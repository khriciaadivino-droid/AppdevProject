import { NativeModules, Platform } from 'react-native';

// Option A: point this at your Railway *Node API* service URL (not the PawStuff landing site).
// After deploying `node server.js` on Railway, paste the new service URL here.
const REMOTE_BASE_URL = 'https://appdevproject-staging.up.railway.app';
const ENABLE_LOCAL_API_FALLBACKS = false;
const LOCAL_API_PORTS = [9000, 8000] as const;

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

const addRemoteUrls = (urls: Set<string>): void => {
    urls.add(REMOTE_BASE_URL);

    if (REMOTE_BASE_URL.startsWith('https://')) {
        urls.add(REMOTE_BASE_URL.replace('https://', 'http://'));
    }
};

export const getBaseUrls = (): string[] => {
    const urls = new Set<string>();
    const metroHost = getMetroHost();

    addRemoteUrls(urls);

    if (!ENABLE_LOCAL_API_FALLBACKS) {
        return Array.from(urls);
    }

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
    TIMEOUT: 30000, // Increased to 30 seconds for slow Railway cold starts
    FALLBACK_TIMEOUT: 15000, // Increased fallback timeout
    DEBUG: true,
    ENDPOINTS: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
        VERIFY: '/api/auth/verify',
        GOOGLE_LOGIN: '/api/auth/google-login',
        VERIFY_EMAIL: '/api/verify-email',
        FORGOT_PASSWORD: null,
        RESET_PASSWORD: null,
    },
};