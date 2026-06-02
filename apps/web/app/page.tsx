'use client';

import { useState } from 'react';

const API_BASE = 'http://localhost:4000';

export default function Home() {
    const [status, setStatus] = useState('Ready');
    const [ad, setAd] = useState<{ placementId: string; creative: string; url: string; image: string } | null>(null);

    const loadAd = async () => {
        setStatus('Loading ad...');
        try {
            const response = await fetch(`${API_BASE}/api/ads?placementId=test`);
            const data = await response.json();
            setAd(data);
            setStatus('Ad loaded. Press impression or click.');
        } catch (error) {
            setStatus('Failed to load ad.');
        }
    };

    const recordImpression = async () => {
        setStatus('Sending impression...');
        await fetch(`${API_BASE}/api/impression`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ placementId: 'test' })
        });
        setStatus('Impression sent.');
    };

    const recordClick = async () => {
        setStatus('Sending click...');
        await fetch(`${API_BASE}/api/click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ placementId: 'test' })
        });
        setStatus('Click sent.');
    };

    return (
        <main className="min-h-screen bg-slate-900 text-slate-100 p-6">
            <div className="mx-auto max-w-3xl rounded-3xl border border-slate-700 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/30">
                <h1 className="text-4xl font-semibold">Wælio Marketing</h1>
                <p className="mt-4 text-slate-400">This is a local startup demo for the ad server and publisher flow.</p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <button onClick={loadAd} className="rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">Load ad</button>
                    <button onClick={recordImpression} className="rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-400">Record impression</button>
                    <button onClick={recordClick} className="rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-orange-400">Record click</button>
                </div>

                <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
                    <h2 className="text-2xl font-semibold">Status</h2>
                    <p className="mt-2 text-slate-300">{status}</p>
                </div>

                {ad ? (
                    <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950 p-6">
                        <h2 className="text-2xl font-semibold">Ad preview</h2>
                        <div className="mt-4 space-y-4">
                            <img src={ad.image} alt="Ad creative" className="w-full rounded-2xl border border-slate-700 object-cover" />
                            <p className="text-lg">{ad.creative}</p>
                            <a href={ad.url} className="inline-block rounded-full bg-slate-700 px-4 py-2 text-slate-100 hover:bg-slate-600" target="_blank" rel="noreferrer">Visit advertiser</a>
                        </div>
                    </div>
                ) : null}
            </div>
        </main>
    );
}
