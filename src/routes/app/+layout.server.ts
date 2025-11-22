import type { LayoutServerLoad } from './$types';
import { BACKEND_DOMAIN_NAME, BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ cookies }) => {
    const hashedUserID = cookies.get('userID');

    if (!hashedUserID) {
        // Let the client-side handle redirect if needed, 
        // or you can throw redirect(303, '/') here if you want strict server-side protection
        return { user: null }; 
    }

    const userID = unhashUserID(hashedUserID);

    if (!userID) {
        return { user: null };
    }

    // Make request to API to verify user access
    const response = await fetch(`https://${BACKEND_DOMAIN_NAME}/users/${userID}/exists`, {
        headers: {
            'Authorization': `${BEARER_TOKEN_BACKEND}`
        }
    });

    const data = await response.json();

    if (!data || !data.exists) {
         return { user: null };
    }

    // Send logged in notification
    // Note: We can fire and forget this without awaiting if performance is key,
    // but awaiting ensures it happens.
    await fetch(`https://${BACKEND_DOMAIN_NAME}/users/${userID}/loggedin`, {
        method: 'POST',
        headers: {
            'Authorization': `${BEARER_TOKEN_BACKEND}`
        }
    });

    // Fetch user data
    const userDataResponse = await fetch(`https://${BACKEND_DOMAIN_NAME}/users/${userID}`, {
        headers: {
            'Authorization': `${BEARER_TOKEN_BACKEND}`
        }
    });

    let user = null;
    if (userDataResponse.ok) {
        user = await userDataResponse.json();
    }

    return {
        user
    };
};
