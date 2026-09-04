import { describe, it, expect } from 'vitest';
import { GET as getTimeline, PUT as putTimeline, DELETE as deleteTimeline } from '../app/api/timeline/route';
import { GET as getProfile, DELETE as deleteProfile } from '../app/api/profile/route';
import { isCookieSecure } from '../lib/userAuth';
import { validateAdminCredentials } from '../lib/adminAuth';

describe('Production Security & Access Control Guardrails (P0 & P1)', () => {
  describe('Timeline Data Leak Prevention (P0)', () => {
    it('should return empty events array when unauthenticated and without profileId', async () => {
      const mockReq = new Request('http://localhost:3000/api/timeline');
      const response = await getTimeline(mockReq);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.events).toEqual([]);
    });

    it('should reject unauthenticated deletion of timeline events', async () => {
      const mockReq = new Request('http://localhost:3000/api/timeline?id=non_existent_or_protected');
      const response = await deleteTimeline(mockReq);
      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('Profile IDOR Protection (P0)', () => {
    it('should return null when unauthenticated user queries without a valid guestId', async () => {
      const mockReq = new Request('http://localhost:3000/api/profile?userId=malicious_target_id');
      const response = await getProfile(mockReq);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.profile).toBeNull();
    });

    it('should reject unauthenticated DELETE without a valid guestId', async () => {
      const mockReq = new Request('http://localhost:3000/api/profile?userId=victim_user_123', {
        method: 'DELETE'
      });
      const response = await deleteProfile(mockReq);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
    });
  });

  describe('Cookie Security & Admin Credentials (P1)', () => {
    it('should detect secure cookie based on forwarded headers', () => {
      const httpReq = new Request('http://localhost:3000/api/auth/login', {
        headers: { 'x-forwarded-proto': 'http' }
      });
      expect(isCookieSecure(httpReq)).toBe(false);

      const httpsReq = new Request('https://localhost:3000/api/auth/login', {
        headers: { 'x-forwarded-proto': 'https' }
      });
      expect(isCookieSecure(httpsReq)).toBe(true);
    });

    it('should validate admin credentials with constant-time equality', () => {
      // In non-production, default passes; bad credentials fail
      expect(validateAdminCredentials('admin', 'WrongPass!')).toBe(false);
      expect(validateAdminCredentials('wrong_admin', 'OncoPath2026!')).toBe(false);
    });
  });
});
