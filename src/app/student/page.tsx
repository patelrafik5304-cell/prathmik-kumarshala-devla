'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  priority: string;
  target: string;
  isActive: boolean;
}

interface Result {
  id: string;
  studentUsername: string;
  studentName: string;
  class: string;
  exam: string;
  percentage: string;
  grade: string;
  subjects: Record<string, number>;
  published: boolean;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [recentResults, setRecentResults] = useState<{ exam: string; percentage: string; grade: string }[]>([]);

  useEffect(() => {
    if (!user) return;

    fetch('/api/announcements')
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        const visible = all
          .filter((a: Announcement) => a.isActive !== false)
          .slice(0, 5);
        setAnnouncements(visible);
      });

    fetch('/api/results')
      .then((r) => r.json())
      .then((data) => {
        console.log('[Dashboard Results] Raw:', data);
        const all = Array.isArray(data) ? data : [];
        const myResults = all.filter(
          (r: Result) => r.studentUsername === user?.username && r.published === true
        );
        console.log('[Dashboard Results] Filtered:', myResults.length);

        const latest = myResults
          .filter((r, i, arr) => arr.findIndex(x => x.exam === r.exam) === i)
          .map((r) => ({ exam: r.exam, percentage: r.percentage, grade: r.grade }))
          .slice(0, 5);

        setRecentResults(latest);
      });
  }, [user]);

  if (!user) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}</h1>
        <p className="text-gray-500">Username: {user.username}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Class', value: user.class || '-', color: 'bg-green-500' },
          { label: 'Username', value: user.username, color: 'bg-blue-500' },
          { label: 'Name', value: user.name, color: 'bg-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-3 h-12 rounded-lg`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Notices */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">School Notices</h2>
            <Link href="/student/notices" className="text-indigo-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          {announcements.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No notices yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((n) => (
                <div key={n.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800">{n.title}</p>
                  <p className="text-sm text-gray-500">{n.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Results</h2>
            <Link href="/student/results" className="text-indigo-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          {recentResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No results uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentResults.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-800">{r.exam}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">{r.percentage}</span>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium">
                      {r.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
