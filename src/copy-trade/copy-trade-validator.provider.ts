import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebSocketManagerClient } from 'src/exchange/hyperliquid/websocket/web-socket-manager.client';
import { UserDataManagerService } from './user-data-manager.service';
import { OrderValidatorService } from './order-validator.service';
import { PositionValidatorService } from './position-validator.service';

export const copyTradeValidatorProvider = {
    provide: 'copyTradeValidatorProvider',
    useFactory: async (
        configService: ConfigService,
        userDataManagerService: UserDataManagerService,
        orderValidatorService: OrderValidatorService,
        positionValidatorService: PositionValidatorService,
    ) => {
        const copyAddress = configService.get<string>('COPY_TRADE_USER_ADDRESS');
        const coin = configService.get<string>('COPY_COIN');
        await positionValidatorService.positionValidate(copyAddress, coin);

        const callback = (update: any) => {
            userDataManagerService.receiveFrontData(update, coin);
            orderValidatorService.orderValidate();
        };
        const isMainNet = configService.get<string>('IS_MAIN_NET') === 'true';

        return new WebSocketManagerClient({ "type": "webData2", "user": copyAddress }, callback, isMainNet);
    },
    inject: [ConfigService, UserDataManagerService, OrderValidatorService, PositionValidatorService]
};

@Module({
    imports: [ConfigModule],
    providers: [copyTradeValidatorProvider],
    exports: ['copyTradeValidatorProvider'],
})
export class UserFillsWebSocketModule { }
