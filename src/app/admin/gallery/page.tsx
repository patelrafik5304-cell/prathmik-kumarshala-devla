'use client';

import { useState, useEffect } from 'react';

interface GalleryItem {
  _id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  date: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Events', description: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => setImages(Array.isArray(data) ? data : []));
  }, []);

  const refetch = () => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => setImages(Array.isArray(data) ? data : []));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category', form.category);
    formData.append('description', form.description);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    await fetch('/api/gallery', {
      method: 'POST',
      body: formData,
    });
    setShowModal(false);
    setForm({ title: '', category: 'Events', description: '' });
    setImageFile(null);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
    setImages(images.filter((i) => i._id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gallery Management</h1>
          <p className="text-gray-500">Manage school photos and videos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Upload Media
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {images.map((img) => (
          <div key={img._id} className="bg-white rounded-xl shadow overflow-hidden">
            <div className="h-48 overflow-hidden">
              {img.imageUrl ? (
                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
              ) : (
                <div className="h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-4xl">Gallery</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{img.title}</h3>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">{img.category}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{img.description}</p>
              <p className="text-xs text-gray-400">{img.date}</p>
              <div className="flex gap-2 mt-3">
                <button className="text-indigo-600 hover:text-indigo-800 text-sm">Edit</button>
                <button onClick={() => handleDelete(img._id)} className="text-red-600 hover:text-red-800 text-sm">
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
            <h2 className="text-xl font-bold mb-4">Upload Media</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option>Events</option>
                  <option>Academic</option>
                  <option>Sports</option>
                  <option>Infrastructure</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  Upload
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
