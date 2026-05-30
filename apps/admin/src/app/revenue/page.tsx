'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function RevenuePage() {
  const [data, setData] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    void api<Record<string, number>>('/api/admin/revenue?days=30').then(setData);
  }, []);

  return (
    <div className="p-8">
      <Link href="/" className="text-sm text-slate-400">
        ← Dashboard
      </Link>
      <h1 className="text-2xl font-bold mt-4">Revenue reports</h1>
      {data && (
        <div className="mt-6 grid grid-cols-2 gap-4 max-w-md">
          {Object.entries(data).map(([k, v]) => (
            <div key={k} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">{k}</p>
              <p className="text-xl font-bold">{typeof v === 'number' ? v.toFixed(2) : v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
