import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { aggregateEvents, type Period } from '@waelio/analytics';
import { calculateCtr, calculateEcpm } from '@waelio/analytics';
import { authenticate, authorize, type AuthRequest } from '../middleware/auth.js';

export const analyticsRouter = Router();
analyticsRouter.use(authenticate);

analyticsRouter.get('/', authorize('ADVERTISER', 'PUBLISHER', 'ADMIN'), async (req: AuthRequest, res) => {
  const period = (req.query.period as Period) || 'daily';
  const campaignId = req.query.campaignId as string | undefined;
  const placementId = req.query.placementId as string | undefined;
  const days = Number(req.query.days) || 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const impressionWhere = {
    createdAt: { gte: since },
    ...(campaignId ? { campaignId } : {}),
    ...(placementId ? { placementId } : {}),
  };

  const impressions = await prisma.impression.groupBy({
    by: ['createdAt'],
    where: impressionWhere,
    _count: true,
    _sum: { revenue: true },
  });

  const clicks = await prisma.click.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: { gte: since },
      ...(campaignId ? { campaignId } : {}),
      ...(placementId ? { placementId } : {}),
    },
    _count: true,
    _sum: { revenue: true },
  });

  const eventsMap = new Map<string, { impressions: number; clicks: number; revenue: number }>();

  for (const row of impressions) {
    const key = row.createdAt.toISOString();
    const e = eventsMap.get(key) ?? { impressions: 0, clicks: 0, revenue: 0 };
    e.impressions += row._count;
    e.revenue += Number(row._sum.revenue ?? 0);
    eventsMap.set(key, e);
  }

  for (const row of clicks) {
    const key = row.createdAt.toISOString();
    const e = eventsMap.get(key) ?? { impressions: 0, clicks: 0, revenue: 0 };
    e.clicks += row._count;
    e.revenue += Number(row._sum.revenue ?? 0);
    eventsMap.set(key, e);
  }

  const rawEvents = Array.from(eventsMap.entries()).map(([iso, data]) => ({
    date: new Date(iso),
    impressions: data.impressions,
    clicks: data.clicks,
    revenue: data.revenue,
  }));

  const buckets = aggregateEvents(rawEvents, period);

  const totalImpressions = rawEvents.reduce((s, e) => s + e.impressions, 0);
  const totalClicks = rawEvents.reduce((s, e) => s + e.clicks, 0);
  const totalRevenue = rawEvents.reduce((s, e) => s + e.revenue, 0);

  res.json({
    summary: {
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: calculateCtr(totalImpressions, totalClicks),
      revenue: Number(totalRevenue.toFixed(2)),
      ecpm: calculateEcpm(totalRevenue, totalImpressions),
    },
    buckets,
    period,
  });
});
