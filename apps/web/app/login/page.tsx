'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, setAuth } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const data = await api<{
        accessToken: string;
        refreshToken: string;
        user: { role: string };
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuth(data.accessToken, data.refreshToken);
      if (data.user.role === 'PUBLISHER') router.push('/publisher');
      else if (data.user.role === 'ADMIN')
        router.push(process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001');
      else router.push('/advertiser');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border"
      >
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-slate-500 mt-1">Waelio Marketing</p>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <label className="block mt-6 text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border rounded-lg px-3 py-2"
          required
        />
        <label className="block mt-4 text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full border rounded-lg px-3 py-2"
          required
        />
        <button
          type="submit"
          className="mt-6 w-full bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700"
        >
          Sign in
        </button>
        <p className="mt-4 text-sm text-center text-slate-500">
          <Link href="/register" className="text-brand-600">
            Create account
          </Link>
          {' · '}
          <Link href="/forgot-password" className="text-brand-600">
            Forgot password
          </Link>
        </p>
      </form>
    </main>
  );
}
