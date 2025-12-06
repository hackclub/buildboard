import type { LayoutServerLoad } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

function hasRole(user: any, roleId: string): boolean {
    if (!user?.roles) return false;
    return user.roles.some((r: any) => r.role_id === roleId);
}

export const load: LayoutServerLoad = async ({ cookies, locals, url }) => {
    if (!locals.flags.isEnabled('enable-platform')) {
        throw redirect(303, '/');
    }

    const hashedUserID = cookies.get('userID');

    if (!hashedUserID) {
        return { user: null };
    }

    let userID: string | null = null;
    try {
        userID = unhashUserID(hashedUserID);
    } catch (error) {
        console.error('Failed to unhash userID, clearing cookie:', error);
        cookies.delete('userID', { path: '/' });
        return { user: null };
    }

    if (!userID) {
        return { user: null };
    }

    const response = await fetch(getBackendUrl(`/users/${userID}/exists`), {
        headers: {
            'Authorization': `${BEARER_TOKEN_BACKEND}`
        }
    });

    const data = await response.json();

    if (!data || !data.exists) {
        return { user: null };
    }

    await fetch(getBackendUrl(`/users/${userID}/loggedin`), {
        method: 'POST',
        headers: {
            'Authorization': `${BEARER_TOKEN_BACKEND}`,
            'X-User-ID': userID
        }
    });

    const userDataResponse = await fetch(getBackendUrl(`/users/${userID}`), {
        headers: {
            'Authorization': `${BEARER_TOKEN_BACKEND}`,
            'X-User-ID': userID
        }
    });

    let user = null;
    if (userDataResponse.ok) {
        user = await userDataResponse.json();
    }

    let hasAcknowledged = false;
    let hasAddress = false;
    let onboardingSkipped = false;

    if (user) {
        hasAcknowledged = cookies.get('hackatimeAcknowledged') === 'true';
        onboardingSkipped = cookies.get('onboardingSkipped') === 'true';
        hasAddress = !!user.has_address;

        const isOnboarding = url.pathname === '/app/onboarding';
        const isComplete = hasAcknowledged && hasAddress;

        if (!isComplete && !onboardingSkipped && !isOnboarding) {
            throw redirect(303, '/app/onboarding');
        }

        if (isComplete && isOnboarding) {
            throw redirect(303, '/app/projects');
        }
    }

    return {
        user,
        hackatimeAcknowledged: hasAcknowledged,
        hasAddress,
        isReviewer: hasRole(user, 'reviewer') || hasRole(user, 'admin'),
        isAdmin: hasRole(user, 'admin'),
        onboardingSkipped
    };
};
