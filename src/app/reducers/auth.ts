import {
    USER_GOOGLE_LOGIN,
    USER_LOGIN,
    USER_LOGIN_COMPLETED,
    USER_LOGIN_ERROR,
    USER_LOGIN_REQUEST,
    USER_LOGIN_RESET,
    USER_LOGOUT,
    USER_LOGOUT_REQUEST,
    USER_LOGOUT_COMPLETED,
    USER_LOGOUT_ERROR,
    USER_REGISTER,
    USER_REGISTER_COMPLETED,
    USER_REGISTER_ERROR,
    USER_REGISTER_REQUEST,
    USER_REGISTER_RESET,
} from '../actions';
import { PURGE } from 'redux-persist';

// Type definitions
export interface AuthUser {
    id: number;
    name: string;
    email: string;
    token: string;
    roles?: string[];
}

export interface AuthState {
    data: AuthUser | null;
    isLoading: boolean;
    isError: boolean;
    errorMessage: string | null;
    registerData: AuthUser | null;
    isRegistering: boolean;
    isRegisterError: boolean;
    registerErrorMessage: string | null;
    registerSuccess: boolean;
}

export interface AuthAction {
    type: string;
    payload?: any;
}

const INITIAL_STATE: AuthState = {
    data: null,
    isLoading: false,
    isError: false,
    errorMessage: null,
    registerData: null,
    isRegistering: false,
    isRegisterError: false,
    registerErrorMessage: null,
    registerSuccess: false,
};

export default function reducer(state: AuthState = INITIAL_STATE, action: AuthAction): AuthState {
    console.log('Auth Reducer - Action:', action.type);
    console.log('Auth Reducer - Current state:', state);
    switch (action.type) {
        case USER_LOGIN_REQUEST:
            return {
                ...state,
                data: null,
                isLoading: true,
                isError: false,
                errorMessage: null,
            };

        case USER_LOGIN_COMPLETED:
            return {
                ...state,
                data: action.payload,
                isLoading: false,
                isError: false,
                errorMessage: null,
            };

        case USER_LOGIN_ERROR:
            return {
                data: null,
                isLoading: false,
                isError: true,
                errorMessage: action.payload || 'Login failed. Please try again.',
                registerData: null,
                isRegistering: false,
                isRegisterError: false,
                registerErrorMessage: null,
                registerSuccess: false,
            };

        case USER_REGISTER_REQUEST:
            return {
                ...state,
                registerData: null,
                isRegistering: true,
                isRegisterError: false,
                registerErrorMessage: null,
                registerSuccess: false,
            };

        case USER_REGISTER_COMPLETED:
            return {
                ...state,
                registerData: action.payload,
                isRegistering: false,
                isRegisterError: false,
                registerErrorMessage: null,
                registerSuccess: true,
            };

        case USER_REGISTER_ERROR:
            return {
                ...state,
                registerData: null,
                isRegistering: false,
                isRegisterError: true,
                registerErrorMessage: action.payload || 'Registration failed. Please try again.',
                registerSuccess: false,
            };

        case USER_LOGIN_RESET:
            return {
                ...INITIAL_STATE,
            };

        case USER_LOGOUT_REQUEST:
            return {
                ...state,
                isLoading: true,
                isError: false,
                errorMessage: null,
            };

        case USER_LOGOUT_COMPLETED:
            return {
                ...INITIAL_STATE,
            };

        case USER_LOGOUT_ERROR:
            return {
                ...state,
                isLoading: false,
                isError: true,
                errorMessage: action.payload || 'Logout failed. Please try again.',
            };

        case USER_REGISTER_RESET:
            return {
                ...state,
                registerData: null,
                isRegistering: false,
                isRegisterError: false,
                registerErrorMessage: null,
                registerSuccess: false,
            };

        case PURGE:
            return INITIAL_STATE;

        default:
            return state;
    }
}

// Action creators
export const userLogin = (payload: any) => ({
    type: USER_LOGIN,
    payload,
});

export const userGoogleLogin = (payload: any) => ({
    type: USER_GOOGLE_LOGIN,
    payload,
});

export const userLoginCompleted = (payload: AuthUser) => ({
    type: USER_LOGIN_COMPLETED,
    payload,
});

export const resetLogin = () => ({
    type: USER_LOGIN_RESET,
});

export const userLogout = () => ({
    type: USER_LOGOUT,
});

export const userRegister = (payload: any) => ({
    type: USER_REGISTER,
    payload,
});

export const resetRegister = () => ({
    type: USER_REGISTER_RESET,
});
