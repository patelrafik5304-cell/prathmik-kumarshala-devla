'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function StudentProfile() {
  const { user } = useAuth();
  const [student, setStudent] = useState<{
    name: string;
    username: string;
    class: string;
    photo?: string;
    dateOfBirth?: string;
    parentName?: string;
    contactNumber?: string;
    address?: string;
  } | null>(null);
  const [attendance, setAttendance] = useState(0);

  useEffect(() => {
    if (!user) return;

    fetch('/api/students')
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        const me = all.find((s: any) => s.username === user.username);
        if (me) setStudent(me);
      });

    fetch(`/api/attendance?studentUsername=${user.username}`)
      .then((r) => r.json())
      .then((data) => {
        const records = Array.isArray(data) ? data : [];
        const total = records.length;
        const present = records.filter((r: any) => r.status === 'present').length;
        const pct = total > 0 ? Math.round((present / total) * 100) : 0;
        setAttendance(pct);
      });
  }, [user]);

  if (!user || !student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 h-32" />
        <div className="px-8 pb-8">
          <div className="-mt-12 mb-4">
            {student.photo ? (
              <img src={student.photo} alt={student.name} className="w-24 h-24 rounded-full border-4 border-white object-cover" />
            ) : (
              <div className="w-24 h-24 bg-indigo-600 rounded-full border-4 border-white flex items-center justify-center">
                <span className="text-white text-3xl font-bold">{student.name.charAt(0)}</span>
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
          <p className="text-gray-500 mb-6">Username: {student.username} | Class: {student.class}</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-b pb-3">
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium text-gray-800">{student.username}</p>
            </div>
            <div className="border-b pb-3">
              <p className="text-sm text-gray-500">Class</p>
              <p className="font-medium text-gray-800">{student.class}</p>
            </div>
            {student.dateOfBirth && (
              <div className="border-b pb-3">
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium text-gray-800">{student.dateOfBirth}</p>
              </div>
            )}
            {student.parentName && (
              <div className="border-b pb-3">
                <p className="text-sm text-gray-500">Parent Name</p>
                <p className="font-medium text-gray-800">{student.parentName}</p>
              </div>
            )}
            {student.contactNumber && (
              <div className="border-b pb-3">
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium text-gray-800">{student.contactNumber}</p>
              </div>
            )}
            {student.address && (
              <div className="border-b pb-3">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-800">{student.address}</p>
              </div>
            )}
            <div className="border-b pb-3">
              <p className="text-sm text-gray-500">Attendance</p>
              <p className="font-medium text-gray-800">{attendance}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
