import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { getBackendUrl, hashUserID } from '$lib/server/auth';
import { idv } from '$lib/server/idv';
import { dev } from '$app/environment';

export const GET: RequestHandler = async ({ url, cookies }) => {
    const returnTo = cookies.get('idv_return_to') || '/onboarding';
    
    if (idv.isBypassed() || url.searchParams.get('bypassed') === 'true') {
        cookies.delete('idv_state', { path: '/' });
        cookies.delete('idv_return_to', { path: '/' });
        throw redirect(302, returnTo);
    }

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    const storedState = cookies.get('idv_state');

    cookies.delete('idv_state', { path: '/' });
    cookies.delete('idv_return_to', { path: '/' });

    if (error) {
        console.error('IDV OAuth error:', error, errorDescription);
        throw redirect(302, '/?error=' + encodeURIComponent('Identity verification failed. Please try again.'));
    }

    if (!state || state !== storedState) {
        console.error('Invalid IDV state - CSRF check failed');
        throw redirect(302, '/?error=' + encodeURIComponent('Invalid verification session. Please try again.'));
    }

    if (!code) {
        console.error('No authorization code received from IDV');
        throw redirect(302, '/?error=' + encodeURIComponent('No authorization code received.'));
    }

    try {
        const tokenData = await idv.exchangeToken(code);
        const accessToken = tokenData.access_token;

        const [userIDV, userInfo] = await Promise.all([
            idv.me(accessToken),
            idv.userinfo(accessToken)
        ]);
        console.log('User fetched successfully from IDV:', userIDV);
        console.log('OIDC UserInfo:', userInfo);

        const identityVaultId = userIDV.identity.id;
        const verificationStatus = userInfo.verification_status || userIDV.identity.verification_status;
        const yswsEligible = userInfo.ysws_eligible ?? userIDV.identity.ysws_eligible ?? false;
        
        console.log('[IDV Callback] YSWS Debug:', {
            from_userinfo: userInfo.ysws_eligible,
            from_identity: userIDV.identity.ysws_eligible,
            resolved: yswsEligible
        });

        const duplicateCheckResponse = await fetch(
            getBackendUrl(`/users/by-identity-vault-id/${encodeURIComponent(identityVaultId)}`),
            { headers: { 'Authorization': BEARER_TOKEN_BACKEND } }
        );

        if (duplicateCheckResponse.ok) {
            // Identity is already linked to a user - log them in as that user
            // The OAuth result is authoritative: if you authenticated with this identity,
            // you become the user that owns it (regardless of any existing cookie)
            const existingUser = await duplicateCheckResponse.json();
            const hashedUserID = hashUserID(existingUser.user_id);
            cookies.set('userID', hashedUserID, { path: '/', httpOnly: true, secure: !dev, sameSite: 'lax' });
            cookies.set('accessToken', accessToken, { path: '/', httpOnly: true, secure: !dev, sameSite: 'lax' });
            throw redirect(302, returnTo);
        }

        const userResponse = await fetch(
            getBackendUrl(`/users/by-email/${encodeURIComponent(userIDV.identity.primary_email)}`),
            { headers: { 'Authorization': BEARER_TOKEN_BACKEND } }
        );

        let user = null;
        if (userResponse.ok) {
            user = await userResponse.json();
        } else if (userResponse.status !== 404) {
            const errorText = await userResponse.text();
            console.error(`Backend error ${userResponse.status}:`, errorText);
            throw redirect(302, '/?error=' + encodeURIComponent('Login failed: Backend unavailable'));
        }

        const address = userIDV.identity.addresses?.[0];
        const slackId = userIDV.identity.slack_id || null;

        if (!user || !user.user_id) {
            console.log('User not found for email, creating new user');
            
            const createUserResponse = await fetch(getBackendUrl('/users'), {
                method: 'POST',
                headers: {
                    'Authorization': BEARER_TOKEN_BACKEND,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userIDV.identity.primary_email,
                    slack_id: slackId,
                    phone_number: userIDV.identity.phone_number || null,
                    identity_vault_id: identityVaultId,
                    identity_vault_access_token: accessToken,
                    verification_status: verificationStatus,
                    ysws_eligible: yswsEligible,
                    profile: {
                        first_name: userInfo.given_name || userIDV.identity.first_name || '',
                        last_name: userInfo.family_name || userIDV.identity.last_name || '',
                        is_public: false,
                        birthday: userIDV.identity.birthday || null
                    },
                    address: address ? {
                        address_line_1: address.line_1 || null,
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

            if (slackId) {
                await fetch(getBackendUrl(`/users/${user.user_id}/roles/slack_member`), {
                    method: 'POST',
                    headers: { 'Authorization': BEARER_TOKEN_BACKEND }
                });
                
                // Sync handle from Slack username
                await fetch(getBackendUrl(`/users/${user.user_id}/sync-handle-from-slack`), {
                    method: 'POST',
                    headers: { 'Authorization': BEARER_TOKEN_BACKEND, 'X-User-Id': user.user_id }
                });
            }
        } else {
            await fetch(getBackendUrl(`/users/${user.user_id}/link-idv`), {
                method: 'POST',
                headers: {
                    'Authorization': BEARER_TOKEN_BACKEND,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    identity_vault_id: identityVaultId,
                    identity_vault_access_token: accessToken,
                    idv_country: address?.country_code || null,
                    verification_status: verificationStatus,
                    ysws_eligible: yswsEligible
                })
            });
        }

        await fetch(getBackendUrl(`/users/${user.user_id}/roles/idv`), {
            method: 'POST',
            headers: { 'Authorization': BEARER_TOKEN_BACKEND }
        });
        await fetch(getBackendUrl(`/users/${user.user_id}/idv-complete`), {
            method: 'POST',
            headers: { 'Authorization': BEARER_TOKEN_BACKEND, 'X-User-Id': user.user_id }
        });
        
        // Always try to sync handle from Slack (handles both new and existing users)
        if (slackId) {
            await fetch(getBackendUrl(`/users/${user.user_id}/sync-handle-from-slack`), {
                method: 'POST',
                headers: { 'Authorization': BEARER_TOKEN_BACKEND, 'X-User-Id': user.user_id }
            });
        }

        const hashedUserID = hashUserID(user.user_id);
        cookies.set('userID', hashedUserID, { path: '/', httpOnly: true, secure: !dev, sameSite: 'lax' });
        cookies.set('accessToken', accessToken, { path: '/', httpOnly: true, secure: !dev, sameSite: 'lax' });
        
        throw redirect(302, returnTo);

    } catch (err) {
        if (err instanceof Response || (err && typeof err === 'object' && 'status' in err)) {
            throw err;
        }
        console.error('Error in IDV callback:', err);
        throw redirect(302, '/?error=' + encodeURIComponent('Identity verification failed. Please try again.'));
    }
};
