import { startUnleash, type Unleash } from 'unleash-client';
import { PUBLIC_UNLEASH_URL, PUBLIC_UNLEASH_CLIENT_KEY } from '$env/static/public';

let unleash: Unleash | null = null;
let isReady = false;

// Mock Unleash instance - enable platform by default when Unleash is unavailable
const mockUnleash = {
    isEnabled: (name: string) => name === 'enable-platform',
    getVariant: () => ({ name: 'disabled', enabled: false }),
} as unknown as Unleash;

// Initialize in the background - never blocks
function initUnleash() {
    if (unleash || !PUBLIC_UNLEASH_URL || !PUBLIC_UNLEASH_CLIENT_KEY) {
        return;
    }

    console.log('[Unleash] Starting background initialization...');
    console.log('[Unleash] URL:', PUBLIC_UNLEASH_URL);

    startUnleash({
        url: PUBLIC_UNLEASH_URL,
        appName: 'buildboard-server',
        customHeaders: {
            Authorization: PUBLIC_UNLEASH_CLIENT_KEY,
        },
    })
        .then((client) => {
            unleash = client;

            client.on('synchronized', () => {
                console.log('[Unleash] Synchronized with server');
                isReady = true;
            });

            client.on('ready', () => {
                console.log('[Unleash] Ready!');
                isReady = true;
            });

            client.on('error', (err) => {
                console.error('[Unleash] Error:', err.message);
            });

            client.on('warn', (msg) => {
                console.warn('[Unleash] Warning:', msg);
            });
        })
        .catch((error) => {
            console.error('[Unleash] Failed to initialize:', error instanceof Error ? error.message : error);
            console.warn('[Unleash] Feature flags will default to disabled.');
        });
}

// Start initialization immediately on module load
initUnleash();

// Synchronous - returns immediately, never blocks
export function getUnleash(): Unleash {
    if (unleash && isReady) {
        return unleash;
    }
    return mockUnleash;
}
