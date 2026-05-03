'use client';

import { useState } from 'react';

const staffMembers = [
  { id: 1, name: 'Mr. Robert Smith', designation: 'Principal', department: 'Administration', email: 'robert@school.com' },
  { id: 2, name: 'Ms. Emily Davis', designation: 'Vice Principal', department: 'Administration', email: 'emily@school.com' },
  { id: 3, name: 'Mr. James Wilson', designation: 'Math Teacher', department: 'Mathematics', email: 'james@school.com' },
  { id: 4, name: 'Ms. Lisa Brown', designation: 'Science Teacher', department: 'Science', email: 'lisa@school.com' },
  { id: 5, name: 'Mr. Thomas Moore', designation: 'English Teacher', department: 'English', email: 'thomas@school.com' },
  { id: 6, name: 'Ms. Anna Clark', designation: 'History Teacher', department: 'Social Studies', email: 'anna@school.com' },
];

export default function StudentStaff() {
  const [selectedDept, setSelectedDept] = useState('All');

  const departments = ['All', 'Administration', 'Mathematics', 'Science', 'English', 'Social Studies'];
  const filtered = selectedDept === 'All' ? staffMembers : staffMembers.filter((s) => s.department === selectedDept);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">School Staff</h1>
      <p className="text-gray-500 mb-8">Get to know our teaching and administrative staff</p>

      {/* Department Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedDept === dept ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Staff Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((staff) => (
          <div key={staff.id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-2xl font-bold">{staff.name.charAt(0)}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{staff.name}</h3>
            <p className="text-indigo-600 text-sm">{staff.designation}</p>
            <p className="text-gray-500 text-sm mt-1">{staff.department}</p>
            <p className="text-gray-400 text-sm mt-2">{staff.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
