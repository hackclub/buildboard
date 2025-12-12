import type { LayoutServerLoad } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

function hasRole(user: any, roleId: string): boolean {
    if (!user?.roles) return false;
    return user.roles.some((r: any) => r.role_id === roleId);
}

export const load: LayoutServerLoad = async ({ cookies, locals, url }) => {
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

    // Block access to app routes if onboarding is not complete
    if (!user?.onboarding_completed_at) {
        throw redirect(303, '/onboarding');
    }

    // Setup status for task checklist (not blocking - just informational)
    const setupStatus = {
        hasHackatime: !!user?.hackatime_completed_at || cookies.get('hackatimeAcknowledged') === 'true',
        isSlackMember: !!user?.slack_linked_at || hasRole(user, 'slack_member'),
        isIdvComplete: !!user?.idv_completed_at,
        onboardingComplete: !!user?.onboarding_completed_at,
    };

    // Fetch user's projects for home page
    let projects: any[] = [];
    try {
        const projectsResponse = await fetch(getBackendUrl(`/users/${userID}/projects`), {
            headers: {
                'Authorization': `${BEARER_TOKEN_BACKEND}`,
                'X-User-ID': userID
            }
        });
        if (projectsResponse.ok) {
            projects = await projectsResponse.json();
        }
    } catch (e) {
        console.error('Failed to fetch projects:', e);
    }

    // Fetch visibility for main project (or show Hidden if no projects)
    let visibility: any = {
        current_level: 1,
        current_level_name: "Hidden",
        next_level: 2,
        next_level_name: "Local",
        progress_percentage: 0,
        milestones: [
            { id: "github", name: "Link GitHub", description: "Connect your GitHub repository", completed: false, level: 2 },
            { id: "hackatime", name: "Link Hackatime", description: "Connect your Hackatime project to track hours", completed: false, level: 2 },
            { id: "shipped", name: "Ship It", description: "Mark your project as shipped", completed: false, level: 3 },
            { id: "approved", name: "Get Approved", description: "Submit for admin review and get approved", completed: false, level: 4 },
            { id: "hours", name: "Log 30+ Hours", description: "Track at least 30 hours in Hackatime", completed: false, level: 5 }
        ],
        total_completed: 0,
        total_milestones: 5
    };
    
    if (projects.length > 0) {
        const sortedProjects = [...projects].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const mainProject = sortedProjects[0];
        try {
            const visibilityResponse = await fetch(
                getBackendUrl(`/projects/${mainProject.project_id}/visibility`),
                { headers: { 'Authorization': `${BEARER_TOKEN_BACKEND}` } }
            );
            if (visibilityResponse.ok) {
                visibility = await visibilityResponse.json();
            }
        } catch (e) {
            console.error('Failed to fetch visibility:', e);
        }
    }

    return {
        user,
        setupStatus,
        projects,
        visibility,
        isReviewer: hasRole(user, 'reviewer') || hasRole(user, 'admin'),
        isAdmin: hasRole(user, 'admin'),
    };
};
