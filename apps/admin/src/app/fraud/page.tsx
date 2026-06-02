'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function FraudPage() {
  const [events, setEvents] = useState<
    { id: string; type: string; severity: string; createdAt: string }[]
  >([]);

  useEffect(() => {
    void api<typeof events>('/api/admin/fraud').then(setEvents);
  }, []);

  return (
    <div className="p-8">
      <Link href="/" className="text-sm text-slate-400">
        ← Dashboard
      </Link>
      <h1 className="text-2xl font-bold mt-4">Fraud monitoring</h1>
      <ul className="mt-6 space-y-2">
        {events.map((e) => (
          <li key={e.id} className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex gap-4">
            <span className="text-red-400 uppercase text-xs">{e.severity}</span>
            <span>{e.type}</span>
            <span className="text-slate-500 text-xs ml-auto">{e.createdAt}</span>
          </li>
        ))}
        {!events.length && <p className="text-slate-500">No fraud events recorded.</p>}
      </ul>
    </div>
  );
}
