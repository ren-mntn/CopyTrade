import { Injectable } from '@nestjs/common';
import { InfoService } from 'src/exchange/hyperliquid/rest-api/info.service';
import { Meta, MetaData } from 'src/interfaces/ws.interface';

@Injectable()
export class MetaDataService {
    constructor(private info: InfoService) { }

    private metaData: Meta[] = [];

    async updateMetaData() {
        const response: MetaData = await this.info.meta();
        this.metaData = response.universe;
    }

    getCurrencyIndex(currencyName: string): number {
        if (!this.metaData) {
            throw new Error('MetaData is not initialized');
        }
        const currency = this.metaData.find((c: Meta) => c.name === currencyName);
        return this.metaData.indexOf(currency);
    }

    getCurrencySzDecimals(currencyName: string): number {
        if (this.metaData.length === 0) {
            throw new Error('MetaData is not initialized');
        }
        const currency = this.metaData.find((c: Meta) => c.name === currencyName);
        if (!currency) {
            throw new Error(`Currency ${currencyName} not found in meta data`);
        }
        return currency.szDecimals;
    }
}
