import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorize, type AuthRequest } from '../middleware/auth.js';

export const campaignsRouter = Router();
campaignsRouter.use(authenticate);

const campaignSchema = z.object({
  name: z.string().min(1),
  pricingModel: z.enum(['CPC', 'CPM']),
  bidAmount: z.number().positive(),
  dailyBudget: z.number().positive().optional(),
  totalBudget: z.number().positive().optional(),
  priority: z.number().int().min(1).max(10).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  geoTargets: z.array(z.string()).optional(),
  deviceTargets: z.array(z.string()).optional(),
  browserTargets: z.array(z.string()).optional(),
  frequencyCap: z.number().int().positive().optional(),
  frequencyPeriod: z.number().int().positive().optional(),
});

async function getAdvertiserId(userId: string): Promise<string | null> {
  const adv = await prisma.advertiser.findUnique({ where: { userId } });
  return adv?.id ?? null;
}

campaignsRouter.get('/', authorize('ADVERTISER', 'ADMIN'), async (req: AuthRequest, res) => {
  const advertiserId =
    req.user!.role === 'ADMIN'
      ? (req.query.advertiserId as string)
      : await getAdvertiserId(req.user!.id);

  if (!advertiserId && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Advertiser profile not found' });
    return;
  }

  const campaigns = await prisma.campaign.findMany({
    where: advertiserId ? { advertiserId } : undefined,
    include: { creatives: true, _count: { select: { impressions: true, clicks: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(campaigns);
});

campaignsRouter.post('/', authorize('ADVERTISER'), async (req: AuthRequest, res) => {
  const parsed = campaignSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const advertiserId = await getAdvertiserId(req.user!.id);
  if (!advertiserId) {
    res.status(403).json({ error: 'Advertiser profile not found' });
    return;
  }

  const data = parsed.data;
  const campaign = await prisma.campaign.create({
    data: {
      advertiserId,
      name: data.name,
      pricingModel: data.pricingModel,
      bidAmount: data.bidAmount,
      dailyBudget: data.dailyBudget,
      totalBudget: data.totalBudget,
      priority: data.priority ?? 5,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      geoTargets: data.geoTargets ?? [],
      deviceTargets: data.deviceTargets ?? [],
      browserTargets: data.browserTargets ?? [],
      frequencyCap: data.frequencyCap,
      frequencyPeriod: data.frequencyPeriod,
      status: 'DRAFT',
    },
  });
  res.status(201).json(campaign);
});

campaignsRouter.get('/:id', authorize('ADVERTISER', 'ADMIN'), async (req: AuthRequest, res) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: { creatives: true },
  });
  if (!campaign) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  if (req.user!.role === 'ADVERTISER') {
    const advertiserId = await getAdvertiserId(req.user!.id);
    if (campaign.advertiserId !== advertiserId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
  }
  res.json(campaign);
});

campaignsRouter.patch('/:id', authorize('ADVERTISER'), async (req: AuthRequest, res) => {
  const advertiserId = await getAdvertiserId(req.user!.id);
  const existing = await prisma.campaign.findFirst({
    where: { id: req.params.id, advertiserId: advertiserId! },
  });
  if (!existing) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const parsed = campaignSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const d = parsed.data;
  const campaign = await prisma.campaign.update({
    where: { id: req.params.id },
    data: {
      ...d,
      startDate: d.startDate ? new Date(d.startDate) : undefined,
      endDate: d.endDate ? new Date(d.endDate) : undefined,
    },
  });
  res.json(campaign);
});

campaignsRouter.post('/:id/submit', authorize('ADVERTISER'), async (req: AuthRequest, res) => {
  const advertiserId = await getAdvertiserId(req.user!.id);
  const campaign = await prisma.campaign.updateMany({
    where: { id: req.params.id, advertiserId: advertiserId!, status: 'DRAFT' },
    data: { status: 'PENDING_APPROVAL' },
  });
  if (campaign.count === 0) {
    res.status(400).json({ error: 'Cannot submit campaign' });
    return;
  }
  res.json({ success: true });
});

campaignsRouter.post('/:id/pause', authorize('ADVERTISER', 'ADMIN'), async (req: AuthRequest, res) => {
  await updateStatus(req, req.params.id, 'PAUSED', ['ACTIVE']);
  res.json({ success: true });
});

campaignsRouter.post('/:id/resume', authorize('ADVERTISER', 'ADMIN'), async (req: AuthRequest, res) => {
  await updateStatus(req, req.params.id, 'ACTIVE', ['PAUSED']);
  res.json({ success: true });
});

async function updateStatus(
  req: AuthRequest,
  id: string,
  status: 'ACTIVE' | 'PAUSED',
  from: string[],
) {
  const where =
    req.user!.role === 'ADMIN'
      ? { id, status: { in: from as ('ACTIVE' | 'PAUSED')[] } }
      : {
          id,
          status: { in: from as ('ACTIVE' | 'PAUSED')[] },
          advertiser: { userId: req.user!.id },
        };
  await prisma.campaign.updateMany({ where, data: { status } });
}
