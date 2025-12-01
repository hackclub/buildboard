import { browser } from '$app/environment';

export interface User {
    user_id: string;
    email: string;
    slack_id?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    is_admin?: boolean;
    is_reviewer?: boolean;
    is_idv?: boolean;
    is_slack_member?: boolean;
    address_line_1?: string | null;
    address_line_2?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    post_code?: string | null;
    birthday?: string | null;
}

let user = $state<User | null>(null);
let loading = $state(false);

export function getUser() {
    if (!user && !loading && browser) {
        updateUser();
    }
    return user;
}

export function isLoading() {
    return loading;
}

export async function updateUser() {
    if (loading) return user;
    loading = true;

    try {
        const res = await fetch('/api/me');
        if (res.ok) {
            const data = await res.json();
            user = data;
        } else {
            user = null;
        }
    } catch (e) {
        console.error('Failed to update user', e);
        user = null;
    } finally {
        loading = false;
    }

    return user;
}

export function clearUser() {
    user = null;
}
