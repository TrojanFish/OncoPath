import crypto from 'crypto';
import { NextResponse } from 'next/server';

const AUTH_SECRET = process.env.ADMIN_SECRET || 'oncopath_patient_auth_secret_key_2026';
export const AUTH_COOKIE_NAME = 'oncopath_auth_token';
export const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

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
  const cleanEmail = email.toLowerCase().trim();
  const timestamp = Date.now();
  const payload = `${userId}:${cleanEmail}:${timestamp}`;
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

/**
 * Extract token from either HttpOnly cookie or Authorization Bearer header
 */
export function extractTokenFromRequest(request: Request): string | null {
  // 1. Priority: Check HttpOnly / Standard Cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1].trim());
    } catch {
      return match[1].trim();
    }
  }

  // 2. Secondary: Check Authorization Bearer header (for mobile / API clients)
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * High-level helper to get authenticated user from incoming Request
 */
export function getAuthenticatedUser(request: Request): { userId: string; email: string } | null {
  const token = extractTokenFromRequest(request);
  return verifyUserToken(token);
}

/**
 * Attach secure HttpOnly session cookie to outgoing NextResponse
 */
export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  const isProd = process.env.NODE_ENV === 'production';
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
  return response;
}

/**
 * Clear session cookie on logout
 */
export function clearAuthCookie(response: NextResponse): NextResponse {
  const isProd = process.env.NODE_ENV === 'production';
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

