'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Eye, EyeOff, X, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Student {
  id: string;
  username: string;
  name: string;
  class: string;
  email: string;
  password: string;
  photo?: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCreds, setShowCreds] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ name: '', class: '', photo: '' });
  const [newCreds, setNewCreds] = useState<{ username: string; password: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setForm({ ...form, photo: ev.target?.result as string }); };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetch('/api/students').then((r) => r.json()).then((data) => setStudents(Array.isArray(data) ? data : []));
  }, []);

  const filtered = students.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editingStudent) {
      await fetch('/api/students', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingStudent.id, ...form }) });
      setStudents(students.map((s) => (s.id === editingStudent.id ? { ...s, ...form } : s)));
      setShowModal(false);
      setEditingStudent(null);
      setForm({ name: '', class: '', photo: '' });
    } else {
      const res = await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.id) {
        setStudents([data, ...students]);
        setNewCreds({ username: data.username, password: data.password });
        setShowCreds(true);
        setShowModal(false);
        setForm({ name: '', class: '', photo: '' });
      }
    }
    setLoading(false);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setForm({ name: student.name, class: student.class, photo: student.photo || '' });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      await fetch(`/api/students?id=${id}`, { method: 'DELETE' });
      setStudents(students.filter((s) => s.id !== id));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Students Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage all student records</p>
        </div>
        <Button variant="primary" onClick={() => { setEditingStudent(null); setForm({ name: '', class: '', photo: '' }); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Add Student
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {student.photo ? (
                        <img src={student.photo} alt={student.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-semibold">
                          {student.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                      )}
                      <span className="font-medium text-gray-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="info">Class {student.class}</Badge>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-primary font-medium">{student.username}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {visiblePasswords[student.id] ? student.password : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                      </span>
                      <button onClick={() => setVisiblePasswords((prev) => ({ ...prev, [student.id]: !prev[student.id] }))} className="text-gray-400 hover:text-gray-600 transition-colors">
                        {visiblePasswords[student.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" className="px-3 py-1.5 text-sm" onClick={() => handleEdit(student)}>Edit</Button>
                      <Button variant="ghost" className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(student.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingStudent ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
            <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" required>
              <option value="">Select class</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((c) => (<option key={c} value={c}>Class {c}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
            <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 hover:bg-gray-50 transition-colors">
              {form.photo ? (
                <img src={form.photo} alt="Preview" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
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
          {!editingStudent && (
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">Username and password will be auto-generated for the student.</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">{loading ? 'Creating...' : editingStudent ? 'Update' : 'Add'}</Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showCreds} onClose={() => setShowCreds(false)} title="Student Created">
        <p className="text-sm text-gray-500 mb-4">Save these credentials for the student:</p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm text-gray-600">Username</span><span className="font-mono font-bold text-green-700">{newCreds?.username}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-600">Password</span><span className="font-mono font-bold text-green-700">{newCreds?.password}</span></div>
          </div>
        </div>
        <Button onClick={() => setShowCreds(false)} className="w-full">Done</Button>
      </Modal>
    </div>
  );
}
