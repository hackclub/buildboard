import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { idv } from '$lib/server/idv';
import { PUBLIC_HC_OAUTH_REDIRECT_URL } from '$env/static/public';

export const GET: RequestHandler = async ({ cookies, url }) => {
    if (idv.isBypassed()) {
        throw redirect(302, '/auth/idv/callback?bypassed=true');
    }

    const state = idv.generateState();
    
    cookies.set('idv_state', state, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 10 // 10 minutes
    });

    const returnTo = url.searchParams.get('returnTo') || '/app';
    cookies.set('idv_return_to', returnTo, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 10
    });

    const email = url.searchParams.get('email') || undefined;

    const authorizeUrl = idv.authorizeUrl(
        PUBLIC_HC_OAUTH_REDIRECT_URL,
        undefined,
        state,
        email
    );

    throw redirect(302, authorizeUrl);
};
