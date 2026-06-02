'use client';

import { DashboardShell } from '@/components/DashboardShell';

const nav = [
  { href: '/advertiser', label: 'Overview' },
  { href: '/advertiser/campaigns', label: 'Campaigns' },
  { href: '/advertiser/creatives', label: 'Creatives' },
  { href: '/advertiser/analytics', label: 'Analytics' },
];

export default function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell title="Advertiser Portal" nav={nav}>
      {children}
    </DashboardShell>
  );
}
