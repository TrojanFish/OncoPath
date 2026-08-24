import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateUserToken,
  verifyUserToken,
  extractTokenFromRequest,
  AUTH_COOKIE_NAME,
} from '../lib/userAuth';

describe('User Authentication & Session Security Engine (P1)', () => {
  describe('Password Hashing & PBKDF2 Verification', () => {
    it('should generate unique salts and correct hashes for identical passwords', () => {
      const p1 = hashPassword('MySecretPass2026!');
      const p2 = hashPassword('MySecretPass2026!');

      expect(p1.salt).not.toBe(p2.salt);
      expect(p1.hash).not.toBe(p2.hash);

      expect(verifyPassword('MySecretPass2026!', p1.hash, p1.salt)).toBe(true);
      expect(verifyPassword('MySecretPass2026!', p2.hash, p2.salt)).toBe(true);
      expect(verifyPassword('WrongPassword', p1.hash, p1.salt)).toBe(false);
    });
  });

  describe('HMAC Token Lifecycle & Anti-Tampering', () => {
    it('should generate and verify valid user session tokens', () => {
      const userId = 'usr_test_123456';
      const email = 'patient@lunghealth.org';
      const token = generateUserToken(userId, email);

      const verified = verifyUserToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(userId);
      expect(verified?.email).toBe(email);
    });

    it('should reject tampered token payloads or signatures', () => {
      const token = generateUserToken('usr_original', 'orig@test.com');

      // Tamper signature
      const tampered1 = token.slice(0, -5) + 'ABCDE';
      expect(verifyUserToken(tampered1)).toBeNull();

      // Tamper base64 decode/encode payload with modified email
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      const forgedPayload = `${parts[0]}:hacker@attack.com:${parts[2]}:${parts[3]}`;
      const forgedToken = Buffer.from(forgedPayload).toString('base64');

      expect(verifyUserToken(forgedToken)).toBeNull();
    });
  });

  describe('Dual-Mode Token Extraction (Cookies vs Authorization Header)', () => {
    it('should extract token correctly from Cookie header', () => {
      const sampleToken = generateUserToken('usr_cookie', 'cookie@test.com');
      const mockReq = {
        headers: {
          get: (key: string) => {
            if (key.toLowerCase() === 'cookie') {
              return `theme=light; ${AUTH_COOKIE_NAME}=${encodeURIComponent(sampleToken)}; analytics=off`;
            }
            return null;
          }
        }
      };

      const extracted = extractTokenFromRequest(mockReq as any);
      expect(extracted).toBe(sampleToken);
    });

    it('should extract token correctly from Authorization Bearer header when cookie is absent', () => {
      const sampleToken = generateUserToken('usr_bearer', 'bearer@test.com');
      const mockReq = {
        headers: {
          get: (key: string) => {
            if (key.toLowerCase() === 'authorization') {
              return `Bearer ${sampleToken}`;
            }
            return null;
          }
        }
      };

      const extracted = extractTokenFromRequest(mockReq as any);
      expect(extracted).toBe(sampleToken);
    });
  });
});
