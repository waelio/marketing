'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function PlacementsPage() {
  const [websites, setWebsites] = useState<{ id: string; name: string; status: string }[]>([]);
  const [placements, setPlacements] = useState<{ id: string; name: string; websiteId: string }[]>([]);
  const [embed, setEmbed] = useState('');
  const [form, setForm] = useState({
    websiteId: '',
    name: '',
    size: 'MEDIUM_RECTANGLE',
  });

  useEffect(() => {
    void api<typeof websites>('/api/websites').then(setWebsites);
    void api<typeof placements>('/api/placements').then(setPlacements);
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const p = await api<{ id: string }>('/api/placements', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    setPlacements((prev) => [...prev, { id: p.id, name: form.name, websiteId: form.websiteId }]);
  }

  async function showEmbed(id: string) {
    const res = await api<{ embedCode: string }>(`/api/placements/${id}/embed`);
    setEmbed(res.embedCode);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Ad placements</h1>
      <form onSubmit={create} className="mt-6 flex flex-wrap gap-3 max-w-xl">
        <select
          value={form.websiteId}
          onChange={(e) => setForm({ ...form, websiteId: e.target.value })}
          className="border rounded-lg px-3 py-2"
          required
        >
          <option value="">Website</option>
          {websites
            .filter((w) => w.status === 'APPROVED')
            .map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
        </select>
        <input
          placeholder="Placement name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border rounded-lg px-3 py-2"
          required
        />
        <select
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="LEADERBOARD">728x90</option>
          <option value="MEDIUM_RECTANGLE">300x250</option>
          <option value="MOBILE_BANNER">320x50</option>
        </select>
        <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg">
          Create
        </button>
      </form>
      <ul className="mt-8 space-y-2">
        {placements.map((p) => (
          <li key={p.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
            <span>{p.name}</span>
            <button onClick={() => showEmbed(p.id)} className="text-sm text-brand-600">
              Get embed code
            </button>
          </li>
        ))}
      </ul>
      {embed && (
        <pre className="mt-4 p-4 bg-slate-900 text-green-400 text-xs rounded-xl overflow-x-auto">
          {embed}
        </pre>
      )}
    </div>
  );
}
