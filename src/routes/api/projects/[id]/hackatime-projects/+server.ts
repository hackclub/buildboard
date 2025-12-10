import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';

export const PUT: RequestHandler = async ({ params, request, cookies }) => {
    const hashedUserID = cookies.get('userID');
    if (!hashedUserID) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userID = unhashUserID(hashedUserID);
        const data = await request.json();
        const { projectNames } = data;

        const response = await fetch(getBackendUrl(`/projects/${params.id}/hackatime-projects`), {
            method: 'PUT',
            headers: {
                'Authorization': BEARER_TOKEN_BACKEND,
                'Content-Type': 'application/json',
                'X-User-Id': userID
            },
            body: JSON.stringify({ project_names: projectNames })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return json({ error: errorData.detail || 'Failed to update hackatime projects' }, { status: response.status });
        }

        const project = await response.json();
        return json(project);
    } catch (error) {
        console.error('Error updating hackatime projects:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

export const GET: RequestHandler = async ({ params, cookies }) => {
    const hashedUserID = cookies.get('userID');
    if (!hashedUserID) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userID = unhashUserID(hashedUserID);

        const response = await fetch(getBackendUrl(`/projects/${params.id}/hackatime-projects/linked`), {
            headers: {
                'Authorization': BEARER_TOKEN_BACKEND,
                'X-User-Id': userID
            }
        });

        if (!response.ok) {
            return json({ error: 'Failed to fetch linked projects' }, { status: response.status });
        }

        const projects = await response.json();
        return json(projects);
    } catch (error) {
        console.error('Error fetching linked hackatime projects:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
