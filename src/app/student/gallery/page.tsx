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
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => setGalleryItems(Array.isArray(data) ? data : []));
  }, []);

  const categories = ['All', ...Array.from(new Set(galleryItems.map((g) => g.category)))];
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

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No images in the gallery yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition cursor-pointer"
              onClick={() => setSelectedImage(item)}
            >
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
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.imageUrl} alt={selectedImage.title} className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
            <div className="bg-white rounded-b-xl p-4 -mt-1">
              <h3 className="font-semibold text-gray-800">{selectedImage.title}</h3>
              <p className="text-sm text-gray-600">{selectedImage.description}</p>
              <p className="text-xs text-gray-400 mt-1">{selectedImage.date} · {selectedImage.category}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
