import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { PLACEMENT_SIZES } from '@waelio/shared';
import { authenticate, authorize, type AuthRequest } from '../middleware/auth.js';

export const placementsRouter = Router();
placementsRouter.use(authenticate);

const placementSchema = z.object({
  websiteId: z.string(),
  name: z.string().min(1),
  size: z
    .enum(['LEADERBOARD', 'MEDIUM_RECTANGLE', 'WIDE_SKYSCRAPER', 'MOBILE_BANNER', 'CUSTOM'])
    .default('MEDIUM_RECTANGLE'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

placementsRouter.get('/', authorize('PUBLISHER', 'ADMIN'), async (req: AuthRequest, res) => {
  const { websiteId } = req.query;
  const placements = await prisma.placement.findMany({
    where: websiteId ? { websiteId: websiteId as string } : undefined,
    include: { website: true },
  });
  res.json(placements);
});

placementsRouter.post('/', authorize('PUBLISHER'), async (req: AuthRequest, res) => {
  const parsed = placementSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const website = await prisma.website.findFirst({
    where: { id: parsed.data.websiteId, publisher: { userId: req.user!.id } },
  });
  if (!website) {
    res.status(404).json({ error: 'Website not found' });
    return;
  }

  let width = parsed.data.width;
  let height = parsed.data.height;
  if (parsed.data.size !== 'CUSTOM' && parsed.data.size in PLACEMENT_SIZES) {
    const dims = PLACEMENT_SIZES[parsed.data.size as keyof typeof PLACEMENT_SIZES];
    width = dims.width;
    height = dims.height;
  }

  const placement = await prisma.placement.create({
    data: { ...parsed.data, width, height },
  });
  res.status(201).json(placement);
});

placementsRouter.get('/:id/embed', authorize('PUBLISHER', 'ADMIN'), async (req, res) => {
  const placement = await prisma.placement.findUnique({ where: { id: req.params.id } });
  if (!placement) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const baseUrl = process.env.NEXT_PUBLIC_AD_SERVER_URL || 'https://ads.waelio.com';
  const embedCode = `<script src="${baseUrl}/sdk.js" data-placement-id="${placement.id}"></script>`;
  res.json({ placementId: placement.id, embedCode });
});
