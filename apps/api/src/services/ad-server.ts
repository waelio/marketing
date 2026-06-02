import { prisma } from '../lib/prisma.js';
import { redis, ensureRedis } from '../lib/redis.js';
import {
  FREQUENCY_CAP_KEY_PREFIX,
  BUDGET_DAILY_KEY_PREFIX,
  BUDGET_TOTAL_KEY_PREFIX,
  REVENUE_SHARE_PUBLISHER,
} from '@waelio/shared';
import { calculateCpmSpend, calculateCpcSpend } from '@waelio/analytics';
import { Decimal } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';

export interface ServeContext {
  placementId: string;
  country?: string;
  device?: string;
  browser?: string;
  ipHash?: string;
}

const pendingImpressions = new Map<
  string,
  {
    campaignId: string;
    creativeId: string;
    placementId: string;
    country?: string;
    device?: string;
    browser?: string;
    ipHash?: string;
    bidAmount: number;
    pricingModel: string;
    confirmed: boolean;
  }
>();

export async function serveAd(ctx: ServeContext) {
  const placement = await prisma.placement.findUnique({
    where: { id: ctx.placementId, isActive: true },
    include: { website: true },
  });

  if (!placement || placement.website.status !== 'APPROVED') {
    return null;
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      status: 'ACTIVE',
      creatives: { some: { isActive: true } },
      OR: [{ startDate: null }, { startDate: { lte: new Date() } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: new Date() } }] }],
    },
    include: { creatives: { where: { isActive: true } } },
    orderBy: [{ priority: 'desc' }, { bidAmount: 'desc' }],
  });

  for (const campaign of campaigns) {
    if (!(await passesTargeting(campaign, ctx))) continue;
    if (!(await passesFrequencyCap(campaign, ctx))) continue;
    if (!(await passesBudget(campaign))) continue;

    const creative = campaign.creatives[0];
    if (!creative) continue;

    const impressionId = uuidv4();
    const bid = Number(campaign.bidAmount);

    pendingImpressions.set(impressionId, {
      campaignId: campaign.id,
      creativeId: creative.id,
      placementId: ctx.placementId,
      country: ctx.country,
      device: ctx.device,
      browser: ctx.browser,
      ipHash: ctx.ipHash,
      bidAmount: bid,
      pricingModel: campaign.pricingModel,
      confirmed: false,
    });

    setTimeout(() => pendingImpressions.delete(impressionId), 300_000);

    return {
      impressionId,
      creativeId: creative.id,
      campaignId: campaign.id,
      type: creative.type,
      imageUrl: creative.imageUrl ?? undefined,
      htmlContent: creative.htmlContent ?? undefined,
      clickUrl: `/api/click?impressionId=${impressionId}&redirect=${encodeURIComponent(creative.clickUrl)}`,
      width: creative.width ?? undefined,
      height: creative.height ?? undefined,
    };
  }

  return null;
}

async function passesTargeting(
  campaign: {
    geoTargets: string[];
    deviceTargets: string[];
    browserTargets: string[];
  },
  ctx: ServeContext,
): Promise<boolean> {
  if (campaign.geoTargets.length && ctx.country && !campaign.geoTargets.includes(ctx.country))
    return false;
  if (campaign.deviceTargets.length && ctx.device && !campaign.deviceTargets.includes(ctx.device))
    return false;
  if (
    campaign.browserTargets.length &&
    ctx.browser &&
    !campaign.browserTargets.includes(ctx.browser)
  )
    return false;
  return true;
}

async function passesFrequencyCap(
  campaign: { id: string; frequencyCap: number | null; frequencyPeriod: number | null },
  ctx: ServeContext,
): Promise<boolean> {
  if (!campaign.frequencyCap || !ctx.ipHash) return true;
  const redisOk = await ensureRedis();
  if (!redisOk) return true;

  const periodHours = campaign.frequencyPeriod ?? 24;
  const key = `${FREQUENCY_CAP_KEY_PREFIX}${campaign.id}:${ctx.ipHash}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, periodHours * 3600);
  return count <= campaign.frequencyCap;
}

async function passesBudget(campaign: {
  id: string;
  dailyBudget: Decimal | null;
  totalBudget: Decimal | null;
  spent: Decimal;
}): Promise<boolean> {
  const spent = Number(campaign.spent);
  if (campaign.totalBudget && spent >= Number(campaign.totalBudget)) return false;

  const redisOk = await ensureRedis();
  if (!redisOk) return !campaign.dailyBudget || true;

  const today = new Date().toISOString().slice(0, 10);
  const dailyKey = `${BUDGET_DAILY_KEY_PREFIX}${campaign.id}:${today}`;
  const dailySpent = Number((await redis.get(dailyKey)) || 0);
  if (campaign.dailyBudget && dailySpent >= Number(campaign.dailyBudget)) return false;

  return true;
}

export async function confirmImpression(impressionId: string): Promise<boolean> {
  const pending = pendingImpressions.get(impressionId);
  if (!pending || pending.confirmed) return false;

  const revenue = pending.pricingModel === 'CPM' ? calculateCpmSpend(1, pending.bidAmount) : 0;

  const publisherShare = revenue * REVENUE_SHARE_PUBLISHER;

  await prisma.impression.create({
    data: {
      id: impressionId,
      campaignId: pending.campaignId,
      creativeId: pending.creativeId,
      placementId: pending.placementId,
      country: pending.country,
      device: pending.device,
      browser: pending.browser,
      ipHash: pending.ipHash,
      revenue: publisherShare,
    },
  });

  await updateSpend(pending.campaignId, revenue);
  pending.confirmed = true;
  return true;
}

export async function recordClick(impressionId: string): Promise<string | null> {
  const pending = pendingImpressions.get(impressionId);
  const impression = await prisma.impression.findUnique({ where: { id: impressionId } });
  const campaignId = pending?.campaignId ?? impression?.campaignId;
  if (!campaignId) return null;

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return null;

  const creative = await prisma.creative.findFirst({
    where: { id: pending?.creativeId ?? impression?.creativeId },
  });
  if (!creative) return null;

  const bid = Number(campaign.bidAmount);
  const revenue = campaign.pricingModel === 'CPC' ? calculateCpcSpend(1, bid) : 0;
  const publisherShare = revenue * REVENUE_SHARE_PUBLISHER;

  await prisma.click.create({
    data: {
      campaignId: campaign.id,
      creativeId: creative.id,
      placementId: pending?.placementId ?? impression!.placementId,
      impressionId,
      country: pending?.country ?? impression?.country,
      device: pending?.device ?? impression?.device,
      browser: pending?.browser ?? impression?.browser,
      ipHash: pending?.ipHash ?? impression?.ipHash,
      revenue: publisherShare,
    },
  });

  if (revenue > 0) await updateSpend(campaign.id, revenue);
  pendingImpressions.delete(impressionId);
  return creative.clickUrl;
}

async function updateSpend(campaignId: string, amount: number): Promise<void> {
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { spent: { increment: amount } },
  });

  const redisOk = await ensureRedis();
  if (!redisOk) return;

  const today = new Date().toISOString().slice(0, 10);
  const dailyKey = `${BUDGET_DAILY_KEY_PREFIX}${campaignId}:${today}`;
  const totalKey = `${BUDGET_TOTAL_KEY_PREFIX}${campaignId}`;
  await redis.incrbyfloat(dailyKey, amount);
  await redis.expire(dailyKey, 86400 * 2);
  await redis.incrbyfloat(totalKey, amount);
}
