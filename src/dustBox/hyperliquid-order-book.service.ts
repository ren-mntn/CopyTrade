import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { OrderBookSnapshot } from '../../entities/order-book-snapshot.entity';
// import { OrderBookDiff } from '../../entities/order-book-diff.entity';
import { DeepPartial } from 'typeorm';

interface WsLevel {
    px: string; // price
    sz: string; // size
    n: number; // number of orders
}

interface ConvertWsLevel {
    px: number; // price
    sz: number; // size
    n: number; // number of orders
}
interface WsBook {
    coin: string;
    asks: Array<WsLevel>;
    bids: Array<WsLevel>;
    time: number;
}
interface ConvertWsBook {
    coin: string;
    asks: Array<ConvertWsLevel>;
    bids: Array<ConvertWsLevel>;
    time: number;
}

interface priceData {
    asks: Array<ConvertWsLevel>;
    bids: Array<ConvertWsLevel>;
}

interface OrderRequest {
    "coin": string;
    "is_buy": boolean;
    "sz": number;
    "limit_px": number;
    "order_type": string;
    "reduce_only": boolean;
}

@Injectable()
export class HyperLiquidOrderBookService {
    constructor(
    ) { }

    async changeData(data: WsBook) {
        
        const convertedData = this.convertData(data);
        const targetPrices = this.getTargetPrices(convertedData);
        const bestPrices = this.getBestPrices(convertedData);
        const orderPrice = this.getOrderPrice(targetPrices, bestPrices);
        const currentPos = 0; //現在のポジション　[0:なし, 1:買い, 2:売り]
        if (currentPos == 0) {
            if (orderPrice != 0) {
                //新規注文
                console.log("新規注文");
                console.log(orderPrice);
            }
            console.log(orderPrice);
        }
    }

    private convertData(rawData: WsBook): ConvertWsBook {
        return {
            coin: rawData.coin,
            asks: rawData.asks.map((ask: any) => ({
                px: parseFloat(ask.px),
                sz: parseFloat(ask.sz),
                n: ask.n
            })),
            bids: rawData.bids.map((bid: any) => ({
                px: parseFloat(bid.px),
                sz: parseFloat(bid.sz),
                n: bid.n
            })),
            time: rawData.time
        };
    }

    private getTargetPrices(data: ConvertWsBook) {
        const ask = data.asks.reduce((max, ask) => ask.sz > max.sz ? ask : max, { px: 0, sz: 0, n: 0 });
        const bid = data.bids.reduce((max, bid) => bid.sz > max.sz ? bid : max, { px: 0, sz: 0, n: 0 });
        return {
            ask,
            bid,
        };
    }

    private getBestPrices(data: ConvertWsBook) {
        const ask = data.asks.reduce((min, ask) => ask.px < min.px ? ask : min, { px: Infinity, sz: 0, n: 0 });
        const bid = data.bids.reduce((max, bid) => bid.px > max.px ? bid : max, { px: 0, sz: 0, n: 0 });
        const bestPrices = {
            ask,
            bid,
        };
        return bestPrices;
    }

    private getOrderPrice(targetPrices: any, bestPrices: any) {
        const targetPriceAsk = bestPrices["ask"]["px"] === targetPrices["ask"]["px"] ? 0 : targetPrices["ask"]["px"] - 1;
        const targetPriceBid = bestPrices["bid"]["px"] === targetPrices["bid"]["px"] ? 0 : targetPrices["bid"]["px"] + 1;
        return targetPriceAsk;
    }

    private postOrder(orderPrice: number, orderSize: number, orderSide: string) {
        console.log("注文");
        console.log(orderPrice);
        console.log(orderSize);
        console.log(orderSide);
    }

    private order(coin: string, is_buy: boolean, sz: number, limit_px: number, order_type: string, reduce_only: boolean) {
        const order: OrderRequest = {
            "coin": coin,
            "is_buy": is_buy,
            "sz": sz,
            "limit_px": limit_px,
            "order_type": order_type,
            "reduce_only": reduce_only,
        }
        return order;
    }
}
