import { call, put, takeEvery, fork, select } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { authGoogleLogin, authLogin, authRegister, authLogout } from '../api/auth';
import { formatErrorForRedux } from '../../utils/errorUtils';
import { setError, setValidationError } from '../reducers/error';
import { RootState } from '../reducers';

import {
    USER_LOGIN,
    USER_LOGIN_COMPLETED,
    USER_LOGIN_ERROR,
    USER_LOGIN_REQUEST,
    USER_GOOGLE_LOGIN,
    USER_LOGOUT,
    USER_LOGOUT_COMPLETED,
    USER_LOGOUT_ERROR,
    USER_LOGOUT_REQUEST,
    USER_REGISTER,
    USER_REGISTER_COMPLETED,
    USER_REGISTER_ERROR,
    USER_REGISTER_REQUEST,
} from '../actions';

interface AuthAction {
    type: string;
    payload?: any;
}

export function* userLoginAsync(action: AuthAction): SagaIterator {
    console.log('👤 userLoginAsync started with:', action.payload);
    yield put({ type: USER_LOGIN_REQUEST });

    try {
        console.log('👤 Calling authLogin API...');
        let response;

        try {
            response = yield call(authLogin, action.payload);
        } catch (callError: any) {
            console.error('👤 Call error:', callError);
            // authLogin should never throw since it catches errors, but just in case
            response = {
                ok: false,
                status: 500,
                data: { message: callError?.message || 'API request failed' }
            };
        }

        console.log('👤 API login response:', response);
        console.log('👤 Response ok:', response?.ok, 'Status:', response?.status);

        if (response?.ok && response?.data) {
            const userData = response.data.user || response.data.data || response.data;
            const token = response.data.token;

            console.log('✅ Login successful, user data:', userData, 'token:', token);

            // Dispatch with user data and token
            yield put({
                type: USER_LOGIN_COMPLETED,
                payload: {
                    ...userData,
                    token,
                    loginTime: new Date().toISOString(),
                }
            });
            yield put(setError(null));
        } else {
            const message = response?.data?.message || 'Login failed. Please try again.';
            console.log('❌ Login failed:', message);

            if (response?.status === 422 && response?.data?.errors) {
                yield put(setValidationError(response.data.errors));
            }

            yield put({ type: USER_LOGIN_ERROR, payload: message });
            yield put(setError({
                statusCode: response?.status || 500,
                userMessage: message,
                message: message,
                fieldErrors: response?.data?.errors || {},
            }));
        }

    } catch (error: any) {
        console.error('❌ Saga Login error:', error);
        const errorPayload = formatErrorForRedux(error, null);
        const message = errorPayload.message || 'Login failed. Please try again.';

        yield put({ type: USER_LOGIN_ERROR, payload: message });
        yield put(setError(errorPayload));
    }
}

export function* userGoogleLoginAsync(action: AuthAction): SagaIterator {
    yield put({ type: USER_LOGIN_REQUEST });

    try {
        let response;

        try {
            response = yield call(authGoogleLogin, action.payload);
        } catch (callError: any) {
            response = {
                ok: false,
                status: 500,
                data: { message: callError?.message || 'API request failed' },
            };
        }

        if (response?.ok && response?.data) {
            const userData = response.data.user || response.data.data || response.data;
            const token = response.data.token;

            yield put({
                type: USER_LOGIN_COMPLETED,
                payload: {
                    ...userData,
                    token,
                    loginTime: new Date().toISOString(),
                },
            });
            yield put(setError(null));
        } else {
            const message = response?.data?.message || 'Google Sign-In failed. Please try again.';

            yield put({ type: USER_LOGIN_ERROR, payload: message });
            yield put(setError({
                statusCode: response?.status || 500,
                userMessage: message,
                message,
                fieldErrors: response?.data?.errors || {},
            }));
        }
    } catch (error: any) {
        const errorPayload = formatErrorForRedux(error, null);
        const message = errorPayload.message || 'Google Sign-In failed. Please try again.';

        yield put({ type: USER_LOGIN_ERROR, payload: message });
        yield put(setError(errorPayload));
    }
}

