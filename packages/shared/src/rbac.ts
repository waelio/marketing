import type { Role } from './types.js';

const PERMISSIONS: Record<Role, string[]> = {
  ADMIN: ['*'],
  ADVERTISER: [
    'campaigns:read',
    'campaigns:write',
    'creatives:read',
    'creatives:write',
    'analytics:read',
    'invoices:read',
  ],
  PUBLISHER: [
    'websites:read',
    'websites:write',
    'placements:read',
    'placements:write',
    'earnings:read',
    'analytics:read',
  ],
};

export function hasPermission(role: Role, permission: string): boolean {
  const perms = PERMISSIONS[role];
  if (perms.includes('*')) return true;
  return perms.includes(permission);
}

export function requireRoles(role: Role, allowed: Role[]): boolean {
  return allowed.includes(role);
}
