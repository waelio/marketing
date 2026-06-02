import type { AnalyticsBucket } from '@waelio/shared';
import { calculateCtr, calculateEcpm } from './metrics.js';

export interface RawEvent {
  date: Date;
  impressions: number;
  clicks: number;
  revenue: number;
}

export type Period = 'daily' | 'weekly' | 'monthly';

function formatDateKey(date: Date, period: Period): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  if (period === 'monthly') return `${y}-${m}`;
  if (period === 'weekly') {
    const start = new Date(date);
    start.setUTCDate(date.getUTCDate() - date.getUTCDay());
    return start.toISOString().slice(0, 10);
  }
  return `${y}-${m}-${d}`;
}

export function aggregateEvents(events: RawEvent[], period: Period): AnalyticsBucket[] {
  const buckets = new Map<string, { impressions: number; clicks: number; revenue: number }>();

  for (const event of events) {
    const key = formatDateKey(event.date, period);
    const existing = buckets.get(key) ?? { impressions: 0, clicks: 0, revenue: 0 };
    existing.impressions += event.impressions;
    existing.clicks += event.clicks;
    existing.revenue += event.revenue;
    buckets.set(key, existing);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      impressions: data.impressions,
      clicks: data.clicks,
      ctr: calculateCtr(data.impressions, data.clicks),
      revenue: Number(data.revenue.toFixed(2)),
      ecpm: calculateEcpm(data.revenue, data.impressions),
    }));
}
