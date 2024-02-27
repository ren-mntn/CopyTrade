import { Injectable } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { OrderBookService } from '../order-book.service';

@Injectable()
export class OrderBookClient {
    private socket: Socket;

    constructor(private orderBookService: OrderBookService) {
        this.connectToSocketIO();
    }

    // https://github.com/bitbankinc/bitbank-api-docs/blob/master/public-stream_JP.md#%E6%9D%BF%E6%83%85%E5%A0%B1%E3%81%AE%E5%B7%AE%E5%88%86%E9%85%8D%E4%BF%A1
    private connectToSocketIO() {
        const url = 'wss://stream.bitbank.cc';

        this.socket = io(url, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 30000,
        });

        this.socket.on('connect', () => {
            console.log('接続しました');
            // this.socket.emit('join-room', 'ticker_btc_jpy');          // ティッカー情報
            // this.socket.emit('join-room', 'transactions_btc_jpy');    // 約定履歴
            this.socket.emit('join-room', 'depth_diff_btc_jpy');      // 板の差分情報
            this.socket.emit('join-room', 'depth_whole_btc_jpy');     // 板情報
        });

        this.socket.on('message', (data) => {
            const roomName = data.room_name;

            if (roomName === 'depth_diff_btc_jpy') {
                this.orderBookService.saveDiff(data);
            }

            if (roomName === 'depth_whole_btc_jpy') {
                this.orderBookService.saveSnapshot(data);
            }
        });


        this.socket.on('disconnect', () => {
            console.log('切断されました');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection failed:', error);
        });
    }
}
