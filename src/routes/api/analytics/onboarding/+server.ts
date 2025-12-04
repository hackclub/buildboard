import { json } from '@sveltejs/kit';
import { unhashUserID, getBackendUrl } from '$lib/server/auth';
import { BEARER_TOKEN_BACKEND } from '$env/static/private';

export interface OnboardingEvent {
    event: 'onboarding_started' | 'onboarding_next' | 'onboarding_skip' | 'onboarding_completed';
    slide?: number;
    totalSlides?: number;
    completedAt?: string;
}

export async function POST({ cookies, request, fetch }) {
    const hashedUserID = cookies.get('userID');

    if (!hashedUserID) {
        return json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const userID = unhashUserID(hashedUserID);
        const body: OnboardingEvent = await request.json();

        const payload = {
            userId: userID,
            event: body.event,
            slide: body.slide,
            totalSlides: body.totalSlides,
            completedAt: body.event === 'onboarding_completed' ? new Date().toISOString() : undefined,
            timestamp: new Date().toISOString()
        };

        const response = await fetch(getBackendUrl('/analytics/onboarding'), {
            method: 'POST',
            headers: {
                'Authorization': `${BEARER_TOKEN_BACKEND}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            return json({ success: true });
        } else {
            console.error('Backend analytics failed:', response.status);
            return json({ success: true });
        }
    } catch (error) {
        console.error('Error in /api/analytics/onboarding:', error);
        return json({ success: true });
    }
}
