import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { getBackendUrl, unhashUserID } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
    console.log('[Frontend API] /api/hackatime/refresh POST called');
    const hashedUserID = cookies.get('userID');
    if (!hashedUserID) {
        console.log('[Frontend API] No userID cookie, returning 401');
        return json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const userID = unhashUserID(hashedUserID);
        console.log('[Frontend API] Calling backend /hackatime/refresh for user:', userID);

        const response = await fetch(getBackendUrl('/hackatime/refresh'), {
            method: 'POST',
            headers: {
                'Authorization': BEARER_TOKEN_BACKEND,
                'X-User-Id': userID
            }
        });

        console.log('[Frontend API] Backend response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Frontend API] Backend error:', errorText);
            return json({ error: 'Failed to refresh' }, { status: response.status });
        }

        const projects = await response.json();
        console.log('[Frontend API] Got', projects.length, 'projects from backend');
        return json(projects);
    } catch (error) {
        console.error('Error refreshing hackatime:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
