'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AnalyticsChart } from '@/components/AnalyticsChart';

export default function AdvertiserAnalyticsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [data, setData] = useState<{
    summary: { impressions: number; clicks: number; ctr: number; revenue: number; ecpm: number };
    buckets: { date: string; impressions: number; clicks: number; revenue: number }[];
  } | null>(null);

  useEffect(() => {
    void api<typeof data>(`/api/analytics?period=${period}&days=30`).then(setData);
  }, [period]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Campaign analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as typeof period)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      {data && (
        <>
          <div className="mt-6 grid grid-cols-4 gap-4">
            {[
              { label: 'Impressions', value: data.summary.impressions },
              { label: 'Clicks', value: data.summary.clicks },
              { label: 'CTR %', value: data.summary.ctr },
              { label: 'eCPM', value: data.summary.ecpm },
            ].map((s) => (
              <div key={s.label} className="bg-white p-4 rounded-xl border">
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-white p-6 rounded-xl border">
            <AnalyticsChart data={data.buckets} />
          </div>
        </>
      )}
    </div>
  );
}
