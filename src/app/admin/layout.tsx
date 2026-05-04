'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Students', href: '/admin/students' },
  { name: 'Staff', href: '/admin/staff' },
  { name: 'Attendance', href: '/admin/attendance' },
  { name: 'Results', href: '/admin/results' },
  { name: 'Announcements', href: '/admin/announcements' },
  { name: 'Gallery', href: '/admin/gallery' },
  { name: 'Website', href: '/admin/website' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoggedIn = user;

  useEffect(() => {
    if (!isLoggedIn) router.push('/login');
    else if (user.role !== 'admin') router.push('/student');
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 text-white fixed h-full overflow-y-auto">
        <div className="p-6 border-b border-indigo-600">
          <h2 className="text-xl font-bold">Admin Panel</h2>
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
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-indigo-600">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-600 transition"
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
