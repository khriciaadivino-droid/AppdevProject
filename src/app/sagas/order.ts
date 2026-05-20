import { call, put, takeEvery, select, fork } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import * as types from '../actions';
import * as orderAPI from '../api/order';

interface OrderAction {
    type: string;
    payload?: any;
    token?: string;
    id?: number;
    params?: any;
}

interface ApiResponse {
    ok: boolean;
    data?: {
        success: boolean;
        data?: any;
        message?: string;
    };
}

function* getToken(fallbackToken?: string): any {
    if (fallbackToken) return fallbackToken;
    const state: any = yield select();
    return state.auth?.data?.token || null;
}

export function* getOrdersAsync(action: OrderAction): SagaIterator {
    try {
        const token: string = yield call(getToken, action.token);
        const response: ApiResponse = yield call(orderAPI.getOrders, token, action.params);

        if (response.ok && response.data?.success) {
            yield put({ type: types.GET_ORDERS_COMPLETED, payload: response.data.data });
        } else {
            yield put({ type: types.GET_ORDERS_ERROR, payload: response.data?.message || 'Failed to fetch orders' });
        }
    } catch (error: any) {
        console.log('🔴 getOrders error:', error.message);
        yield put({ type: types.GET_ORDERS_ERROR, payload: error.message });
    }
}

export function* createOrderAsync(action: OrderAction): SagaIterator {
    try {
        const token: string = yield call(getToken, action.token);
        const response: ApiResponse = yield call(orderAPI.createOrder, action.payload, token);

        if (response.ok && response.data?.success) {
            yield put({ type: types.CREATE_ORDER_COMPLETED, payload: response.data.data });
        } else {
            yield put({ type: types.CREATE_ORDER_ERROR, payload: response.data?.message || 'Failed to create order' });
        }
    } catch (error: any) {
        console.log('🔴 createOrder error:', error.message);
        yield put({ type: types.CREATE_ORDER_ERROR, payload: error.message });
    }
}

export function* updateOrderAsync(action: OrderAction): SagaIterator {
    try {
        const token: string = yield call(getToken, action.token);
        const response: ApiResponse = yield call(orderAPI.updateOrder, action.id, action.payload, token);

        if (response.ok && response.data?.success) {
            yield put({ type: types.UPDATE_ORDER_COMPLETED, payload: response.data.data });
        } else {
            yield put({ type: types.UPDATE_ORDER_ERROR, payload: response.data?.message || 'Failed to update order' });
        }
    } catch (error: any) {
        console.log('🔴 updateOrder error:', error.message);
        yield put({ type: types.UPDATE_ORDER_ERROR, payload: error.message });
    }
}

export function* deleteOrderAsync(action: OrderAction): SagaIterator {
    try {
        const token: string = yield call(getToken, action.token);
        const response: ApiResponse = yield call(orderAPI.deleteOrder, action.id, token);

        if (response.ok && response.data?.success) {
            yield put({ type: types.DELETE_ORDER_COMPLETED, payload: action.id });
        } else {
            yield put({ type: types.DELETE_ORDER_ERROR, payload: response.data?.message || 'Failed to delete order' });
        }
    } catch (error: any) {
        console.log('🔴 deleteOrder error:', error.message);
        yield put({ type: types.DELETE_ORDER_ERROR, payload: error.message });
    }
}

export function* watchOrders(): SagaIterator {
    yield takeEvery([
        types.GET_ORDERS_REQUEST,
        types.CREATE_ORDER_REQUEST,
        types.UPDATE_ORDER_REQUEST,
        types.DELETE_ORDER_REQUEST,
    ], function* (action: OrderAction): SagaIterator {
        if (action.type === types.GET_ORDERS_REQUEST) yield call(getOrdersAsync, action);
        else if (action.type === types.CREATE_ORDER_REQUEST) yield call(createOrderAsync, action);
        else if (action.type === types.UPDATE_ORDER_REQUEST) yield call(updateOrderAsync, action);
        else if (action.type === types.DELETE_ORDER_REQUEST) yield call(deleteOrderAsync, action);
    });
}

// Default export for root saga
export default function* orderSaga(): SagaIterator {
    yield fork(watchOrders);
}
