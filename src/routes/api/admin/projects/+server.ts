import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const hashedUserID = cookies.get('userID');
	if (!hashedUserID) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	let userID: string;
	try {
		userID = unhashUserID(hashedUserID);
	} catch (error) {
		console.error('Failed to unhash userID:', error);
		cookies.delete('userID', { path: '/' });
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const params = new URLSearchParams();
		const q = url.searchParams.get('q');
		const week = url.searchParams.get('week');
		const shipped = url.searchParams.get('shipped');
		const reviewStatus = url.searchParams.get('review_status');
		const minHours = url.searchParams.get('min_hours');
		const maxHours = url.searchParams.get('max_hours');
		const skip = url.searchParams.get('skip') || '0';
		const limit = url.searchParams.get('limit') || '50';

		if (q) params.set('q', q);
		if (week) params.set('week', week);
		if (shipped) params.set('shipped', shipped);
		if (reviewStatus) params.set('review_status', reviewStatus);
		if (minHours) params.set('min_hours', minHours);
		if (maxHours) params.set('max_hours', maxHours);
		params.set('skip', skip);
		params.set('limit', limit);

		const response = await fetch(getBackendUrl(`/admin/projects?${params.toString()}`), {
			headers: {
				'Authorization': `${BEARER_TOKEN_BACKEND}`,
				'X-User-ID': userID
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			return json({ error: errorText || 'Failed to fetch admin projects' }, { status: response.status });
		}

		return json(await response.json());
	} catch (error) {
		console.error('Error fetching admin projects:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
