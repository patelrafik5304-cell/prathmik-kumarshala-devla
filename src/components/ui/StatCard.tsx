'use client';

import { useEffect, useState } from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accentColor: string;
}

const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
  blue: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600', iconBg: 'bg-blue-100' },
  green: { bg: 'from-green-500 to-green-600', text: 'text-green-600', iconBg: 'bg-green-100' },
  amber: { bg: 'from-amber-500 to-amber-600', text: 'text-amber-600', iconBg: 'bg-amber-100' },
  purple: { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600', iconBg: 'bg-purple-100' },
  red: { bg: 'from-red-500 to-red-600', text: 'text-red-600', iconBg: 'bg-red-100' },
};

export default function StatCard({ icon, label, value, accentColor }: StatCardProps) {
  const [visible, setVisible] = useState(false);
  const colors = colorMap[accentColor] || colorMap.blue;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`motion-card bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`w-11 h-11 sm:w-12 sm:h-12 ${colors.iconBg} rounded-xl flex items-center justify-center ${colors.text}`}>
          {icon}
        </div>
      </div>
      <div className={`h-1 w-full mt-4 rounded-full bg-gradient-to-r ${colors.bg}`} />
    </div>
  );
}
