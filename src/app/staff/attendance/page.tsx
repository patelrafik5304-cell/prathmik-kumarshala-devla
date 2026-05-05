'use client';

import { useState, useEffect } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface AttendanceRecord {
  id: string;
  studentUsername: string;
  studentName: string;
  class: string;
  date: string;
  status: string;
}

interface Announcement {
  id: string;
  title: string;
  date: string;
  type?: 'general' | 'holiday' | 'vacation';
}

function checkDateRestrictions(dateStr: string, announcements: Announcement[]): { isRestricted: boolean; reason: string } {
  // Check if Sunday
  const dayOfWeek = new Date(dateStr).getDay();
  if (dayOfWeek === 0) {
    return { isRestricted: true, reason: 'Sunday - No attendance recorded' };
  }

  // Check for holiday/vacation announcements
  const holidayAnnouncement = announcements.find((a) =>
    a.date === dateStr && (a.type === 'holiday' || a.type === 'vacation')
  );

  if (holidayAnnouncement) {
    return { isRestricted: true, reason: holidayAnnouncement.title || 'Holiday/Vacation' };
  }

  return { isRestricted: false, reason: '' };
}

export default function StaffAttendancePage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<{ id: string; name: string; class: string }[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayReason, setHolidayReason] = useState('');

  useEffect(() => {
    fetch('/api/students')
      .then((r) => r.json())
      .then((data) => {
        setStudents(Array.isArray(data) ? data : []);
        if (data.length > 0 && !selectedClass) {
          setSelectedClass(data[0].class);
        }
      });

    fetch('/api/announcements')
      .then((r) => r.json())
      .then((data) => setAnnouncements(Array.isArray(data) ? data : []));
  }, []);

  const classes = [...new Set(students.map((s) => s.class))].sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));

  const fetchAttendance = async () => {
    setLoading(true);
    
    // Check date restrictions
    const restriction = checkDateRestrictions(date, announcements);
    if (restriction.isRestricted) {
      setIsHoliday(true);
      setHolidayReason(restriction.reason);
      setRecords([]);
      setLoading(false);
      return;
    }
    
    setIsHoliday(false);
    setHolidayReason('');
    
    try {
      const res = await fetch(`/api/attendance?date=${date}`);
      const data = await res.json();
      const all = Array.isArray(data) ? data : [];
      
      // Filter by class if selected
      const filtered = selectedClass 
        ? all.filter((r: any) => r.class === selectedClass)
        : all;
      
      setRecords(filtered);
    } catch (e) {
      console.error('Failed to fetch attendance', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (date) {
      fetchAttendance();
    }
  }, [date, selectedClass]);

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Student Attendance</h1>
        <p className="text-gray-500 mt-1 text-sm">View student attendance records</p>
      </div>

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all bg-white"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  Class {c === '0' ? 'BALVATIKA' : c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="flex gap-3">
              <Badge variant="success">Present: {presentCount}</Badge>
              <Badge variant="danger">Absent: {absentCount}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {isHoliday && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>No attendance records for {date}: {holidayReason}</span>
        </div>
      )}

      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">Loading attendance records...</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-primary">{record.studentUsername}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{record.studentName}</td>
                    <td className="px-6 py-4">
                      <Badge variant="default">
                        {record.class === '0' ? 'BALVATIKA' : `Class ${record.class}`}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={record.status === 'present' ? 'success' : 'danger'}>
                        {record.status === 'present' ? 'Present' : 'Absent'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && !isHoliday && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No attendance records found for {date}
                      {selectedClass && ` in Class ${selectedClass === '0' ? 'BALVATIKA' : selectedClass}`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
