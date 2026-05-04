'use client';

import { useState, useEffect } from 'react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  date: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'medium' });

  useEffect(() => {
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((data) => setAnnouncements(data));
  }, []);

  const refetch = () => {
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((data) => setAnnouncements(data));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        date: new Date().toISOString().split('T')[0],
        isActive: true,
      }),
    });
    setShowModal(false);
    setForm({ title: '', content: '', priority: 'medium' });
    refetch();
  };

  const toggleActive = async (item: Announcement) => {
    await fetch('/api/announcements', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
    });
    setAnnouncements(announcements.map((a) => (a.id === item.id ? { ...a, isActive: !a.isActive } : a)));
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Announcements</h1>
          <p className="text-gray-500">Manage school notices and announcements</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      a.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : a.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {a.priority}
                  </span>
                  <span className="text-sm text-gray-500">{a.date}</span>
                  {!a.isActive && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Inactive</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{a.title}</h3>
                <p className="text-gray-600 mt-1">{a.content}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => toggleActive(a)}
                  className={`px-3 py-1 rounded text-sm ${
                    a.isActive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {a.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm">Edit</button>
                <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-800 text-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Announcement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  Publish
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
