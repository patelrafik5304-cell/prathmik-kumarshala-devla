'use client';

import { useState } from 'react';
import { Save, Globe } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

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

  const handleChange = (key: string, value: any) => { setSettings({ ...settings, [key]: value }); };

  const handleSave = () => { alert('Website settings saved successfully!'); setTimeout(() => window.location.reload(), 500); };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Website Content Control</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage public website content and visibility</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Globe className="w-5 h-5 text-blue-600" /></div>
            <h2 className="text-lg font-semibold text-gray-800">School Information</h2>
          </div>
          <div className="space-y-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">School Name</label><input type="text" value={settings.schoolName} onChange={(e) => handleChange('schoolName', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Tagline</label><input type="text" value={settings.tagline} onChange={(e) => handleChange('tagline', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label><input type="color" value={settings.primaryColor} onChange={(e) => handleChange('primaryColor', e.target.value)} className="w-full h-12 border-2 border-gray-200 rounded-xl cursor-pointer" /></div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Hero Section</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Hero Title</label><input type="text" value={settings.heroTitle} onChange={(e) => handleChange('heroTitle', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Hero Description</label><textarea value={settings.heroDescription} onChange={(e) => handleChange('heroDescription', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" rows={3} /></div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Module Visibility</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'showResults', label: 'Show Results to Students' },
              { key: 'showAttendance', label: 'Show Attendance to Students' },
              { key: 'showGallery', label: 'Show Gallery on Website' },
              { key: 'showNotices', label: 'Show Notices on Website' },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="relative">
                  <input type="checkbox" checked={(settings as any)[item.key]} onChange={(e) => handleChange(item.key, e.target.checked)} className="sr-only peer" />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                    {(settings as any)[item.key] && (<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>)}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Button onClick={handleSave}><Save className="w-4 h-4" /> Save Changes</Button>
      </div>
    </div>
  );
}
