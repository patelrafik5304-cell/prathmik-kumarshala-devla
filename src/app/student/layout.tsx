'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import TopBar from '@/components/ui/TopBar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoggedIn = user;

  useEffect(() => {
    if (!isLoggedIn) router.push('/login');
    else if (user.role === 'admin') router.push('/admin');
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || user.role === 'admin') return null;

  const pageTitle = pathname === '/student' ? 'Dashboard' :
    pathname === '/student/profile' ? 'My Profile' :
    pathname === '/student/attendance' ? 'Attendance' :
    pathname === '/student/results' ? 'Results' :
    pathname === '/student/staff' ? 'Staff' :
    pathname === '/student/notices' ? 'Notices' :
    pathname === '/student/gallery' ? 'Gallery' : 'Dashboard';

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar role="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar title={pageTitle} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="lg:ml-[280px] pt-16 p-4 lg:p-8">
        <div className="animate-slide-up">
          {children}
        </div>
      </main>
    </div>
  );
}
