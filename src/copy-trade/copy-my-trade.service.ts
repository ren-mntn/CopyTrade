import { Injectable } from '@nestjs/common';

import { WsOrder } from 'src/interfaces/ws.interface';
import { OrderListService } from './order-list.service';
import { CopyOrderService } from './copy-order.service';

@Injectable()
export class CopyMyTradeService {

    constructor(
        private orderListService: OrderListService,
        private copyOrderService: CopyOrderService

    ) { }

    async receiveMyOrder(update: WsOrder[], coin: string): Promise<void> {
        update.forEach(order => {
            if (order.order.coin === coin) {
                if (order.status === 'open') {
                    this.orderListService.receivedOpenOrder(order.order.cloid, order.order.oid);
                    console.log('receivedOpenOrder                  ', order.order.cloid);
                    this.copyOrderService.triggerCancelForWaitingList(order.order.cloid);
                } else if (order.status === 'canceled') {
                    this.orderListService.removeOrder(order.order.cloid);
                }
            }
        });
    }
}