import { Module } from '@nestjs/common';
import { WsOrder } from 'src/interfaces/ws.interface';
import { CopyOrderService } from './copy-order.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebSocketManagerClient } from 'src/exchange/hyperliquid/websocket/web-socket-manager.client';

export const copyOrderWebSocketClientProvider = {
    provide: 'copyOrderWebSocketClientProvider',
    useFactory: (copyOrderService: CopyOrderService, configService: ConfigService) => {
        const coin = configService.get<string>('COPY_COIN');
        const copyAddress = configService.get<string>('COPY_TRADE_USER_ADDRESS');
        const callback = (update: WsOrder[]) => {
            copyOrderService.copyOrder(update, coin);
        };
        return new WebSocketManagerClient({ "type": "orderUpdates", "user": copyAddress }, callback);
    },
    inject: [CopyOrderService, ConfigService] 
};

@Module({
    imports: [ConfigModule],
    providers: [CopyOrderService, copyOrderWebSocketClientProvider],
    exports: ['copyOrderWebSocketClientProvider'],
})
export class OrderUpdatesWebSocketModule { }
