/**
 * Authentication API Service (TypeScript)
 * Uses centralized HTTP client for all requests
 */

import { apiGet, apiPost } from './client';
import { API_CONFIG } from './config';

// Type definitions
export interface AuthUser {
    id: number;
    email: string;
    name: string;
    token: string;
    roles?: string[];
    isVerified?: boolean;
    loginTime?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface GoogleLoginCredentials {
    idToken: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    username?: string;
    name?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
}

export interface RegisterResponse {
    id: number;
    email: string;
    username: string;
    isVerified: boolean;
    message?: string;
}

export interface VerifyEmailResponse {
    success: boolean;
    message: string;
}

export interface ApiAuthResponse {
    ok: boolean;
    status: number;
    data?: {
        success?: boolean;
        data?: any;
        user?: any;
        message?: string;
        errors?: Record<string, any>;
        token?: string;
    };
}

export interface GoogleAuthConfigResponse {
    ok: boolean;
    status: number;
    data?: {
        success?: boolean;
        enabled?: boolean;
        clientId?: string | null;
        message?: string;
    };
}

/**
 * Login user - Returns response in format saga expects
 */
export async function authLogin(credentials: LoginCredentials): Promise<ApiAuthResponse> {
    console.log('🔐 [Auth] Login attempt:', credentials.email);

    try {
        const response = await apiPost(API_CONFIG.ENDPOINTS.LOGIN, {
            email: credentials.email,
            password: credentials.password,
        });

        console.log('🔐 [Auth] Raw response:', response);

        // Return response in format saga expects
        return {
            ok: response.ok,
            status: response.status,
            data: response.data,
        };
    } catch (error: any) {
        console.error('❌ [Auth] Login error:', error.message);
        return {
            ok: false,
            status: 500,
            data: {
                message: error.message || 'Login failed',
                errors: {},
            },
        };
    }
}

export async function getGoogleAuthConfig(): Promise<GoogleAuthConfigResponse> {
    try {
        const response = await apiGet('/api/google/config');

        return {
            ok: response.ok,
            status: response.status,
            data: response.data,
        };
    } catch (error: any) {
        return {
            ok: false,
            status: 500,
            data: {
                success: false,
                enabled: false,
                clientId: null,
                message: error.message || 'Google Sign-In configuration failed to load',
            },
        };
    }
}

export async function authGoogleLogin(credentials: GoogleLoginCredentials): Promise<ApiAuthResponse> {
    try {
        const response = await apiPost(API_CONFIG.ENDPOINTS.GOOGLE_LOGIN, {
            firebaseToken: credentials.idToken,
        });

        return {
            ok: response.ok,
            status: response.status,
            data: response.data,
        };
    } catch (error: any) {
        return {
            ok: false,
            status: 500,
            data: {
                message: error.message || 'Google Sign-In failed',
                errors: {},
            },
        };
    }
}

/**
 * Register new user - Returns response in format saga expects
 */
export async function authRegister(
    credentials: RegisterCredentials
): Promise<ApiAuthResponse> {
    console.log('📝 [Auth] Registration attempt:', credentials.email);

    try {
        const username = credentials.username?.trim()
            || credentials.fullName?.trim()
            || credentials.name?.trim()
            || [credentials.firstName, credentials.lastName]
                .filter((value): value is string => Boolean(value?.trim()))
                .join(' ')
                .trim()
            || credentials.email.split('@')[0];

        const response = await apiPost(API_CONFIG.ENDPOINTS.REGISTER, {
            username,
            name: username,
            email: credentials.email,
            password: credentials.password,
        });

        console.log('📝 [Auth] Raw response:', response);

        return {
            ok: response.ok,
            status: response.status,
            data: response.data,
        };
    } catch (error: any) {
        console.error('❌ [Auth] Registration error:', error.message);
        return {
            ok: false,
            status: 500,
            data: {
                message: error.message || 'Registration failed',
                errors: {},
            },
        };
    }
}

/**
 * Verify email address
 */
export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
    try {
        console.log('✉️ [Auth] Email verification attempt');

        const response = await apiPost(`/api/verify-email?token=${token}`);

        if (!response.ok) {
            const errorMsg = response.data?.message || 'Verification failed';
            console.error('❌ [Auth] Verification failed:', errorMsg);
            throw new Error(errorMsg);
        }

        console.log('✅ [Auth] Email verified');

        return {
            success: true,
            message: response.data?.message || 'Email verified successfully',
        };
    } catch (error: any) {
        console.error('❌ [Auth] Verification error:', error.message);
        throw error;
    }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<VerifyEmailResponse> {
    try {
        console.log('🔑 [Auth] Password reset request:', email);

        const response = await apiPost('/api/forgot-password', { email });

        if (!response.ok) {
            const errorMsg = response.data?.message || 'Reset request failed';
            console.error('❌ [Auth] Reset request failed:', errorMsg);
            throw new Error(errorMsg);
        }

        console.log('✅ [Auth] Reset email sent');

        return {
            success: true,
            message: response.data?.message || 'Reset link sent to your email',
        };
    } catch (error: any) {
        console.error('❌ [Auth] Reset error:', error.message);
        throw error;
    }
}

/**
 * Reset password with token
 */
export async function resetPassword(
    token: string,
    newPassword: string
): Promise<VerifyEmailResponse> {
    try {
        console.log('🔑 [Auth] Password reset attempt');

        const response = await apiPost('/api/reset-password', {
            token,
            password: newPassword,
        });

        if (!response.ok) {
            const errorMsg = response.data?.message || 'Password reset failed';
            console.error('❌ [Auth] Password reset failed:', errorMsg);
            throw new Error(errorMsg);
        }

        console.log('✅ [Auth] Password reset successful');

        return {
            success: true,
            message: response.data?.message || 'Password reset successfully',
        };
    } catch (error: any) {
        console.error('❌ [Auth] Password reset error:', error.message);
        throw error;
    }
}

/**
 * Logout user - Records logout in activity log
 */
export async function authLogout(token?: string): Promise<ApiAuthResponse> {
    console.log('🔓 [Auth] Logout attempt');

    try {
        const response = await apiPost('/api/logout', {}, token);

        console.log('🔓 [Auth] Raw response:', response);

        return {
            ok: response.ok,
            status: response.status,
            data: response.data,
        };
    } catch (error: any) {
        console.error('❌ [Auth] Logout error:', error.message);
        return {
            ok: false,
            status: 500,
            data: {
                message: error.message || 'Logout failed',
                errors: {},
            },
        };
    }
}
