'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Bell } from 'lucide-react';

export default function StudentNotices() {
  const [notices, setNotices] = useState<{ id: string; title: string; content: string; priority: string; isActive: boolean; date: string }[]>([]);

  useEffect(() => {
    fetch('/api/announcements').then((r) => r.json()).then((data) => setNotices(Array.isArray(data) ? data.filter((n: any) => n.isActive) : []));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">School Notices</h1>
        <p className="text-gray-500 mt-1 text-sm">Stay updated with school announcements</p>
      </div>

      {notices.length === 0 ? (
        <EmptyState icon={<Bell className="w-8 h-8" />} title="No notices available" description="Check back later for updates" />
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <Card key={n.id} className="p-6">
              <div className="flex items-start justify-between mb-3 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{n.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{n.date}</p>
                </div>
                <Badge variant={n.priority === 'high' ? 'danger' : n.priority === 'medium' ? 'warning' : 'success'}>{n.priority}</Badge>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{n.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
