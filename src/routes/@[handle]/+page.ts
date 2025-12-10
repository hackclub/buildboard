import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async () => {
  // Profile page is not ready yet; redirect away.
  throw redirect(302, '/projects');
};
