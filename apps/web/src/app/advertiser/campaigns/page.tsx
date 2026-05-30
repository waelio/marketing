'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Campaign {
  id: string;
  name: string;
  status: string;
  pricingModel: string;
  bidAmount: string;
  spent: string;
  dailyBudget: string | null;
  totalBudget: string | null;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    void api<Campaign[]>('/api/campaigns').then(setCampaigns);
  }, []);

  async function pause(id: string) {
    await api(`/api/campaigns/${id}/pause`, { method: 'POST' });
    setCampaigns((c) => c.map((x) => (x.id === id ? { ...x, status: 'PAUSED' } : x)));
  }

  async function resume(id: string) {
    await api(`/api/campaigns/${id}/resume`, { method: 'POST' });
    setCampaigns((c) => c.map((x) => (x.id === id ? { ...x, status: 'ACTIVE' } : x)));
  }

  async function submit(id: string) {
    await api(`/api/campaigns/${id}/submit`, { method: 'POST' });
    setCampaigns((c) =>
      c.map((x) => (x.id === id ? { ...x, status: 'PENDING_APPROVAL' } : x)),
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link href="/advertiser/campaigns/new" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm">
          New campaign
        </Link>
      </div>
      <div className="mt-6 bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Status</th>
              <th className="p-3">Model</th>
              <th className="p-3">Bid</th>
              <th className="p-3">Spent</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-100">{c.status}</span>
                </td>
                <td className="p-3">{c.pricingModel}</td>
                <td className="p-3">${c.bidAmount}</td>
                <td className="p-3">${c.spent}</td>
                <td className="p-3 flex gap-2">
                  {c.status === 'DRAFT' && (
                    <button onClick={() => submit(c.id)} className="text-brand-600 text-xs">
                      Submit
                    </button>
                  )}
                  {c.status === 'ACTIVE' && (
                    <button onClick={() => pause(c.id)} className="text-amber-600 text-xs">
                      Pause
                    </button>
                  )}
                  {c.status === 'PAUSED' && (
                    <button onClick={() => resume(c.id)} className="text-green-600 text-xs">
                      Resume
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
