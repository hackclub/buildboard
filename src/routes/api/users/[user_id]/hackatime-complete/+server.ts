import { json } from '@sveltejs/kit';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';

export async function POST({ params, cookies }) {
    const hashedUserID = cookies.get('userID');

    if (!hashedUserID) {
        return json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const userID = unhashUserID(hashedUserID);

        if (userID !== params.user_id) {
            return json({ error: 'Forbidden' }, { status: 403 });
        }

        const response = await fetch(getBackendUrl(`/users/${userID}/hackatime-complete`), {
            method: 'POST',
            headers: {
                'Authorization': `${BEARER_TOKEN_BACKEND}`,
                'X-User-ID': userID
            }
        });

        if (response.ok) {
            const data = await response.json();
            return json(data);
        } else {
            return json({ error: 'Failed to complete hackatime' }, { status: response.status });
        }
    } catch (error) {
        console.error('Error completing hackatime:', error);
        return json({ error: 'Internal error' }, { status: 500 });
    }
}
