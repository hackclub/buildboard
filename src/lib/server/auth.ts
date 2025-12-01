import { ENCRYPTION_KEY, BACKEND_DOMAIN_NAME } from '$env/static/private';
import { createDecipheriv } from 'crypto';

export function unhashUserID(hashedUserID: string): string {
    const parts = hashedUserID.split(':');
    if (parts.length !== 2) throw new Error('Invalid hashed user ID format');
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export function getBackendUrl(path: string): string {
    let baseUrl = BACKEND_DOMAIN_NAME;
    
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        throw new Error('BACKEND_DOMAIN_NAME must include protocol (http:// or https://)');
    }
    
    // Remove trailing slash from base if present
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }

    // Remove leading slash from path if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    return `${baseUrl}/${cleanPath}`;
}
