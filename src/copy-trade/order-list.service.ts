import { Injectable } from '@nestjs/common';
import { OrderRequest } from 'src/interfaces/order.interface';

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

type OrderStatus = 'openSending' | 'open' | 'cancelSending'


@Injectable()
export class OrderListService {
    constructor() { }

    private orderList: OrderList[] = [];

    public consoleLog() {
        if (this.orderList.length === 0) {
            return;
        }
        console.log('---------------------------------------');

        this.orderList.forEach((order) => {
            const side = order.isBuy ? 'BUY' : 'SELL';
            console.log(`${order.coin} ${side} ${order.size} ${order.price} ${order.cloid} ${order.timestamp} ${order.status}`);
        });
    }

    public addNewOrder(order: OrderRequest, ownerOid: number, status: OrderStatus, timestamp: number): void {
        const newOrder = {
            coin: order.coin,
            ownerOid: ownerOid,
            cloid: order.cloid,
            oid: null,
            isBuy: order.isBuy,
            size: order.sz,
            price: order.limitPx,
            timestamp: timestamp,
            status: status
        };
        this.orderList = [...this.orderList, newOrder];
    }

    public orderStatusIsOpen(ownerOid: number): boolean {
        return this.orderList.some(o => o.ownerOid === ownerOid && o.status === 'open');
    }

    public orderStatusIsOpenSending
        (ownerOid: number): boolean {
        return this.orderList.some(o => o.ownerOid === ownerOid && o.status === 'openSending');
    }

    public getCloidByOwnerId(ownerOid: number): string | undefined {
        const order = this.orderList.find(o => o.ownerOid === ownerOid);
        return order?.cloid;
    }

    public updateOrderStatus(cloid: string, status: OrderStatus): void {
        this.orderList = this.orderList.map(order =>
            order.cloid === cloid ? { ...order, status: status } : order
        );
    }

    public removeOrder(cloid: string): void {
        this.orderList = this.orderList.filter(order => order.cloid !== cloid);
    }

    public updateOidByCloid(cloid: string, oid: number): void {
        this.orderList = this.orderList.map(order =>
            order.cloid === cloid ? { ...order, oid: oid } : order
        );
    }

    public receivedOpenOrder(cloid: string, oid: number): void {
        this.orderList = this.orderList.map(order =>
            order.cloid === cloid ? { ...order, status: 'open', oid: oid } : order
        );
    }

    public receivedExecution(cloid: string, size: number): void {
        this.orderList = this.orderList
            .map(order =>
                order.cloid === cloid ? { ...order, size: order.size - size } : order
            )
            .filter(order => order.size > 0);
            
        if (this.orderList.filter(order => order.cloid === cloid).length === 0) {
            console.log(`Order ${cloid} is executed all.`);
        }
    }

    public getOrderList(): OrderList[] {
        return this.orderList;
    }
}