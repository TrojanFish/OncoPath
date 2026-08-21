import crypto from 'crypto';

const AUTH_SECRET = process.env.ADMIN_SECRET || 'oncopath_patient_auth_secret_key_2026';

/**
 * Hash a password using PBKDF2 with a random salt
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verify a plain password against stored hash and salt
 */
export function verifyPassword(password: string, storedHash: string, salt: string | null | undefined): boolean {
  if (!salt) {
    // Backward compatibility or legacy simple SHA-256
    const simpleHash = crypto.createHash('sha256').update(password).digest('hex');
    return simpleHash === storedHash;
  }
  const hashToVerify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(hashToVerify, 'hex'));
}

/**
 * Generate a signed JWT-like token for user session
 */
export function generateUserToken(userId: string, email: string): string {
  const payload = `${userId}:${email.toLowerCase().trim()}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

/**
 * Verify user session token (valid for 30 days)
 */
export function verifyUserToken(token: string | null | undefined): { userId: string; email: string } | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 4) return null;

    const [userId, email, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return null;

    // Token expires in 30 days
    if (Date.now() - timestamp > 30 * 24 * 60 * 60 * 1000) {
      return null;
    }

    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(`${userId}:${email}:${timestampStr}`)
      .digest('hex');

    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSig, 'hex');
    if (sigBuffer.length !== expectedBuffer.length) return null;

    if (crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return { userId, email };
    }
    return null;
  } catch {
    return null;
  }
}
