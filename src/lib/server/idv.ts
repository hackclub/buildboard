/**
 * Identity Vault Service
 * 
 * SECURITY WARNING:
 * - getIdentity() and setSlackId() use the global program key and return/modify PII
 * - These methods MUST only be called from admin-protected routes
 * - Always verify user.is_admin === true before calling these methods
 * - Never expose these methods via public API endpoints
 */

import { dev } from '$app/environment';
import { HC_OAUTH_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_HC_OAUTH_CLIENT_ID, PUBLIC_HC_OAUTH_REDIRECT_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import LZString from 'lz-string';
import { randomBytes } from 'crypto';

function getGlobalProgramKey(): string {
    const key = env.IDV_GLOBAL_PROGRAM_KEY;
    if (!key) {
        throw new Error('IDV_GLOBAL_PROGRAM_KEY environment variable is not set');
    }
    return key;
}

function isBypassMode(): boolean {
    return env.BYPASS_IDV === 'true';
}

type IDVEnvironment = 'staging' | 'prod';

interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
    refresh_token?: string;
}

interface IDVAddress {
    line_1?: string;
    line_2?: string;
    city?: string;
    state?: string;
    country_code?: string;
    postal_code?: string;
}

interface IDVIdentity {
    id: string;
    primary_email: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    birthday?: string;
    slack_id?: string;
    addresses?: IDVAddress[];
    verification_status?: 'needs_submission' | 'pending' | 'verified' | 'ineligible';
    ysws_eligible?: boolean;
}

interface OIDCUserInfo {
    sub: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
    email_verified?: boolean;
    slack_id?: string;
    verification_status?: 'needs_submission' | 'pending' | 'verified' | 'ineligible';
    ysws_eligible?: boolean;
    address?: {
        street_address?: string;
        locality?: string;
        region?: string;
        postal_code?: string;
        country?: string;
    };
}

interface MeResponse {
    identity: IDVIdentity;
}

const HOSTS: Record<IDVEnvironment, string> = {
    staging: 'https://hca.dinosaurbbq.org',
    prod: 'https://auth.hackclub.com'
};

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 500;

class IdentityVaultService {
    private env: IDVEnvironment;
    private host: string;

    constructor() {
        this.env = dev ? 'staging' : 'prod';
        this.host = HOSTS[this.env];
    }

    private async withRetry<T>(fn: () => Promise<T>, maxRetries = MAX_RETRIES): Promise<T> {
        let lastError: Error | null = null;
        
        for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
            try {
                return await fn();
            } catch (error) {
                const isRetryable = error instanceof TypeError || 
                    (error instanceof Error && (
                        error.message.includes('fetch failed') ||
                        error.message.includes('ECONNREFUSED') ||
                        error.message.includes('ETIMEDOUT') ||
                        error.message.includes('socket')
                    ));

                if (!isRetryable || attempt > maxRetries) {
                    throw error;
                }

                lastError = error as Error;
                console.warn(`IDV request failed (attempt ${attempt}/${maxRetries + 1}): ${lastError.message}`);
                await this.sleep(RETRY_BASE_DELAY_MS * attempt);
            }
        }

        throw lastError;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private encodeStashData(params: Record<string, unknown>): string {
        const json = JSON.stringify(params);
        const compressed = LZString.compressToUTF16(json);
        return Buffer.from(compressed, 'utf16le').toString('base64url');
    }

    generateState(): string {
        return randomBytes(24).toString('hex');
    }

    isBypassed(): boolean {
        return isBypassMode();
    }

    authorizeUrl(redirectUri: string, stashData?: Record<string, unknown>, state?: string, loginHint?: string): string {
        const params = new URLSearchParams();
        params.set('client_id', PUBLIC_HC_OAUTH_CLIENT_ID);
        params.set('redirect_uri', redirectUri);
        params.set('response_type', 'code');
        params.set('scope', 'openid profile email slack_id');
        
        if (state) {
            params.set('state', state);
        }
        
        if (loginHint) {
            params.set('login_hint', loginHint);
        }
        
        if (stashData) {
            params.set('stash_data', this.encodeStashData(stashData));
        }
        
        return `${this.host}/oauth/authorize?${params.toString()}`;
    }

    async exchangeToken(code: string, redirectUri?: string): Promise<TokenResponse> {
        return this.withRetry(async () => {
            const params = new URLSearchParams({
                client_id: PUBLIC_HC_OAUTH_CLIENT_ID,
                client_secret: HC_OAUTH_CLIENT_SECRET,
                redirect_uri: redirectUri || PUBLIC_HC_OAUTH_REDIRECT_URL,
                code,
                grant_type: 'authorization_code'
            });

            const response = await fetch(`${this.host}/oauth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params.toString()
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Token exchange failed:', errorText);
                throw new Error(`Token exchange failed: ${response.status}`);
            }

            return response.json();
        });
    }

    async me(userToken: string): Promise<MeResponse> {
        if (!userToken) {
            throw new Error('userToken is required');
        }

        return this.withRetry(async () => {
            const response = await fetch(`${this.host}/api/v1/me`, {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user: ${response.status}`);
            }

            return response.json();
        });
    }

    async userinfo(accessToken: string): Promise<OIDCUserInfo> {
        if (!accessToken) {
            throw new Error('accessToken is required');
        }

        return this.withRetry(async () => {
            const response = await fetch(`${this.host}/oauth/userinfo`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch userinfo: ${response.status}`);
            }

            return response.json();
        });
    }

    /**
     * ADMIN ONLY - Returns PII (name, email, address, etc.)
     * Only call from admin-protected server routes after verifying user.is_admin === true
     */
    async getIdentity(identityId: string): Promise<IDVIdentity> {
        const programKey = getGlobalProgramKey();
        return this.withRetry(async () => {
            const response = await fetch(`${this.host}/api/v1/identities/${identityId}`, {
                headers: {
                    'Authorization': `Bearer ${programKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to get identity: ${response.status}`);
            }

            return response.json();
        });
    }

    /**
     * ADMIN ONLY - Modifies identity data
     * Only call from admin-protected server routes after verifying user.is_admin === true
     */
    async setSlackId(identityId: string, slackId: string): Promise<void> {
        const programKey = getGlobalProgramKey();
        return this.withRetry(async () => {
            const response = await fetch(`${this.host}/api/v1/identities/${identityId}/set_slack_id`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${programKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ slack_id: slackId })
            });

            if (!response.ok) {
                throw new Error(`Failed to set slack ID: ${response.status}`);
            }
        });
    }

    buildAddressCreationUrl(stashData?: Record<string, unknown>): string {
        const params = new URLSearchParams();
        
        if (stashData) {
            params.set('stash_data', this.encodeStashData(stashData));
        }
        
        const query = params.toString();
        return `${this.host}/addresses/program_create_address${query ? `?${query}` : ''}`;
    }

    getHost(): string {
        return this.host;
    }

    getEnv(): IDVEnvironment {
        return this.env;
    }
}

export const idv = new IdentityVaultService();
export type { TokenResponse, MeResponse, IDVIdentity, IDVAddress, OIDCUserInfo };
