'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, setAuth } from '@/lib/api';

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [role, setRole] = useState<'ADVERTISER' | 'PUBLISHER'>(
    (params.get('role') as 'ADVERTISER' | 'PUBLISHER') || 'ADVERTISER',
  );
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const data = await api<{
        accessToken: string;
        refreshToken: string;
        user: { role: string };
      }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...form, role }),
      });
      setAuth(data.accessToken, data.refreshToken);
      router.push(role === 'PUBLISHER' ? '/publisher' : '/advertiser');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border"
    >
      <h1 className="text-2xl font-bold">Create account</h1>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2">
        {(['ADVERTISER', 'PUBLISHER'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 py-2 text-sm rounded-lg border ${
              role === r ? 'bg-brand-50 border-brand-600 text-brand-700' : ''
            }`}
          >
            {r === 'ADVERTISER' ? 'Advertiser' : 'Publisher'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <input
          placeholder="First name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm"
          required
        />
        <input
          placeholder="Last name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm"
          required
        />
      </div>
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="mt-3 w-full border rounded-lg px-3 py-2 text-sm"
        required
      />
      <input
        type="password"
        placeholder="Password (8+ chars, uppercase, number)"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="mt-3 w-full border rounded-lg px-3 py-2 text-sm"
        required
      />
      <button
        type="submit"
        className="mt-6 w-full bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700"
      >
        Register
      </button>
      <p className="mt-4 text-sm text-center">
        <Link href="/login" className="text-brand-600">
          Already have an account?
        </Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
