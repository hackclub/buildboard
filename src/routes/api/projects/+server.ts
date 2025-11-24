import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url }) => {
    const skip = url.searchParams.get('skip') || '0';
    const limit = url.searchParams.get('limit') || '100';
    const user_id = url.searchParams.get('user_id');

    try {
        let apiUrl = getBackendUrl(`/projects?skip=${skip}&limit=${limit}`);
        if (user_id) {
            apiUrl += `&user_id=${user_id}`;
        }

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `${BEARER_TOKEN_BACKEND}`
            }
        });

        if (!response.ok) {
            return json({ error: 'Failed to fetch projects' }, { status: response.status });
        }

        const projects = await response.json();
        return json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const hashedUserID = cookies.get('userID');
        if (!hashedUserID) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const userID = unhashUserID(hashedUserID);
        const data = await request.json();
        const { projectTitle, projectDescription, projectType } = data;
        
        const payload = {
            user_id: userID,
            project_name: projectTitle,
            project_description: projectDescription,
            project_type: projectType,
            submission_week: "1" // Default value
        };

        const response = await fetch(getBackendUrl('/projects'), {
            method: 'POST',
            headers: {
                'Authorization': `${BEARER_TOKEN_BACKEND}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            return json({ error: errorText || 'Failed to create project' }, { status: response.status });
        }

        const project = await response.json();
        return json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
