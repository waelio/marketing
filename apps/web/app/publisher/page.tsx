'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function PublisherOverview() {
  const [websites, setWebsites] = useState(0);

  useEffect(() => {
    void api<unknown[]>('/api/websites').then((w) => setWebsites(w.length));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Publisher dashboard</h1>
      <p className="text-slate-500 mt-1">Manage sites, placements, and earnings</p>
      <div className="mt-6 bg-white p-6 rounded-xl border max-w-sm">
        <p className="text-sm text-slate-500">Registered websites</p>
        <p className="text-3xl font-bold">{websites}</p>
      </div>
      <Link href="/publisher/websites" className="inline-block mt-6 text-brand-600">
        Add website →
      </Link>
    </div>
  );
}
