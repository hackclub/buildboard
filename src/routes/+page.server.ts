import type { PageServerLoad, Actions } from './$types';
import { BEARER_TOKEN_BACKEND, ENCRYPTION_KEY } from '$env/static/private';
import { getBackendUrl } from '$lib/server/auth';
import { createDecipheriv } from 'crypto';
import { fail } from '@sveltejs/kit';

function unhashUserID(hashedUserID: string): string {
    const parts = hashedUserID.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export const actions: Actions = {
    rsvp: async ({ request, getClientAddress }) => {
        // Debug: Log all headers to see which one contains the real IP
        const headers = Object.fromEntries(request.headers);
        console.log('Incoming Request Headers:', JSON.stringify(headers, null, 2));

        const data = await request.formData();
        const email = data.get('email')?.toString();
        
        // Securely get IP address from server (configured to trust Cloudflare headers)
        const ip_address = getClientAddress();

        // Check IP count
        try {
            const countResponse = await fetch(getBackendUrl(`/rsvps/count/${ip_address}`), {
                headers: {
                    'Authorization': `${BEARER_TOKEN_BACKEND}`
                }
            });

            if (countResponse.ok) {
                const count = await countResponse.json();
                if (count >= 1000) {
                    return fail(429, { message: 'Too many requests' });
                }
            }
        } catch (error) {
            console.error('Error checking IP count:', error);
        }

        if (!email) {
            return fail(400, { missing: true });
        }

        try {
            console.log(`New RSVP attempt (anonymized)`);
            // console.log(`Sending request to: ${getBackendUrl('/rsvps')}`);

            const response = await fetch(getBackendUrl('/rsvps'), {
                method: 'POST',
                headers: {
                    'Authorization': `${BEARER_TOKEN_BACKEND}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    ip_address
                })
            });


            if (!response.ok) {
                console.error('RSVP backend failed:', response.status);
                const text = await response.text();
                let errorMessage = `Something went wrong (${response.status})`;
                try {
                    const errorJson = JSON.parse(text);
                    errorMessage = errorJson.message || errorJson.error || (typeof errorJson.detail === 'string' ? errorJson.detail : null) || errorMessage;
                } catch {
                    if (text) errorMessage = text;
                }
                return fail(response.status, { message: errorMessage });
            }

            const result = await response.json();
            return result.message === 'collisions detected'
                ? { success: true, collision: true }
                : { success: true };
        } catch (error) {
            console.error('RSVP error:', error);
            return fail(500, { message: 'Internal server error' });
        }
    }
};

export const load: PageServerLoad = async ({ cookies, url }) => {
    const utmFromUrl = url.searchParams.get('utm_source');
    const utm_source =
        utmFromUrl && utmFromUrl.trim().length > 0
            ? utmFromUrl.trim()
            : 'non referred';
    try {
        const response = await fetch(getBackendUrl('/utms'), {
            method: 'POST',
            headers: {
                'Authorization': `${BEARER_TOKEN_BACKEND}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ utm_source })
        });
        console.log('UTM POST response:', response.status, await response.text());
        console.log(`Sent UTM data: ${utm_source}`);
        console.log( JSON.stringify({ utm_source}));
    } catch (error) {
        console.error('Error sending UTM data:', error);
    }

    const hashedUserID = cookies.get('userID');

    if (!hashedUserID) {
        return { projects: null };
    }

    try {
        const userID = unhashUserID(hashedUserID);

        // Get user data to fetch slack_id
        const userResponse = await fetch(getBackendUrl(`/users/${userID}`), {
            headers: {
                'Authorization': `${BEARER_TOKEN_BACKEND}`
            }
        });

        if (!userResponse.ok) {
            return { projects: null };
        }

        const user = await userResponse.json();
        
        if (!user.slack_id) {
            return { projects: null };
        }

        // Fetch Hackatime projects
        const hackatimeResponse = await fetch(`https://hackatime.hackclub.com/api/v1/users/${user.slack_id}/stats?features=projects&start_date=2025-10-18`);

        if (!hackatimeResponse.ok) {
            return { projects: null };
        }

        const hackatimeData = await hackatimeResponse.json();
        
        return {
            projects: hackatimeData.data?.projects || []
        };
    } catch (error) {
        console.error('Error fetching projects:', error);
        return { projects: null };
    }
};
