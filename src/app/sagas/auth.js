import { call, put, takeEvery } from 'redux-saga/effects';
import { authLogin } from '../api/auth';

import {
  USER_LOGIN,
  USER_LOGIN_COMPLETED,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
} from '../actions';


const mockLogin = async ({ email, password }) => {
  console.log(' Mock Login Called:', { email, password });


  await new Promise(resolve => setTimeout(resolve, 800));

  console.log(' Mock Login - Returning success');


  return {
    id: 1,
    email: email,
    name: 'Test User',
    token: 'mock-token-12345',
    loginTime: new Date().toISOString(),
  };
};

export function* userLoginAsync(action) {
  console.log(' userLoginAsync started with:', action.payload);
  yield put({ type: USER_LOGIN_REQUEST });

  try {
    console.log(' Calling authLogin API...');
    const response = yield call(authLogin, action.payload);

    console.log(' API login response:', response);
    yield put({ type: USER_LOGIN_COMPLETED, payload: response });
    console.log(' USER_LOGIN_COMPLETED dispatched');

  } catch (error) {
    console.error(' Login error:', error);
    const message = error?.message || 'Login failed. Please try again.';
    const canFallbackToMock =
      __DEV__ &&
      /network request failed|failed to fetch|endpoint not found|timed out|404|5\d\d|mongoose|mongo|serverselectionerror|econnrefused|api server is unreachable/i.test(message);

    if (canFallbackToMock) {
      const mockResponse = yield call(mockLogin, action.payload);
      yield put({ type: USER_LOGIN_COMPLETED, payload: mockResponse });
      return;
    }

    yield put({ type: USER_LOGIN_ERROR, payload: message });
  }
}

export function* userLogin() {

  yield takeEvery(USER_LOGIN, userLoginAsync);
}
