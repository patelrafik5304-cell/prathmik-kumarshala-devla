'use client';

import { useState, useEffect } from 'react';
import { Plus, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

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
    reader.onload = (ev) => { setForm({ ...form, photo: ev.target?.result as string }); };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetch('/api/staff').then((r) => r.json()).then((data) => setStaff(data));
  }, []);

  const refetch = () => { fetch('/api/staff').then((r) => r.json()).then((data) => setStaff(data)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      await fetch('/api/staff', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingStaff.id, ...form }) });
      setEditingStaff(null);
    } else {
      await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage teaching and non-teaching staff</p>
        </div>
        <Button variant="primary" onClick={() => { setEditingStaff(null); setForm({ name: '', designation: '', photo: '' }); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Add Staff
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {s.photo ? (
                        <img src={s.photo} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-gray-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{s.designation}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" className="px-3 py-1.5 text-sm" onClick={() => handleEdit(s)}>Edit</Button>
                      <Button variant="ghost" className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(s.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No staff members found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingStaff ? 'Edit Staff' : 'Add Staff'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Designation</label>
            <input type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
            <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 hover:bg-gray-50 transition-colors">
              {form.photo ? (
                <img src={form.photo} alt="Preview" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
              )}
              <div>
                <span className="text-sm text-primary font-medium">{form.photo ? 'Change Photo' : 'Choose Photo'}</span>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {form.photo && (
              <button type="button" onClick={() => setForm({ ...form, photo: '' })} className="mt-2 text-red-600 text-sm hover:underline">Remove</button>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">{editingStaff ? 'Update' : 'Add'}</Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
