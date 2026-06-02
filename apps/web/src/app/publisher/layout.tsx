'use client';

import { DashboardShell } from '@/components/DashboardShell';

const nav = [
  { href: '/publisher', label: 'Overview' },
  { href: '/publisher/websites', label: 'Websites' },
  { href: '/publisher/placements', label: 'Placements' },
  { href: '/publisher/earnings', label: 'Earnings' },
];

export default function PublisherLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell title="Publisher Portal" nav={nav}>
      {children}
    </DashboardShell>
  );
}
