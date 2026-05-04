'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Users, UserCheck, Megaphone, FileText, Plus, Upload, Bell, ChevronRight } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ students: 0, staff: 0, announcements: 0, results: 0 });
  const [recentStudents, setRecentStudents] = useState<{ name: string; class: string }[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<{ title: string; date: string; priority: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/students').then(r => r.json()),
      fetch('/api/staff').then(r => r.json()),
      fetch('/api/announcements').then(r => r.json()),
      fetch('/api/results').then(r => r.json()),
    ]).then(([students, staff, announcements, results]) => {
      const s = Array.isArray(students) ? students : [];
      const st = Array.isArray(staff) ? staff : [];
      const a = Array.isArray(announcements) ? announcements : [];
      const r = Array.isArray(results) ? results : [];

      setCounts({
        students: s.length,
        staff: st.length,
        announcements: a.length,
        results: r.length,
      });

      setRecentStudents(s.slice(-5).reverse().map((s: any) => ({ name: s['student name'] || s.name, class: s.class })));
      setRecentAnnouncements(a.slice(-5).reverse().map((a: any) => ({ title: a.title, date: a.date, priority: a.priority })));
    });
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">{greeting}, {user?.name || 'Admin'}!</h1>
        <p className="text-gray-500 mt-1 text-sm">{dateStr}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="stagger-1 animate-slide-up" style={{ animationFillMode: 'backwards' }}>
          <StatCard icon={<Users className="w-6 h-6" />} label="Total Students" value={counts.students} accentColor="blue" />
        </div>
        <div className="stagger-2 animate-slide-up" style={{ animationFillMode: 'backwards' }}>
          <StatCard icon={<UserCheck className="w-6 h-6" />} label="Total Staff" value={counts.staff} accentColor="green" />
        </div>
        <div className="stagger-3 animate-slide-up" style={{ animationFillMode: 'backwards' }}>
          <StatCard icon={<FileText className="w-6 h-6" />} label="Results Published" value={counts.results} accentColor="amber" />
        </div>
        <div className="stagger-4 animate-slide-up" style={{ animationFillMode: 'backwards' }}>
          <StatCard icon={<Megaphone className="w-6 h-6" />} label="Announcements" value={counts.announcements} accentColor="purple" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/admin/students" className="group">
            <Card className="p-5 hover:border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Add Student</p>
                  <p className="text-sm text-gray-500">Enroll a new student</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/admin/results" className="group">
            <Card className="p-5 hover:border-amber-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Manage Results</p>
                  <p className="text-sm text-gray-500">Upload or edit results</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/admin/announcements" className="group">
            <Card className="p-5 hover:border-purple-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Post Announcement</p>
                  <p className="text-sm text-gray-500">Share school notices</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Students</h2>
          {recentStudents.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">No students yet.</p>
          ) : (
            <div className="space-y-3">
              {recentStudents.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-semibold">
                      {s.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-500">Class {s.class}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Announcements</h2>
          {recentAnnouncements.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">No announcements yet.</p>
          ) : (
            <div className="space-y-3">
              {recentAnnouncements.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.title}</p>
                    <p className="text-xs text-gray-500">{a.date}</p>
                  </div>
                  <Badge variant={a.priority === 'high' ? 'danger' : a.priority === 'medium' ? 'warning' : 'success'}>
                    {a.priority || 'low'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
