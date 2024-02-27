import { AssetPosition, MarginSummary, Position } from "./ws.interface";

export type Tif = 'Alo' | 'Ioc' | 'Gtc';

export interface Tpsl {
    tp: number;
    sl: number;
}
export interface LimitOrderType {
    tif: Tif;
}
export interface TriggerOrderType {
    triggerPx: number;
    isMarket: boolean;
    tpsl: Tpsl;
}

export interface OrderType {
    limit?: LimitOrderType;
    trigger?: TriggerOrderType;
    total?: false;
}

export interface OrderRequest {
    coin: string;
    isBuy: boolean;
    limitPx: number;
    sz: number;
    reduceOnly: boolean;
    cloid?: string;
}

export interface OrderWire {
    a: number;
    b: boolean;
    p: string;
    s: string;
    r: boolean;
    t: OrderType
    c?: string;
}

export interface CancelRequest {
    coin: string;
    oid: number;
}

export interface CancelByCloidRequest {
    coin: string;
    cloid: string;
}

export interface UserState {
    assetPositions: AssetPosition[],
    crossMaintenanceMarginUsed: string;
    crossMarginSummary: MarginSummary;
    marginSummary: MarginSummary;
    time: number;
    withdrawable: string;
}

export interface Meta {
    name: string;
    szDecimals: number;
    maxLeverage: number;
    onlyIsolated: boolean;
}

export interface MetaData {
    universe: Meta[];
}

export interface UserFill {
    closedPnl: string;
    coin: string;
    crossed: boolean;
    dir: string;
    hash: string;
    oid: number;
    px: string;
    side: string;
    startPosition: string;
    sz: string;
    time: number;
}
