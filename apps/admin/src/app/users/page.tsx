'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    void api<User[]>('/api/admin/users').then(setUsers);
  }, []);

  async function toggleActive(id: string, isActive: boolean) {
    await api(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !isActive }),
    });
    setUsers((u) => u.map((x) => (x.id === id ? { ...x, isActive: !isActive } : x)));
  }

  return (
    <div className="p-8">
      <Link href="/" className="text-sm text-slate-400">
        ← Dashboard
      </Link>
      <h1 className="text-2xl font-bold mt-4">User management</h1>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="text-left text-slate-400">
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Active</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-slate-800">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.isActive ? 'Yes' : 'No'}</td>
              <td className="p-2">
                <button onClick={() => toggleActive(u.id, u.isActive)} className="text-admin-600">
                  Toggle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
