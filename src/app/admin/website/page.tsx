'use client';

import { useState } from 'react';

const initialSettings = {
  schoolName: 'Prathmik Kumarshala',
  tagline: 'Excellence in Education',
  primaryColor: '#4F46E5',
  showResults: true,
  showAttendance: true,
  showGallery: true,
  showNotices: true,
  heroTitle: 'Welcome to Our School',
  heroDescription: 'Empowering students with quality education and modern learning tools',
};

export default function WebsiteControl() {
  const [settings, setSettings] = useState(initialSettings);

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    alert('Website settings saved successfully!');
    console.log('Settings:', settings);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Website Content Control</h1>
      <p className="text-gray-500 mb-8">Manage public website content and visibility</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* School Info */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">School Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
              <input
                type="text"
                value={settings.schoolName}
                onChange={(e) => handleChange('schoolName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => handleChange('heroTitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Description</label>
              <textarea
                value={settings.heroDescription}
                onChange={(e) => handleChange('heroDescription', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Visibility Controls */}
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Module Visibility</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'showResults', label: 'Show Results to Students' },
              { key: 'showAttendance', label: 'Show Attendance to Students' },
              { key: 'showGallery', label: 'Show Gallery on Website' },
              { key: 'showNotices', label: 'Show Notices on Website' },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={(settings as any)[item.key]}
                  onChange={(e) => handleChange(item.key, e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
                <span className="text-gray-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
