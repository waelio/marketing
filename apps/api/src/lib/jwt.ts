import jwt from 'jsonwebtoken';
import type { JwtPayload, Role } from '@waelio/shared';

const secret = process.env.JWT_SECRET || 'dev-secret';
const accessExpires = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const refreshExpires = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, secret, { expiresIn: accessExpires });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'refresh' }, secret, { expiresIn: refreshExpires });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  const payload = jwt.verify(token, secret) as { sub: string; type?: string };
  if (payload.type !== 'refresh') throw new Error('Invalid refresh token');
  return payload;
}

export function parseRole(role: string): Role {
  if (role === 'ADMIN' || role === 'ADVERTISER' || role === 'PUBLISHER') return role;
  throw new Error('Invalid role');
}
