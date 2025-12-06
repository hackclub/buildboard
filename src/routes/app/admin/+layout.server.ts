import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

function hasRole(user: any, roleId: string): boolean {
    if (!user?.roles) return false;
    return user.roles.some((r: any) => r.role_id === roleId);
}

export const load: LayoutServerLoad = async ({ parent }) => {
    const data = await parent();
    const user = (data as any).user;

    if (!user || !hasRole(user, 'admin')) {
        throw redirect(303, '/app/projects');
    }

    return {
        user
    };
};
