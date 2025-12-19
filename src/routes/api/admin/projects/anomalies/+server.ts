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
		const skip = url.searchParams.get('skip') || '0';
		const limit = url.searchParams.get('limit') || '50';

		const response = await fetch(getBackendUrl(`/admin/projects/anomalies?skip=${skip}&limit=${limit}`), {
			headers: {
				'Authorization': `${BEARER_TOKEN_BACKEND}`,
				'X-User-ID': userID
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			return json({ error: errorText || 'Failed to fetch project anomalies' }, { status: response.status });
		}

		return json(await response.json());
	} catch (error) {
		console.error('Error fetching project anomalies:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
