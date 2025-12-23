import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';

export const GET: RequestHandler = async ({ params, cookies }) => {
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
		const response = await fetch(getBackendUrl(`/admin/users/${params.user_id}`), {
			headers: {
				'Authorization': `${BEARER_TOKEN_BACKEND}`,
				'X-User-ID': userID
			}
		});

		if (!response.ok) {
			let errorMsg = 'Failed to fetch user details';
			try {
				const errorData = await response.json();
				errorMsg = errorData.detail || errorData.error || errorMsg;
			} catch {
				errorMsg = await response.text() || errorMsg;
			}
			console.error('Backend error:', response.status, errorMsg);
			return json({ error: errorMsg }, { status: response.status });
		}

		return json(await response.json());
	} catch (error) {
		console.error('Error fetching user details:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
