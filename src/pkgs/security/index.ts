import {
  createCipheriv,
  createDecipheriv,
  createHash,
  pbkdf2Sync,
  randomBytes,
} from 'crypto';

// Get the encryption key from the environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be set and 32 characters long');
}

// Get the salt from the environment variables
const SALT = process.env.SALT;
if (!SALT) {
  throw new Error('SALT must be set');
}

const IV_LENGTH = 16;

const encrypt = (text: string): string => {
  try {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(
      'aes-256-gcm',
      Uint8Array.from(Buffer.from(ENCRYPTION_KEY)),
      Uint8Array.from(iv),
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Encryption failed');
  }
};

const decrypt = (text: string): string => {
  try {
    const parts = text.split(':');
    const iv = Uint8Array.from(Buffer.from(parts[0], 'hex'));
    const tag = Uint8Array.from(Buffer.from(parts[1], 'hex'));
    const encrypted = parts[2];
    const decipher = createDecipheriv(
      'aes-256-gcm',
      Uint8Array.from(Buffer.from(ENCRYPTION_KEY)),
      Uint8Array.from(iv),
    );
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Decryption failed');
  }
};

/**
 * Hashes a password using bcrypt
 * @param pass - The plain text password
 * @returns The hashed password
 */
const hashPassword = (pass: string): string =>
  pbkdf2Sync(
    pass,
    Uint8Array.from(Buffer.from(SALT, 'base64')),
    100000,
    512,
    'sha512',
  ).toString('hex');

/**
 * Hash a text using SHA256
 * @param text - The text to hash
 * @returns The hashed text
 */
const hash = (text: string): string =>
  createHash('sha256').update(text).digest('hex');

/**
 * Verifies a password against a hashed password
 * @param pass - The plain text password
 * @param hashedPass - The hashed password
 * @returns Whether the password is correct
 * @throws If verifying the password fails
 */
const verifyPassword = (pass: string, hashedPass: string): boolean =>
  hashPassword(pass) === hashedPass;

export { encrypt, decrypt, hashPassword, verifyPassword, hash };
