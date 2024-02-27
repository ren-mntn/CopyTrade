import { Controller, Get, Query } from '@nestjs/common';
import { FetchUserInfoService } from 'src/browser-api/services/fetch-user-info.service';
import { FetchUserTradeHistoryService } from 'src/browser-api/services/fetch-user-trade-history.service';

@Controller('trade')
export class UserTradeHistoryController {
    constructor(
        private readonly fetchUserInfo: FetchUserInfoService,
        private readonly fetchUserTradeHistory: FetchUserTradeHistoryService,
    ) { }

    @Get()
    async fetchUserData(@Query('userId') userId: string) {
        const tradeHistory = await this.fetchUserTradeHistory.fetchUserTradeHistory(userId);
        const positions = await this.fetchUserInfo.positions(userId);
        return { tradeHistory, positions };
    }
}
