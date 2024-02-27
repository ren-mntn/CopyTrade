import { Injectable } from '@nestjs/common';

import { OrderListService } from './order-list.service';
import { CopyOrderService } from './copy-order.service';
import { OpenOrder, Position, WsWebData2 } from 'src/interfaces/ws.interface';
import { UserDataManagerService } from './user-data-manager.service';
import { promises } from 'dns';
import { ExchangeService } from 'src/exchange/hyperliquid/rest-api/exchange.service';

type OrderSide = 'BUY' | 'SELL';


interface UserOrder {
    coin: string;
    side: OrderSide;
    size: number;
    price: number;
    oid: number;
    timestamp: number;
}

type OrderStatus = 'openSending' | 'open' | 'cancelSending'

interface OrderList {
    coin: string;
    ownerOid: number;
    cloid: string;
    oid: number | null;
    isBuy: boolean;
    size: number;
    price: number;
    timestamp: number;
    status: OrderStatus;
}

@Injectable()
export class OrderValidatorService {

    constructor(
        private userDataManagerService: UserDataManagerService,
        private orderListService: OrderListService,
        private exchangeService: ExchangeService,

    ) { }

    async orderValidate(): Promise<void> {
        const masterOrderList: UserOrder[] = this.userDataManagerService.getUserOrderList();
        const myOrderList: OrderList[] = this.orderListService.getOrderList();
        const now = Date.now();

        //myOrderListに存在するがmasterOrderListに存在しないものを取得
        const notExistOrderList: OrderList[] = myOrderList.filter(myOrder => {
            return !masterOrderList.some(masterOrder => masterOrder.oid === myOrder.ownerOid);
        });

        const cancelOrderList: OrderList[] = notExistOrderList.filter(order => {
            return order.timestamp + 60000 < now;
        });

        this.processCancelOrders(cancelOrderList);
    }

    private processCancelOrders(cancelOrderList: OrderList[]): void {
        const cancelRequestList = cancelOrderList.map(order => {
            return {
                coin: order.coin,
                cloid: order.cloid
            };
        });

        cancelRequestList.forEach(order => {
            console.log('コピー元には無いオーダーの為キャンセル', order.cloid);
        });

        this.exchangeService.bulkCancelByCloid(cancelRequestList);
    }

}