'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Bell, Images, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';

interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  priority: string;
  isActive: boolean;
}

export default function StaffDashboard() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        const visible = all.filter((a: Announcement) => a.isActive !== false).slice(0, 5);
        setAnnouncements(visible);
      });
  }, []);

  if (!user) return null;

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Welcome, {user.name}!</h1>
        <p className="text-gray-500 mt-1 text-sm">Staff Portal | Welcome to your dashboard</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <Link href="/student/notices" className="block">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">School Notices</h3>
                <p className="text-sm text-gray-500">View announcements</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
            </div>
          </Card>
        </Link>

        <Link href="/student/gallery" className="block">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Images className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">Gallery</h3>
                <p className="text-sm text-gray-500">View school photos</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Notices */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            Recent Notices
          </h2>
          <Link href="/student/notices" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {announcements.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm">No notices yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((n) => (
              <div key={n.id} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-800 text-sm">{n.title}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${n.priority === 'high' ? 'bg-red-100 text-red-700' : n.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {n.priority || 'low'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{n.date}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
