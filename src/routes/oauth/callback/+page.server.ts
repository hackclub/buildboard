import { redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { getBackendUrl, hashUserID } from '$lib/server/auth';
import { idv } from '$lib/server/idv';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, cookies }) => {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error) {
        console.error('OAuth error:', error, errorDescription);
        throw redirect(302, '/');
    }

    if (!code) {
        console.error('No authorization code received');
        throw redirect(302, '/');
    }

    try {
        const tokenData = await idv.exchangeToken(code);
        const accessToken = tokenData.access_token;

        const userIDV = await idv.me(accessToken);
        console.log('User fetched successfully from IDV:', userIDV);

        const userResponse = await fetch(getBackendUrl(`/users/by-email/${encodeURIComponent(userIDV.identity.primary_email)}`), {
            headers: {
                'Authorization': `${BEARER_TOKEN_BACKEND}`
            }
        });

        let user = null;
        if (userResponse.ok) {
            try {
                user = await userResponse.json();
            } catch (e) {
                console.error('Failed to parse user response:', e);
            }
        } else if (userResponse.status === 404) {
            console.log('User not found (404 returned from backend)');
        } else {
            const errorText = await userResponse.text();
            console.error(`Backend error ${userResponse.status}:`, errorText);
            throw redirect(302, '/?error=' + encodeURIComponent('Login failed: Backend unavailable'));
        }

        if (!user || !user.user_id) {
            console.log('User not found for email, creating new user');
            
            const address = userIDV.identity.addresses?.[0];
            const hasAddressData = !!address?.line_1;
            const slackId = userIDV.identity.slack_id || null;
            
            const createUserResponse = await fetch(getBackendUrl('/users'), {
                method: 'POST',
                headers: {
                    'Authorization': `${BEARER_TOKEN_BACKEND}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userIDV.identity.primary_email,
                    slack_id: slackId,
                    profile: {
                        first_name: userIDV.identity.first_name || '',
                        last_name: userIDV.identity.last_name || '',
                        is_public: false,
                        birthday: null
                    },
                    address: hasAddressData && address ? {
                        address_line_1: address.line_1,
                        address_line_2: address.line_2 || null,
                        city: address.city || null,
                        state: address.state || null,
                        country: address.country_code || null,
                        post_code: address.postal_code || null,
                        is_primary: true
                    } : null
                })
            });

            if (!createUserResponse.ok) {
                console.error('Failed to create user', await createUserResponse.text());
                throw redirect(302, '/?error=' + encodeURIComponent('Login failed. Please try again.'));
            }

            user = await createUserResponse.json();

            // Add roles based on IDV data
            if (hasAddressData) {
                await fetch(getBackendUrl(`/users/${user.user_id}/roles/idv`), {
                    method: 'POST',
                    headers: { 'Authorization': `${BEARER_TOKEN_BACKEND}` }
                });
            }
            if (slackId) {
                await fetch(getBackendUrl(`/users/${user.user_id}/roles/slack_member`), {
                    method: 'POST',
                    headers: { 'Authorization': `${BEARER_TOKEN_BACKEND}` }
                });
                
                // Sync handle from Slack username
                await fetch(getBackendUrl(`/users/${user.user_id}/sync-handle-from-slack`), {
                    method: 'POST',
                    headers: { 'Authorization': `${BEARER_TOKEN_BACKEND}`, 'X-User-Id': user.user_id }
                });
            }
        } else {
            // For existing users, also try to sync handle from Slack
            const slackId = userIDV.identity.slack_id || null;
            if (slackId) {
                await fetch(getBackendUrl(`/users/${user.user_id}/sync-handle-from-slack`), {
                    method: 'POST',
                    headers: { 'Authorization': `${BEARER_TOKEN_BACKEND}`, 'X-User-Id': user.user_id }
                });
            }
        }

        const hashedUserID = hashUserID(user.user_id);
        cookies.set('userID', hashedUserID, { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
        cookies.set('accessToken', accessToken, { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
        throw redirect(302, '/home');

    } catch (err) {
        // If this is an intentional redirect or an HTTP error from SvelteKit, rethrow it untouched
        if (isRedirect(err) || isHttpError(err)) {
            throw err;
        }
        console.error('Error exchanging code for token:', err);
        throw redirect(302, '/');
    }
};
