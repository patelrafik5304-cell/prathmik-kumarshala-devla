'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CalendarDays, FileText, Bell, ChevronRight, TrendingUp, Award } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

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
  const [recentResults, setRecentResults] = useState<{ exam: string; percentage: string; grade: string; subjects?: Record<string, number> }[]>([]);
  const [topStudents, setTopStudents] = useState<{ name: string; percentage: string; grade: string }[]>([]);
  const [attendancePct, setAttendancePct] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    fetch('/api/announcements')
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        const visible = all.filter((a: Announcement) => a.isActive !== false).slice(0, 5);
        setAnnouncements(visible);
      });

    fetch(`/api/results?studentUsername=${user.username}&published=true`)
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        const myResults = all.filter(
          (r: Result) => r.published === true
        );
        const latest = myResults
          .filter((r, i, arr) => arr.findIndex(x => x.exam === r.exam) === i)
          .map((r) => ({ exam: r.exam, percentage: r.percentage, grade: r.grade, subjects: r.subjects }))
          .slice(0, 5);
        setRecentResults(latest);
      });

    fetch('/api/attendance')
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        const myAttendance = all.filter((a: any) => a.studentUsername === user?.username);
        if (myAttendance.length > 0) {
          const present = myAttendance.filter((a: any) => a.status === 'present').length;
          setAttendancePct(Math.round((present / myAttendance.length) * 100));
        }
      });

    fetch(`/api/results?class=${user.class}&published=true`).then((r) => r.json()).then(async (data) => {
      const all = Array.isArray(data) ? data : [];
      if (all.length === 0) return;

      const byExam: Record<string, any[]> = {};
      all.forEach((r: any) => {
        if (!byExam[r.exam]) byExam[r.exam] = [];
        byExam[r.exam].push(r);
      });

      const examNames = Object.keys(byExam).sort((a, b) => {
        const dateA = byExam[a][0]?.createdAt || '';
        const dateB = byExam[b][0]?.createdAt || '';
        return dateB.localeCompare(dateA);
      });
      const latestResults = byExam[examNames[0]];
      if (!latestResults) return;

      latestResults.sort((a: any, b: any) => parseFloat(b.percentage) - parseFloat(a.percentage));

      const attendanceMap: Record<string, number> = {};
      const seenPcts: Record<string, number> = {};
      latestResults.forEach((r: any) => {
        if (!seenPcts[r.percentage]) seenPcts[r.percentage] = 0;
        seenPcts[r.percentage]++;
      });

      await Promise.all(latestResults.map(async (r: any) => {
        if (seenPcts[r.percentage] <= 1) return;
        try {
          const attData = await fetch(`/api/attendance?studentUsername=${r.studentUsername}`).then(res => res.json());
          const records = Array.isArray(attData) ? attData : [];
          attendanceMap[r.studentUsername] = records.length > 0 ? (records.filter((a: any) => a.status === 'present').length / records.length) * 100 : 0;
        } catch {
          attendanceMap[r.studentUsername] = 0;
        }
      }));

      latestResults.sort((a: any, b: any) => {
        const pctDiff = parseFloat(b.percentage) - parseFloat(a.percentage);
        if (pctDiff !== 0) return pctDiff;
        return (attendanceMap[b.studentUsername] || 0) - (attendanceMap[a.studentUsername] || 0);
      });

      setTopStudents(latestResults.slice(0, 10).map((r: any) => ({ name: r.studentName, percentage: r.percentage, grade: r.grade })));
    });
  }, [user]);

  if (!user) return null;

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const latestPct = recentResults.length > 0 ? parseFloat(recentResults[0].percentage) : null;

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">{greeting}, {user.name}!</h1>
        <p className="text-gray-500 mt-1 text-sm">{user.class === '0' ? 'BALVATIKA' : user.class ? `Class ${user.class}` : '-'} | Welcome to your portal</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <div className="stagger-1 animate-slide-up" style={{ animationFillMode: 'backwards' }}>
          <StatCard icon={<CalendarDays className="w-6 h-6" />} label="Attendance" value={attendancePct !== null ? `${attendancePct}%` : '-'} accentColor="green" />
        </div>
        <div className="stagger-2 animate-slide-up" style={{ animationFillMode: 'backwards' }}>
          <StatCard icon={<Award className="w-6 h-6" />} label="Latest Result" value={latestPct !== null ? `${latestPct}%` : '-'} accentColor="blue" />
        </div>
        <div className="stagger-3 animate-slide-up" style={{ animationFillMode: 'backwards' }}>
          <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Grade" value={recentResults.length > 0 ? recentResults[0].grade : '-'} accentColor="amber" />
        </div>
      </div>

      {/* Performance Graph */}
      {recentResults.length > 1 && (
        <div className="mb-8 animate-slide-up stagger-4" style={{ animationFillMode: 'backwards' }}>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Performance Trend</h2>
            <div className="flex items-end gap-4 h-40">
              {recentResults.slice(0, 6).reverse().map((r, i) => {
                const pct = parseFloat(r.percentage) || 0;
                const height = Math.max(pct, 10);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">{pct}%</span>
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-700 ease-out"
                      style={{ height: `${height}%`, animationDelay: `${i * 100}ms` }}
                    />
                    <span className="text-xs text-gray-500 truncate w-full text-center">{r.exam.substring(0, 8)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Top 10 Students */}
      {topStudents.length > 0 && (
        <div className="mb-8 animate-slide-up">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Top 10 Students — {user.class === '0' ? 'BALVATIKA' : `Class ${user.class}`}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-10">#</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">%</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topStudents.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2.5 text-sm font-bold text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2.5 text-sm font-medium text-gray-800">{s.name}</td>
                      <td className="px-3 py-2.5 text-sm font-semibold text-right text-primary">{s.percentage}</td>
                      <td className="px-3 py-2.5 text-right"><Badge variant={s.grade === 'A+' || s.grade === 'A' ? 'success' : s.grade === 'B+' || s.grade === 'B' ? 'info' : s.grade === 'C' ? 'warning' : 'danger'}>{s.grade}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Notices & Results */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              School Notices
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
                    <Badge variant={n.priority === 'high' ? 'danger' : n.priority === 'medium' ? 'warning' : 'success'}>
                      {n.priority || 'low'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{n.date}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Recent Results
            </h2>
            <Link href="/student/results" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {recentResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">No results uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentResults.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-800 text-sm">{r.exam}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 text-sm">{r.percentage}</span>
                    <Badge variant={r.grade === 'A' || r.grade === 'A+' ? 'success' : r.grade === 'B' ? 'info' : 'warning'}>
                      {r.grade}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
