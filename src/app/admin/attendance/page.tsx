'use client';

import { useState, useEffect } from 'react';

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
    fetch('/api/students')
      .then((r) => r.json())
      .then((data) => {
        setStudents(Array.isArray(data) ? data : []);
        if (data.length > 0 && !selectedClass) {
          setSelectedClass(data[0].class);
        }
      });
  }, []);

  const classes = [...new Set(students.map((s) => s.class))].sort((a, b) => {
    const numA = parseInt(a) || 0;
    const numB = parseInt(b) || 0;
    return numA - numB;
  });

  const filteredStudents = students.filter((s) => s.class === selectedClass);

  useEffect(() => {
    const initial: Record<string, string> = {};
    filteredStudents.forEach((s) => {
      initial[s.id] = '';
    });
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

    await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(records),
    });

    setSavedMsg(`Attendance saved for ${filteredStudents.length} students`);
    setLoading(false);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const presentCount = Object.values(attendance).filter((v) => v === 'present').length;
  const absentCount = Object.values(attendance).filter((v) => v === 'absent').length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Management</h1>
      <p className="text-gray-500 mb-8">Mark and track student attendance</p>

      {savedMsg && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">{savedMsg}</div>
      )}

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {classes.map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="flex gap-4 text-sm">
              <span className="text-green-600">Present: {presentCount}</span>
              <span className="text-red-600">Absent: {absentCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 font-mono text-indigo-600">{student.username}</td>
                <td className="px-6 py-4">{student.name}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      attendance[student.id] === 'present'
                        ? 'bg-green-100 text-green-700'
                        : attendance[student.id] === 'absent'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {attendance[student.id] || 'Not marked'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAttendance(student.id, 'present')}
                      className={`px-3 py-1 rounded text-sm ${
                        attendance[student.id] === 'present'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleAttendance(student.id, 'absent')}
                      className={`px-3 py-1 rounded text-sm ${
                        attendance[student.id] === 'absent'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No students in this class
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>
    </div>
  );
}
