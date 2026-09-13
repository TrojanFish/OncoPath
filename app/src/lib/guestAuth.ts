import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { isCookieSecure } from './userAuth';

const DEFAULT_GUEST_SECRET = 'oncopath_guest_session_secret_key_2026';
const GUEST_SECRET = process.env.ADMIN_SECRET || DEFAULT_GUEST_SECRET;
export const GUEST_COOKIE_NAME = 'oncopath_guest_token';
export const GUEST_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Generate a signed guest token with anti-tampering HMAC signature.
 * Format: guestId.signature
 */
export function signGuestId(guestId: string): string {
  const cleanId = guestId.trim();
  const signature = crypto.createHmac('sha256', GUEST_SECRET).update(cleanId).digest('hex');
  return `${cleanId}.${signature}`;
}

/**
 * Verify a signed guest token and extract the valid guestId.
 */
export function verifyGuestToken(token: string | null | undefined): string | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 2) return null;

  const [guestId, signature] = parts;
  if (!guestId.startsWith('guest-')) return null;

  const expectedSig = crypto.createHmac('sha256', GUEST_SECRET).update(guestId).digest('hex');
  const sigBuf = Buffer.from(signature, 'hex');
  const expectedBuf = Buffer.from(expectedSig, 'hex');

  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  return guestId;
}

/**
 * Extract and verify guestId from Request headers or signed cookies.
 */
export function extractVerifiedGuestId(request: Request): string | null {
  // 1. Priority: Check HttpOnly signed guest cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${GUEST_COOKIE_NAME}=([^;]+)`));
  if (match && match[1]) {
    const verified = verifyGuestToken(decodeURIComponent(match[1].trim()));
    if (verified) return verified;
  }

  // 2. Secondary: Check X-Guest-Token header
  const guestTokenHeader = request.headers.get('x-guest-token');
  if (guestTokenHeader) {
    const verified = verifyGuestToken(guestTokenHeader);
    if (verified) return verified;
  }

  // 3. Fallback: Check Authorization header if it passes signed token
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer guest-') && authHeader.includes('.')) {
    const token = authHeader.substring(7).trim();
    const verified = verifyGuestToken(token);
    if (verified) return verified;
  }

  return null;
}

/**
 * Set signed guest token cookie on response
 */
export function setGuestCookie(response: NextResponse, guestId: string, request?: Request): NextResponse {
  const signedToken = signGuestId(guestId);
  response.cookies.set({
    name: GUEST_COOKIE_NAME,
    value: signedToken,
    httpOnly: true,
    secure: isCookieSecure(request),
    sameSite: 'lax',
    path: '/',
    maxAge: GUEST_COOKIE_MAX_AGE,
  });
  return response;
}
