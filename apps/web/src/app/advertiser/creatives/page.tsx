'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function CreativesPage() {
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    campaignId: '',
    name: '',
    imageUrl: '',
    clickUrl: '',
  });

  useEffect(() => {
    void api<{ id: string; name: string }[]>('/api/campaigns').then(setCampaigns);
  }, []);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    await api('/api/creatives', {
      method: 'POST',
      body: JSON.stringify({ ...form, type: 'IMAGE' }),
    });
    alert('Creative created');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Creatives</h1>
      <form onSubmit={upload} className="mt-6 max-w-md space-y-3 bg-white p-6 rounded-xl border">
        <select
          value={form.campaignId}
          onChange={(e) => setForm({ ...form, campaignId: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          required
        >
          <option value="">Select campaign</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Creative name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <input
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <input
          placeholder="Click URL"
          value={form.clickUrl}
          onChange={(e) => setForm({ ...form, clickUrl: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-lg">
          Upload creative
        </button>
      </form>
    </div>
  );
}
