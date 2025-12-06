import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';
import { getBackendUrl, hashUserID } from '$lib/server/auth';

export const actions: Actions = {
    sendCode: async ({ request }) => {
        const data = await request.formData();
        const email = data.get('email')?.toString();

        if (!email) {
            return fail(400, { message: 'Email is required' });
        }

        try {
            const response = await fetch(getBackendUrl('/auth/send-otp'), {
                method: 'POST',
                headers: {
                    'Authorization': `${BEARER_TOKEN_BACKEND}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const text = await response.text();
                let errorMessage = `Something went wrong (${response.status})`;
                try {
                    const errorJson = JSON.parse(text);
                    errorMessage = errorJson.detail || errorJson.message || errorJson.error || errorMessage;
                } catch {
                    if (text) errorMessage = text;
                }
                return fail(response.status, { message: errorMessage });
            }

            throw redirect(303, `/auth/login?email=${encodeURIComponent(email)}`);
        } catch (error) {
            if (error instanceof Response) throw error;
            if ((error as any)?.status === 303) throw error;
            console.error('Send code error:', error);
            return fail(500, { message: 'Internal server error' });
        }
    },

    verifyOtp: async ({ request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email')?.toString();
        const otp = data.get('otp')?.toString();

        if (!email || !otp) {
            return fail(400, { message: 'Email and code are required' });
        }

        try {
            const response = await fetch(getBackendUrl('/auth/verify-otp'), {
                method: 'POST',
                headers: {
                    'Authorization': `${BEARER_TOKEN_BACKEND}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, otp })
            });

            if (!response.ok) {
                const text = await response.text();
                let errorMessage = 'Invalid or expired code';
                try {
                    const errorJson = JSON.parse(text);
                    errorMessage = errorJson.detail || errorJson.message || errorJson.error || errorMessage;
                } catch {
                    if (text) errorMessage = text;
                }
                return fail(response.status, { message: errorMessage });
            }

            const result = await response.json();
            
            if (result.userID) {
                const hashedUserID = hashUserID(result.userID);
                cookies.set('userID', hashedUserID, {
                    path: '/',
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 30
                });
            }

            throw redirect(303, '/app');
        } catch (error) {
            if (error instanceof Response) throw error;
            if ((error as any)?.status === 303) throw error;
            console.error('Verify OTP error:', error);
            return fail(500, { message: 'Internal server error' });
        }
    }
};
