'use client';

import { useState } from 'react';

const results = [
  { id: 1, studentName: 'John Doe', rollNumber: 'STU001', class: '10-A', exam: 'Mid-term', percentage: '92%', grade: 'A+' },
  { id: 2, studentName: 'Jane Smith', rollNumber: 'STU002', class: '10-A', exam: 'Mid-term', percentage: '88%', grade: 'A' },
  { id: 3, studentName: 'Mike Johnson', rollNumber: 'STU003', class: '10-B', exam: 'Mid-term', percentage: '95%', grade: 'A+' },
  { id: 4, studentName: 'Sarah Williams', rollNumber: 'STU004', class: '9-A', exam: 'Mid-term', percentage: '90%', grade: 'A+' },
];

export default function ResultsPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = results.filter(
    (r) =>
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Results Management</h1>
          <p className="text-gray-500">Upload and manage student results</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            📥 Bulk Upload
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            + Add Result
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <input
          type="text"
          placeholder="Search by student name or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((result) => (
              <tr key={result.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{result.rollNumber}</td>
                <td className="px-6 py-4">{result.studentName}</td>
                <td className="px-6 py-4">{result.class}</td>
                <td className="px-6 py-4">{result.exam}</td>
                <td className="px-6 py-4 font-medium">{result.percentage}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium">
                    {result.grade}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="text-indigo-600 hover:text-indigo-800">View</button>
                    <button className="text-indigo-600 hover:text-indigo-800">Edit</button>
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Result</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option>Mid-term</option>
                    <option>Final</option>
                    <option>Unit Test</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subjects (Marks)</label>
                {['Math', 'Science', 'English', 'Social'].map((sub) => (
                  <div key={sub} className="flex items-center gap-3 mb-2">
                    <span className="w-20 text-sm">{sub}</span>
                    <input type="number" placeholder="Marks" className="flex-1 px-3 py-1 border border-gray-300 rounded" />
                    <span className="text-sm text-gray-500">/100</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  Save Result
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
