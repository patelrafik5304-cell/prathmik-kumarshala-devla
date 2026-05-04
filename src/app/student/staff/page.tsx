'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

export default function StudentStaff() {
  const [staffMembers, setStaffMembers] = useState<{ id: string; name: string; designation: string; photo?: string }[]>([]);

  useEffect(() => {
    fetch('/api/staff').then((r) => r.json()).then((data) => setStaffMembers(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">School Staff</h1>
        <p className="text-gray-500 mt-1 text-sm">Get to know our teaching and administrative staff</p>
      </div>

      {staffMembers.length === 0 ? (
        <EmptyState icon={<Users className="w-8 h-8" />} title="No staff members found" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffMembers.map((staff) => (
            <Card key={staff.id} className="p-6 text-center hover:-translate-y-1">
              {staff.photo ? (
                <img src={staff.photo} alt={staff.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-blue-100" />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-3xl font-bold">{staff.name.charAt(0)}</span>
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-800">{staff.name}</h3>
              <p className="text-primary text-sm font-medium mt-1">{staff.designation}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
