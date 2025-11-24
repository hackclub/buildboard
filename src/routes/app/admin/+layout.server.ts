import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent }) => {
    const data = await parent();
    const user = (data as any).user;

    if (!user || !user.is_admin) {
        throw redirect(303, '/app/projects');
    }

    return {
        user
    };
};
