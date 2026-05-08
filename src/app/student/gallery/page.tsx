'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Image as ImageIcon, X } from 'lucide-react';

export default function StudentGallery() {
  const [galleryItems, setGalleryItems] = useState<{ _id: string; title: string; category: string; description: string; imageUrl: string; date: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<{ title: string; description: string; category: string; date: string; imageUrl: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/gallery?t=${Date.now()}`).then((r) => r.json()).then((data) => setGalleryItems(Array.isArray(data) ? data : [])).finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(galleryItems.map((g) => g.category)))];
  const filtered = selectedCategory === 'All' ? galleryItems : galleryItems.filter((g) => g.category === selectedCategory);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">School Gallery</h1>
        <p className="text-gray-500 mt-1 text-sm">Explore school memories and events</p>
      </div>

      {galleryItems.length > 0 && (
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat}</button>
            ))}
          </div>
        </Card>
      )}

      {loading && galleryItems.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500">Images loading...</p>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<ImageIcon className="w-8 h-8" />} title="No images uploaded yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <Card key={item._id} className="overflow-hidden group cursor-pointer" onClick={() => setSelectedImage(item)}>
              <div className="h-48 overflow-hidden relative">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center"><ImageIcon className="w-12 h-12 text-white/50" /></div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{item.title}</h3>
                  <Badge variant="info">{item.category}</Badge>
                </div>
                <p className="text-sm text-gray-500 truncate">{item.description}</p>
                <p className="text-xs text-gray-400 mt-1">{item.date}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300"><X className="w-8 h-8" /></button>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.imageUrl} alt={selectedImage.title} loading="lazy" className="w-full max-h-[80vh] object-contain rounded-t-xl animate-scale-in" />
            <div className="bg-white rounded-b-xl p-4 -mt-1">
              <h3 className="font-semibold text-gray-800">{selectedImage.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedImage.description}</p>
              <p className="text-xs text-gray-400 mt-2">{selectedImage.date} · {selectedImage.category}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
