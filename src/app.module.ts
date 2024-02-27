import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DataSourceModule } from './data-source.module';

import { TypeOrmModule } from '@nestjs/typeorm';

import { HttpModule } from '@nestjs/axios';

import { Transaction } from './entities/transaction.entity';
import { FetchCandleController } from './browser-api/controllers/fetch-candle.controller';
import { UserTradeHistoryController } from './browser-api/controllers/user-trade-history.controller';
import { FetchLeaderBoardController } from './browser-api/controllers/fetch-leader-board.controller';
import { FetchUserInfoService } from './browser-api/services/fetch-user-info.service';
import { FetchUserTradeHistoryService } from './browser-api/services/fetch-user-trade-history.service';
import { FetchLeaderBoardService } from './browser-api/services/fetch-leader-board.service';

import { FetchCandleService } from './browser-api/services/fetch-candle.service';

import { MetaDataService } from './copy-trade/meta-data.service';
import { ExchangeService } from './exchange/hyperliquid/rest-api/exchange.service';
import { SigningService } from './exchange/hyperliquid/rest-api/signing.service';
import { copyOrderWebSocketClientProvider } from './copy-trade/copy-order-web-socket.provider';
import { PostApiService } from './exchange/hyperliquid/rest-api/post-api.service';
import { InfoService } from './exchange/hyperliquid/rest-api/info.service';
import { copyMyOrderUpdatesWebSocketClientProvider } from './copy-trade/copy-my-order-updates-web-socket.provider';
import { OrderListService } from './copy-trade/order-list.service';
import { CopyOrderService } from './copy-trade/copy-order.service';
import { CopyMyTradeService } from './copy-trade/copy-my-trade.service';
import { myExecutionWebSocketClientProvider } from './copy-trade/my-execution-web-socket.provider';
import { MyExecutionService } from './copy-trade/my-execution.service';
import { copyTradeValidatorProvider } from './copy-trade/copy-trade-validator.provider';
import { UserDataManagerService } from './copy-trade/user-data-manager.service';
import { OrderValidatorService } from './copy-trade/order-validator.service';
import { PositionValidatorService } from './copy-trade/position-validator.service';

@Module({
  imports: [
    HttpModule,
    DataSourceModule,
    TypeOrmModule.forFeature([Transaction]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [FetchCandleController, UserTradeHistoryController, FetchLeaderBoardController],
  providers: [
    PostApiService,
    InfoService,
    ExchangeService,
    MetaDataService,
    SigningService,
    FetchUserInfoService,
    FetchCandleService,
    FetchUserTradeHistoryService,
    FetchLeaderBoardService,
    CopyOrderService,
    OrderListService,
    CopyMyTradeService,
    MyExecutionService,
    OrderValidatorService,
    PositionValidatorService,
    UserDataManagerService,
    copyTradeValidatorProvider,
    copyOrderWebSocketClientProvider,
    copyMyOrderUpdatesWebSocketClientProvider,
    myExecutionWebSocketClientProvider,
  ],
  exports: [
    FetchUserInfoService,
  ],

})
export class AppModule {
  constructor(private metaDataService: MetaDataService,
  ) {
    this.metaDataService.updateMetaData();
  }
}
