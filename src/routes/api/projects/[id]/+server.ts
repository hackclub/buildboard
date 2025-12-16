import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';

export const DELETE: RequestHandler = async ({ params, cookies }) => {
    const hashedUserID = cookies.get('userID');
    if (!hashedUserID) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userID = unhashUserID(hashedUserID);

        const response = await fetch(getBackendUrl(`/projects/${params.id}`), {
            method: 'DELETE',
            headers: {
                'Authorization': BEARER_TOKEN_BACKEND,
                'x-user-id': userID
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return json({ error: errorData.detail || 'Failed to delete project' }, { status: response.status });
        }

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting project:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

export const PATCH: RequestHandler = async ({ params, request, cookies }) => {
    const hashedUserID = cookies.get('userID');
    if (!hashedUserID) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userID = unhashUserID(hashedUserID);
        const data = await request.json();

        const response = await fetch(getBackendUrl(`/projects/${params.id}`), {
            method: 'PATCH',
            headers: {
                'Authorization': BEARER_TOKEN_BACKEND,
                'Content-Type': 'application/json',
                'x-user-id': userID
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return json({ error: errorData.detail || 'Failed to update project' }, { status: response.status });
        }

        const project = await response.json();
        return json(project);
    } catch (error) {
        console.error('Error updating project:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
