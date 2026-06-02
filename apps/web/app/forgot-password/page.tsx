'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border"
      >
        <h1 className="text-2xl font-bold">Reset password</h1>
        {sent ? (
          <p className="mt-4 text-sm text-slate-600">
            If an account exists, check your email for reset instructions.
          </p>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="mt-6 w-full border rounded-lg px-3 py-2"
              required
            />
            <button type="submit" className="mt-4 w-full bg-brand-600 text-white py-2 rounded-lg">
              Send reset link
            </button>
          </>
        )}
        <p className="mt-4 text-sm text-center">
          <Link href="/login" className="text-brand-600">
            Back to sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
