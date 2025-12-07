import { redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_SLACK_CLIENT_ID, PUBLIC_SLACK_REDIRECT_URI } from '$env/static/public';
import { SLACK_CLIENT_SECRET, BEARER_TOKEN_BACKEND, ENCRYPTION_KEY } from '$env/static/private';
import { getBackendUrl } from '$lib/server/auth';
import { createCipheriv, randomBytes } from 'crypto';

function hashUserID(userID: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(userID, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

export const GET: RequestHandler = async ({ url, cookies }) => {
    const code1 = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
        console.error('Slack OAuth error:', error);
        throw redirect(302, '/');
    }

    if (!code1) {
        console.error('No authorization code received');
        throw redirect(302, '/');
    }

    try {
        const params = new URLSearchParams({
            code: code1,
            client_id: PUBLIC_SLACK_CLIENT_ID,
            client_secret: SLACK_CLIENT_SECRET,
            redirect_uri: PUBLIC_SLACK_REDIRECT_URI
        });

        const slackResponse = await fetch('https://slack.com/api/openid.connect.token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!slackResponse.ok) {
            const errorText = await slackResponse.text();
            console.error('Slack HTTP error:', slackResponse.status, errorText);
            throw redirect(302, '/');
        }

        const data = await slackResponse.json();
        console.log('Full Slack OpenID Connect response:', JSON.stringify(data, null, 2));

        if (!data.ok) {
            console.error('Slack API error:', data.error);
            throw redirect(302, '/');
        }

        const idToken = data.id_token;
        
        if (!idToken) {
            console.error('No id_token in OpenID Connect response');
            throw redirect(302, '/');
        }

        const tokenPayload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
        console.log('OpenID token payload:', tokenPayload);

        const slackID = tokenPayload.sub?.replace('https://slack.com/user_id/', '');
        const email = tokenPayload.email;
        const firstName = tokenPayload.name;

        const backendUrl = getBackendUrl(`/users/by-email/${encodeURIComponent(email)}`);
        const userResponse = await fetch(backendUrl, {
            headers: {
                'Authorization': `${BEARER_TOKEN_BACKEND}`
            }
        });

        let user1: { user_id: string } | null = null;
        if (userResponse.ok) {
            try {
                user1 = await userResponse.json();
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

        console.log('User fetched by email:', user1);
        if (!user1 || !user1.user_id) {
            console.log('User not found for email, creating new user');
            
            const requestBody = {
                email: email,
                slack_id: slackID,
                profile: {
                    first_name: firstName || '',
                    last_name: '',
                    is_public: false,
                    birthday: null
                },
                address: null
            };

            console.log('Creating user with request body:', requestBody);
            const createUrl = getBackendUrl('/users');
            
            const createUserResponse = await fetch(createUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `${BEARER_TOKEN_BACKEND}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Create user response status:', createUserResponse.status);

            if (!createUserResponse.ok) {
                const errorBody = await createUserResponse.text();
                console.error('Failed to create user. Response:', errorBody);
                
                // If conflict (user already exists), try to fetch by email again
                if (createUserResponse.status === 409) {
                    console.log('User already exists, attempting to fetch existing user');
                    const retryResponse = await fetch(getBackendUrl(`/users/by-email/${encodeURIComponent(email.toLowerCase())}`), {
                        headers: { 'Authorization': `${BEARER_TOKEN_BACKEND}` }
                    });
                    if (retryResponse.ok) {
                        user1 = await retryResponse.json();
                        console.log('Found existing user:', user1);
                    } else {
                        throw redirect(302, '/?error=' + encodeURIComponent('Login failed. Please try again.'));
                    }
                } else {
                    throw redirect(302, '/?error=' + encodeURIComponent('Login failed. Please try again.'));
                }
            } else {
                const responseBody = await createUserResponse.text();
                console.log('Create user response body:', responseBody);
                user1 = JSON.parse(responseBody);

                // Add slack_member role for new users
                await fetch(getBackendUrl(`/users/${user1.user_id}/roles/slack_member`), {
                    method: 'POST',
                    headers: { 'Authorization': `${BEARER_TOKEN_BACKEND}` }
                });
            }
        }

        const hashedUserID = hashUserID(user1!.user_id);
        cookies.set('userID', hashedUserID, { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });

        throw redirect(302, '/app/onboarding');

    } catch (err) {
        if (isRedirect(err) || isHttpError(err)) {
            throw err;
        }
        console.error('Error processing Slack OAuth:', err);
        throw redirect(302, '/');
    }
};
