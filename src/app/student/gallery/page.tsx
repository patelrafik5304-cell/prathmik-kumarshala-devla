'use client';

import { useState } from 'react';

const galleryItems = [
  { id: 1, title: 'Annual Day 2026', category: 'Events', description: 'Students performing at annual day celebration', date: '2026-04-15' },
  { id: 2, title: 'Science Fair', category: 'Academic', description: 'Student projects on display at the science fair', date: '2026-03-20' },
  { id: 3, title: 'Sports Day', category: 'Sports', description: 'Annual sports meet highlights and winners', date: '2026-02-10' },
  { id: 4, title: 'Library', category: 'Infrastructure', description: 'Our newly renovated school library', date: '2026-01-15' },
  { id: 5, title: 'Computer Lab', category: 'Infrastructure', description: 'Modern computer lab with latest systems', date: '2025-12-20' },
  { id: 6, title: 'Art Competition', category: 'Events', description: 'Students showcasing their art skills', date: '2025-11-15' },
];

export default function StudentGallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Events', 'Academic', 'Sports', 'Infrastructure'];
  const filtered = selectedCategory === 'All' ? galleryItems : galleryItems.filter((g) => g.category === selectedCategory);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">School Gallery</h1>
      <p className="text-gray-500 mb-8">Explore school memories and events</p>

      {/* Category Filter */}
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

      {/* Gallery Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition">
            <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-4xl">🖼️</span>
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
