import { randomBytes } from 'crypto';

import 'reflect-metadata';

vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

const ENCRYPTION_KEY = '12345678901234567890123456789012'; // 32 chars
const SALT = randomBytes(16).toString('base64');

process.env.ENCRYPTION_KEY = ENCRYPTION_KEY;
process.env.SALT = SALT;
