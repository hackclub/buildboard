import type { PageServerLoad, Actions } from './$types';
import { BACKEND_DOMAIN_NAME, BEARER_TOKEN_BACKEND, ENCRYPTION_KEY } from '$env/static/private';
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
        const ip_address = getClientAddress();
        console.log(`Resolved IP: ${ip_address}`);

        const data = await request.formData();
        const email = data.get('email')?.toString();
        const ip_address = getClientAddress();

        if (!email) {
            return fail(400, { missing: true });
        }

        try {
            console.log(`New RSVP attempt: ${email} from ${ip_address}`);
            
            const response = await fetch(`https://${BACKEND_DOMAIN_NAME}/rsvps`, {
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

            if (response.status === 422) {
                return fail(422, { message: 'Too many requests' });
            }

            const result = await response.json();

            if (response.ok) {
                if (result.message === 'collisions detected') {
                    return { success: true, collision: true };
                }
                return { success: true };
            } else {
                console.error('RSVP backend failed:', response.status, result);
                return fail(response.status, { message: result.message || 'Something went wrong' });
            }
        } catch (error) {
            console.error('RSVP error:', error);
            return fail(500, { message: 'Internal server error' });
        }
    }
};

export const load: PageServerLoad = async ({ cookies }) => {
    const hashedUserID = cookies.get('userID');

    if (!hashedUserID) {
        return { projects: null };
    }

    try {
        const userID = unhashUserID(hashedUserID);

        // Get user data to fetch slack_id
        const userResponse = await fetch(`https://${BACKEND_DOMAIN_NAME}/users/${userID}`, {
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
