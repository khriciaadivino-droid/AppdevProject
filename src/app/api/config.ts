import { NativeModules, Platform } from 'react-native';

const API_PORT = 8000;

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

export const API_BASE_URL = getBaseUrls()[0];

export const API_CONFIG = {
    BASE_URLS: getBaseUrls(),
    TIMEOUT: 15000,
    DEBUG: true,
    ENDPOINTS: {
        LOGIN: '/api/login',
        REGISTER: '/api/register',
        VERIFY_EMAIL: '/api/verify-email',
        FORGOT_PASSWORD: null,
        RESET_PASSWORD: null,
    },
};