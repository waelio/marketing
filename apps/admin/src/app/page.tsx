'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminHome() {
  const [metrics, setMetrics] = useState<Record<string, number> | null>(null);
  const [pendingCampaigns, setPendingCampaigns] = useState<unknown[]>([]);
  const [pendingWebsites, setPendingWebsites] = useState<unknown[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    void api<Record<string, number>>('/api/admin/metrics')
      .then(setMetrics)
      .catch(() => undefined);
    void api<unknown[]>('/api/admin/campaigns/pending').then(setPendingCampaigns);
    void api<unknown[]>('/api/admin/websites/pending').then(setPendingWebsites);
  }, []);

  async function approveCampaign(id: string) {
    await api(`/api/admin/campaigns/${id}/approve`, { method: 'POST' });
    setPendingCampaigns((c) => (c as { id: string }[]).filter((x) => x.id !== id));
  }

  async function approveWebsite(id: string) {
    await api(`/api/admin/websites/${id}/approve`, { method: 'POST' });
    setPendingWebsites((w) => (w as { id: string }[]).filter((x) => x.id !== id));
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 px-8 py-4 flex justify-between">
        <h1 className="text-xl font-bold text-admin-600">Waelio Admin</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/users">Users</Link>
          <Link href="/fraud">Fraud</Link>
          <Link href="/revenue">Revenue</Link>
          <Link href="/login">Login</Link>
        </nav>
      </header>
      <main className="p-8 max-w-6xl mx-auto">
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(metrics).map(([k, v]) => (
              <div key={k} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400 uppercase">{k}</p>
                <p className="text-2xl font-bold mt-1">{v}</p>
              </div>
            ))}
          </div>
        )}
        <section className="mt-10">
          <h2 className="font-semibold">Pending campaigns</h2>
          <ul className="mt-4 space-y-2">
            {(pendingCampaigns as { id: string; name: string }[]).map((c) => (
              <li
                key={c.id}
                className="flex justify-between bg-slate-900 p-3 rounded-lg border border-slate-800"
              >
                <span>{c.name}</span>
                <button onClick={() => approveCampaign(c.id)} className="text-green-400 text-sm">
                  Approve
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-10">
          <h2 className="font-semibold">Pending websites</h2>
          <ul className="mt-4 space-y-2">
            {(pendingWebsites as { id: string; name: string; domain: string }[]).map((w) => (
              <li
                key={w.id}
                className="flex justify-between bg-slate-900 p-3 rounded-lg border border-slate-800"
              >
                <span>
                  {w.name} ({w.domain})
                </span>
                <button onClick={() => approveWebsite(w.id)} className="text-green-400 text-sm">
                  Approve
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
