'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function NewCampaignPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    pricingModel: 'CPC' as 'CPC' | 'CPM',
    bidAmount: 0.5,
    dailyBudget: '',
    totalBudget: '',
    geoTargets: '',
    deviceTargets: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name,
        pricingModel: form.pricingModel,
        bidAmount: Number(form.bidAmount),
        dailyBudget: form.dailyBudget ? Number(form.dailyBudget) : undefined,
        totalBudget: form.totalBudget ? Number(form.totalBudget) : undefined,
        geoTargets: form.geoTargets ? form.geoTargets.split(',').map((s) => s.trim()) : [],
        deviceTargets: form.deviceTargets ? form.deviceTargets.split(',').map((s) => s.trim()) : [],
      }),
    });
    router.push('/advertiser/campaigns');
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold">New campaign</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 bg-white p-6 rounded-xl border">
        <input
          placeholder="Campaign name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <select
          value={form.pricingModel}
          onChange={(e) => setForm({ ...form, pricingModel: e.target.value as 'CPC' | 'CPM' })}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="CPC">CPC</option>
          <option value="CPM">CPM</option>
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Bid amount"
          value={form.bidAmount}
          onChange={(e) => setForm({ ...form, bidAmount: Number(e.target.value) })}
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          type="number"
          placeholder="Daily budget (optional)"
          value={form.dailyBudget}
          onChange={(e) => setForm({ ...form, dailyBudget: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          type="number"
          placeholder="Total budget (optional)"
          value={form.totalBudget}
          onChange={(e) => setForm({ ...form, totalBudget: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          placeholder="Geo targets (US,GB,...)"
          value={form.geoTargets}
          onChange={(e) => setForm({ ...form, geoTargets: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          placeholder="Devices (desktop,mobile,tablet)"
          value={form.deviceTargets}
          onChange={(e) => setForm({ ...form, deviceTargets: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />
        <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-lg">
          Create
        </button>
      </form>
    </div>
  );
}
