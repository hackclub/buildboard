import type { PageServerLoad } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';

interface Project {
    created_at: string;
    live_url: string;
    project_name: string;
    code_url: string;
    time_spent: number;
    submission_week: number;
}

export const load: PageServerLoad = async ({ cookies }) => {
    const hashedUserID = cookies.get('userID');

    if (!hashedUserID) {
        return { projects: [] as Project[] };
    }

    const userID = unhashUserID(hashedUserID);

    try {
        // Fetch user's projects
        const projectsResponse = await fetch(getBackendUrl(`/users/${userID}/projects`), {
            headers: {
                'Authorization': `${BEARER_TOKEN_BACKEND}`
            }
        });

        if (!projectsResponse.ok) {
            return { projects: [] as Project[] };
        }

        const projects = await projectsResponse.json();
        
        return {
            projects: (projects || []) as Project[]
        };
    } catch (error) {
        console.error('Error fetching projects:', error);
        return { projects: [] as Project[] };
    }
};
