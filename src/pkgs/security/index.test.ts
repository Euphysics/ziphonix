import { randomBytes } from 'crypto';

import { encrypt, decrypt, hashPassword, verifyPassword, hash } from './index';

describe('Crypto Utility Functions', () => {
  const ENCRYPTION_KEY = '12345678901234567890123456789012'; // 32 chars
  const SALT = randomBytes(16).toString('base64');
  process.env.ENCRYPTION_KEY = ENCRYPTION_KEY;
  process.env.SALT = SALT;

  const plaintext = 'Test encryption';
  const invalidCiphertext = 'invalid:data';
  const password = 'SecurePassword123';
  let hashedPassword: string;

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const encrypted = encrypt(plaintext);
      expect(encrypted).toBeTruthy();
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should throw an error for invalid ciphertext', () => {
      expect(() => decrypt(invalidCiphertext)).toThrow('Decryption failed');
    });
  });

  describe('hashPassword and verifyPassword', () => {
    it('should hash a password and verify it correctly', () => {
      hashedPassword = hashPassword(password);
      expect(hashedPassword).toBeTruthy();
      expect(verifyPassword(password, hashedPassword)).toBe(true);
    });

    it('should return false for incorrect passwords', () => {
      expect(verifyPassword('WrongPassword', hashedPassword)).toBe(false);
    });
  });

  describe('hash', () => {
    it('should hash text correctly using SHA256', () => {
      const hashedText = hash(plaintext);
      expect(hashedText).toBeTruthy();
      expect(hashedText).toHaveLength(64); // SHA256 hashes are 64 characters in hex
    });
  });
});
