import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const returnTo = url.searchParams.get('returnTo') || '/app';
    throw redirect(302, `/auth/idv/start?returnTo=${encodeURIComponent(returnTo)}`);
};
