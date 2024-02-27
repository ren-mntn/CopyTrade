import { Injectable } from '@nestjs/common';

import { WsUserFills } from 'src/interfaces/ws.interface';
import { OrderListService } from './order-list.service';
import { CopyOrderService } from './copy-order.service';

@Injectable()
export class MyExecutionService {

    constructor(
        private orderListService: OrderListService,
        private copyOrderService: CopyOrderService
    ) { }

    async executionReceived(executions: WsUserFills, coin: string): Promise<void> {
        executions.fills.forEach(execution => {
            if (execution.coin === coin) {
                this.orderListService.receivedExecution(execution.cloid, parseFloat(execution.sz));
                console.log('receivedExecution                  ', execution.cloid);
                this.copyOrderService.triggerRemoveForWaitingList(execution.cloid)
            }
        });
    }
}