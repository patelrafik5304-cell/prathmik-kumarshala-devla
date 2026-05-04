'use client';

import { useState, useEffect } from 'react';

interface StaffMember {
  id: string;
  name: string;
  designation: string;
  photo?: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', designation: '', photo: '' });
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm({ ...form, photo: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetch('/api/staff')
      .then((r) => r.json())
      .then((data) => setStaff(data));
  }, []);

  const refetch = () => {
    fetch('/api/staff')
      .then((r) => r.json())
      .then((data) => setStaff(data));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      await fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingStaff.id, ...form }),
      });
      setEditingStaff(null);
    } else {
      await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setShowModal(false);
    setForm({ name: '', designation: '', photo: '' });
    refetch();
  };

  const handleEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setForm({ name: member.name, designation: member.designation, photo: member.photo || '' });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this staff member?')) {
      await fetch(`/api/staff?id=${id}`, { method: 'DELETE' });
      setStaff(staff.filter((s) => s.id !== id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-gray-500">Manage teaching and non-teaching staff</p>
        </div>
        <button
          onClick={() => { setEditingStaff(null); setForm({ name: '', designation: '', photo: '' }); setShowModal(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Add Staff
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4">{s.designation}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(s)} className="text-indigo-600 hover:text-indigo-800">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingStaff ? 'Edit Staff' : 'Add Staff'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <label className="flex items-center gap-3 cursor-pointer border border-gray-300 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition">
                  {form.photo ? (
                    <img src={form.photo} alt="Preview" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-indigo-600 font-medium">Choose Photo</span>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {form.photo && (
                  <button type="button" onClick={() => setForm({ ...form, photo: '' })} className="mt-2 text-red-600 text-sm hover:underline">
                    Remove
                  </button>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  {editingStaff ? 'Update' : 'Add'}
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
