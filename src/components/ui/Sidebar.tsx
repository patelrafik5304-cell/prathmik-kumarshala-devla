'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, CalendarDays, FileText,
  Megaphone, Image, Globe, LogOut, X, Menu, Bell, UserCircle
} from 'lucide-react';

const adminItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/staff', label: 'Staff', icon: UserCheck },
  { href: '/admin/attendance', label: 'Attendance', icon: CalendarDays },
  { href: '/admin/results', label: 'Results', icon: FileText },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/gallery', label: 'Gallery', icon: Image },
  { href: '/admin/website', label: 'Website', icon: Globe },
];

const studentItems = [
  { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/profile', label: 'My Profile', icon: UserCircle },
  { href: '/student/attendance', label: 'Attendance', icon: CalendarDays },
  { href: '/student/results', label: 'Results', icon: FileText },
  { href: '/student/staff', label: 'Staff', icon: Users },
  { href: '/student/notices', label: 'Notices', icon: Bell },
  { href: '/student/gallery', label: 'Gallery', icon: Image },
];

interface SidebarProps {
  role: string;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export default function Sidebar({ role, isOpen, onClose, onOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const items = role === 'admin' ? adminItems : studentItems;
  const title = role === 'admin' ? 'Admin Panel' : 'Student Portal';

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed top-4 left-4 z-30 lg:hidden p-2.5 bg-white rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-[280px] bg-primary text-white z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center font-bold text-white text-lg">
                P
              </div>
              <h2 className="font-semibold text-sm">{title}</h2>
            </div>
            <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <button
                      onClick={() => {
                        router.push(item.href);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-white/15 text-white shadow-lg'
                          : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="px-3 py-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all duration-200"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
