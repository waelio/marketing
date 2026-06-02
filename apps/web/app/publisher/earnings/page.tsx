'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AnalyticsChart } from '@/components/AnalyticsChart';

export default function EarningsPage() {
  const [data, setData] = useState<{
    summary: { revenue: number; impressions: number; ecpm: number };
    buckets: { date: string; impressions: number; clicks: number; revenue: number }[];
  } | null>(null);

  useEffect(() => {
    void api<typeof data>('/api/analytics?period=daily&days=30').then(setData);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Earnings</h1>
      {data && (
        <>
          <div className="mt-6 grid grid-cols-3 gap-4 max-w-xl">
            <div className="bg-white p-4 rounded-xl border">
              <p className="text-sm text-slate-500">Revenue</p>
              <p className="text-2xl font-bold">${data.summary.revenue.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border">
              <p className="text-sm text-slate-500">Impressions</p>
              <p className="text-2xl font-bold">{data.summary.impressions}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border">
              <p className="text-sm text-slate-500">eCPM</p>
              <p className="text-2xl font-bold">{data.summary.ecpm}</p>
            </div>
          </div>
          <div className="mt-8 bg-white p-6 rounded-xl border">
            <AnalyticsChart data={data.buckets} />
          </div>
        </>
      )}
    </div>
  );
}
