import type { LayoutServerLoad } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ cookies, locals, url }) => {
    if (!locals.flags.isEnabled('enable-platform')) {
        throw redirect(303, '/');
    }

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
    const response = await fetch(getBackendUrl(`/users/${userID}/exists`), {
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
    await fetch(getBackendUrl(`/users/${userID}/loggedin`), {
        method: 'POST',
        headers: {
            'Authorization': `${BEARER_TOKEN_BACKEND}`
        }
    });

    // Fetch user data
    const userDataResponse = await fetch(getBackendUrl(`/users/${userID}`), {
        headers: {
            'Authorization': `${BEARER_TOKEN_BACKEND}`
        }
    });

    let user = null;
    if (userDataResponse.ok) {
        user = await userDataResponse.json();
    }

    let hasAcknowledged = false;
    let isIDV = false;
    let onboardingSkipped = false;

    if (user) {
        hasAcknowledged = cookies.get('hackatimeAcknowledged') === 'true';
        onboardingSkipped = cookies.get('onboardingSkipped') === 'true';
        isIDV = !!user.is_idv;

        const isOnboarding = url.pathname === '/app/onboarding';
        const isComplete = hasAcknowledged && isIDV;

        // If not complete and NOT skipped, force onboarding
        if (!isComplete && !onboardingSkipped && !isOnboarding) {
            throw redirect(303, '/app/onboarding');
        }

        // If complete and ON onboarding, send to projects
        if (isComplete && isOnboarding) {
            throw redirect(303, '/app/projects');
        }
    }

    return {
        user,
        hackatimeAcknowledged: hasAcknowledged,
        isIDV,
        isReviewer: !!user?.is_reviewer,
        onboardingSkipped
    };
};
