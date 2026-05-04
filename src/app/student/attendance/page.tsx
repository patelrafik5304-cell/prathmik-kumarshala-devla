'use client';

const attendanceData = [
  { date: '2026-05-03', status: 'present' },
  { date: '2026-05-02', status: 'present' },
  { date: '2026-05-01', status: 'absent' },
  { date: '2026-04-30', status: 'present' },
  { date: '2026-04-29', status: 'present' },
  { date: '2026-04-28', status: 'late' },
  { date: '2026-04-27', status: 'present' },
  { date: '2026-04-26', status: 'present' },
  { date: '2026-04-25', status: 'present' },
  { date: '2026-04-24', status: 'absent' },
];

const monthlyStats = [
  { month: 'January', present: 20, absent: 1, late: 0, percentage: '95%' },
  { month: 'February', present: 18, absent: 2, late: 1, percentage: '90%' },
  { month: 'March', present: 22, absent: 0, late: 2, percentage: '92%' },
  { month: 'April', present: 20, absent: 2, late: 1, percentage: '91%' },
];

export default function StudentAttendance() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Attendance</h1>
      <p className="text-gray-500 mb-8">Track your daily attendance</p>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Overall Attendance', value: '94%', color: 'bg-green-500' },
          { label: 'Present Days', value: '80', color: 'bg-blue-500' },
          { label: 'Absent Days', value: '6', color: 'bg-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-3 h-12 rounded-lg`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Attendance</h2>
        <div className="space-y-2">
          {attendanceData.map((a, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-800">{a.date}</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  a.status === 'present'
                    ? 'bg-green-100 text-green-700'
                    : a.status === 'absent'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Summary</h2>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Late</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {monthlyStats.map((m, i) => (
              <tr key={i}>
                <td className="px-4 py-3">{m.month}</td>
                <td className="px-4 py-3 text-green-600">{m.present}</td>
                <td className="px-4 py-3 text-red-600">{m.absent}</td>
                <td className="px-4 py-3 text-yellow-600">{m.late}</td>
                <td className="px-4 py-3 font-medium">{m.percentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
