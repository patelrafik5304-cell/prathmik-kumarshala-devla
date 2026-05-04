'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ students: 0, staff: 0, announcements: 0, results: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/students').then(r => r.json()),
      fetch('/api/staff').then(r => r.json()),
      fetch('/api/announcements').then(r => r.json()),
      fetch('/api/results').then(r => r.json()),
    ]).then(([students, staff, announcements, results]) => {
      setCounts({
        students: Array.isArray(students) ? students.length : 0,
        staff: Array.isArray(staff) ? staff.length : 0,
        announcements: Array.isArray(announcements) ? announcements.length : 0,
        results: Array.isArray(results) ? results.length : 0,
      });
    });
  }, []);

  const stats = [
    { label: 'Total Students', value: String(counts.students), color: 'bg-blue-500' },
    { label: 'Total Staff', value: String(counts.staff), color: 'bg-green-500' },
    { label: 'Announcements', value: String(counts.announcements), color: 'bg-purple-500' },
    { label: 'Results', value: String(counts.results), color: 'bg-orange-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name || 'Admin'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-3 h-12 rounded-lg`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/students" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition">
              <p className="font-medium text-blue-700">Manage Students</p>
            </Link>
            <Link href="/admin/staff" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition">
              <p className="font-medium text-green-700">Manage Staff</p>
            </Link>
            <Link href="/admin/results" className="p-4 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition">
              <p className="font-medium text-orange-700">Results</p>
            </Link>
            <Link href="/admin/announcements" className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition">
              <p className="font-medium text-purple-700">Announcements</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gallery</h2>
          <Link href="/admin/gallery" className="p-4 bg-indigo-50 rounded-lg text-center hover:bg-indigo-100 transition block">
            <p className="font-medium text-indigo-700">Manage Photos</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
