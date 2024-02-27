import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from 'src/entities/transaction.entity';
import { InfoService } from 'src/exchange/hyperliquid/rest-api/info.service';

interface TransactionType {
    oid: string;
    coin: string;
    dir: string;
    px: string;
    sz: string;
    time: number;
    closedPnl: string;
    fee: string;
    startPosition: string;
}

@Injectable()
export class FetchUserTradeHistoryService {

    constructor(
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        private info: InfoService,
    ) { }

    private dirList = [
        'Open Long',
        'Open Short',
        'Close Long',
        'Close Short',
        'Liquidated Cross Long',
        'Liquidated Cross Short',
        'Liquidated Isolated Long',
        'Liquidated Isolated Short',
        'Long > Short',
        'Short > Long',
    ];

    public async fetchUserTradeHistory(userId: string) { // asyncキーワードを追加

        const existingTransactions = await this.transactionRepository.find({
            where: { userId },
            order: { timestamp: 'DESC' },
        });



        const lastTimestamp = existingTransactions.length > 0 ? existingTransactions[0].timestamp + 1 : 0;

        const newTransactions = await this.userFillsByTime(userId, lastTimestamp);

        if (newTransactions.length === 0) {
            const coinList = Array.from(new Set(existingTransactions.map(transaction => transaction.coin)));

            return { uid: userId, positions: existingTransactions, coinList: coinList };
        }

        const compressedTransactions = this.compressTransactions(newTransactions);

        const transactionEntities = compressedTransactions.map(transaction => this.transactionRepository.create({
            userId,
            oid: transaction.oid,
            coin: transaction.coin,
            dir: transaction.dir,
            price: transaction.price,
            size: transaction.size,
            timestamp: transaction.timestamp,
            closedPnl: transaction.closedPnl,
            fee: transaction.fee,
        }));

        const batchSize = 1000;
        for (let i = 0; i < transactionEntities.length; i += batchSize) {
            const batch = transactionEntities.slice(i, i + batchSize);
            await this.transactionRepository.save(batch);
        }

        const combinedTransactions = [...compressedTransactions, ...existingTransactions];
        const coinList = Array.from(new Set(combinedTransactions.map(transaction => transaction.coin)));

        return { uid: userId, positions: combinedTransactions, coinList: coinList };
    }


    private calculationSize(transaction: any): number {
        const size = parseFloat(transaction.sz);
        const startPosition = parseFloat(transaction.startPosition);
        if (transaction.dir === 'Open Long' || transaction.dir === 'Close Short' || transaction.dir === 'Short > Long' || transaction.dir === 'Liquidated Cross Short' || transaction.dir === 'Liquidated Isolated Short') {
            return startPosition + size;
        } else {
            return startPosition - size;
        }
    }

    private compressTransactions(transactions: TransactionType[]): {
        oid: string;
        coin: string;
        dir: string;
        price: number;
        size: number;
        timestamp: number;
        closedPnl: number;
        fee: number;
    }[] {
        const compressedTransactions = [];
        const transactionMap = new Map();

        for (const transaction of transactions) {
            const oid = transaction.oid;
            const lastSize = this.calculationSize(transaction);
            if (transactionMap.has(oid)) {
                const existingTransaction = transactionMap.get(oid);
                existingTransaction.size = lastSize;
                existingTransaction.closedPnl += parseFloat(transaction.closedPnl);
                existingTransaction.fee += parseFloat(transaction.fee);
            } else {
                transactionMap.set(oid, {
                    oid: transaction.oid,
                    coin: transaction.coin,
                    dir: transaction.dir,
                    price: parseFloat(transaction.px),
                    size: lastSize,
                    timestamp: transaction.time,
                    closedPnl: parseFloat(transaction.closedPnl),
                    fee: parseFloat(transaction.fee),
                });
            }
        }

        for (const transaction of transactionMap.values()) {
            compressedTransactions.push(transaction);
        }
        return compressedTransactions;
    }

    private async userFillsByTime(userId: string, startTime = 169879680000): Promise<any[]> {
        const maxResultsPerCall = 2000; // APIから1度に取得できる最大件数
        let hasMoreData = true;
        let allTransactions = [];
        let currentStartTime = startTime; // 2023年12月1日のUNIXタイムスタンプ（ミリ秒）
        let apiCallCount = 0; // API呼び出し回数をカウント
        let maxApiCalls = 20; // 最大API呼び出し回数
        while (hasMoreData) {

            const response = await this.info.userFillsByTime(userId, currentStartTime);
            allTransactions = allTransactions.concat(response);
            apiCallCount++;

            if (apiCallCount >= maxApiCalls) {
                console.log(`API call limit reached: ${maxApiCalls} calls`);
                break;
            }

            if (response.length < maxResultsPerCall) {
                hasMoreData = false;
            } else {
                currentStartTime = response[response.length - 1].time + 1;
            }
        }
        if (apiCallCount > 1) {
            console.log(`API was called ${apiCallCount} times.`);
        }

        return allTransactions;
    }

}