/**
 * Error utility functions for parsing and formatting API errors (TypeScript)
 * Converts backend error responses into user-friendly messages
 */

export interface ParsedError {
    userMessage: string;
    fieldErrors: Record<string, string | string[]>;
    technicalError?: string;
    statusCode: number;
}

/**
 * Parse API error response and extract relevant information
 */
export const parseAPIError = (response: any, statusCode: number): ParsedError => {
    let userMessage = 'An error occurred. Please try again.';
    let fieldErrors: Record<string, string | string[]> = {};
    let technicalError: string | undefined;

    switch (statusCode) {
        case 400:
            userMessage = response?.data?.message || 'Invalid request. Please check your input.';
            fieldErrors = response?.data?.errors || {};
            break;

        case 401:
            userMessage = 'Your session has expired. Please log in again.';
            technicalError = 'Unauthorized - JWT token invalid or expired';
            break;

        case 403:
            userMessage = 'You do not have permission to perform this action.';
            technicalError = 'Forbidden - Insufficient permissions';
            break;

        case 404:
            userMessage = 'The requested resource was not found.';
            technicalError = 'Resource not found';
            break;

        case 422:
            userMessage = 'Validation failed. Please check your input.';
            fieldErrors = formatValidationErrors(response?.data?.errors);
            technicalError = 'Validation error - check field errors';
            break;

        case 429:
            userMessage = 'Too many requests. Please wait a moment and try again.';
            technicalError = 'Rate limited';
            break;

        case 500:
            userMessage = 'Server error. Please try again later.';
            technicalError = response?.data?.message || 'Internal server error';
            break;

        case 503:
            userMessage = 'Service is temporarily unavailable. Please try again later.';
            technicalError = 'Service unavailable';
            break;

        default:
            userMessage = response?.data?.message || 'An unexpected error occurred.';
            technicalError = `Error code: ${statusCode}`;
    }

    return {
        userMessage,
        fieldErrors,
        technicalError,
        statusCode,
    };
};

/**
 * Format validation errors from API response
 */
const formatValidationErrors = (
    errors: any
): Record<string, string | string[]> => {
    if (!errors || typeof errors !== 'object') {
        return {};
    }

    const formatted: Record<string, string | string[]> = {};

    for (const [field, messages] of Object.entries(errors)) {
        if (Array.isArray(messages)) {
            formatted[field] = messages.length === 1 ? messages[0] : messages;
        } else if (typeof messages === 'string') {
            formatted[field] = messages;
        } else {
            formatted[field] = 'Invalid input';
        }
    }

    return formatted;
};

/**
 * Get user-friendly error message from various error types
 */
export const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') {
        return error;
    }

    if (error?.message) {
        return error.message;
    }

    if (error?.userMessage) {
        return error.userMessage;
    }

    if (error?.data?.message) {
        return error.data.message;
    }

    return 'An error occurred. Please try again.';
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (statusCode: number): boolean => {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(statusCode);
};

/**
 * Format error for Redux dispatch
 */
export const formatErrorForRedux = (error: any) => {
    if (!error) {
        return {
            message: 'Unknown error occurred',
            statusCode: 0,
            isRetryable: false,
        };
    }

    const statusCode = error.statusCode || error.status || 0;
    const message = getErrorMessage(error);

    return {
        message,
        statusCode,
        isRetryable: isRetryableError(statusCode),
        details: error,
    };
};
