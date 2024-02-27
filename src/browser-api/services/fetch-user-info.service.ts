import { Injectable } from '@nestjs/common';
import { ExchangeService } from 'src/exchange/hyperliquid/rest-api/exchange.service';
import { InfoService } from 'src/exchange/hyperliquid/rest-api/info.service';
import { OrderRequest } from 'src/interfaces/order.interface';

@Injectable()
export class FetchUserInfoService {
    constructor(private info: InfoService,
        private exchangeService: ExchangeService,
    ) { }

    public async positions(userId: string) { // asyncキーワードを追加
        const positions = this.fetchUserPositions(userId);

        // const orderList: OrderRequest[] = [
        //     {
        //         coin: 'SOL',
        //         isBuy: false,
        //         limitPx: 105,
        //         sz: 1,
        //         reduceOnly: false,
        //     },
        //     {
        //         coin: 'SOL',
        //         isBuy: false,
        //         limitPx: 106,
        //         sz: 1,
        //         reduceOnly: false,
        //     }
        // ];
        // await this.exchangeService.bulkOrder(orderList);

        // await this.exchangeService.order('SOL', false, 105, 1, false);

        // const cancelList = [
        //     {
        //         coin: 'SOL',
        //         oid: 10662563948,
        //     },
        //     {
        //         coin: 'SOL',
        //         oid: 10662563949,
        //     }
        // ];
        // const res = await this.exchangeService.bulkCancel(cancelList);
        // const res = await this.exchangeService.cancel('SOL', 10662563948);
        // console.log(res)

        return positions;
    }

    private async fetchUserPositions(uid: string) {
        const res = await this.info.userState(uid);
        return res;
    }

    // private formatTimestamp(timestamp: number): string {
    //     // moment.jsを使用して、タイムスタンプをフォーマットします
    //     return moment(timestamp).format('YYYY/MM/DD/HH:mm');
    // }

    // private totalClosedPnl(transactions: any[]): number {
    //     return transactions.reduce((total, transaction) => {
    //         return total + parseFloat(transaction.closedPnl);
    //     }, 0);
    // }



    // // ユーザーのポジションとポジションの割合を表示する
    // private tes = (res: any, uid: string, coin: string) => {
    //     const accountValue = parseFloat(res.crossMarginSummary.accountValue);
    //     console.log(`UID: ${uid}  AccountValue: ${accountValue}`);
    //     for (const assetPosition of res.assetPositions) {
    //         const position = assetPosition.position;
    //         if (position && position.positionValue && accountValue) {
    //             if (coin && position.coin !== coin) {
    //                 continue;  // coinが一致しない場合はスキップ
    //             }
    //             const positionValue = parseFloat(position.positionValue);
    //             const positionSize = parseFloat(position.szi); // ポジションサイズを取得
    //             const entryPrice = parseFloat(position.entryPx); // ポジションサイズを取得

    //             // ポジションがaccountValueの何パーセントを使用しているかを計算
    //             const positionPercentage = (positionValue / accountValue) * 100;

    //             const coinStr = `Coin: ${position.coin}`.padEnd(13, ' ');
    //             const sizeStr = `Size: ${positionSize.toFixed(2)}`.padEnd(20, ' ');
    //             const priceStr = `entryPrice: ${entryPrice.toFixed(2)}`.padEnd(25, ' ');
    //             const percentStr = `: ${positionPercentage.toFixed(2)}%`.padEnd(15, ' ');
    //             const pnlStr = `pnl: ${position.unrealizedPnl}`.padEnd(37, ' ');

    //             console.log(`${coinStr}${sizeStr}${priceStr}${percentStr}${pnlStr}`);
    //         }
    //     }
    // }
    // // トランザクションの配列を受け取り、損益を計算する oidが同じ注文の損益をまとめる
    // private calculatePnl(transactions: any[]): any {
    //     let oldId = 0;
    //     let orderPnl = 0;
    //     let oldTime = 0;
    //     let oldCoin = '';
    //     for (let i = transactions.length - 1; i >= 0; i--) {
    //         const d = transactions[i];
    //         // 新しい注文の場合
    //         if (d.oid != oldId && d.dir.toLowerCase().includes('close')) {
    //             oldId = d.oid;
    //             const formattedTime = this.formatTimestamp(d.time); // タイムスタンプをフォーマット
    //             console.log('Pnl:', orderPnl, d.dir, oldCoin, formattedTime)
    //             orderPnl = parseFloat(d.closedPnl);
    //             console.log(d)
    //         }
    //         // 既存の注文の場合
    //         else if (d.oid == oldId) {
    //             orderPnl += parseFloat(d.closedPnl);
    //             oldCoin = d.coin;
    //             oldTime = d.time;
    //         }

    //     }
    // }

    // // 通過別の損益を計算する
    // private calculatePnlByCurrency(transactions: any[]): any {
    //     const pnlByCurrency = transactions.reduce((acc, transaction) => {
    //         const coin = transaction.coin;
    //         const closedPnl = parseFloat(transaction.closedPnl);

    //         if (!acc[coin]) {
    //             acc[coin] = 0; // 初めての通貨の場合、初期値を設定
    //         }

    //         acc[coin] += closedPnl; // 通貨ごとの損益を加算
    //         return acc;
    //     }, {});

    //     // 通貨ごとの損益を出力
    //     for (const [coin, pnl] of Object.entries(pnlByCurrency)) {
    //         const pnlNumber = pnl as number; // 型アサーションを使用して number 型にキャスト

    //         const coinStr = `${coin}`.padEnd(7, ' ');
    //         const pnlStr = `: ${pnlNumber.toFixed(2)}`.padEnd(25, ' ');

    //         console.log(`${coinStr}${pnlStr}`);
    //     }

    //     return pnlByCurrency;
    // }

    // private calculateWinRate(transactions: any[]): number {
    //     let winCount = 0;
    //     let loseCount = 0;

    //     for (const transaction of transactions) {
    //         const closedPnl = parseFloat(transaction.closedPnl);
    //         if (closedPnl > 0) {
    //             winCount++;
    //         } else if (closedPnl < 0) {
    //             loseCount++;
    //         }
    //         // ここでclosedPnlが0の場合はカウントされません（引き分けとみなすかもしれません）
    //     }

    //     if (winCount + loseCount === 0) {
    //         return 0; // トレードがない場合は勝率は0%とします
    //     }

    //     return (winCount / (winCount + loseCount)) * 100; // 勝率をパーセンテージで計算
    // }
}

