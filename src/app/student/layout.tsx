'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoggedIn = user;

  useEffect(() => {
    if (!isLoggedIn) router.push('/login');
    else if (user.role === 'admin') router.push('/admin');
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || user.role === 'admin') return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar role="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} />
      <main className="flex-1 lg:ml-[280px] p-4 lg:p-8 h-screen overflow-y-auto">
        <div className="animate-slide-up">
          {children}
        </div>
      </main>
    </div>
  );
}
