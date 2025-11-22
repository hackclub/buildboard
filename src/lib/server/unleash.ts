import { startUnleash, type Unleash } from 'unleash-client';
import { PUBLIC_UNLEASH_URL, PUBLIC_UNLEASH_CLIENT_KEY } from '$env/static/public';

let unleash: Unleash;

export async function getUnleash() {
    if (!unleash) {
        unleash = await startUnleash({
            url: PUBLIC_UNLEASH_URL,
            appName: 'buildboard-server',
            customHeaders: {
                Authorization: PUBLIC_UNLEASH_CLIENT_KEY,
            },
        });
    }
    return unleash;
}
