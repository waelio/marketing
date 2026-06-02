import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { sanitizeDomain } from '@waelio/shared';
import { authenticate, authorize, type AuthRequest } from '../middleware/auth.js';

export const websitesRouter = Router();
websitesRouter.use(authenticate);

const websiteSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
  url: z.string().url(),
  category: z.string().optional(),
});

async function getPublisherId(userId: string): Promise<string | null> {
  const pub = await prisma.publisher.findUnique({ where: { userId } });
  return pub?.id ?? null;
}

websitesRouter.get('/', authorize('PUBLISHER', 'ADMIN'), async (req: AuthRequest, res) => {
  const publisherId =
    req.user!.role === 'ADMIN'
      ? (req.query.publisherId as string)
      : await getPublisherId(req.user!.id);

  const websites = await prisma.website.findMany({
    where: publisherId ? { publisherId } : undefined,
    include: { placements: true, _count: { select: { placements: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(websites);
});

websitesRouter.post('/', authorize('PUBLISHER'), async (req: AuthRequest, res) => {
  const parsed = websiteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const publisherId = await getPublisherId(req.user!.id);
  if (!publisherId) {
    res.status(403).json({ error: 'Publisher profile not found' });
    return;
  }
  const domain = sanitizeDomain(parsed.data.domain);
  const website = await prisma.website.create({
    data: { publisherId, ...parsed.data, domain, status: 'PENDING' },
  });
  res.status(201).json(website);
});

websitesRouter.get('/:id', authorize('PUBLISHER', 'ADMIN'), async (req: AuthRequest, res) => {
  const website = await prisma.website.findUnique({
    where: { id: req.params.id },
    include: { placements: true },
  });
  if (!website) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(website);
});
