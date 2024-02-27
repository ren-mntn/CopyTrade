import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeepPartial } from 'typeorm';
import { OrderBookSnapshot } from '../order-book-snapshot.entity';
import { OrderBookDiff } from '../order-book-diff.entity';

interface OrderBookSnapShotData {
    'room_name': string;
    'message': {
        'data': {
            'asks': string[][];
            'bids': string[][];
            'timestamp': string;
            'sequenceId': string;
            'asks_over': string;
            'bids_under': string;
        };
    };
}

interface OrderBookDiffData {
    'room_name': string;
    'message': {
        'data': {
            'a': string[][];
            'b': string[][];
            't': string;
            's': string;
            'ao': string;
            'bu': string;
        };
    };
}
@Injectable()
export class OrderBookService {
    constructor(
        @InjectRepository(OrderBookSnapshot)
        private orderBookSnapshotRepository: Repository<OrderBookSnapshot>,
        @InjectRepository(OrderBookDiff)
        private orderBookDiffRepository: Repository<OrderBookDiff>
    ) { }

    // スナップショットデータを保存する
    async saveSnapshot(data: OrderBookSnapShotData): Promise<OrderBookSnapshot> {
        const transformedData = this.transformToOrderBookSnapshot(data);
        const snapshot = this.orderBookSnapshotRepository.create(transformedData);
        return this.orderBookSnapshotRepository.save(snapshot);
    }

    // 差分データを保存する
    async saveDiff(data: OrderBookDiffData): Promise<OrderBookDiff> {
        const transformedData = this.transformToOrderBookDiff(data);
        const diff = this.orderBookDiffRepository.create(transformedData);
        return this.orderBookDiffRepository.save(diff);
    }

    private transformToOrderBookSnapshot(data: OrderBookSnapShotData): DeepPartial<OrderBookDiff> {
        return {
            pair: 'btc_jpy',
            asks: data.message.data.asks,
            bids: data.message.data.bids,
            timestamp: data.message.data.timestamp,
            sequence_id: data.message.data.sequenceId,
        };
    }

    private transformToOrderBookDiff(data: OrderBookDiffData): DeepPartial<OrderBookDiff> {
        return {
            pair: 'btc_jpy',
            asks: data.message.data.a,
            bids: data.message.data.b,
            timestamp: data.message.data.t,
            sequence_id: data.message.data.s,
        };
    }


}
