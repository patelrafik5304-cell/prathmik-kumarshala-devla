'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, User, Calendar, Phone, MapPin, Percent } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function StudentProfile() {
  const { user } = useAuth();
  const [student, setStudent] = useState<{ name: string; username: string; class: string; photo?: string; dateOfBirth?: string; parentName?: string; contactNumber?: string; address?: string } | null>(null);
  const [attendance, setAttendance] = useState(0);
  const [showPhoto, setShowPhoto] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch('/api/students').then((r) => r.json()).then((data) => {
      const all = Array.isArray(data) ? data : [];
      const me = all.find((s: any) => s.username === user.username);
      if (me) setStudent(me);
    });
    fetch(`/api/attendance?studentUsername=${user.username}`).then((r) => r.json()).then((data) => {
      const records = Array.isArray(data) ? data : [];
      const total = records.length;
      const present = records.filter((r: any) => r.status === 'present').length;
      setAttendance(total > 0 ? Math.round((present / total) * 100) : 0);
    });
  }, [user]);

  if (!user || !student) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading profile...</p></div>;

  const attendanceColor = attendance >= 75 ? 'success' : attendance >= 50 ? 'warning' : 'danger';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500 mt-1 text-sm">Your personal information</p>
      </div>

      <Card className="overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary to-purple-700 h-32" />
        <div className="px-6 lg:px-8 pb-8">
          <div className="-mt-12 mb-4">
            {student.photo ? (
              <img src={student.photo} alt={student.name} onClick={() => setShowPhoto(true)} className="w-24 h-24 rounded-full border-4 border-white object-cover cursor-pointer shadow-lg hover:shadow-xl transition-shadow" />
            ) : (
              <div className="w-24 h-24 bg-primary rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold">{student.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
          <p className="text-gray-500 text-sm">Class {student.class} | Username: {student.username}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><User className="w-5 h-5 text-blue-600" /></div><div><p className="text-xs text-gray-500">Username</p><p className="font-semibold text-gray-800 text-sm">{student.username}</p></div></div></Card>
        <Card className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Calendar className="w-5 h-5 text-green-600" /></div><div><p className="text-xs text-gray-500">Class</p><p className="font-semibold text-gray-800 text-sm">{student.class}</p></div></div></Card>
        <Card className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center"><Percent className="w-5 h-5 text-amber-600" /></div><div><p className="text-xs text-gray-500">Attendance</p><Badge variant={attendanceColor as any}>{attendance}%</Badge></div></div></Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Details</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {student.dateOfBirth && (<div className="border-b pb-3"><p className="text-xs text-gray-500 mb-1">Date of Birth</p><p className="font-medium text-gray-800">{student.dateOfBirth}</p></div>)}
          {student.parentName && (<div className="border-b pb-3"><p className="text-xs text-gray-500 mb-1">Parent Name</p><p className="font-medium text-gray-800">{student.parentName}</p></div>)}
          {student.contactNumber && (<div className="border-b pb-3"><p className="text-xs text-gray-500 mb-1">Contact</p><p className="font-medium text-gray-800 flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />{student.contactNumber}</p></div>)}
          {student.address && (<div className="border-b pb-3"><p className="text-xs text-gray-500 mb-1">Address</p><p className="font-medium text-gray-800 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" />{student.address}</p></div>)}
        </div>
      </Card>

      {showPhoto && student.photo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowPhoto(false)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300"><X className="w-8 h-8" /></button>
          <img src={student.photo} alt={student.name} className="max-w-md max-h-[80vh] rounded-xl shadow-2xl animate-scale-in" />
        </div>
      )}
    </div>
  );
}
