import { call, put, takeEvery, select, fork } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import * as types from '../actions';
import * as petAPI from '../api/pet';

interface PetAction {
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

export function* getPetsAsync(action: PetAction): SagaIterator {
    try {
        const token: string = yield call(getToken, action.token);
        const response: ApiResponse = yield call(petAPI.getPets, token, action.params);

        if (response.ok && response.data?.success) {
            yield put({ type: types.GET_PETS_COMPLETED, payload: response.data.data });
        } else {
            yield put({ type: types.GET_PETS_ERROR, payload: response.data?.message || 'Failed to fetch pets' });
        }
    } catch (error: any) {
        console.log('🔴 getPets error:', error.message);
        yield put({ type: types.GET_PETS_ERROR, payload: error.message });
    }
}

export function* createPetAsync(action: PetAction): SagaIterator {
    try {
        const token: string = yield call(getToken, action.token);
        const response: ApiResponse = yield call(petAPI.createPet, action.payload, token);

        if (response.ok && response.data?.success) {
            yield put({ type: types.CREATE_PET_COMPLETED, payload: response.data.data });
        } else {
            yield put({ type: types.CREATE_PET_ERROR, payload: response.data?.message || 'Failed to create pet' });
        }
    } catch (error: any) {
        console.log('🔴 createPet error:', error.message);
        yield put({ type: types.CREATE_PET_ERROR, payload: error.message });
    }
}

export function* updatePetAsync(action: PetAction): SagaIterator {
    try {
        const token: string = yield call(getToken, action.token);
        const response: ApiResponse = yield call(petAPI.updatePet, action.id, action.payload, token);

        if (response.ok && response.data?.success) {
            yield put({ type: types.UPDATE_PET_COMPLETED, payload: response.data.data });
        } else {
            yield put({ type: types.UPDATE_PET_ERROR, payload: response.data?.message || 'Failed to update pet' });
        }
    } catch (error: any) {
        console.log('🔴 updatePet error:', error.message);
        yield put({ type: types.UPDATE_PET_ERROR, payload: error.message });
    }
}

export function* deletePetAsync(action: PetAction): SagaIterator {
    try {
        const token: string = yield call(getToken, action.token);
        const response: ApiResponse = yield call(petAPI.deletePet, action.id, token);

        if (response.ok && response.data?.success) {
            yield put({ type: types.DELETE_PET_COMPLETED, payload: action.id });
        } else {
            yield put({ type: types.DELETE_PET_ERROR, payload: response.data?.message || 'Failed to delete pet' });
        }
    } catch (error: any) {
        console.log('🔴 deletePet error:', error.message);
        yield put({ type: types.DELETE_PET_ERROR, payload: error.message });
    }
}

export function* watchPets(): SagaIterator {
    yield takeEvery([
        types.GET_PETS_REQUEST,
        types.CREATE_PET_REQUEST,
        types.UPDATE_PET_REQUEST,
        types.DELETE_PET_REQUEST,
    ], function* (action: PetAction): SagaIterator {
        if (action.type === types.GET_PETS_REQUEST) yield call(getPetsAsync, action);
        else if (action.type === types.CREATE_PET_REQUEST) yield call(createPetAsync, action);
        else if (action.type === types.UPDATE_PET_REQUEST) yield call(updatePetAsync, action);
        else if (action.type === types.DELETE_PET_REQUEST) yield call(deletePetAsync, action);
    });
}

// Default export for root saga
export default function* petSaga(): SagaIterator {
    yield fork(watchPets);
}
