import { apiGet } from './client';

interface ApiResponse<T> {
    status: number;
    ok: boolean;
    data?: T;
}

export interface NotificationItem {
    id: number;
    user_id?: number | null;
    username?: string | null;
    role?: string | null;
    action?: string | null;
    target_data?: string | null;
    timestamp?: string | null;
}

interface NotificationEnvelope {
    success?: boolean;
    message?: string;
    data?: NotificationItem[];
    meta?: {
        count?: number;
        timestamp?: string;
    };
}

export const getNotifications = async (
    token?: string,
    params?: Record<string, string | number | boolean | null | undefined>
): Promise<ApiResponse<NotificationEnvelope>> => {
    const queryEntries = Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== null);
    const queryString = queryEntries.length > 0
        ? `?${new URLSearchParams(queryEntries.map(([key, value]) => [key, String(value)])).toString()}`
        : '';

    return apiGet<NotificationEnvelope>(`/events${queryString}`, token);
};

export const extractNotifications = (
    payload?: NotificationEnvelope | NotificationItem[]
): NotificationItem[] => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    return [];
};

export default {
    getNotifications,
    extractNotifications,
};