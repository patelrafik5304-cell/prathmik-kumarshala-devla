'use client';

import { useState } from 'react';

const initialStaff = [
  { id: 1, name: 'Mr. Robert Smith', designation: 'Principal', department: 'Administration', email: 'robert@school.com', contact: '9876543210' },
  { id: 2, name: 'Ms. Emily Davis', designation: 'Vice Principal', department: 'Administration', email: 'emily@school.com', contact: '9876543211' },
  { id: 3, name: 'Mr. James Wilson', designation: 'Math Teacher', department: 'Mathematics', email: 'james@school.com', contact: '9876543212' },
  { id: 4, name: 'Ms. Lisa Brown', designation: 'Science Teacher', department: 'Science', email: 'lisa@school.com', contact: '9876543213' },
];

export default function StaffPage() {
  const [staff, setStaff] = useState(initialStaff);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', designation: '', department: '', email: '', contact: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStaff([{ ...form, id: Date.now() }, ...staff]);
    setShowModal(false);
    setForm({ name: '', designation: '', department: '', email: '', contact: '' });
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this staff member?')) {
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
          onClick={() => setShowModal(true)}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4">{s.designation}</td>
                <td className="px-6 py-4">{s.department}</td>
                <td className="px-6 py-4">{s.email}</td>
                <td className="px-6 py-4">{s.contact}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="text-indigo-600 hover:text-indigo-800">Edit</button>
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
            <h2 className="text-xl font-bold mb-4">Add Staff</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {['name', 'designation', 'department', 'email', 'contact'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={(form as any)[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  Add
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
