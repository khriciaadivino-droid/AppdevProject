import * as types from '../actions';

// Type definitions
export interface Order {
    id: number;
    userId: number;
    status: string;
    totalAmount?: number;
    items?: any[];
    createdAt?: string;
    [key: string]: any;
}

export interface OrderState {
    list: Order[];
    isLoading: boolean;
    error: string | null;
}

export interface OrderAction {
    type: string;
    payload?: any;
}

const initialState: OrderState = {
    list: [],
    isLoading: false,
    error: null,
};

export default function orderReducer(state: OrderState = initialState, action: OrderAction): OrderState {
    switch (action.type) {
        case types.GET_ORDERS_REQUEST:
            return { ...state, isLoading: true, error: null };
        case types.GET_ORDERS_COMPLETED:
            return { ...state, list: action.payload, isLoading: false };
        case types.GET_ORDERS_ERROR:
            return { ...state, error: action.payload, isLoading: false };

        case types.CREATE_ORDER_REQUEST:
            return { ...state, isLoading: true, error: null };
        case types.CREATE_ORDER_COMPLETED:
            return { ...state, list: [...state.list, action.payload], isLoading: false };
        case types.CREATE_ORDER_ERROR:
            return { ...state, error: action.payload, isLoading: false };

        case types.UPDATE_ORDER_REQUEST:
            return { ...state, isLoading: true, error: null };
        case types.UPDATE_ORDER_COMPLETED:
            return {
                ...state,
                list: state.list.map(item => item.id === action.payload.id ? action.payload : item),
                isLoading: false,
            };
        case types.UPDATE_ORDER_ERROR:
            return { ...state, error: action.payload, isLoading: false };

        case types.DELETE_ORDER_REQUEST:
            return { ...state, isLoading: true, error: null };
        case types.DELETE_ORDER_COMPLETED:
            return {
                ...state,
                list: state.list.filter(item => item.id !== action.payload),
                isLoading: false,
            };
        case types.DELETE_ORDER_ERROR:
            return { ...state, error: action.payload, isLoading: false };

        default:
            return state;
    }
}
