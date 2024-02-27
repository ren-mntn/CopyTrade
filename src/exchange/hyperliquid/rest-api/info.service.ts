import { BadRequestException, Injectable } from '@nestjs/common';
import { PostApiService } from './post-api.service';
import { UserFill, UserState } from 'src/interfaces/order.interface';
import { MetaData } from 'src/interfaces/ws.interface';

type PublicApiType = 'meta' | 'allMids' | 'metaAndAssetCtxs' | 'clearinghouseState' | 'openOrders' | 'userFills' | 'userFillsByTime' | 'userFunding' | 'fundingHistory' | 'l2Book' | 'candleSnapshot' | 'orderStatus';

interface ApiRequestBody {
    type: PublicApiType;
    user?: string;
    startTime?: number;
    req?: any;
}

@Injectable()
export class InfoService {
    constructor(
        private postApiService: PostApiService,
    ) { }

    private async fetchApiData<T>(body: ApiRequestBody): Promise<T> {
        body.type = body.type as PublicApiType;
        return this.postApiService.baseAPI('info', body);
    }

    async meta(): Promise<MetaData> {
        return this.fetchApiData({ type: 'meta' });
    }

    async userState(userId: string): Promise<UserState> {
        return this.fetchApiData({ type: 'clearinghouseState', user: userId });
    }

    async userFills(userId: string): Promise<UserFill[]> {
        return this.fetchApiData({ type: 'userFills', user: userId });
    }

    async userFillsByTime(userId: string, startTime = 169879680000): Promise<UserFill[]> {
        return this.fetchApiData({
            type: 'userFillsByTime',
            user: userId,
            startTime: startTime,
        });
    }

    async candleSnapshot(coin: string, interval: string, startTime: number, endTime = Date.now()): Promise<any> {
        return this.fetchApiData({
            type: 'candleSnapshot',
            req: {
                coin,
                interval,
                startTime,
                endTime,
            },
        });
    }
}