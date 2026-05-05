'use client';

import { useState, useEffect } from 'react';
import { Plus, Megaphone } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  date: string;
  type?: 'general' | 'holiday' | 'vacation';
  startDate?: string;
  endDate?: string;
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'medium', type: 'general', startDate: '', endDate: '' });
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  useEffect(() => {
    fetch('/api/announcements').then((r) => r.json()).then((data) => setAnnouncements(data));
  }, []);

  const refetch = () => { fetch('/api/announcements').then((r) => r.json()).then((data) => setAnnouncements(data)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await fetch('/api/announcements', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingItem.id, ...form }) });
      setEditingItem(null);
    } else {
      await fetch('/api/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, date: new Date().toISOString().split('T')[0], isActive: true }) });
    }
    setShowModal(false);
    setForm({ title: '', content: '', priority: 'medium', type: 'general', startDate: '', endDate: '' });
    refetch();
  };

  const handleEdit = (item: Announcement) => {
    setEditingItem(item);
    setForm({ title: item.title, content: item.content, priority: item.priority, type: item.type || 'general', startDate: item.startDate || '', endDate: item.endDate || '' });
    setShowModal(true);
  };

  const toggleActive = async (item: Announcement) => {
    // Optimistic update
    setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, isActive: !a.isActive } : a));
    try {
      await fetch('/api/announcements', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, isActive: !item.isActive }) });
    } catch (err) {
      // Revert on error
      setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, isActive: item.isActive } : a));
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    try {
      await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      refetch(); // Revert on error
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Announcements</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage school notices and announcements</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> New Announcement</Button>
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <Card key={a.id} className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <Badge variant={a.priority === 'high' ? 'danger' : a.priority === 'medium' ? 'warning' : 'success'}>{a.priority}</Badge>
                  <span className="text-sm text-gray-500">{a.date}</span>
                  {a.startDate && a.endDate && (
                    <span className="text-sm text-blue-600">📅 {a.startDate} to {a.endDate}</span>
                  )}
                  {!a.isActive && (<Badge variant="default">Inactive</Badge>)}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{a.title}</h3>
                <p className="text-gray-600 mt-1 text-sm">{a.content}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="ghost" className={`px-3 py-1.5 text-sm ${a.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`} onClick={() => toggleActive(a)}>{a.isActive ? 'Deactivate' : 'Activate'}</Button>
                <Button variant="ghost" className="px-3 py-1.5 text-sm" onClick={() => handleEdit(a)}>Edit</Button>
                {isAdmin && (
                  <Button variant="ghost" className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(a.id)}>Delete</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {announcements.length === 0 && (
          <Card className="p-12 text-center">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No announcements yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first announcement to get started</p>
          </Card>
        )}
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditingItem(null); setForm({ title: '', content: '', priority: 'medium', type: 'general' }); }} title={editingItem ? 'Edit Announcement' : 'New Announcement'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" required /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Content</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" rows={3} required /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all bg-white"><option value="general">General Notice</option><option value="holiday">Holiday</option><option value="vacation">Vacation</option></select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all bg-white"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
          <div className="flex gap-3 pt-2"><Button type="submit" className="flex-1">{editingItem ? 'Update' : 'Publish'}</Button><Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowModal(false); setEditingItem(null); setForm({ title: '', content: '', priority: 'medium', type: 'general' }); }}>Cancel</Button></div>
        </form>
      </Modal>
    </div>
  );
}
