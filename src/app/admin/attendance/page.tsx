'use client';

import { useState, useEffect } from 'react';
import { Check, X as XIcon, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Student {
  id: string;
  username: string;
  name: string;
  class: string;
}

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    fetch('/api/students').then((r) => r.json()).then((data) => {
      setStudents(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedClass) { setSelectedClass(data[0].class); }
    });
  }, []);

  const classes = [...new Set(students.map((s) => s.class))].sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
  const filteredStudents = students.filter((s) => s.class === selectedClass);

  useEffect(() => {
    const initial: Record<string, string> = {};
    filteredStudents.forEach((s) => { initial[s.id] = ''; });
    setAttendance(initial);
  }, [selectedClass, filteredStudents.length]);

  const handleAttendance = (studentId: string, status: string) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSavedMsg('');
    const records = filteredStudents.map((student) => ({
      studentId: student.id,
      studentUsername: student.username,
      studentName: student.name,
      class: student.class,
      date,
      status: attendance[student.id] || 'absent',
    }));
    await fetch('/api/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(records) });
    setSavedMsg(`Attendance saved for ${filteredStudents.length} students`);
    setLoading(false);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const presentCount = Object.values(attendance).filter((v) => v === 'present').length;
  const absentCount = Object.values(attendance).filter((v) => v === 'absent').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Attendance Management</h1>
        <p className="text-gray-500 mt-1 text-sm">Mark and track student attendance</p>
      </div>

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
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all bg-white">
              {classes.map((c) => (<option key={c} value={c}>Class {c}</option>))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="flex gap-3">
              <Badge variant="success">Present: {presentCount}</Badge>
              <Badge variant="danger">Absent: {absentCount}</Badge>
            </div>
          </div>
          <div className="flex items-end">
            <Button onClick={handleSubmit} loading={loading} className="w-full">
              <Check className="w-4 h-4" /> Save Attendance
            </Button>
          </div>
        </div>
      </Card>

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
                      <button onClick={() => handleAttendance(student.id, 'present')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${attendance[student.id] === 'present' ? 'bg-green-600 text-white shadow-lg shadow-green-500/25' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                        Present
                      </button>
                      <button onClick={() => handleAttendance(student.id, 'absent')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${attendance[student.id] === 'absent' ? 'bg-red-600 text-white shadow-lg shadow-red-500/25' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
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
    </div>
  );
}
