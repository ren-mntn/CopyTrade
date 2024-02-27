import { Injectable } from '@nestjs/common';

import { OrderListService } from './order-list.service';
import { CopyOrderService } from './copy-order.service';
import { OpenOrder, Position, WsWebData2 } from 'src/interfaces/ws.interface';

type OrderSide = 'BUY' | 'SELL';

interface UserOrder {
    coin: string;
    side: OrderSide;
    size: number;
    price: number;
    oid: number;
    timestamp: number;
}

interface UserPosition {
    coin: string;
    side: OrderSide;
    size: number;
    entryPrice: number;
}

@Injectable()
export class UserDataManagerService {

    private userOrderList: UserOrder[];
    private userPosition: UserPosition | null = null;

    constructor(
        private orderListService: OrderListService,
        private copyOrderService: CopyOrderService
    ) { }

    async receiveFrontData(update: WsWebData2, coin: string): Promise<void> {
        const position = update.clearinghouseState.assetPositions.find(pos => pos.position.coin === coin);
        if (position) {
            this.updateMasterPosition(position.position);
        }

        this.userOrderList = update.openOrders
            .filter(openOrder => openOrder.coin === coin)
            .map(this.createMasterOrder.bind(this));
    }

    private updateMasterPosition(position: Position): void {
        this.userPosition = {
            coin: position.coin,
            side: this.getSide(parseFloat(position.szi)),
            size: parseFloat(position.szi),
            entryPrice: parseFloat(position.entryPx)
        };
    }

    private createMasterOrder(openOrder: OpenOrder): UserOrder {
        return {
            coin: openOrder.coin,
            side: this.getSideFromOrderSide(openOrder.side),
            size: parseFloat(openOrder.sz),
            price: parseFloat(openOrder.limitPx),
            oid: openOrder.oid,
            timestamp: openOrder.timestamp
        };
    }

    private getSide(size: number): OrderSide {
        return size > 0 ? 'BUY' : 'SELL';
    }

    private getSideFromOrderSide(orderSide: string): OrderSide {
        return orderSide === 'B' ? 'BUY' : 'SELL';
    }

    public getUserOrderList(): UserOrder[] {
        return this.userOrderList;
    }

}