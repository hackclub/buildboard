import { browser } from '$app/environment';

export interface UserProfile {
    avatar_url?: string | null;
    bio?: string | null;
    is_public: boolean;
}

export interface UserRole {
    role_id: string;
}

export interface User {
    user_id: string;
    handle?: string | null;
    referral_code?: string;
    profile?: UserProfile | null;
    roles?: UserRole[];
    has_address?: boolean;
    created_at: string;
}

export function hasRole(user: User | null, roleId: string): boolean {
    if (!user?.roles) return false;
    return user.roles.some(r => r.role_id === roleId);
}

export function isAdmin(user: User | null): boolean {
    return hasRole(user, 'admin');
}

export function isReviewer(user: User | null): boolean {
    return hasRole(user, 'reviewer') || hasRole(user, 'admin');
}

export function isIdv(user: User | null): boolean {
    return hasRole(user, 'idv');
}

export function isSlackMember(user: User | null): boolean {
    return hasRole(user, 'slack_member');
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
