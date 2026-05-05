'use client';

import { useState, useEffect } from 'react';
import { Check, X as XIcon, Calendar, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Student {
  id: string;
  username: string;
  name: string;
  class: string;
}

interface Announcement {
  id: string;
  title: string;
  date: string;
  type?: 'general' | 'holiday' | 'vacation';
}

function getDateRange() {
  const today = new Date();
  const fifteenDaysAgo = new Date(today);
  fifteenDaysAgo.setDate(today.getDate() - 15);
  return {
    min: fifteenDaysAgo.toISOString().split('T')[0],
    max: today.toISOString().split('T')[0],
  };
}

function isDateValid(dateStr: string): boolean {
  const { min, max } = getDateRange();
  return dateStr >= min && dateStr <= max;
}

function checkDateRestrictions(dateStr: string): { isRestricted: boolean; reason: string } {
  // Check if Sunday
  const dayOfWeek = new Date(dateStr).getDay();
  if (dayOfWeek === 0) {
    return { isRestricted: true, reason: 'Sunday - No attendance allowed' };
  }

  return { isRestricted: false, reason: '' };
}

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const dateRange = getDateRange();
  const [date, setDate] = useState(dateRange.max);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [viewMode, setViewMode] = useState<'mark' | 'view-absent'>('mark');
  const [absentStudents, setAbsentStudents] = useState<any[]>([]);
  const [loadingAbsent, setLoadingAbsent] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayReason, setHolidayReason] = useState('');

  useEffect(() => {
    fetch('/api/students').then((r) => r.json()).then((data) => {
      setStudents(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedClass) { setSelectedClass(data[0].class); }
    });
  }, []);

  const classes = [...new Set(students.map((s) => s.class))].sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
  const filteredStudents = students.filter((s) => s.class === selectedClass);

  useEffect(() => {
    const fetchSavedAttendance = async () => {
      const initial: Record<string, string> = {};
      filteredStudents.forEach((s) => { initial[s.id] = 'present'; });

      // Check date restrictions (Sunday)
      const restriction = checkDateRestrictions(date);
      if (restriction.isRestricted) {
        setIsHoliday(true);
        setHolidayReason(restriction.reason);
        setAttendance(initial);
        return;
      }

      // Check for holiday/vacation announcements
      try {
        const res = await fetch('/api/announcements');
        const announcements: Announcement[] = await res.json();
        const holidayAnnouncement = announcements.find((a: any) =>
          a.date === date && (a.type === 'holiday' || a.type === 'vacation')
        );

        if (holidayAnnouncement) {
          setIsHoliday(true);
          setHolidayReason(holidayAnnouncement.title || 'Holiday/Vacation');
          setAttendance(initial);
          return;
        }

        setIsHoliday(false);
        setHolidayReason('');
      } catch (e) {
        console.error('Failed to check announcements', e);
      }

      try {
        const res = await fetch(`/api/attendance?date=${date}`);
        const records = await res.json();

        const savedMap: Record<string, string> = {};
        records.forEach((r: any) => { savedMap[r.studentUsername] = r.status; });

        filteredStudents.forEach((s) => {
          if (savedMap[s.username]) {
            initial[s.id] = savedMap[s.username];
          }
        });
      } catch (e) {
        console.error('Failed to fetch saved attendance', e);
      }

      setAttendance(initial);
    };

    if (filteredStudents.length > 0) {
      fetchSavedAttendance();
    }
  }, [selectedClass, date, filteredStudents.length]);

  const handleAttendance = (studentId: string, status: string) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleSubmit = async () => {
    if (!isDateValid(date)) {
      alert('You can only mark attendance for the last 15 days. Future dates are not allowed.');
      return;
    }
    if (isHoliday) {
      alert(`Cannot mark attendance for ${date}: ${holidayReason}`);
      return;
    }
    setLoading(true);
    setSavedMsg('');
    const records = filteredStudents.map((student) => ({
      studentId: student.id,
      studentUsername: student.username,
      studentName: student.name,
      class: student.class,
      date,
      status: attendance[student.id] || 'present',
    }));
    await fetch('/api/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(records) });
    setSavedMsg(`Attendance saved for ${filteredStudents.length} students`);
    setLoading(false);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const fetchAbsentStudents = async () => {
    setLoadingAbsent(true);
    try {
      const res = await fetch(`/api/attendance?date=${date}`);
      const data = await res.json();
      const absent = data.filter((r: any) => r.status === 'absent');
      setAbsentStudents(absent);
    } catch (e) {
      console.error('Failed to fetch absent students', e);
    }
    setLoadingAbsent(false);
  };

  const presentCount = Object.values(attendance).filter((v) => v === 'present').length;
  const absentCount = Object.values(attendance).filter((v) => v === 'absent').length;
  const dateValid = isDateValid(date);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Attendance Management</h1>
        <p className="text-gray-500 mt-1 text-sm">Mark and track student attendance (last 15 days only)</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setViewMode('mark')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'mark' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Mark Attendance
        </button>
        <button onClick={() => setViewMode('view-absent')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'view-absent' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          View Absentees
        </button>
      </div>

      {!dateValid && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl mb-6 text-sm animate-slide-down flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Selected date is outside the allowed range. Please select a date within the last 15 days.</span>
        </div>
      )}

      {isHoliday && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm animate-slide-down flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Cannot mark attendance for {date}: {holidayReason}</span>
        </div>
      )}

      {savedMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 text-sm animate-slide-down flex items-center gap-2">
          <Check className="w-4 h-4" /> {savedMsg}
        </div>
      )}

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={date}
                min={dateRange.min}
                max={dateRange.max}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Only last 15 days allowed</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all bg-white">
              {classes.map((c) => (<option key={c} value={c}>{c === '0' ? 'BALVATIKA' : `Class ${c}`}</option>))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="flex gap-3">
              <Badge variant="success">Present: {presentCount}</Badge>
              <Badge variant="danger">Absent: {absentCount}</Badge>
            </div>
          </div>
          <div className="flex items-end">
            <Button onClick={handleSubmit} loading={loading} disabled={!dateValid || filteredStudents.length === 0 || isHoliday} className="w-full">
              <Check className="w-4 h-4" /> Save Attendance
            </Button>
          </div>
        </div>
      </Card>

      {viewMode === 'view-absent' && (
        <div>
          <Card className="p-6 mb-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={date}
                    min={dateRange.min}
                    max={dateRange.max}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all"
                  />
                </div>
              </div>
              <Button onClick={fetchAbsentStudents} loading={loadingAbsent} className="bg-red-600 hover:bg-red-700">
                <XIcon className="w-4 h-4" /> View Absent Students
              </Button>
            </div>
          </Card>

          {absentStudents.length > 0 && (
            <>
              <div className="mb-4 flex items-center gap-3">
                <Badge variant="danger" className="text-base px-4 py-2">
                  <XIcon className="w-4 h-4 mr-1" /> {absentStudents.length} Student{absentStudents.length > 1 ? 's' : ''} Absent on {date}
                </Badge>
              </div>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {absentStudents.map((record, idx) => (
                        <tr key={idx} className="hover:bg-red-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-sm text-red-600">{record.studentUsername}</td>
                          <td className="px-6 py-4 font-medium text-gray-800">{record.studentName}</td>
                          <td className="px-6 py-4">
                            <Badge variant="default">{record.class === '0' ? 'BALVATIKA' : `Class ${record.class}`}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {!loadingAbsent && absentStudents.length === 0 && date && (
            <Card className="p-12 text-center">
              <XIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No absent records found for {date}. Click "View Absent Students" to check.</p>
            </Card>
          )}
        </div>
      )}

      {viewMode === 'mark' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-primary">{student.username}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{student.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant={attendance[student.id] === 'present' ? 'success' : attendance[student.id] === 'absent' ? 'danger' : 'default'}>
                        {attendance[student.id] || 'Not marked'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAttendance(student.id, 'present')} 
                          disabled={isHoliday}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isHoliday ? 'opacity-50 cursor-not-allowed' : attendance[student.id] === 'present' ? 'bg-green-600 text-white shadow-lg shadow-green-500/25' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        >
                          Present
                        </button>
                        <button 
                          onClick={() => handleAttendance(student.id, 'absent')} 
                          disabled={isHoliday}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isHoliday ? 'opacity-50 cursor-not-allowed' : attendance[student.id] === 'absent' ? 'bg-red-600 text-white shadow-lg shadow-red-500/25' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No students in this class</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
