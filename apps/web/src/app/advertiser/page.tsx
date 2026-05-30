'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdvertiserOverview() {
  const [stats, setStats] = useState({ campaigns: 0, active: 0 });
  const [analytics, setAnalytics] = useState<{
    summary: { impressions: number; clicks: number; ctr: number; revenue: number };
  } | null>(null);

  useEffect(() => {
    void (async () => {
      const campaigns = await api<{ status: string }[]>('/api/campaigns');
      setStats({
        campaigns: campaigns.length,
        active: campaigns.filter((c) => c.status === 'ACTIVE').length,
      });
      const a = await api<{ summary: { impressions: number; clicks: number; ctr: number; revenue: number } }>(
        '/api/analytics?days=30',
      );
      setAnalytics(a);
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Campaigns', value: stats.campaigns },
          { label: 'Active', value: stats.active },
          { label: 'Impressions', value: analytics?.summary.impressions ?? 0 },
          { label: 'CTR %', value: analytics?.summary.ctr ?? 0 },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-xl border">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <Link
        href="/advertiser/campaigns/new"
        className="inline-block mt-8 bg-brand-600 text-white px-6 py-2 rounded-lg"
      >
        Create campaign
      </Link>
    </div>
  );
}
