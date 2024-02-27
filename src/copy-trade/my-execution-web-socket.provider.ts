import { Module } from '@nestjs/common';
import { WsUserFills } from 'src/interfaces/ws.interface';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebSocketManagerClient } from 'src/exchange/hyperliquid/websocket/web-socket-manager.client';
import { MyExecutionService } from './my-execution.service';

export const myExecutionWebSocketClientProvider = {
    provide: 'myExecutionWebSocketClientProvider',
    useFactory: (
        configService: ConfigService,
        myExecutionService: MyExecutionService
    ) => {
        const myAddress = configService.get<string>('MY_ADDRESS');
        const isMainNet = configService.get<string>('IS_MAIN_NET') === 'true';
        const coin = configService.get<string>('COPY_COIN');
        const callback = (update: WsUserFills) => {
            myExecutionService.executionReceived(update, coin);
        };

        return new WebSocketManagerClient({ "type": "userFills", "user": myAddress }, callback, isMainNet);

    },
    inject: [ConfigService, MyExecutionService]
};

@Module({
    imports: [ConfigModule],
    providers: [myExecutionWebSocketClientProvider],
    exports: ['myExecutionWebSocketClientProvider'],
})
export class UserFillsWebSocketModule { }
