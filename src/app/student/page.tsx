'use client';

import Link from 'next/link';

const studentInfo = {
  name: 'John Doe',
  rollNumber: 'STU001',
  class: '10-A',
  attendance: '94%',
  pendingFees: '$0',
};

const notices = [
  { id: 1, title: 'Annual Sports Day on May 15', date: '2026-05-03', priority: 'high' },
  { id: 2, title: 'Mid-term Exam Results Published', date: '2026-05-01', priority: 'medium' },
  { id: 3, title: 'Library Books Due Next Week', date: '2026-04-30', priority: 'low' },
];

const recentResults = [
  { subject: 'Mathematics', marks: '92/100', grade: 'A+' },
  { subject: 'Science', marks: '88/100', grade: 'A' },
  { subject: 'English', marks: '95/100', grade: 'A+' },
];

export default function StudentDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {studentInfo.name}</h1>
        <p className="text-gray-500">Roll No: {studentInfo.rollNumber} | Class: {studentInfo.class}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Attendance', value: studentInfo.attendance, color: 'bg-green-500', icon: '📋' },
          { label: 'Pending Fees', value: studentInfo.pendingFees, color: 'bg-blue-500', icon: '💰' },
          { label: 'Class', value: studentInfo.class, color: 'bg-purple-500', icon: '🏫' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Notices */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">School Notices</h2>
            <Link href="/student/notices" className="text-indigo-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800">{n.title}</p>
                <p className="text-sm text-gray-500">{n.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Results */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Results</h2>
            <Link href="/student/results" className="text-indigo-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentResults.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-800">{r.subject}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">{r.marks}</span>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium">
                    {r.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
