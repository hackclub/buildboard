import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { getBackendUrl } from '$lib/server/auth';

export const POST: RequestHandler = async ({ params, request }) => {
    const { id } = params;
    
    try {
        const data = await request.json();
        
        const response = await fetch(getBackendUrl(`/projects/${id}/github/link`), {
            method: 'POST',
            headers: {
                'Authorization': `${BEARER_TOKEN_BACKEND}`,
                'Content-Type': 'application/json'
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
