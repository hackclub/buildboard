import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const startTime = new Date().toISOString();

export const GET: RequestHandler = async () => {
    return json({
        status: 'up',
        since: startTime
    });
};
