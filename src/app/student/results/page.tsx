'use client';

const results = [
  { subject: 'Mathematics', marks: '92/100', grade: 'A+', exam: 'Mid-term' },
  { subject: 'Science', marks: '88/100', grade: 'A', exam: 'Mid-term' },
  { subject: 'English', marks: '95/100', grade: 'A+', exam: 'Mid-term' },
  { subject: 'Social Studies', marks: '85/100', grade: 'A', exam: 'Mid-term' },
  { subject: 'Hindi', marks: '90/100', grade: 'A+', exam: 'Mid-term' },
];

const examHistory = [
  { exam: 'Mid-term 2026', date: '2026-04-15', percentage: '92%', grade: 'A+' },
  { exam: 'Unit Test 3', date: '2026-03-10', percentage: '88%', grade: 'A' },
  { exam: 'Unit Test 2', date: '2026-02-05', percentage: '90%', grade: 'A+' },
  { exam: 'Unit Test 1', date: '2026-01-08', percentage: '85%', grade: 'A' },
];

export default function StudentResults() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Results</h1>
      <p className="text-gray-500 mb-8">View and download your exam results</p>

      {/* Current Results */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Mid-term Examination 2026</h2>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {results.map((r, i) => (
              <tr key={i}>
                <td className="px-4 py-3">{r.subject}</td>
                <td className="px-4 py-3">{r.marks}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium">
                    {r.grade}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3">450/500</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">A+</span>
              </td>
            </tr>
          </tbody>
        </table>
        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          📥 Download PDF
        </button>
      </div>

      {/* Exam History */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Exam History</h2>
        <div className="space-y-3">
          {examHistory.map((e, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">{e.exam}</p>
                <p className="text-sm text-gray-500">{e.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-indigo-600">{e.percentage}</span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm">{e.grade}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
