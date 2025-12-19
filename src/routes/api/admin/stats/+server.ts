import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
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
		const response = await fetch(getBackendUrl('/admin/stats'), {
			headers: {
				'Authorization': `${BEARER_TOKEN_BACKEND}`,
				'X-User-ID': userID
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			return json({ error: errorText || 'Failed to fetch admin stats' }, { status: response.status });
		}

		return json(await response.json());
	} catch (error) {
		console.error('Error fetching admin stats:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
