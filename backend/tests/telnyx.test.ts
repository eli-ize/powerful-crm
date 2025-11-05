import { TelnyxService } from '../src/services/telnyx';

describe('TelnyxService', () => {
  describe('formatPhoneNumber', () => {
    it('should add + prefix if missing', () => {
      expect(TelnyxService.formatPhoneNumber('1234567890')).toBe('+1234567890');
    });

    it('should not duplicate + prefix', () => {
      expect(TelnyxService.formatPhoneNumber('+1234567890')).toBe('+1234567890');
    });

    it('should handle empty string', () => {
      expect(TelnyxService.formatPhoneNumber('')).toBe('+');
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate correct E.164 format', () => {
      expect(TelnyxService.validatePhoneNumber('+1234567890')).toBe(true);
      expect(TelnyxService.validatePhoneNumber('+12345678901234')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(TelnyxService.validatePhoneNumber('1234567890')).toBe(false);
      expect(TelnyxService.validatePhoneNumber('+123')).toBe(false);
      expect(TelnyxService.validatePhoneNumber('')).toBe(false);
    });
  });
});
