import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';

export const POST: RequestHandler = async ({ params, request, cookies }) => {
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
		const body = await request.json();
		const projectId = params.project_id;

		const response = await fetch(getBackendUrl(`/admin/projects/${projectId}/review`), {
			method: 'POST',
			headers: {
				'Authorization': `${BEARER_TOKEN_BACKEND}`,
				'X-User-ID': userID,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			const errorText = await response.text();
			return json({ error: errorText || 'Failed to submit review' }, { status: response.status });
		}

		return json(await response.json());
	} catch (error) {
		console.error('Error submitting project review:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
