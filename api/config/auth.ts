import type { SignOptions } from 'jsonwebtoken';

export function loadAuthConfig(env: { JWT_SECRET?: string; JWT_EXPIRES_IN?: string }) {
  const secret = env.JWT_SECRET;
  if (!secret || secret === 'change-me-to-a-real-secret' || Buffer.byteLength(secret.trim()) < 32) {
    throw new Error('JWT_SECRET must be explicitly configured with at least 32 bytes');
  }
  const expiresIn = env.JWT_EXPIRES_IN || '7d';
  if (!/^[1-9]\d*[smhd]$/.test(expiresIn)) throw new Error('JWT_EXPIRES_IN must be a positive duration such as 7d');
  return { secret, expiresIn: expiresIn as SignOptions['expiresIn'] };
}
export const authConfig = loadAuthConfig({ JWT_SECRET: process.env.JWT_SECRET, JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN });
