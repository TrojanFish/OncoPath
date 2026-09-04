import crypto from 'crypto';
import { NextResponse } from 'next/server';

const DEFAULT_SECRET = 'oncopath_patient_auth_secret_key_2026';
const AUTH_SECRET = process.env.ADMIN_SECRET || DEFAULT_SECRET;
export const AUTH_COOKIE_NAME = 'oncopath_auth_token';
export const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export const PBKDF2_ITERATIONS = 210000;
export const LEGACY_PBKDF2_ITERATIONS = 1000;

if (process.env.NODE_ENV === 'production' && AUTH_SECRET === DEFAULT_SECRET) {
  console.warn('⚠️ [SECURITY WARNING] OncoPath is running in production with default ADMIN_SECRET! Please configure ADMIN_SECRET in your production .env file.');
}

/**
 * Hash a password using PBKDF2 with a random salt and 210,000 iterations (OWASP compliant)
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const rawHash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex');
  const hash = `pbkdf2$${PBKDF2_ITERATIONS}$${rawHash}`;
  return { hash, salt };
}

/**
 * Verify a plain password against stored hash and salt (supports adaptive legacy 1,000 & modern 210,000 iterations)
 */
export function verifyPassword(password: string, storedHash: string, salt: string | null | undefined): boolean {
  if (!salt) {
    // Backward compatibility or legacy simple SHA-256
    const simpleHash = crypto.createHash('sha256').update(password).digest('hex');
    return simpleHash === storedHash;
  }

  // 1. Prefixed modern hash (e.g. pbkdf2$210000$<hex>)
  if (storedHash.startsWith('pbkdf2$')) {
    const parts = storedHash.split('$');
    const iterations = parseInt(parts[1], 10) || PBKDF2_ITERATIONS;
    const expectedHex = parts[2];
    const computedHex = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
    const expectedBuf = Buffer.from(expectedHex, 'hex');
    const computedBuf = Buffer.from(computedHex, 'hex');
    if (expectedBuf.length !== computedBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, computedBuf);
  }

  // 2. Legacy raw hex format (check 1,000 iterations first for backward compatibility)
  const legacyHex = crypto.pbkdf2Sync(password, salt, LEGACY_PBKDF2_ITERATIONS, 64, 'sha512').toString('hex');
  const storedBuf = Buffer.from(storedHash, 'hex');
  const legacyBuf = Buffer.from(legacyHex, 'hex');
  if (storedBuf.length === legacyBuf.length && crypto.timingSafeEqual(storedBuf, legacyBuf)) {
    return true;
  }

  // 3. Fallback check raw hex at modern iterations
  const modernHex = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, 'sha512').toString('hex');
  const modernBuf = Buffer.from(modernHex, 'hex');
  if (storedBuf.length === modernBuf.length && crypto.timingSafeEqual(storedBuf, modernBuf)) {
    return true;
  }

  return false;
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
 * Helper to determine whether the session cookie should have the 'secure' attribute
 */
export function isCookieSecure(request?: Request): boolean {
  if (process.env.COOKIE_SECURE === 'false' || process.env.COOKIE_SECURE === '0') {
    return false;
  }
  if (process.env.COOKIE_SECURE === 'true' || process.env.COOKIE_SECURE === '1') {
    return true;
  }
  if (request) {
    const proto = request.headers.get('x-forwarded-proto');
    if (proto === 'http') return false;
    if (proto === 'https') return true;
  }
  return process.env.NODE_ENV === 'production';
}

/**
 * Attach secure HttpOnly session cookie to outgoing NextResponse
 */
export function setAuthCookie(response: NextResponse, token: string, request?: Request): NextResponse {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isCookieSecure(request),
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
  return response;
}

/**
 * Clear session cookie on logout
 */
export function clearAuthCookie(response: NextResponse, request?: Request): NextResponse {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isCookieSecure(request),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

