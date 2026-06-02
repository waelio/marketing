import { Router } from 'express';
import { serveAd, confirmImpression, recordClick } from '../services/ad-server.js';
import { hashIp } from '../lib/hash.js';

export const adsRouter = Router();

adsRouter.get('/ads', async (req, res) => {
  const placementId = req.query.placementId as string;
  if (!placementId) {
    res.status(400).json({ error: 'placementId required' });
    return;
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
  const ad = await serveAd({
    placementId,
    country: (req.query.country as string) || (req.headers['cf-ipcountry'] as string),
    device: req.query.device as string,
    browser: req.query.browser as string,
    ipHash: ip ? hashIp(ip) : undefined,
  });

  if (!ad) {
    res.status(204).send();
    return;
  }
  res.json(ad);
});

adsRouter.post('/impression', async (req, res) => {
  const { impressionId } = req.body as { impressionId?: string };
  if (!impressionId) {
    res.status(400).json({ error: 'impressionId required' });
    return;
  }
  const ok = await confirmImpression(impressionId);
  res.json({ success: ok });
});

adsRouter.post('/click', async (req, res) => {
  const impressionId =
    (req.body as { impressionId?: string }).impressionId || (req.query.impressionId as string);
  if (!impressionId) {
    res.status(400).json({ error: 'impressionId required' });
    return;
  }
  const redirect = await recordClick(impressionId);
  if (req.query.redirect) {
    res.redirect(302, decodeURIComponent(req.query.redirect as string));
    return;
  }
  res.json({ success: !!redirect, redirectUrl: redirect });
});

adsRouter.get('/click', async (req, res) => {
  const impressionId = req.query.impressionId as string;
  if (!impressionId) {
    res.status(400).json({ error: 'impressionId required' });
    return;
  }
  const redirect = await recordClick(impressionId);
  const target = (req.query.redirect as string) || redirect;
  if (target) res.redirect(302, decodeURIComponent(target));
  else res.status(404).json({ error: 'Not found' });
});
