import { ENCRYPTION_KEY } from '$env/static/private';
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
