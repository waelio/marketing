import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorize, type AuthRequest } from '../middleware/auth.js';

export const creativesRouter = Router();
creativesRouter.use(authenticate);

const creativeSchema = z.object({
  campaignId: z.string(),
  name: z.string().min(1),
  type: z.enum(['IMAGE', 'HTML', 'VIDEO']).default('IMAGE'),
  imageUrl: z.string().url().optional(),
  clickUrl: z.string().url(),
  htmlContent: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

creativesRouter.get('/', authorize('ADVERTISER', 'ADMIN'), async (req: AuthRequest, res) => {
  const { campaignId } = req.query;
  const creatives = await prisma.creative.findMany({
    where: campaignId ? { campaignId: campaignId as string } : undefined,
    include: { campaign: { select: { advertiserId: true, name: true } } },
  });
  res.json(creatives);
});

creativesRouter.post('/', authorize('ADVERTISER'), async (req: AuthRequest, res) => {
  const parsed = creativeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { campaignId, ...data } = parsed.data;
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, advertiser: { userId: req.user!.id } },
  });
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }
  const creative = await prisma.creative.create({ data: { campaignId, ...data } });
  res.status(201).json(creative);
});

creativesRouter.delete('/:id', authorize('ADVERTISER'), async (req: AuthRequest, res) => {
  const creative = await prisma.creative.findFirst({
    where: { id: req.params.id, campaign: { advertiser: { userId: req.user!.id } } },
  });
  if (!creative) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  await prisma.creative.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true });
});
