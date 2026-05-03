'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/student', icon: '🏠' },
  { name: 'My Profile', href: '/student/profile', icon: '👤' },
  { name: 'Attendance', href: '/student/attendance', icon: '📋' },
  { name: 'Results', href: '/student/results', icon: '📝' },
  { name: 'Staff', href: '/student/staff', icon: '👩🏫' },
  { name: 'Notices', href: '/student/notices', icon: '📢' },
  { name: 'Gallery', href: '/student/gallery', icon: '🖼️' },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, role, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) router.push('/login');
    else if (role === 'admin') router.push('/admin');
  }, [user, role, router]);

  if (!user || role === 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 text-white fixed h-full overflow-y-auto">
        <div className="p-6 border-b border-indigo-600">
          <h2 className="text-xl font-bold">Student Portal</h2>
          <p className="text-indigo-200 text-sm">Prathmik Kumarshala</p>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                pathname === item.href ? 'bg-indigo-800' : 'hover:bg-indigo-600'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-indigo-600">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-600 transition"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
