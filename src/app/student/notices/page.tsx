'use client';

import { useState, useEffect } from 'react';

interface Notice {
  _id: string;
  title: string;
  content: string;
  priority: string;
  isActive: boolean;
  date: string;
}

export default function StudentNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((data) => setNotices(data.filter((n: Notice) => n.isActive)));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">School Notices</h1>
      <p className="text-gray-500 mb-8">Stay updated with school announcements</p>

      {notices.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">No notices available.</div>
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <div key={n._id} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{n.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">{n.date}</span>
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
      )}
    </div>
  );
}
