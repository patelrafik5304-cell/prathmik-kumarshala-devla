'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Check, X as XIcon, Calendar } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

function DonutChart({ pct, size = 160 }: { pct: number; size?: number }) {
  const [animated, setAnimated] = useState(false);
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#grad)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={animated ? offset : circumference}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
      />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" className="fill-gray-800 text-2xl font-bold" fontSize={size * 0.18} fontFamily="inherit">
        {pct}%
      </text>
    </svg>
  );
}

export default function StudentAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<{ id: string; date: string; status: string; class: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/attendance?studentUsername=${user.username}`).then((r) => r.json()).then((data) => {
      const all = Array.isArray(data) ? data : [];
      const deduped = Array.from(new Map(all.map((r: any) => [r.date, r])).values());
      setRecords(deduped);
    });
  }, [user]);

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const total = records.length;
  const overallPct = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">My Attendance</h1>
        <p className="text-gray-500 mt-1 text-sm">Track your daily attendance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <StatCard icon={<Check className="w-6 h-6" />} label="Overall Attendance" value={`${overallPct}%`} accentColor="green" />
        <StatCard icon={<Calendar className="w-6 h-6" />} label="Present Days" value={presentCount} accentColor="blue" />
        <StatCard icon={<XIcon className="w-6 h-6" />} label="Absent Days" value={absentCount} accentColor="red" />
      </div>

      {records.length > 0 && (
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <DonutChart pct={overallPct} />
            </div>
            <div className="flex-1 w-full">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center sm:text-left">Attendance Overview</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-gray-700">Present</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">{presentCount} / {total}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-gray-700">Absent</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">{absentCount} / {total}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Total Days</span>
                  </div>
                  <span className="text-sm font-bold text-gray-600">{total}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Attendance History</h2>
        {records.length === 0 ? (
          <EmptyState icon={<Calendar className="w-8 h-8" />} title="No attendance records" description="Your attendance will appear here once marked" />
        ) : (
          <div className="space-y-2">
            {records.slice().sort((a, b) => b.date.localeCompare(a.date)).map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <span className="text-sm font-medium text-gray-700">{r.date}</span>
                <Badge variant={r.status === 'present' ? 'success' : r.status === 'absent' ? 'danger' : 'warning'}>
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
