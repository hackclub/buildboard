import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url }) => {
    const skip = url.searchParams.get('skip') || '0';
    const limit = url.searchParams.get('limit') || '100';

    try {
        const apiUrl = getBackendUrl(`/projects?skip=${skip}&limit=${limit}`);

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `${BEARER_TOKEN_BACKEND}`
            }
        });

        if (!response.ok) {
            return json({ error: 'Failed to fetch projects' }, { status: response.status });
        }

        const projects = await response.json();
        const sanitizedProjects = projects.map((project: Record<string, unknown>) => ({
            project_name: project.project_name,
            project_description: project.project_description,
            attachment_urls: project.attachment_urls,
            code_url: project.code_url,
            live_url: project.live_url
        }));
        return json(sanitizedProjects);
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
        
        let userID: string | null = null;
        try {
            userID = unhashUserID(hashedUserID);
        } catch (error) {
            console.error('Failed to unhash userID, clearing cookie:', error);
            cookies.delete('userID', { path: '/' });
            return json({ error: 'Unauthorized' }, { status: 401 });
        }
        const data = await request.json();
        const { projectTitle, projectDescription, projectType, hackatimeKeys } = data;
        
        const payload: Record<string, unknown> = {
            user_id: userID,
            project_name: projectTitle,
            project_description: projectDescription,
            project_type: projectType,
            submission_week: "1" // Default value
        };

        if (hackatimeKeys && hackatimeKeys.length > 0) {
            payload.hackatime_projects = hackatimeKeys;
        }

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