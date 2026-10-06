'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { OLVUserPublic } from '@/lib/olv/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<OLVUserPublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/olv/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.data);
        } else {
          router.push('/products/offer-letter-verification/auth/signin');
        }
      })
      .catch(() => router.push('/products/offer-letter-verification/auth/signin'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSignout = async () => {
    await fetch('/api/olv/auth/signout', { method: 'POST' });
    router.push('/products/offer-letter-verification');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null; // Will redirect

  return (
    <div className="min-h-screen bg-gray-50 pt-[80px] font-body flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="p-6">
          <h2 className="font-heading font-bold text-xl text-[var(--color-bg-dark)] mb-1">
            Offer Verification
          </h2>
          <p className="text-sm text-gray-500 truncate">{user.company}</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link
            href="/products/offer-letter-verification/dashboard"
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/products/offer-letter-verification/dashboard'
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Verification Dashboard
          </Link>
          <Link
            href="/products/offer-letter-verification/dashboard/usage"
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/products/offer-letter-verification/dashboard/usage'
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Usage & History
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
              {user.fullName.charAt(0)}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignout}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
