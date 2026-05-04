'use client';

import { useState, useEffect } from 'react';

interface StaffMember {
  id: string;
  name: string;
  designation: string;
  photo?: string;
}

export default function StudentStaff() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);

  useEffect(() => {
    fetch('/api/staff')
      .then((r) => r.json())
      .then((data) => setStaffMembers(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">School Staff</h1>
      <p className="text-gray-500 mb-8">Get to know our teaching and administrative staff</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffMembers.length === 0 && (
          <p className="text-gray-500 text-center py-12 col-span-full">No staff members found.</p>
        )}
        {staffMembers.map((staff) => (
          <div key={staff.id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
            {staff.photo ? (
              <img src={staff.photo} alt={staff.name} className="w-16 h-16 rounded-full object-cover mb-4 border-2 border-indigo-100" />
            ) : (
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl font-bold">{staff.name.charAt(0)}</span>
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-800">{staff.name}</h3>
            <p className="text-indigo-600 text-sm">{staff.designation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
