import { BadRequestException, Injectable } from '@nestjs/common';
import { InfoService } from '../../exchange/hyperliquid/rest-api/info.service';

@Injectable()
export class FetchCandleService {
    constructor(
        private info: InfoService,
    ) { }

    async fetchCandle(coin: string, timeFrame: number, barNum = 1000): Promise<any> {

        const timeFrames = {
            1: '1m', 3: '3m', 5: '5m', 15: '15m', 30: '30m',
            60: '1h', 240: '4h', 1440: '1d',
        };
        const interval = timeFrames[timeFrame];
        if (!interval) {
            throw new BadRequestException(`Invalid time frame: ${timeFrame}`);
        }

        const endTime = Date.now();
        const startTime = endTime - (timeFrame * 60 * 1000 * barNum);

        return await this.info.candleSnapshot(coin, interval, startTime);
    }
}