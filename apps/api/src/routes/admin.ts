import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorize, type AuthRequest } from '../middleware/auth.js';

export const adminRouter = Router();
adminRouter.use(authenticate, authorize('ADMIN'));

adminRouter.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

adminRouter.patch('/users/:id', async (req, res) => {
  const { isActive, role } = req.body as { isActive?: boolean; role?: string };
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...(isActive !== undefined ? { isActive } : {}),
      ...(role ? { role: role as 'ADMIN' | 'ADVERTISER' | 'PUBLISHER' } : {}),
    },
  });
  res.json(user);
});

adminRouter.get('/campaigns/pending', async (_req, res) => {
  const campaigns = await prisma.campaign.findMany({
    where: { status: 'PENDING_APPROVAL' },
    include: { advertiser: { include: { user: { select: { email: true } } } }, creatives: true },
  });
  res.json(campaigns);
});

adminRouter.post('/campaigns/:id/approve', async (req: AuthRequest, res) => {
  const campaign = await prisma.campaign.update({
    where: { id: req.params.id, status: 'PENDING_APPROVAL' },
    data: { status: 'ACTIVE', reviewedAt: new Date(), reviewedBy: req.user!.id },
  });
  res.json(campaign);
});

adminRouter.post('/campaigns/:id/reject', async (req: AuthRequest, res) => {
  const { reason } = req.body as { reason?: string };
  const campaign = await prisma.campaign.update({
    where: { id: req.params.id },
    data: {
      status: 'REJECTED',
      rejectReason: reason,
      reviewedAt: new Date(),
      reviewedBy: req.user!.id,
    },
  });
  res.json(campaign);
});

adminRouter.get('/websites/pending', async (_req, res) => {
  const websites = await prisma.website.findMany({
    where: { status: 'PENDING' },
    include: { publisher: { include: { user: { select: { email: true } } } } },
  });
  res.json(websites);
});

adminRouter.post('/websites/:id/approve', async (req: AuthRequest, res) => {
  const website = await prisma.website.update({
    where: { id: req.params.id },
    data: { status: 'APPROVED', reviewedAt: new Date(), reviewedBy: req.user!.id },
  });
  res.json(website);
});

adminRouter.post('/websites/:id/reject', async (req: AuthRequest, res) => {
  const { reason } = req.body as { reason?: string };
  const website = await prisma.website.update({
    where: { id: req.params.id },
    data: {
      status: 'REJECTED',
      rejectReason: reason,
      reviewedAt: new Date(),
      reviewedBy: req.user!.id,
    },
  });
  res.json(website);
});

adminRouter.get('/fraud', async (_req, res) => {
  const events = await prisma.fraudEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json(events);
});

adminRouter.get('/metrics', async (_req, res) => {
  const [users, campaigns, impressions, clicks, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.campaign.count({ where: { status: 'ACTIVE' } }),
    prisma.impression.count(),
    prisma.click.count(),
    prisma.impression.aggregate({ _sum: { revenue: true } }),
  ]);
  res.json({
    users,
    activeCampaigns: campaigns,
    impressions,
    clicks,
    revenue: Number(revenue._sum.revenue ?? 0),
  });
});

adminRouter.get('/revenue', async (req, res) => {
  const days = Number(req.query.days) || 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const impressions = await prisma.impression.aggregate({
    where: { createdAt: { gte: since } },
    _sum: { revenue: true },
    _count: true,
  });
  const clicks = await prisma.click.aggregate({
    where: { createdAt: { gte: since } },
    _sum: { revenue: true },
    _count: true,
  });
  res.json({
    impressions: impressions._count,
    impressionRevenue: Number(impressions._sum.revenue ?? 0),
    clicks: clicks._count,
    clickRevenue: Number(clicks._sum.revenue ?? 0),
    total: Number(impressions._sum.revenue ?? 0) + Number(clicks._sum.revenue ?? 0),
  });
});

adminRouter.post('/fraud', async (req, res) => {
  const schema = z.object({
    type: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    ipHash: z.string().optional(),
    placementId: z.string().optional(),
    campaignId: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const event = await prisma.fraudEvent.create({ data: parsed.data });
  res.status(201).json(event);
});
