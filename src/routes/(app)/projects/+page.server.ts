import type { PageServerLoad } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';

interface Project {
    project_id: string;
    created_at: string;
    live_url: string;
    project_name: string;
    code_url: string;
    time_spent: number;
    submission_week: number;
}

interface VisibilityMilestone {
    id: string;
    name: string;
    description: string;
    completed: boolean;
    level: number;
}

interface VisibilityStatus {
    current_level: number;
    current_level_name: string;
    next_level: number | null;
    next_level_name: string | null;
    progress_percentage: number;
    milestones: VisibilityMilestone[];
    total_completed: number;
    total_milestones: number;
}

export const load: PageServerLoad = async ({ cookies }) => {
    const hashedUserID = cookies.get('userID');

    const defaultVisibility: VisibilityStatus = {
        current_level: 1,
        current_level_name: "Hidden",
        next_level: 2,
        next_level_name: "Local",
        progress_percentage: 0,
        milestones: [
            { id: "connected", name: "Connected", description: "GitHub repo and Hackatime project linked", completed: false, level: 2 },
            { id: "shipped", name: "Shipped", description: "Project marked as shipped", completed: false, level: 3 },
            { id: "approved", name: "Approved", description: "Admin review approved", completed: false, level: 4 },
            { id: "billboard", name: "Billboard", description: "Logged 30+ hours and completed the program", completed: false, level: 5 }
        ],
        total_completed: 0,
        total_milestones: 4
    };

    if (!hashedUserID) {
        return { projects: [] as Project[], visibility: defaultVisibility };
    }

    let userID: string | null = null;
    try {
        userID = unhashUserID(hashedUserID);
    } catch (error) {
        console.error('Failed to unhash userID, clearing cookie:', error);
        cookies.delete('userID', { path: '/' });
        return { projects: [] as Project[], visibility: defaultVisibility };
    }

    try {
        const projectsResponse = await fetch(getBackendUrl(`/users/${userID}/projects`), {
            headers: {
                'Authorization': `${BEARER_TOKEN_BACKEND}`,
                'x-user-id': userID
            }
        });

        if (!projectsResponse.ok) {
            return { projects: [] as Project[], visibility: defaultVisibility };
        }

        const projects = (await projectsResponse.json()) as Project[];

        const sortedProjects = [...projects].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const mainProject = sortedProjects[0] || null;

        let visibility: VisibilityStatus = defaultVisibility;
        
        if (mainProject) {
            try {
                const visibilityResponse = await fetch(
                    getBackendUrl(`/projects/${mainProject.project_id}/visibility`),
                    { headers: { 'Authorization': `${BEARER_TOKEN_BACKEND}` } }
                );
                if (visibilityResponse.ok) {
                    visibility = await visibilityResponse.json();
                }
            } catch (e) {
                console.error('Failed to fetch visibility:', e);
            }
        }

        return {
            projects: projects || [],
            visibility
        };
    } catch (error) {
        console.error('Error fetching projects:', error);
        return { projects: [] as Project[], visibility: defaultVisibility };
    }
};
