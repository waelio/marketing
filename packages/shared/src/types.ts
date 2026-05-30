export type Role = 'ADMIN' | 'ADVERTISER' | 'PUBLISHER';

export type CampaignStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'REJECTED';

export type PricingModel = 'CPC' | 'CPM';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AdRequestContext {
  placementId: string;
  country?: string;
  device?: string;
  browser?: string;
  ipHash?: string;
  userAgent?: string;
}

export interface AdResponse {
  impressionId: string;
  creativeId: string;
  campaignId: string;
  type: 'IMAGE' | 'HTML' | 'VIDEO';
  imageUrl?: string;
  htmlContent?: string;
  clickUrl: string;
  width?: number;
  height?: number;
}

export interface AnalyticsBucket {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
  ecpm: number;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}
