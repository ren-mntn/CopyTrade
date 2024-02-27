import { Controller, Get, Query } from '@nestjs/common';
import { FetchCandleService } from 'src/browser-api/services/fetch-candle.service';

@Controller('fetch-candle')
export class FetchCandleController {
    constructor(private readonly fetchCandle: FetchCandleService) { }

    @Get()
    async fetchData(
        @Query('coin') coin: string,
        @Query('timeFrame') timeFrame: number
    ) {
        const candle = await this.fetchCandle.fetchCandle(coin, timeFrame);
        return candle;
    }
}
