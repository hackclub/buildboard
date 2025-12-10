import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { getBackendUrl, unhashUserID } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
    const hashedUserID = cookies.get('userID');
    if (!hashedUserID) {
        return json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const userID = unhashUserID(hashedUserID);

        const response = await fetch(getBackendUrl('/projects/hackatime-projects/unlinked'), {
            headers: {
                'Authorization': BEARER_TOKEN_BACKEND,
                'X-User-Id': userID
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch unlinked hackatime projects:', errorText);
            return json({ error: 'Failed to fetch projects' }, { status: response.status });
        }

        const projects = await response.json();
        return json(projects);
    } catch (error) {
        console.error('Error fetching unlinked hackatime projects:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
