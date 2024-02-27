import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

import { MetaDataService } from './meta-data.service';
import { ExchangeService } from 'src/exchange/hyperliquid/rest-api/exchange.service';
import { WsOrder } from 'src/interfaces/ws.interface';
import { CancelByCloidRequest, OrderRequest } from 'src/interfaces/order.interface';
import { OrderListService } from './order-list.service';

@Injectable()
export class CopyOrderService {
    private tradeSizeMultiplier: number
    private waitingCancelList: CancelByCloidRequest[]

    constructor(
        private exchangeService: ExchangeService,
        private metaDataService: MetaDataService,
        private configService: ConfigService,
        private orderListService: OrderListService
        ,
    ) {
        this.tradeSizeMultiplier = parseFloat(this.configService.get<string>('TRADE_SIZE_MULTIPLIER'));
        this.waitingCancelList = [];
    }

    async copyOrder(update: WsOrder[], coin: string): Promise<void> {
        const orderRequestList: OrderRequest[] = [];
        const cancelRequestList: CancelByCloidRequest[] = [];
        const timestamp = Date.now();
        let hasTransaction = false;
        console.log('this.waitingCancelList', this.waitingCancelList.map(order => order.cloid));
        update.forEach(order => {
            if (order.order.coin === coin) {
                if (order.status === 'open') {
                    this.processOpenOrders(order, orderRequestList, timestamp);
                    hasTransaction = true;
                } else if (order.status === 'canceled') {
                    this.processCancelOrders(order, cancelRequestList);
                    hasTransaction = true;
                }
            }
        });
        if (!hasTransaction) {
            return;
        }

        if (cancelRequestList.length > 0) {
            await this.executeCancels(cancelRequestList);
        }

        if (orderRequestList.length > 0) {
            await this.executeOrders(orderRequestList);
        }

        this.orderListService.consoleLog();
    }

    private roundSize(size: number, coin: string): number {
        const decimals = this.metaDataService.getCurrencySzDecimals(coin)
        const factor = Math.pow(10, decimals);
        return Math.round(size * factor) / factor;
    }

    private createOrderRequest(update: WsOrder, roundedSize: number, cloid: string): OrderRequest {
        return {
            coin: update.order.coin,
            isBuy: update.order.side === 'B',
            limitPx: parseFloat(update.order.limitPx),
            sz: roundedSize,
            reduceOnly: false,
            cloid: cloid
        };
    }

    private processOpenOrders(update: WsOrder, orderRequestList: OrderRequest[], timestamp: number) {
        const roundedSize = this.roundSize(parseFloat(update.order.sz) * this.tradeSizeMultiplier, update.order.coin);
        const cloid = this.generateCloid();
        const OrderRequest = this.createOrderRequest(update, roundedSize, cloid);
        orderRequestList.push(OrderRequest);
        this.orderListService.addNewOrder(OrderRequest, update.order.oid, 'openSending', timestamp);
    }

    private processCancelOrders(update: WsOrder, cancelRequestList: CancelByCloidRequest[]) {
        const cloid = this.orderListService.getCloidByOwnerId(update.order.oid);
        if (this.orderListService.orderStatusIsOpen(update.order.oid)) {
            cancelRequestList.push({
                coin: update.order.coin,
                cloid: cloid,
            });
            this.orderListService.updateOrderStatus(cloid, 'cancelSending');
        }
        else if (this.orderListService.orderStatusIsOpenSending(update.order.oid)) {
            this.waitingCancelList.push({
                coin: update.order.coin,
                cloid: cloid,
            });
        }
    }

    private async executeOrders(orderRequestList: OrderRequest[]) {
        const res = await this.exchangeService.bulkOrder(orderRequestList);
        res.response.data.statuses.forEach((status, index: number) => {
            if (status.resting) {
            } else if (status.filled) {
            } else if (status.error && status.error.includes('Order must have minimum value of $10')) {
                console.log('注文サイズが小さい:', orderRequestList); // どこかに配列を保存して、orderListから削除する。indexを使った方法ではどのorderがエラーになったかわからない
            } else if (status.error && status.error.includes('Insufficient margin to place order')) {
                console.log('証拠金不足:', orderRequestList);
            } else {
                console.log('未知のエラーorder:', status);
            }
        });
    }

    private async executeCancels(cancelRequestList: CancelByCloidRequest[]) {
        const res = await this.exchangeService.bulkCancelByCloid(cancelRequestList);
        res.response.data.statuses.forEach((status, index: number) => {
            if (status === 'success') {
            } else if (status.error && status.error.includes('Order was never placed')) {
                console.log("おそらく失敗", cancelRequestList[index]);
                //もうでないはず　
            } else {
                console.log('未知のエラー:', status);
            }
        });
    }

    public async triggerCancelForWaitingList(cloid: string): Promise<void> {
        if (this.waitingCancelList) {
            const orderToCancel = this.waitingCancelList.find(order => order.cloid === cloid);
            if (orderToCancel) {
                await this.exchangeService.bulkCancelByCloid([orderToCancel]);
                this.waitingCancelList = this.waitingCancelList.filter(order => order.cloid !== cloid);
            }
        }
    }
    public async triggerRemoveForWaitingList(cloid: string): Promise<void> {
        if (this.waitingCancelList) {
            this.waitingCancelList = this.waitingCancelList.filter(order => order.cloid !== cloid);
        }
    }

    private generateCloid(): string {
        return '0x' + randomBytes(16).toString('hex');
    }
}