/**
 * Global error reducer for handling app-wide errors
 * Used for network errors, authentication failures, etc.
 */

// Type definitions
export interface ErrorPayload {
    error?: any;
    statusCode?: number;
    message?: string;
    userMessage?: string;
    fieldErrors?: Record<string, any>;
    isRetryable?: boolean;
    timestamp?: string;
    actionType?: string;
}

export interface ErrorState {
    error: any;
    statusCode: number | null;
    message: string | null;
    userMessage: string | null;
    fieldErrors: Record<string, any>;
    isRetryable: boolean;
    timestamp: string | null;
    actionType: string | null;
}

export interface ErrorAction {
    type: string;
    payload?: ErrorPayload;
}

const initialState: ErrorState = {
    error: null,
    statusCode: null,
    message: null,
    userMessage: null,
    fieldErrors: {},
    isRetryable: false,
    timestamp: null,
    actionType: null,
};

export default function errorReducer(state: ErrorState = initialState, action: ErrorAction): ErrorState {
    switch (action.type) {
        // Global error actions
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                statusCode: action.payload?.statusCode ?? null,
                message: action.payload?.message ?? null,
                userMessage: action.payload?.userMessage ?? null,
                fieldErrors: action.payload?.fieldErrors || {},
                isRetryable: action.payload?.isRetryable || false,
                timestamp: action.payload?.timestamp || new Date().toISOString(),
                actionType: action.payload?.actionType ?? null,
            };

        case 'CLEAR_ERROR':
            return initialState;

        case 'UNAUTHORIZED_ERROR':
            return {
                ...initialState,
                statusCode: 401,
                message: 'Session expired. Please login again.',
                userMessage: 'Your session has expired. Please log in again.',
                isRetryable: false,
                timestamp: new Date().toISOString(),
            };

        case 'FORBIDDEN_ERROR':
            return {
                ...state,
                statusCode: 403,
                message: 'Permission denied.',
                userMessage: 'You do not have permission to perform this action.',
                isRetryable: false,
                timestamp: new Date().toISOString(),
            };

        case 'NETWORK_ERROR':
            return {
                ...state,
                statusCode: 0,
                message: 'Network error.',
                userMessage: action.payload?.message || 'Please check your internet connection.',
                isRetryable: true,
                timestamp: new Date().toISOString(),
            };

        case 'VALIDATION_ERROR':
            return {
                ...state,
                statusCode: 422,
                message: 'Validation failed.',
                userMessage: 'Please check your input and try again.',
                fieldErrors: action.payload?.fieldErrors || {},
                isRetryable: false,
                timestamp: new Date().toISOString(),
            };

        default:
            return state;
    }
}

// Action creators
export const setError = (payload: ErrorPayload | null) => ({
    type: 'SET_ERROR',
    payload,
});

export const clearError = () => ({
    type: 'CLEAR_ERROR',
});

export const setValidationError = (fieldErrors: Record<string, any>) => ({
    type: 'VALIDATION_ERROR',
    payload: { fieldErrors },
});
