import { getUnleash } from '$lib/server/unleash';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const unleash = await getUnleash();
    event.locals.flags = {
        isEnabled: (name: string) => unleash.isEnabled(name),
    };
    return resolve(event);
};
