'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@waelio.com');
  const [password, setPassword] = useState('Admin123!');

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const data = await api<{ accessToken: string; refreshToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    router.push('/');
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={login}
        className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-full max-w-sm"
      >
        <h1 className="text-xl font-bold">Admin login</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-4 w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-3 w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
        />
        <button type="submit" className="mt-4 w-full bg-admin-600 py-2 rounded">
          Sign in
        </button>
      </form>
    </main>
  );
}
