'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  class: string;
}

export default function StudentAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/attendance?studentUsername=${user.username}`)
      .then((r) => r.json())
      .then((data) => setRecords(Array.isArray(data) ? data : []));
  }, [user]);

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const total = records.length;
  const overallPct = total > 0 ? `${Math.round((presentCount / total) * 100)}%` : '0%';

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Attendance</h1>
      <p className="text-gray-500 mb-8">Track your daily attendance</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Overall Attendance', value: overallPct, color: 'bg-green-500' },
          { label: 'Present Days', value: String(presentCount), color: 'bg-blue-500' },
          { label: 'Absent Days', value: String(absentCount), color: 'bg-red-500' },
        ].map((stat, i) => (
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

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Attendance</h2>
        {records.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No attendance records yet.</p>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-800">{r.date}</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    r.status === 'present'
                      ? 'bg-green-100 text-green-700'
                      : r.status === 'absent'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
