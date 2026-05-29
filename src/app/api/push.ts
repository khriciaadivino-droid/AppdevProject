import { apiPost } from './client';

export interface RegisterPushTokenResponse {
    ok: boolean;
    status: number;
    data?: any;
}

export const registerPushToken = async (
    token: string,
    platform: string,
    authToken: string
): Promise<RegisterPushTokenResponse> => {
    const response = await apiPost('/api/push/register', { token, platform }, authToken);
    return { ok: response.ok, status: response.status, data: response.data };
};

export const sendTestPush = async (
    title: string,
    body: string,
    authToken: string
): Promise<RegisterPushTokenResponse> => {
    const response = await apiPost('/api/push/test', { title, body }, authToken);
    return { ok: response.ok, status: response.status, data: response.data };
};

