import { json } from '@sveltejs/kit';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';

export async function GET({ cookies, fetch }) {
    const hashedUserID = cookies.get('userID');

    if (!hashedUserID) {
        return json(null);
    }

    try {
        const userID = unhashUserID(hashedUserID);

        const response = await fetch(getBackendUrl(`/users/${userID}`), {
            headers: {
                'Authorization': `${BEARER_TOKEN_BACKEND}`,
                'X-User-ID': userID
            }
        });

        if (response.ok) {
            const user = await response.json();
            return json(user);
        } else {
            console.error('Failed to fetch user:', response.status);
            return json(null);
        }
    } catch (error) {
        console.error('Error in /api/me:', error);
        return json(null);
    }
}
