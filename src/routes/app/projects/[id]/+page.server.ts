import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getBackendUrl } from '$lib/server/auth';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
    const projectId = params.id;

    try {
        const url = getBackendUrl(`/projects/${projectId}`);
        console.log(`Fetching project from: ${url}`);

        const projectResponse = await fetch(url);
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
                const readmeResponse = await fetch(readmeUrl);
                if (readmeResponse.ok) {
                    readme = await readmeResponse.json();
                } else {
                    console.warn(`Failed to fetch README: ${readmeResponse.status}`);
                }
            } catch (e) {
                console.error('Failed to fetch README:', e);
            }
        }

        return {
            project,
            readme
        };
    } catch (e) {
        console.error('Error loading project:', e);
        throw e; // Re-throw to let SvelteKit handle it (or 500 if it's unknown)
    }
};
