import { startUnleash, type Unleash } from 'unleash-client';
import { PUBLIC_UNLEASH_URL, PUBLIC_UNLEASH_CLIENT_KEY } from '$env/static/public';

let unleash: Unleash | null = null;
let initializationFailed = false;

// Mock Unleash instance that returns false for all flags
const mockUnleash: Unleash = {
    isEnabled: () => false,
    getVariant: () => ({ name: 'disabled', enabled: false }),
} as Unleash;

export async function getUnleash(): Promise<Unleash> {
    // If we already failed to initialize, return mock immediately
    if (initializationFailed) {
        return mockUnleash;
    }

    // If already initialized successfully, return it
    if (unleash) {
        return unleash;
    }

    // Check if credentials are configured
    if (!PUBLIC_UNLEASH_URL || !PUBLIC_UNLEASH_CLIENT_KEY) {
        console.warn('Unleash is not configured (missing URL or API key). Feature flags will default to disabled.');
        initializationFailed = true;
        return mockUnleash;
    }

    // Try to initialize Unleash
    try {
        console.log('[Unleash] Starting initialization...');
        console.log('[Unleash] URL:', PUBLIC_UNLEASH_URL);

        unleash = await startUnleash({
            url: PUBLIC_UNLEASH_URL,
            appName: 'buildboard-server',
            customHeaders: {
                Authorization: PUBLIC_UNLEASH_CLIENT_KEY,
            },
        });

        // Listen for errors to avoid unhandled rejections
        unleash.on('error', (err) => {
            console.error('[Unleash] Error:', err.message);
        });

        unleash.on('warn', (msg) => {
            console.warn('[Unleash] Warning:', msg);
        });

        unleash.on('ready', () => {
            console.log('[Unleash] Ready! Feature toggles have been fetched');
            console.log('[Unleash] enable-platform flag is now:', unleash.isEnabled('enable-platform'));
        });

        unleash.on('synchronized', () => {
            console.log('[Unleash] Synchronized with server');
        });

        console.log('[Unleash] Client started (waiting for initial sync...)');

        return unleash;
    } catch (error) {
        console.error('[Unleash] Failed to initialize:', error instanceof Error ? error.message : error);
        console.warn('[Unleash] Falling back to mock client. All feature flags will be disabled.');
        initializationFailed = true;
        return mockUnleash;
    }
}
