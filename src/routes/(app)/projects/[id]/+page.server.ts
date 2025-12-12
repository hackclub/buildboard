import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { getBackendUrl } from '$lib/server/auth';

export interface VisibilityMilestone {
    id: string;
    name: string;
    description: string;
    completed: boolean;
    level: number;
}

export interface VisibilityStatus {
    current_level: number;
    current_level_name: string;
    next_level: number | null;
    next_level_name: string | null;
    progress_percentage: number;
    milestones: VisibilityMilestone[];
    total_completed: number;
    total_milestones: number;
}

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
    const projectId = params.id;

    try {
        const url = getBackendUrl(`/projects/${projectId}`);
        console.log(`Fetching project from: ${url}`);

        const projectResponse = await fetch(url, {
            headers: { 'Authorization': `${BEARER_TOKEN_BACKEND}` }
        });
        if (!projectResponse.ok) {
            console.error(`Failed to fetch project: ${projectResponse.status} ${projectResponse.statusText}`);
            const body = await projectResponse.text();
            console.error(`Response body: ${body}`);
            throw error(projectResponse.status, 'Project not found');
        }
        const project = await projectResponse.json();

        let readme = null;
        if (project.github_installation_id && project.github_repo_path) {
            try {
                const readmeUrl = getBackendUrl(`/projects/${projectId}/readme`);
                console.log(`Fetching README from: ${readmeUrl}`);
                const readmeResponse = await fetch(readmeUrl, {
                        headers: { 'Authorization': `${BEARER_TOKEN_BACKEND}` }
                    });
                if (readmeResponse.ok) {
                    readme = await readmeResponse.json();
                } else {
                    console.warn(`Failed to fetch README: ${readmeResponse.status}`);
                }
            } catch (e) {
                console.error('Failed to fetch README:', e);
            }
        }

        let visibility: VisibilityStatus | null = null;
        try {
            const visibilityUrl = getBackendUrl(`/projects/${projectId}/visibility`);
            const visibilityResponse = await fetch(visibilityUrl, {
                headers: { 'Authorization': `${BEARER_TOKEN_BACKEND}` }
            });
            if (visibilityResponse.ok) {
                visibility = await visibilityResponse.json();
            } else {
                console.warn(`Failed to fetch visibility: ${visibilityResponse.status}`);
            }
        } catch (e) {
            console.error('Failed to fetch visibility:', e);
        }

        return {
            project,
            readme,
            visibility
        };
    } catch (e) {
        console.error('Error loading project:', e);
        throw e;
    }
};
