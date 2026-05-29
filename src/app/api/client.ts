/**
 * Centralized HTTP Client (TypeScript)
 * Handles all API requests with fallback URL support, timeouts, and error handling
 */

import { API_CONFIG, getBaseUrls } from './config';

let preferredBaseUrl: string | null = null;

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
    const base = baseUrl.replace(/\/$/, '');
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    if (normalizedEndpoint.startsWith('/api/')) {
        return `${base}${normalizedEndpoint}`;
    }

    if (normalizedEndpoint.startsWith('/mobile/')) {
        return `${base}/api${normalizedEndpoint}`;
    }

    return `${base}/api${normalizedEndpoint}`;
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

const normalizeHeaders = (headers?: any): Record<string, string> => {
    if (!headers) return {};
    if (headers instanceof Headers) {
        const result: Record<string, string> = {};
        headers.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
    if (Array.isArray(headers)) {
        return headers.reduce<Record<string, string>>((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
    }
    return { ...headers } as Record<string, string>;
};

const redactHeaders = (headers: Record<string, string>): Record<string, string> => {
    const redacted = { ...headers };
    Object.keys(redacted).forEach((key) => {
        if (key.toLowerCase() === 'authorization') {
            redacted[key] = 'Bearer ***';
        }
    });
    return redacted;
};

const redactBody = (body?: any): string | undefined => {
    if (!body || typeof body !== 'string') {
        return typeof body === 'string' ? body : undefined;
    }

    try {
        const parsed = JSON.parse(body);
        if (parsed && typeof parsed === 'object') {
            if ('password' in parsed) {
                parsed.password = '***';
            }
            if ('token' in parsed) {
                parsed.token = '***';
            }
            if ('firebaseToken' in parsed) {
                parsed.firebaseToken = '***';
            }
        }
        return JSON.stringify(parsed);
    } catch {
        return body;
    }
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

/** Gateway errors (e.g. Railway 502) return JSON but are not our API — try the next base URL. */
const isRetryableGatewayStatus = (status: number): boolean =>
    status === 502 || status === 503 || status === 504;

const isApiResponse = (response: Response): boolean =>
    (response.ok || hasJsonContentType(response)) && !isRetryableGatewayStatus(response.status);

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
            const isPreferred = preferredBaseUrl === baseUrl;
            const isFirstFallback = preferredBaseUrl === null && baseUrl === baseUrls[0];
            const timeoutMs = (isPreferred || isFirstFallback)
                ? API_CONFIG.TIMEOUT
                : API_CONFIG.FALLBACK_TIMEOUT;

            if (API_CONFIG.DEBUG) {
                const requestHeaders = redactHeaders(normalizeHeaders(options.headers));
                const requestBody = redactBody(options.body);
                console.log(`📡 [API] Trying: ${fullUrl} (${timeoutMs}ms timeout)`);
                console.log('📡 [API] Request:', {
                    method: options.method ?? 'GET',
                    headers: requestHeaders,
                    body: requestBody,
                });
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
