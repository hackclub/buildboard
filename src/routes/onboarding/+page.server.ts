import type { PageServerLoad } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies }) => {
    const hashedUserID = cookies.get('userID');

    if (!hashedUserID) {
        throw redirect(303, '/auth/idv/start?returnTo=/onboarding');
    }

    let userID: string | null = null;
    try {
        userID = unhashUserID(hashedUserID);
    } catch (error) {
        console.error('Failed to unhash userID, clearing cookie:', error);
        cookies.delete('userID', { path: '/' });
        throw redirect(303, '/auth/idv/start?returnTo=/onboarding');
    }

    if (!userID) {
        throw redirect(303, '/auth/idv/start?returnTo=/onboarding');
    }

    const userResponse = await fetch(getBackendUrl(`/users/${userID}`), {
        headers: {
            'Authorization': `${BEARER_TOKEN_BACKEND}`,
            'X-User-ID': userID
        }
    });

    if (!userResponse.ok) {
        throw redirect(303, '/auth/idv/start?returnTo=/onboarding');
    }

    const user = await userResponse.json();

    // If onboarding is already complete, go to home
    if (user.onboarding_completed_at) {
        throw redirect(303, '/home');
    }

    return { user };
};
