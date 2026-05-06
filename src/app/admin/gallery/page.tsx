'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';

interface GalleryItem {
  _id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  date: string;
}

export default function GalleryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Events', description: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetch('/api/gallery').then((r) => r.json()).then((data) => setImages(Array.isArray(data) ? data : []));
  }, []);

  const refetch = () => { fetch('/api/gallery').then((r) => r.json()).then((data) => setImages(Array.isArray(data) ? data : [])); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category', form.category);
    formData.append('description', form.description);
    if (imageFile) formData.append('image', imageFile);
    const res = await fetch('/api/gallery', { method: 'POST', body: formData });
    if (res.ok) { setTimeout(() => window.location.reload(), 500); }
    else { alert('Upload failed'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const categories = ['all', ...new Set(images.map((i) => i.category))];
  const filtered = filterCategory === 'all' ? images : images.filter((i) => i.category === filterCategory);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Gallery Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage school photos and videos</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Upload Media</Button>
      </div>

      {images.length > 0 && (
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterCategory === cat ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={<ImageIcon className="w-8 h-8" />} title="No images yet" description="Upload your first school photo to get started" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((img) => (
            <Card key={img._id} className="overflow-hidden group">
              <div className="h-48 overflow-hidden relative cursor-pointer" onClick={() => setLightbox(img.imageUrl)}>
                {img.imageUrl ? (
                  <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-white/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{img.title}</h3>
                  <Badge variant="info">{img.category}</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-1 truncate">{img.description}</p>
                <p className="text-xs text-gray-400 mb-3">{img.date}</p>
                <div className="flex gap-2">
                  {isAdmin && (
                    <Button variant="ghost" className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(img._id)}><Trash2 className="w-3.5 h-3.5" /> Delete</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setForm({ title: '', category: 'Events', description: '' }); setImageFile(null); }} title="Upload Media">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" required /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all bg-white"><option>Events</option><option>Academic</option><option>Sports</option><option>Infrastructure</option></select></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" rows={3} /></div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">File</label>
            <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-blue-600" /></div>
              <div><span className="text-sm text-primary font-medium">{imageFile ? imageFile.name : 'Choose Image'}</span><p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p></div>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" />
            </label>
            {imageFile && (<button type="button" onClick={() => setImageFile(null)} className="mt-2 text-red-600 text-sm hover:underline">Remove</button>)}
          </div>
          <div className="flex gap-3 pt-2"><Button type="submit" className="flex-1">Upload</Button><Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowModal(false); setForm({ title: '', category: 'Events', description: '' }); setImageFile(null); }}>Cancel</Button></div>
        </form>
      </Modal>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300"><X className="w-8 h-8" /></button>
          <img src={lightbox} alt="Gallery" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl animate-scale-in" />
        </div>
      )}
    </div>
  );
}
