import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword, generateToken } from '../lib/hash.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js';
import { isValidEmail, isValidPassword } from '@waelio/shared';
import type { AuthRequest } from '../middleware/auth.js';
import { authenticate } from '../middleware/auth.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADVERTISER', 'PUBLISHER']).default('ADVERTISER'),
});

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }
  const { email, password, firstName, lastName, role } = parsed.data;
  if (!isValidEmail(email) || !isValidPassword(password)) {
    res.status(400).json({ error: 'Invalid email or password format' });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role,
      ...(role === 'ADVERTISER' ? { advertiser: { create: {} } } : { publisher: { create: {} } }),
    },
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken(user.id);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId: user.id, refreshToken, expiresAt } });

  res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role, firstName, lastName },
    accessToken,
    refreshToken,
  });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken(user.id);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId: user.id, refreshToken, expiresAt } });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    accessToken,
    refreshToken,
  });
});

authRouter.post('/logout', authenticate, async (req: AuthRequest, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) {
    await prisma.session.deleteMany({ where: { refreshToken } });
  } else if (req.user) {
    await prisma.session.deleteMany({ where: { userId: req.user.id } });
  }
  res.json({ success: true });
});

authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token required' });
    return;
  }
  try {
    const payload = verifyRefreshToken(refreshToken);
    const session = await prisma.session.findUnique({ where: { refreshToken } });
    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ error: 'Session expired' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

authRouter.post('/forgot-password', async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    res.status(400).json({ error: 'Email required' });
    return;
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const resetToken = generateToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetExpires: new Date(Date.now() + 3600000) },
    });
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }
  }
  res.json({ message: 'If the email exists, a reset link has been sent' });
});

authRouter.post('/reset-password', async (req, res) => {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password || !isValidPassword(password)) {
    res.status(400).json({ error: 'Invalid token or password' });
    return;
  }
  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetExpires: { gt: new Date() } },
  });
  if (!user) {
    res.status(400).json({ error: 'Invalid or expired reset token' });
    return;
  }
  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetExpires: null },
  });
  res.json({ message: 'Password updated successfully' });
});

authRouter.get('/me', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      advertiser: { select: { id: true, company: true, balance: true } },
      publisher: { select: { id: true, company: true, balance: true } },
    },
  });
  res.json(user);
});
