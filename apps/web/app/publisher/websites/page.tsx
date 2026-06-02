'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Website {
  id: string;
  name: string;
  domain: string;
  status: string;
}

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [form, setForm] = useState({ name: '', domain: '', url: '', category: '' });

  useEffect(() => {
    void api<Website[]>('/api/websites').then(setWebsites);
  }, []);

  async function register(e: React.FormEvent) {
    e.preventDefault();
    const w = await api<Website>('/api/websites', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    setWebsites((prev) => [w, ...prev]);
    setForm({ name: '', domain: '', url: '', category: '' });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Websites</h1>
      <form onSubmit={register} className="mt-6 grid md:grid-cols-2 gap-4 max-w-2xl">
        <input
          placeholder="Site name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border rounded-lg px-3 py-2"
          required
        />
        <input
          placeholder="Domain"
          value={form.domain}
          onChange={(e) => setForm({ ...form, domain: e.target.value })}
          className="border rounded-lg px-3 py-2"
          required
        />
        <input
          placeholder="URL"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          className="border rounded-lg px-3 py-2"
          required
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          className="bg-brand-600 text-white px-4 py-2 rounded-lg md:col-span-2"
        >
          Register website
        </button>
      </form>
      <div className="mt-8 space-y-3">
        {websites.map((w) => (
          <div key={w.id} className="bg-white p-4 rounded-xl border flex justify-between">
            <div>
              <p className="font-medium">{w.name}</p>
              <p className="text-sm text-slate-500">{w.domain}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-slate-100 h-fit">{w.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
