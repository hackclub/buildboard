import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';

export const POST: RequestHandler = async ({ params, cookies }) => {
    const hashedUserID = cookies.get('userID');
    if (!hashedUserID) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userID = unhashUserID(hashedUserID);

        const response = await fetch(getBackendUrl(`/projects/${params.id}/submit`), {
            method: 'POST',
            headers: {
                'Authorization': BEARER_TOKEN_BACKEND,
                'Content-Type': 'application/json',
                'x-user-id': userID
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return json({ error: errorData.detail || 'Failed to submit project' }, { status: response.status });
        }

        const result = await response.json();
        return json(result);
    } catch (error) {
        console.error('Error submitting project:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
