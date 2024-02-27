import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExchangeService } from 'src/exchange/hyperliquid/rest-api/exchange.service';

import { InfoService } from 'src/exchange/hyperliquid/rest-api/info.service';
import { MetaDataService } from './meta-data.service';

@Injectable()
export class PositionValidatorService {
    private tradeSizeMultiplier: number;

    constructor(
        private infoService: InfoService,
        private configService: ConfigService,
        private exchangeService: ExchangeService,
        private metaDataService: MetaDataService,

    ) {
        this.tradeSizeMultiplier = parseFloat(this.configService.get<string>('TRADE_SIZE_MULTIPLIER'));
    }

    async positionValidate(masterAddress: string, coin: string): Promise<void> {

        const masterState = await this.infoService.userState(masterAddress);
        const masterPosition = masterState.assetPositions.find((position) => position.position.coin === coin).position;
        setTimeout(() => {
        }, 5000);

        if (masterPosition) {
            const isBuy = parseFloat(masterPosition.szi) > 0;
            const size = this.getSize(masterPosition.szi, coin);
            const price = this.getOrderPrice(parseFloat(masterPosition.entryPx), isBuy);
            const res = await this.exchangeService.order(
                coin,
                isBuy,
                price,
                size
            )
            console.log('ポジション調整完了', res.response.data.statuses);

        }

    }

    private getSize(size: string, coin: string): number {
        return this.roundSize(Math.abs(parseFloat(size) * this.tradeSizeMultiplier), coin);
    }

    private getOrderPrice(price: number, isBuy: boolean): number {
        const adjustedPrice = isBuy ? price * 1.05 : price * 0.95;
        const formattedPrice = parseFloat(adjustedPrice.toPrecision(5));

        if (formattedPrice.toString().split('.')[1]?.length > 5) {
            throw new Error('Invalid price: more than 5 decimal places');
        }

        return formattedPrice;
    }

    private roundSize(size: number, coin: string): number {
        const decimals = this.metaDataService.getCurrencySzDecimals(coin)
        const factor = Math.pow(10, decimals);
        return Math.round(size * factor) / factor;
    }

}