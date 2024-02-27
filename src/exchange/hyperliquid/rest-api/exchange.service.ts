import { Injectable } from '@nestjs/common';

import { PostApiService } from './post-api.service';
import { SigningService } from './signing.service';
import { MetaDataService } from 'src/copy-trade/meta-data.service';
import { OrderResponse } from 'src/interfaces/exchange-response.interface';
import { CancelByCloidRequest, CancelRequest, OrderRequest, OrderType, OrderWire, Tif } from 'src/interfaces/order.interface';

@Injectable()
export class ExchangeService {
    constructor(
        private postApiService: PostApiService,
        private signingService: SigningService,
        private metaDataService: MetaDataService,
    ) { }

    async postAction(action: any): Promise<any> {
        const [signature, nonce] = await this.signingService.signL1Action(action);

        const body = {
            action: action,
            nonce: nonce,
            signature: signature,
        };

        return await this.postApiService.baseAPI('exchange', body);
    }

    private orderRequestToOrderWire(orders: OrderRequest[], asset: number): OrderWire[] {
        return orders.map((order) => {
            const wire: OrderWire = {
                a: asset,
                b: order.isBuy,
                p: order.limitPx.toString(),
                s: order.sz.toString(),
                r: order.reduceOnly,
                t: { limit: { tif: 'Gtc' as Tif } } as OrderType,
            };

            if (order.cloid) {
                wire.c = order.cloid;
            }

            return wire;
        });
    }

    private orderWireToOrderAction(orderWire: OrderWire[]): any {
        return {
            type: 'order',
            orders: orderWire,
            grouping: 'na',
        }
    }

    async order(coin: string, isBuy: boolean, price: number, size: number, reduceOnly = false): Promise<OrderResponse> {
        return await this.bulkOrder([{
            coin: coin,
            isBuy: isBuy,
            limitPx: price,
            sz: size,
            reduceOnly: reduceOnly,
        }]);
    }

    async bulkOrder(orderList: OrderRequest[]): Promise<OrderResponse> {
        const coin = this.metaDataService.getCurrencyIndex(orderList[0].coin);
        const action = this.orderRequestToOrderWire(orderList, coin);
        const order_action = this.orderWireToOrderAction(action)

        return await this.postAction(order_action);
    }

    async cancel(coin: string, oid: number): Promise<OrderResponse> {
        return this.bulkCancel([{
            coin: coin,
            oid: oid,
        }]);
    }

    async cancelByCloid(coin: string, cloid: string): Promise<OrderResponse> {
        return this.bulkCancelByCloid([{
            coin: coin,
            cloid: cloid,
        }]);
    }

    async bulkCancel(cancelList: CancelRequest[]): Promise<OrderResponse> {
        const cancels = cancelList.map((cancel) => ({
            a: this.metaDataService.getCurrencyIndex(cancel.coin),
            o: cancel.oid,
        }));

        return this.postAction({
            type: 'cancel',
            cancels: cancels,
        });
    }

    async bulkCancelByCloid(cancelList: CancelByCloidRequest[]): Promise<OrderResponse> {
        const cancels = cancelList.map((cancel) => ({
            asset: this.metaDataService.getCurrencyIndex(cancel.coin),
            cloid: cancel.cloid,
        }));

        return this.postAction({
            type: 'cancelByCloid',
            cancels: cancels,
        });
    }

}