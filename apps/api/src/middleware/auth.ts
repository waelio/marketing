import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt.js';
import type { Role } from '@waelio/shared';
import { hasPermission, requireRoles } from '@waelio/shared';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: Role };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const payload = verifyAccessToken(header.slice(7));
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !requireRoles(req.user.role, roles)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}

export function authorizePermission(permission: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !hasPermission(req.user.role, permission)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}
