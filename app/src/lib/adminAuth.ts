import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { isCookieSecure } from './userAuth';

const DEFAULT_ADMIN_SECRET = 'oncopath_evidence_admin_secret_key_2026';
const DEFAULT_ADMIN_PASSWORD = 'OncoPath2026!';

const ADMIN_SECRET = process.env.ADMIN_SECRET || DEFAULT_ADMIN_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
export const ADMIN_COOKIE_NAME = 'oncopath_admin_token';
export const ADMIN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

if (process.env.NODE_ENV === 'production' && ADMIN_SECRET === DEFAULT_ADMIN_SECRET) {
  console.warn('⚠️ [SECURITY WARNING] OncoPath is running in production with default ADMIN_SECRET! Please configure ADMIN_SECRET in your production .env file.');
}

export function validateAdminCredentials(username: string, password: string): boolean {
  const cleanUser = username.trim();
  const cleanPass = password.trim();

  // In production, block login if still using default password to avoid hijacking
  if (process.env.NODE_ENV === 'production' && ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD) {
    console.error('⛔ [SECURITY ERROR] Default ADMIN_PASSWORD is not allowed in production! Please set ADMIN_PASSWORD in your production .env file.');
    return false;
  }

  const userBuf = Buffer.from(cleanUser);
  const targetUserBuf = Buffer.from(ADMIN_USERNAME);
  const passBuf = Buffer.from(cleanPass);
  const targetPassBuf = Buffer.from(ADMIN_PASSWORD);

  const userMatches = userBuf.length === targetUserBuf.length && crypto.timingSafeEqual(userBuf, targetUserBuf);
  const passMatches = passBuf.length === targetPassBuf.length && crypto.timingSafeEqual(passBuf, targetPassBuf);

  return userMatches && passMatches;
}

export function generateAdminToken(username: string): string {
  const payload = `${username.trim()}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;

    const [username, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    // Expire token after 7 days
    if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
      return false;
    }

    if (username !== ADMIN_USERNAME) {
      return false;
    }

    const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(`${username}:${timestampStr}`).digest('hex');
    
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSig, 'hex');
    if (sigBuffer.length !== expectedBuffer.length) return false;
    
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export function extractAdminToken(request: Request): string | null {
  // 1. Priority: Check Cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1].trim());
    } catch {
      return match[1].trim();
    }
  }

  // 2. Secondary: Check Authorization Bearer header
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

export function verifyAdminRequest(request: Request): boolean {
  const token = extractAdminToken(request);
  return verifyAdminToken(token);
}

export function setAdminCookie(response: NextResponse, token: string, request?: Request): NextResponse {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isCookieSecure(request),
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return response;
}

export function clearAdminCookie(response: NextResponse, request?: Request): NextResponse {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isCookieSecure(request),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

