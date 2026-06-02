export function calculateCtr(impressions: number, clicks: number): number {
  if (impressions === 0) return 0;
  return Number(((clicks / impressions) * 100).toFixed(4));
}

export function calculateEcpm(revenue: number, impressions: number): number {
  if (impressions === 0) return 0;
  return Number(((revenue / impressions) * 1000).toFixed(4));
}

export function calculateCpcSpend(clicks: number, bidAmount: number): number {
  return Number((clicks * bidAmount).toFixed(6));
}

export function calculateCpmSpend(impressions: number, bidAmount: number): number {
  return Number(((impressions / 1000) * bidAmount).toFixed(6));
}
