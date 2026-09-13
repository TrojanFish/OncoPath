/**
 * OncoPath In-Memory Sliding Window Rate Limiter
 * Provides robust abuse prevention for high-cost AI LLM endpoints and brute-force protection.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean expired records every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  intervalMs: number; // Window duration in milliseconds
  maxRequests: number; // Max allowed requests in this window
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check and increment rate limit for a specific identifier (IP / Token)
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { intervalMs: 60 * 1000, maxRequests: 30 }
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + options.intervalMs
    };
    rateLimitStore.set(identifier, newRecord);
    return {
      success: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - 1,
      resetTime: newRecord.resetTime
    };
  }

  if (record.count >= options.maxRequests) {
    return {
      success: false,
      limit: options.maxRequests,
      remaining: 0,
      resetTime: record.resetTime
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - record.count,
    resetTime: record.resetTime
  };
}

/**
 * Extract client IP from incoming Request headers (support reverse proxies / Cloudflare / Nginx)
 */
export function getClientIp(request: Request): string {
  // 1. Priority: Cloudflare Edge Header (stripped and validated by Cloudflare edge)
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp && cfIp.trim()) {
    return cfIp.trim();
  }

  // 2. Secondary: Nginx configured trusted Real IP ($client_real_ip)
  const realIp = request.headers.get('x-real-ip');
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  // 3. Fallback: Parse X-Forwarded-For safely
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor && forwardedFor.trim()) {
    const parts = forwardedFor.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      return parts[0];
    }
  }

  return '127.0.0.1';
}
