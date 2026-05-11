'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('@/components/ui/Sidebar'), { ssr: false });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.push('/login');
    else if (user?.role !== 'admin') router.push('/student');
  }, [user, router, loading]);

  if (loading || !user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} />
      <main className="flex-1 min-w-0 lg:ml-[280px] p-3 pt-16 sm:p-4 lg:p-8 h-screen overflow-y-auto">
        <div className="animate-slide-up">
          {children}
        </div>
      </main>
    </div>
  );
}
