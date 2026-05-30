'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Bucket {
  date: string;
  impressions: number;
  clicks: number;
  revenue: number;
}

export function AnalyticsChart({ data }: { data: Bucket[] }) {
  if (!data.length) {
    return <p className="text-slate-500 text-sm">No data for this period.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="impressions" stroke="#3b82f6" dot={false} />
        <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#10b981" dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#f59e0b" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
