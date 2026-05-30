import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + (process.env.IP_SALT || 'waelio')).digest('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
