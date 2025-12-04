import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { getBackendUrl, unhashUserID } from '$lib/server/auth';

/**
 * Link a GitHub repository to a project.
 * 
 * SECURITY: Passes x-user-id header so the backend can verify the user owns this project.
 * Without this, any authenticated user could hijack anyone's project's GitHub integration (IDOR vulnerability).
 */
export const POST: RequestHandler = async ({ params, request, cookies }) => {
    const { id } = params;
    
    // Get the authenticated user's ID from their session cookie
    const hashedUserID = cookies.get('userID');
    if (!hashedUserID) {
        return json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userID = unhashUserID(hashedUserID);
    
    try {
        const data = await request.json();
        
        const response = await fetch(getBackendUrl(`/projects/${id}/github/link`), {
            method: 'POST',
            headers: {
                'Authorization': `${BEARER_TOKEN_BACKEND}`,
                'Content-Type': 'application/json',
                'X-User-ID': userID  // SECURITY: Backend uses this to verify project ownership
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Failed to link repository' }));
            return json(errorData, { status: response.status });
        }

        const result = await response.json();
        return json(result);
    } catch (error) {
        console.error('Error linking GitHub repository:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
