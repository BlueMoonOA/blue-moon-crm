// src/app/page.tsx
'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Blue Moon CRM</h1>
      <p className="mt-2">
        Welcome{session?.user?.email ? `, ${session.user.email}` : ''}.
      </p>

      <div className="mt-6 flex gap-3">
        <Link href="/deals" className="px-4 py-2 rounded border">Deals</Link>
        <Link href="/leads" className="px-4 py-2 rounded border">Leads</Link>
        <Link href="/proposals" className="px-4 py-2 rounded border">Proposals</Link>
      </div>

      <div className="mt-8">
        {status === 'authenticated' ? (
          <button onClick={() => signOut()} className="px-4 py-2 rounded bg-black text-white">
            Sign out
          </button>
        ) : (
          <button onClick={() => signIn()} className="px-4 py-2 rounded bg-black text-white">
            Sign in
          </button>
        )}
      </div>
    </main>
  );
}
