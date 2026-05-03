'use client';

const notices = [
  { id: 1, title: 'Annual Sports Day on May 15', content: 'All students must participate in the annual sports day. Uniform is mandatory.', date: '2026-05-03', priority: 'high', category: 'Events' },
  { id: 2, title: 'Mid-term Exam Results Published', content: 'Mid-term results are now available on the portal. Check your scores.', date: '2026-05-01', priority: 'medium', category: 'Academic' },
  { id: 3, title: 'Parent-Teacher Meeting', content: 'Meeting scheduled for next Friday at 10 AM in the school auditorium.', date: '2026-04-28', priority: 'high', category: 'General' },
  { id: 4, title: 'Library Books Due Next Week', content: 'All library books must be returned by next Friday.', date: '2026-04-30', priority: 'low', category: 'Library' },
  { id: 5, title: 'Science Fair Projects', content: 'Submit your science fair project topics by this Friday.', date: '2026-04-25', priority: 'medium', category: 'Academic' },
];

export default function StudentNotices() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">School Notices</h1>
      <p className="text-gray-500 mb-8">Stay updated with school announcements</p>

      <div className="space-y-4">
        {notices.map((n) => (
          <div key={n.id} className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{n.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500">{n.date}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{n.category}</span>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  n.priority === 'high'
                    ? 'bg-red-100 text-red-700'
                    : n.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {n.priority}
              </span>
            </div>
            <p className="text-gray-600">{n.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
