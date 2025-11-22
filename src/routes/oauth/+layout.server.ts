import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals.flags.isEnabled('enable-platform')) {
        throw redirect(303, '/');
    }
};
