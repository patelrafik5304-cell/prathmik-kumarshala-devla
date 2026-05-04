'use client';

import { useState } from 'react';
import Link from 'next/link';

const stats = [
  { label: 'Total Students', value: '1,248', color: 'bg-blue-500' },
  { label: 'Total Staff', value: '86', color: 'bg-green-500' },
  { label: 'Present Today', value: '1,156', color: 'bg-emerald-500' },
  { label: 'Absent Today', value: '92', color: 'bg-red-500' },
];

const recentAnnouncements = [
  { id: 1, title: 'Annual Sports Day', date: '2026-05-03', priority: 'high' },
  { id: 2, title: 'Mid-term Exam Schedule', date: '2026-05-01', priority: 'medium' },
  { id: 3, title: 'Parent-Teacher Meeting', date: '2026-04-28', priority: 'high' },
];

const recentResults = [
  { id: 1, student: 'John Doe', class: '10-A', exam: 'Mid-term', percentage: '92%' },
  { id: 2, student: 'Jane Smith', class: '10-A', exam: 'Mid-term', percentage: '88%' },
  { id: 3, student: 'Mike Johnson', class: '10-B', exam: 'Mid-term', percentage: '95%' },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Welcome back, Admin</p>
      </div>

      {/* Stats Cards */}
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
        {/* Recent Announcements */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Announcements</h2>
            <Link href="/admin/announcements" className="text-indigo-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentAnnouncements.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{a.title}</p>
                  <p className="text-sm text-gray-500">{a.date}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    a.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : a.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {a.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Results */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Results</h2>
            <Link href="/admin/results" className="text-indigo-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentResults.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{r.student}</p>
                  <p className="text-sm text-gray-500">Class {r.class} - {r.exam}</p>
                </div>
                <span className="font-bold text-indigo-600">{r.percentage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
