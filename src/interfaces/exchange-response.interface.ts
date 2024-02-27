
export interface OrderResponse {
    status: string;
    response: OrderResponse | CancelResponse;
}
export interface OrderResponse{
    type: 'order';
    data: {
        statuses: OrderStatus[];
    };
}

export interface OrderStatus {
    resting: {
        oid: number;
    }
}

export interface CancelResponse {
    type: 'cancel';
    data: {
        statuses: string[];
    };
}