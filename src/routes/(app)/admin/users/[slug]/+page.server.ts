import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface UserProfile {
    avatar_url: string;
    bio: string;
    is_public: boolean;
    slack_id: string;
}

interface User {
    user_id: string;
    handle: string;
    referral_code: string;
    profile: UserProfile;
    roles: { role_id: string }[];
    has_address: boolean;
    storyline_completed_at: string | null;
    hackatime_completed_at: string | null;
    slack_linked_at: string | null;
    idv_completed_at: string | null;
    onboarding_completed_at: string | null;
    verification_status: string;
    ysws_eligible: boolean;
    created_at: string;
}

export const load: PageServerLoad = async ({ params, fetch: svelteFetch }) => {
    const response = await svelteFetch(`/api/admin/users/${encodeURIComponent(params.slug)}`);

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
            throw error(401, 'Unauthorized');
        }
        if (response.status === 403) {
            throw error(403, 'Forbidden');
        }
        if (response.status === 404) {
            throw error(404, 'User not found');
        }
        if (response.status === 400) {
            throw error(400, data.error || 'Invalid user ID');
        }
        throw error(response.status, 'Failed to fetch user');
    }

    const user: User = await response.json();
    return { user };
};
