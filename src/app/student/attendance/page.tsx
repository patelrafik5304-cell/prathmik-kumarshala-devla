'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Check, X as XIcon, Calendar } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

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

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Attendance History</h2>
        {records.length === 0 ? (
          <EmptyState icon={<Calendar className="w-8 h-8" />} title="No attendance records" description="Your attendance will appear here once marked" />
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
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
