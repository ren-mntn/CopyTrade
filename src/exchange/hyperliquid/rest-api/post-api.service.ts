import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';

type PublicApiType = 'meta' | 'allMids' | 'metaAndAssetCtxs' | 'clearinghouseState' | 'openOrders' | 'userFills' | 'userFillsByTime' | 'userFunding' | 'fundingHistory' | 'l2Book' | 'candleSnapshot' | 'orderStatus';

@Injectable()
export class PostApiService {
    private url: string;
    private axiosInstance: AxiosInstance; // Axiosのインスタンスを保持するためのプロパティ

    constructor(
        private configService: ConfigService,
    ) {
        this.url = this.configService.get<string>('IS_MAIN_NET') === 'true' ? 'https://api.hyperliquid.xyz/' : 'https://api.hyperliquid-testnet.xyz/';
        this.axiosInstance = axios.create({
            baseURL: this.url,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async baseAPI(urlOption: string, body: any): Promise<any> {
        const sendUrl = this.url + urlOption;

        try {
            const response = await this.axiosInstance.post(sendUrl, body);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = `Axios error in baseAPI: ${error.message}, URL: ${error.config.url}, Status: ${error.response?.status}, Data: ${JSON.stringify(error.response?.data)}`;
                console.error(errorMessage);
            } else {
                console.error(`Error in baseAPI: ${error.message}`);
            }
            throw error;
        }
    }
}

