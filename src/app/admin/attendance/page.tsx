'use client';

import { useState } from 'react';

const classes = ['10-A', '10-B', '9-A', '9-B', '8-A', '8-B'];
const students = [
  { id: 1, rollNumber: 'STU001', name: 'John Doe', class: '10-A' },
  { id: 2, rollNumber: 'STU002', name: 'Jane Smith', class: '10-A' },
  { id: 3, rollNumber: 'STU003', name: 'Mike Johnson', class: '10-B' },
  { id: 4, rollNumber: 'STU004', name: 'Sarah Williams', class: '9-A' },
  { id: 5, rollNumber: 'STU005', name: 'David Brown', class: '9-B' },
];

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});

  const filteredStudents = students.filter((s) => s.class === selectedClass);

  const handleAttendance = (studentId: number, status: string) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleSubmit = () => {
    alert('Attendance saved successfully!');
    console.log('Attendance:', { date, class: selectedClass, attendance });
  };

  const presentCount = Object.values(attendance).filter((v) => v === 'present').length;
  const absentCount = Object.values(attendance).filter((v) => v === 'absent').length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Management</h1>
      <p className="text-gray-500 mb-8">Mark and track student attendance</p>

      {/* Controls */}
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
                <option key={c} value={c}>{c}</option>
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

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 font-medium">{student.rollNumber}</td>
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
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Save Attendance
        </button>
        <button className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">
          📥 Export Report
        </button>
      </div>
    </div>
  );
}
