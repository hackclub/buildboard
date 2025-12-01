import { getUnleash } from '$lib/server/unleash';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const unleash = await getUnleash();
    event.locals.flags = {
        isEnabled: (name: string) => {
            const enabled = unleash.isEnabled(name);
            console.log(`[Feature Flag] ${name}: ${enabled}`);
            return enabled;
        },
    };
    return resolve(event);
};
