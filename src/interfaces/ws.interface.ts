import { Tif } from "./order.interface";

export interface Subscribe {
    "type": string,
    "user"?: string,
    "coin"?: string,
    "interval"?: number
}
export type SubscribeType = "allMids" | "notification" | "webData2" | "candle" | "l2Book" | "userFills" | "orderUpdates" | "trades" | "userEvents" | "userFundings" | "userNonFundingLedgerUpdates"

export interface WsBasicOrder {
    coin: string;
    side: string;
    limitPx: string;
    sz: string;
    oid: number;
    timestamp: number;
    origSz: string;
    cloid: string | undefined;
}

export interface WsOrder {
    order: WsBasicOrder;
    status: string;
    statusTimestamp: number;
}

export interface WsUserFills {
    user: string;
    fills: WsUserFill[];
}
export interface WsUserFill {
    coin: string;
    px: string;
    sz: string;
    side: string;
    time: number;
    startPosition: string;
    dir: string;
    closedPnl: string;
    hash: string;
    oid: number;
    crossed: boolean;
    fee: string;
    tid: number;
    cloid?: string;
}

export interface WsTrade {
    coin: string;
    side: string;
    px: string;
    sz: string;
    hash: string;
    time: number;
}

export interface WsBook {
    coin: string;
    levels: [Array<WsLevel>, Array<WsLevel>];
    time: number;
}

export interface WsLevel {
    px: string; // price
    sz: string; // size
    n: number; // number of orders
}

export interface Notification {
    notification: string;
}

export interface AllMids {
    mids: Record<string, string>;
}

// export type WsUserEvent = WsFill[] | WsUserFunding | WsLiquidation | WsNonUserCancel[];

export interface WsUserFill {
    coin: string;
    px: string; // price
    sz: string; // size
    side: string;
    time: number;
    startPosition: string;
    dir: string; // used for frontend display
    closedPnl: string;
    hash: string; // L1 transaction hash
    oid: number; // order id
    crossed: boolean; // whether order crossed the spread (was taker)
    fee: string; // negative means rebate
    tid: number; // unique trade id
}

export interface WsUserFunding {
    time: number;
    coin: string;
    usdc: string;
    szi: string;
    fundingRate: string;
}

export interface WsLiquidation {
    lid: number;
    liquidator: string;
    liquidated_user: string;
    liquidated_ntl_pos: string;
    liquidated_account_value: string;
}

export interface WsNonUserCancel {
    coin: String;
    oid: number;
}

export interface WsOrder {
    order: WsBasicOrder;
    status: string;
    statusTimestamp: number;
}

export interface WsBasicOrder {
    coin: string;
    side: string;
    limitPx: string;
    sz: string;
    oid: number;
    timestamp: number;
    origSz: string;
    cloid: string | undefined;
}

export interface MarginSummary {
    accountValue: string;
    totalNtlPos: string;
    totalRawUsd: string;
    totalMarginUsed: string;
}

export interface Leverage {
    type: string; //cross | isolated だと思う
    value: number;
}

export interface CumFunding {
    allTime: string;
    sinceOpen: string;
    sinceChange: string;
}

export interface Position {
    coin: string;
    szi: string;
    leverage: Leverage;
    entryPx: string;
    positionValue: string;
    unrealizedPnl: string;
    returnOnEquity: string;
    liquidationPx: string | null;
    marginUsed: string;
    maxLeverage: number;
    cumFunding: CumFunding;
}


export interface AssetPosition {
    type: string; //onWay | position
    position: Position
}

export interface ClearinghouseState {
    marginSummary: MarginSummary;
    crossMarginSummary: MarginSummary;
    crossMaintenanceMarginUsed: string;
    withdrawable: string;
    assetPositions: AssetPosition[];
    time: number;
}

export interface OpenOrder {
    coin: string;
    side: string;
    limitPx: string;
    sz: string;
    oid: number;
    timestamp: number;
    triggerCondition: any;
    isTrigger: boolean;
    triggerPx: string;
    children: [];
    isPositionTpsl: boolean;
    reduceOnly: boolean;
    orderType: string; // おそらく'limit' | 'trigger'
    origSz: string;
    tif: Tif;
    cloid?: string
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
export interface AssetCtx {
    funding: string;
    openInterest: string;
    prevDayPx: string;
    dayNtlVlm: string;
    premium: string;
    oraclePx: string;
    markPx: string;
    midPx: string;
    impactPxs: string[];
}
export interface WsWebData2 {
    clearinghouseState: ClearinghouseState;
    leadingVaults: any;
    totalVaultEquity: string;
    openOrders: OpenOrder[];
    agentAddress: string;
    cumLedger: string;
    meta: MetaData
    assetCtxs: AssetCtx[];
    serverTime: number;
    isVault: boolean;
    user: string;
    twapStates: any; //不明
}
