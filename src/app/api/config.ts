import { NativeModules, Platform } from 'react-native';

const REMOTE_BASE_URL = 'https://observant-imagination-staging-336e.up.railway.app';
const ENABLE_LOCAL_API_FALLBACKS = false;
const LOCAL_API_PORTS = [8000] as const;

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

const addLocalHostUrls = (urls: Set<string>, host: string): void => {
    LOCAL_API_PORTS.forEach((port) => {
        urls.add(`http://${host}:${port}`);
    });
};

export const getBaseUrls = (): string[] => {
    if (!ENABLE_LOCAL_API_FALLBACKS) {
        return [REMOTE_BASE_URL];
    }

    const urls = new Set<string>();
    const metroHost = getMetroHost();

    urls.add(REMOTE_BASE_URL);

    if (metroHost) {
        addLocalHostUrls(urls, metroHost);
    }

    if (Platform.OS === 'android') {
        addLocalHostUrls(urls, '10.0.2.2');
        addLocalHostUrls(urls, '10.0.3.2');
    }

    addLocalHostUrls(urls, 'localhost');
    addLocalHostUrls(urls, '127.0.0.1');

    return Array.from(urls);
};

export const API_BASE_URL = getBaseUrls()[0] ?? REMOTE_BASE_URL;

export const API_CONFIG = {
    BASE_URLS: getBaseUrls(),
    TIMEOUT: 15000,
    FALLBACK_TIMEOUT: 4000,
    DEBUG: true,
    ENDPOINTS: {
        LOGIN: '/api/login',
        REGISTER: '/api/register',
        LOGOUT: '/api/logout',
        VERIFY: '/api/verify',
        GOOGLE_LOGIN: '/api/google-login',
        VERIFY_EMAIL: '/api/verify-email',
        FORGOT_PASSWORD: null,
        RESET_PASSWORD: null,
    },
};