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

    // Record login (fire and forget)
    fetch(getBackendUrl(`/users/${userID}/loggedin`), {
        method: 'POST',
        headers: {
            'Authorization': `${BEARER_TOKEN_BACKEND}`,
            'X-User-ID': userID
        }
    }).catch(() => {});

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

    // Check if user has completed the storyline (intro story)
    const storylineComplete = !!user?.storyline_completed_at;
    const isOnStoryline = url.pathname === '/app/onboarding';

    // If haven't completed storyline, send them there
    if (!storylineComplete && !isOnStoryline) {
        throw redirect(303, '/app/onboarding');
    }

    // Setup status for task checklist (not blocking - just informational)
    const setupStatus = {
        hasHackatime: !!user?.hackatime_completed_at || cookies.get('hackatimeAcknowledged') === 'true',
        isSlackMember: !!user?.slack_linked_at || hasRole(user, 'slack_member'),
        isIdvComplete: !!user?.idv_completed_at,
        storylineComplete,
        onboardingComplete: !!user?.onboarding_completed_at,
    };

    return {
        user,
        setupStatus,
        isReviewer: hasRole(user, 'reviewer') || hasRole(user, 'admin'),
        isAdmin: hasRole(user, 'admin'),
    };
};
