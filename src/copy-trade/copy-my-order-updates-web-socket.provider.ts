import { Module } from '@nestjs/common';
import { WsOrder } from 'src/interfaces/ws.interface';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebSocketManagerClient } from 'src/exchange/hyperliquid/websocket/web-socket-manager.client';
import { CopyMyTradeService } from './copy-my-trade.service';

export const copyMyOrderUpdatesWebSocketClientProvider = {
    provide: 'copyMyOrderUpdatesWebSocketClient',
    useFactory: (copyOrderService: CopyMyTradeService, configService: ConfigService) => {
        const coin = configService.get<string>('COPY_COIN');
        const callback = (update: WsOrder[]) => {
            copyOrderService.receiveMyOrder(update, coin);
        };
        const myAddress = configService.get<string>('MY_ADDRESS');
        const isMainNet = configService.get<string>('IS_MAIN_NET') === 'true';
        return new WebSocketManagerClient({ "type": "orderUpdates", "user": myAddress }, callback, isMainNet);
    },
    inject: [CopyMyTradeService, ConfigService]
};

@Module({
    imports: [ConfigModule],
    providers: [CopyMyTradeService, copyMyOrderUpdatesWebSocketClientProvider],
    exports: ['copyMyOrderUpdatesWebSocketClient'],
})
export class OrderUpdatesWebSocketModule { }
