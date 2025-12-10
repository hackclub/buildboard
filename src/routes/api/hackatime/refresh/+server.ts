import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { getBackendUrl, unhashUserID } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
    const hashedUserID = cookies.get('userID');
    if (!hashedUserID) {
        return json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const userID = unhashUserID(hashedUserID);

        const response = await fetch(getBackendUrl('/hackatime/refresh'), {
            method: 'POST',
            headers: {
                'Authorization': BEARER_TOKEN_BACKEND,
                'X-User-Id': userID
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to refresh hackatime:', errorText);
            return json({ error: 'Failed to refresh' }, { status: response.status });
        }

        const projects = await response.json();
        return json(projects);
    } catch (error) {
        console.error('Error refreshing hackatime:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
