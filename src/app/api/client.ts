/**
 * Centralized HTTP Client (TypeScript)
 * Handles all API requests with fallback URL support, timeouts, and error handling
 */

import { NativeModules, Platform } from 'react-native';

const API_PORT = 8000;
let preferredBaseUrl: string | null = null;

const getMetroHost = (): string | null => {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;

    if (!scriptURL) {
        return null;
    }

    try {
        const parsedHost = scriptURL.match(/^https?:\/\/([^/:]+)/i)?.[1];

        return parsedHost ?? null;
    } catch {
        return null;
    }
};

const getBaseUrls = (): string[] => {
    const urls = new Set<string>();
    const metroHost = getMetroHost();

    if (metroHost) {
        urls.add(`http://${metroHost}:${API_PORT}`);
    }

    if (Platform.OS === 'android') {
        urls.add(`http://10.0.2.2:${API_PORT}`);
        urls.add(`http://10.0.3.2:${API_PORT}`);
    }

    urls.add('http://192.168.254.104:8000');
    urls.add('http://localhost:8000');
    urls.add('http://127.0.0.1:8000');

    return Array.from(urls);
};

const API_CONFIG = {
    TIMEOUT: 12000,
    FALLBACK_TIMEOUT: 4000,
    DEBUG: true,
    ENDPOINTS: {
        LOGIN: '/api/login',
        REGISTER: '/api/register',
        VERIFY_EMAIL: '/api/verify-email',
        FORGOT_PASSWORD: '/api/forgot-password',
        RESET_PASSWORD: '/api/reset-password',
    },
};

console.log('🔧 [API Client] Initialized with BASE_URLS:', getBaseUrls());

// Type definitions
interface FetchOptions extends RequestInit {
    signal?: AbortSignal;
}

interface ApiResponse<T = any> {
    status: number;
    ok: boolean;
    data?: T;
    response: Response;
}

/**
 * Fetch with timeout support
 */
const fetchWithTimeout = async (
    url: string,
    options: FetchOptions = {},
    timeoutMs: number = API_CONFIG.TIMEOUT
): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error?.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeoutMs}ms`);
        }
        throw error;
    }
};

/**
 * Build full URL from endpoint
 */
const buildUrl = (baseUrl: string, endpoint: string): string => {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    if (normalizedEndpoint.startsWith('/api/')) {
        return `${baseUrl}${normalizedEndpoint}`;
    }

    if (normalizedEndpoint.startsWith('/mobile/')) {
        return `${baseUrl}/api${normalizedEndpoint}`;
    }

    return `${baseUrl}/api${normalizedEndpoint}`;
};

const getOrderedBaseUrls = (): string[] => {
    const baseUrls = getBaseUrls();

    if (!preferredBaseUrl || !baseUrls.includes(preferredBaseUrl)) {
        return baseUrls;
    }

    return [preferredBaseUrl, ...baseUrls.filter((url) => url !== preferredBaseUrl)];
};

const hasJsonContentType = (response: Response): boolean => {
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';

    return contentType.includes('application/json') || contentType.includes('+json');
};

const readResponseData = async <T = any>(response: Response): Promise<T | undefined> => {
    if (!hasJsonContentType(response)) {
        return undefined;
    }

    try {
        return (await response.clone().json()) as T;
    } catch {
        return undefined;
    }
};

const isApiResponse = (response: Response): boolean => response.ok || hasJsonContentType(response);

/**
 * Main HTTP client with fallback support
 */
export const apiClient = async <T = any>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<ApiResponse<T>> => {
    const baseUrls = getOrderedBaseUrls();
    let lastError: Error | null = null;
    let lastResponse: Response | null = null;

    for (const baseUrl of baseUrls) {
        try {
            const fullUrl = buildUrl(baseUrl, endpoint);
            const timeoutMs = preferredBaseUrl === baseUrl
                ? API_CONFIG.TIMEOUT
                : API_CONFIG.FALLBACK_TIMEOUT;

            if (API_CONFIG.DEBUG) {
                console.log(`📡 [API] Trying: ${fullUrl} (${timeoutMs}ms timeout)`);
            }

            const response = await fetchWithTimeout(fullUrl, options, timeoutMs);

            if (API_CONFIG.DEBUG) {
                console.log(`📡 [API] Response: ${response.status} ${response.statusText}`);
            }

            lastResponse = response;

            if (isApiResponse(response)) {
                preferredBaseUrl = baseUrl;

                return {
                    status: response.status,
                    ok: response.ok,
                    data: await readResponseData<T>(response),
                    response,
                };
            }

            if (API_CONFIG.DEBUG) {
                console.log('⚠️ [API] Non-JSON fallback response, trying next base URL');
            }
        } catch (error: any) {
            lastError = error;
            if (API_CONFIG.DEBUG) {
                console.log(`⚠️ [API] Failed: ${error.message}`);
            }
            continue;
        }
    }

    // If we got a response but it wasn't ok, return it
    if (lastResponse) {
        return {
            status: lastResponse.status,
            ok: lastResponse.ok,
            data: await readResponseData<T>(lastResponse),
            response: lastResponse,
        };
    }

    // All failed, throw last error
    throw lastError || new Error('All API endpoints failed');
};

/**
 * GET request
 */
export const apiGet = async <T = any>(
    endpoint: string,
    token?: string
): Promise<ApiResponse<T>> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        return await apiClient<T>(endpoint, {
            method: 'GET',
            headers,
        });
    } catch (error: any) {
        console.error('📡 [API] GET request failed:', error.message);
        return {
            status: 0,
            ok: false,
            data: { message: error?.message || 'Network error' } as any,
            response: null as any,
        };
    }
};

/**
 * POST request
 */
export const apiPost = async <T = any>(
    endpoint: string,
    body?: any,
    token?: string
): Promise<ApiResponse<T>> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        return await apiClient<T>(endpoint, {
            method: 'POST',
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch (error: any) {
        console.error('📡 [API] POST request failed:', error.message);
        return {
            status: 0,
            ok: false,
            data: { message: error?.message || 'Network error' } as any,
            response: null as any,
        };
    }
};

/**
 * PUT request
 */
export const apiPut = async <T = any>(
    endpoint: string,
    body?: any,
    token?: string
): Promise<ApiResponse<T>> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        return await apiClient<T>(endpoint, {
            method: 'PUT',
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch (error: any) {
        console.error('📡 [API] PUT request failed:', error.message);
        return {
            status: 0,
            ok: false,
            data: { message: error?.message || 'Network error' } as any,
            response: null as any,
        };
    }
};

/**
 * DELETE request
 */
export const apiDelete = async <T = any>(
    endpoint: string,
    token?: string
): Promise<ApiResponse<T>> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        return await apiClient<T>(endpoint, {
            method: 'DELETE',
            headers,
        });
    } catch (error: any) {
        console.error('📡 [API] DELETE request failed:', error.message);
        return {
            status: 0,
            ok: false,
            data: { message: error?.message || 'Network error' } as any,
            response: null as any,
        };
    }
};

/**
 * PATCH request
 */
export const apiPatch = async <T = any>(
    endpoint: string,
    body?: any,
    token?: string
): Promise<ApiResponse<T>> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        return await apiClient<T>(endpoint, {
            method: 'PATCH',
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch (error: any) {
        console.error('📡 [API] PATCH request failed:', error.message);
        return {
            status: 0,
            ok: false,
            data: { message: error?.message || 'Network error' } as any,
            response: null as any,
        };
    }
};
