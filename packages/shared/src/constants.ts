export const PLACEMENT_SIZES = {
  LEADERBOARD: { width: 728, height: 90 },
  MEDIUM_RECTANGLE: { width: 300, height: 250 },
  WIDE_SKYSCRAPER: { width: 160, height: 600 },
  MOBILE_BANNER: { width: 320, height: 50 },
} as const;

export const REVENUE_SHARE_PUBLISHER = 0.7;
export const REVENUE_SHARE_PLATFORM = 0.3;

export const FREQUENCY_CAP_KEY_PREFIX = 'freq:';
export const BUDGET_DAILY_KEY_PREFIX = 'budget:daily:';
export const BUDGET_TOTAL_KEY_PREFIX = 'budget:total:';
