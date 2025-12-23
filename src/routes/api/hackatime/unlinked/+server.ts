import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { getBackendUrl, unhashUserID } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
    console.log('[Frontend API] /api/hackatime/unlinked GET called');
    const hashedUserID = cookies.get('userID');
    if (!hashedUserID) {
        console.log('[Frontend API] No userID cookie, returning 401');
        return json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const userID = unhashUserID(hashedUserID);
        console.log('[Frontend API] Calling backend /projects/hackatime-projects/unlinked for user:', userID);

        const response = await fetch(getBackendUrl('/projects/hackatime-projects/unlinked'), {
            headers: {
                'Authorization': BEARER_TOKEN_BACKEND,
                'X-User-Id': userID
            }
        });

        console.log('[Frontend API] Backend response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Frontend API] Backend error:', errorText);
            return json({ error: 'Failed to fetch projects' }, { status: response.status });
        }

        const projects = await response.json();
        console.log('[Frontend API] Got', projects.length, 'unlinked projects from backend');
        return json(projects);
    } catch (error) {
        console.error('Error fetching unlinked hackatime projects:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