export function* userRegisterAsync(action: AuthAction): SagaIterator {
    console.log('📝 userRegisterAsync started with:', action.payload);
    yield put({ type: USER_REGISTER_REQUEST });

    try {
        console.log('📝 Calling authRegister API...');
        let response;

        try {
            response = yield call(authRegister, action.payload);
        } catch (callError: any) {
            console.error('📝 Call error:', callError);
            response = {
                ok: false,
                status: 500,
                data: { message: callError?.message || 'API request failed' }
            };
        }

        console.log('📝 API register response:', response);
        console.log('📝 Response ok:', response?.ok, 'Status:', response?.status);

        if (response?.ok && response?.data) {
            const userData = response.data.user || response.data.data || response.data;
            const token = response.data.token;

            console.log('✅ Registration successful, user data:', userData);

            yield put({
                type: USER_REGISTER_COMPLETED,
                payload: {
                    ...userData,
                    token,
                    loginTime: new Date().toISOString(),
                }
            });
            yield put(setError(null));
        } else {
            const message = response?.data?.message || 'Registration failed. Please try again.';
            console.log('❌ Registration failed:', message);

            if (response?.status === 422 && response?.data?.errors) {
                console.log('⚠️ Validation errors:', response.data.errors);
                yield put(setValidationError(response.data.errors));
            }

            yield put({ type: USER_REGISTER_ERROR, payload: message });
            yield put(setError({
                statusCode: response?.status || 500,
                userMessage: message,
                message: message,
                fieldErrors: response?.data?.errors || {},
            }));
        }

    } catch (error: any) {
        console.error('❌ Register error:', error);
        const errorPayload = formatErrorForRedux(error, null);
        const message = errorPayload.message || 'Registration failed. Please try again.';
        console.error('❌ Error message to dispatch:', message);

        yield put({ type: USER_REGISTER_ERROR, payload: message });
        yield put(setError(errorPayload));
    }
}

export function* userLogoutAsync(): SagaIterator {
    console.log('🔓 userLogoutAsync started');
    yield put({ type: USER_LOGOUT_REQUEST });

    try {
        console.log('🔓 Calling authLogout API...');

        // Get token from Redux state
        const authState: any = yield select((state: RootState) => state.auth);
        const token = authState?.data?.token;

        if (!token) {
            console.warn('⚠️ No token found in state, logout may fail');
        }

        console.log('🔓 Token available:', !!token);

        let response;

        try {
            // Pass token to logout API
            response = yield call(authLogout, token);
        } catch (callError: any) {
            console.error('🔓 Call error:', callError);
            response = {
                ok: false,
                status: 500,
                data: { message: callError?.message || 'API request failed' }
            };
        }

        console.log('🔓 API logout response:', response);
        console.log('🔓 Response ok:', response?.ok, 'Status:', response?.status);

        if (response?.ok) {
            console.log('✅ Logout successful');

            yield put({
                type: USER_LOGOUT_COMPLETED,
            });
            yield put(setError(null));
        } else {
            const message = response?.data?.message || 'Logout failed. Please try again.';
            console.log('❌ Logout failed:', message);

            yield put({ type: USER_LOGOUT_ERROR, payload: message });
            yield put(setError({
                statusCode: response?.status || 500,
                userMessage: message,
                message: message,
                fieldErrors: {},
            }));
        }

    } catch (error: any) {
        console.error('❌ Saga Logout error:', error);
        const errorPayload = formatErrorForRedux(error, null);
        const message = errorPayload.message || 'Logout failed. Please try again.';

        yield put({ type: USER_LOGOUT_ERROR, payload: message });
        yield put(setError(errorPayload));
    }
}

export function* userLogin(): SagaIterator {
    yield takeEvery(USER_LOGIN, userLoginAsync);
}

export function* userGoogleLogin(): SagaIterator {
    yield takeEvery(USER_GOOGLE_LOGIN, userGoogleLoginAsync);
}

export function* userLogout(): SagaIterator {
    yield takeEvery(USER_LOGOUT, userLogoutAsync);
}

export function* userRegister(): SagaIterator {
    yield takeEvery(USER_REGISTER, userRegisterAsync);
}

// Default export - combines all auth sagas
export default function* authSaga(): SagaIterator {
    yield fork(userLogin);
    yield fork(userGoogleLogin);
    yield fork(userLogout);
    yield fork(userRegister);
}
