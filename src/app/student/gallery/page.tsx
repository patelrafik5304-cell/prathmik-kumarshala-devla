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

export default function StudentGallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => setGalleryItems(Array.isArray(data) ? data : []));
  }, []);

  const categories = ['All', 'Events', 'Academic', 'Sports', 'Infrastructure'];
  const filtered = selectedCategory === 'All' ? galleryItems : galleryItems.filter((g) => g.category === selectedCategory);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">School Gallery</h1>
      <p className="text-gray-500 mb-8">Explore school memories and events</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition">
            <div className="h-48 overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-4xl">Gallery</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">{item.category}</span>
              </div>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="text-xs text-gray-400 mt-2">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
