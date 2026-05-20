/**
 * Root Saga Index (TypeScript)
 * Combines all sagas and registers them with the store
 */

import { fork } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import authSaga from './auth';
import petSaga from './pet';
import orderSaga from './order';

/**
 * Root saga
 * Spawns all application sagas
 */
export function* rootSaga(): SagaIterator {
    yield fork(authSaga);
    yield fork(petSaga);
    yield fork(orderSaga);
}

export default rootSaga;
