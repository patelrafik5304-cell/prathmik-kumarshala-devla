'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Eye, EyeOff, X, User, Upload, Download, FileSpreadsheet, Trash2, Check, FileDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';

interface Student {
  id: string;
  studentId: string;
  childUid: string;
  username: string;
  name: string;
  class: string;
  email: string;
  password: string;
  photo?: string;
}

interface CsvRow {
  name: string;
  childUid: string;
  class: string;
}

export default function StudentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showCreds, setShowCreds] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ name: '', childUid: '', class: '', photo: '' });
  const [newCreds, setNewCreds] = useState<{ username: string; password: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvResult, setCsvResult] = useState<{ success: number; total: number; errors: string[]; done?: boolean; credentials?: Array<{ name: string; username: string; password: string }> } | null>(null);
  const [bulkDeleteClass, setBulkDeleteClass] = useState('');
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteCount, setBulkDeleteCount] = useState(0);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteFromClass, setPromoteFromClass] = useState('');
  const [promoteToClass, setPromoteToClass] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setForm({ ...form, photo: ev.target?.result as string }); };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const r = await fetch('/api/students');
        const data = await r.json();
        console.log('Loaded', data.length, 'students');
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      }
    };
    loadStudents();
  }, []);

  const filtered = students.filter(
    (s) => (filterClass === 'all' || s.class === filterClass) &&
           (s.name.toLowerCase().includes(search.toLowerCase()) || s.username.toLowerCase().includes(search.toLowerCase()) || s.childUid.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editingStudent) {
      await fetch('/api/students', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingStudent.id, ...form }) });
      setStudents(students.map((s) => (s.id === editingStudent.id ? { ...s, ...form } : s)));
      setShowModal(false);
      setEditingStudent(null);
      setForm({ name: '', childUid: '', class: '', photo: '' });
    } else {
      const res = await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.id) {
        setStudents([data, ...students]);
        setNewCreds({ username: data.username, password: data.password });
        setShowCreds(true);
        setShowModal(false);
        setForm({ name: '', childUid: '', class: '', photo: '' });
      }
    }
    setLoading(false);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setForm({ name: student.name, childUid: student.childUid, class: student.class, photo: student.photo || '' });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    await fetch(`/api/students?id=${studentToDelete.id}`, { method: 'DELETE' });
    setStudents(students.filter((s) => s.id !== studentToDelete.id));
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const openDeleteModal = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleBulkDelete = async () => {
    console.log('handleBulkDelete called, bulkDeleteClass:', bulkDeleteClass);
    if (!bulkDeleteClass) {
      alert('Please select a class first');
      return;
    }
    setLoading(true);
    try {
      const url = `/api/students?class=${bulkDeleteClass}`;
      console.log('Deleting with URL:', url);
      const res = await fetch(url, { method: 'DELETE' });
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      if (data.success) {
        setShowBulkDeleteModal(false);
        setBulkDeleteCount(data.deletedCount);
        const displayClass = bulkDeleteClass === '0' ? 'BALVATIKA' : `Class ${bulkDeleteClass}`;
        setSavedMsg(`Deleted ${data.deletedCount} students from ${displayClass}`);
        fetch('/api/students').then((r) => r.json()).then((d) => setStudents(Array.isArray(d) ? d : []));
        setTimeout(() => setSavedMsg(''), 5000);
      } else {
        alert('Delete failed: ' + (data.error || 'Unknown error'));
      }
    } catch (e: any) {
      console.error('Bulk delete failed', e);
      alert('Delete failed: ' + e.message);
    }
    setLoading(false);
  };

  const handlePromoteStudents = async () => {
    if (!promoteFromClass || !promoteToClass) return;
    setLoading(true);
    try {
      const res = await fetch('/api/students/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromClass: promoteFromClass, toClass: promoteToClass }),
      });
      const data = await res.json();
      if (data.success) {
        const fromDisplay = promoteFromClass === '0' ? 'BALVATIKA' : `Class ${promoteFromClass}`;
        const toDisplay = promoteToClass === '0' ? 'BALVATIKA' : `Class ${promoteToClass}`;
        setSavedMsg(`Promoted ${data.updatedCount} students from ${fromDisplay} to ${toDisplay}`);
        fetch('/api/students').then((r) => r.json()).then((d) => setStudents(Array.isArray(d) ? d : []));
        setTimeout(() => setSavedMsg(''), 5000);
      }
    } catch (e) {
      console.error('Promote failed', e);
    }
    setLoading(false);
    setShowPromoteModal(false);
    setPromoteFromClass('');
    setPromoteToClass('');
  };

  const parseCsv = (text: string): CsvRow[] => {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    const rows: CsvRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length >= 3) {
        rows.push({ name: cols[0].trim(), childUid: cols[1].trim(), class: cols[2].trim() });
      }
    }
    return rows;
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
    }
    result.push(current);
    return result;
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      alert('File too large. Maximum size is 1MB.');
      return;
    }
    
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a .csv file.');
      return;
    }
    
    setCsvFile(file);
    setCsvResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCsv(text);
      if (rows.length > 100) {
        alert('Maximum 100 students allowed per import. Please split your file.');
        return;
      }
      setCsvRows(rows);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (csvRows.length === 0) return;
    setCsvLoading(true);
    try {
      const res = await fetch('/api/students/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: csvRows }),
      });
      const data = await res.json();
      console.log('Bulk import response:', data);
      setCsvResult({ 
        success: data.success, 
        total: csvRows.length, 
        errors: data.errors || [],
        credentials: data.credentials || []
      });
      if (data.success > 0) {
        const r = await fetch('/api/students');
        const d = await r.json();
        setStudents(Array.isArray(d) ? d : []);
        setCsvResult({ 
          success: csvResult?.success || 0, 
          total: csvResult?.total || 0, 
          errors: csvResult?.errors || [], 
          credentials: csvResult?.credentials, 
          done: true 
        });
      }
    } catch (err) {
      console.error('Bulk import error:', err);
      setCsvResult({ success: 0, total: csvRows.length, errors: ['Failed to import'] });
    }
    setCsvLoading(false);
  };

  const downloadTemplate = () => {
    const csv = 'name,childuid,class\njohn,43552,Class 2\njane,35364,Class 3';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadStudentPDF = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const studentsToShow = filtered;
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Credentials</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #1e3a8a; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #1e3a8a; color: white; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:hover { background: #f5f5f5; }
          .info { margin-bottom: 10px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Student Credentials Report</h1>
        <p class="info">Generated on ${new Date().toLocaleDateString()}</p>
        <p class="info">Total Students: ${studentsToShow.length}</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Password</th>
              <th>Class</th>
            </tr>
          </thead>
          <tbody>
    `;

    studentsToShow.forEach(student => {
      html += `
        <tr>
          <td>${student.name}</td>
          <td>${student.username}</td>
          <td>${student.password}</td>
          <td>${student.class === '0' ? 'BALVATIKA' : 'Class ' + student.class}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getClassDisplay = (cls: string) => cls === '0' ? 'BALVATIKA' : `Class ${cls}`;

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Students Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage all student records</p>
        </div>
        
        {/* Mobile action bar - visible on small screens */}
        <div className="flex sm:hidden gap-2">
          <Button variant="secondary" onClick={downloadStudentPDF} className="flex-1 justify-center py-3 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
            <FileDown className="w-5 h-5" /> Download List
          </Button>
          <Button variant="secondary" onClick={() => { setShowCsvModal(true); setCsvRows([]); setCsvFile(null); setCsvResult(null); }} className="flex-1 justify-center py-3">
            <Upload className="w-5 h-5" /> Upload CSV
          </Button>
          <Button variant="primary" onClick={() => { setEditingStudent(null); setForm({ name: '', childUid: '', class: '', photo: '' }); setShowModal(true); }} className="flex-1 justify-center py-3">
            <Plus className="w-5 h-5" /> Add
          </Button>
        </div>
        
        {/* Desktop buttons - hidden on mobile */}
        <div className="hidden sm:flex gap-2">
          <Button variant="secondary" onClick={downloadStudentPDF} className="justify-center">
            <FileDown className="w-4 h-4" /> Download List PDF
          </Button>
          <Button variant="secondary" onClick={() => { setShowCsvModal(true); setCsvRows([]); setCsvFile(null); setCsvResult(null); }} className="justify-center">
            <Upload className="w-4 h-4" /> Upload CSV
          </Button>
          <Button variant="primary" onClick={() => { setEditingStudent(null); setForm({ name: '', childUid: '', class: '', photo: '' }); setShowModal(true); }} className="justify-center">
            <Plus className="w-4 h-4" /> Add Student
          </Button>
        </div>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, username, or child UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
            />
          </div>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all bg-white min-w-[160px]"
          >
            <option value="all">All Classes</option>
            <option value="0">BALVATIKA</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (<option key={c} value={c}>Class {c}</option>))}
          </select>
        </div>
      </Card>

      {isAdmin && (
        <Card className="p-6 mb-6 border-2 border-red-200 bg-red-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800">Danger Zone</h3>
              <p className="text-sm text-red-600 mt-1">Bulk delete all students from a selected class. This will also delete all attendance and result records for these students.</p>
            </div>
            <div className="flex gap-3 items-end">
              <div>
                <select
                  value={bulkDeleteClass}
                  onChange={(e) => setBulkDeleteClass(e.target.value)}
                  className="px-4 py-2.5 border-2 border-red-300 rounded-xl outline-none focus:border-red-500 bg-white"
                >
                  <option value="">Select Class</option>
                  <option value="0">BALVATIKA</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={!bulkDeleteClass}
                onClick={() => setShowBulkDeleteModal(true)}
              >
                Delete All Students of This Class
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isAdmin && (
        <Card className="p-6 mb-6 border-2 border-blue-200 bg-blue-50">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-800">Promote Students to Next Year</h3>
            <p className="text-sm text-blue-600 mt-1">Promote all students from one class to the next (e.g., Class 1 → Class 2). Class 8 students will be graduated.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">From Class</label>
              <select
                value={promoteFromClass}
                onChange={(e) => setPromoteFromClass(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl outline-none focus:border-blue-500 bg-white text-base"
              >
                <option value="">Select class</option>
                <option value="0">BALVATIKA</option>
                {[1, 2, 3, 4, 5, 6, 7].map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-center text-blue-600 font-bold text-xl">
              →
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">To Class</label>
              <select
                value={promoteToClass}
                onChange={(e) => setPromoteToClass(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl outline-none focus:border-blue-500 bg-white text-base"
              >
                <option value="">Select class</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
                <option value="graduated">Graduated</option>
              </select>
            </div>
            <Button
              variant="primary"
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 text-base"
              disabled={!promoteFromClass || !promoteToClass}
              onClick={() => setShowPromoteModal(true)}
            >
              Promote All Students
            </Button>
          </div>
        </Card>
      )}

      {savedMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 text-sm animate-slide-down flex items-center gap-2">
          <Check className="w-4 h-4" /> {savedMsg}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child UID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 font-mono text-sm text-purple-600 font-medium">{student.childUid}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {student.photo ? (
                        <img src={student.photo} alt={student.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-semibold">
                          {student.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                      )}
                      <span className="font-medium text-gray-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="info">{getClassDisplay(student.class)}</Badge>
                  </td>
                  <td className="px-4 py-4 font-mono text-sm text-primary font-medium">{student.username}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {visiblePasswords[student.id] ? student.password : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                      </span>
                      <button onClick={() => setVisiblePasswords((prev) => ({ ...prev, [student.id]: !prev[student.id] }))} className="text-gray-400 hover:text-gray-600 transition-colors">
                        {visiblePasswords[student.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" className="px-3 py-1.5 text-sm" onClick={() => handleEdit(student)}>Edit</Button>
                      {isAdmin && (
                        <Button variant="ghost" className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => openDeleteModal(student)}>Delete</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingStudent ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Child UID</label>
            <input type="text" value={form.childUid} onChange={(e) => setForm({ ...form, childUid: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" required placeholder="e.g. CHILD001" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
            <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all" required>
              <option value="">Select class</option>
              <option value="0">BALVATIKA</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (<option key={c} value={c}>Class {c}</option>))}
            </select>
          </div>
          {!editingStudent && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Photo (Optional)</label>
              <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 hover:bg-gray-50 transition-colors">
                {form.photo ? (
                  <img src={form.photo} alt="Preview" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div>
                  <span className="text-sm text-primary font-medium">{form.photo ? 'Change Photo' : 'Choose Photo'}</span>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {form.photo && (
                <button type="button" onClick={() => setForm({ ...form, photo: '' })} className="mt-2 text-red-600 text-sm hover:underline">Remove</button>
              )}
            </div>
          )}
          {!editingStudent && (
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">Username and password will be auto-generated for the student.</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">{loading ? 'Creating...' : editingStudent ? 'Update' : 'Add'}</Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showCreds} onClose={() => setShowCreds(false)} title="Student Created">
        <p className="text-sm text-gray-500 mb-4">Save these credentials for the student:</p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm text-gray-600">Username</span><span className="font-mono font-bold text-green-700">{newCreds?.username}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-600">Password</span><span className="font-mono font-bold text-green-700">{newCreds?.password}</span></div>
          </div>
        </div>
        <Button onClick={() => setShowCreds(false)} className="w-full">Done</Button>
      </Modal>

      <Modal open={showCsvModal} onClose={() => setShowCsvModal(false)} title="Bulk Import Students" size="lg">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">CSV Format Required</p>
                <p className="text-xs text-blue-600 mt-1">Your CSV must have headers: <code className="bg-blue-100 px-1 rounded">name,childuid,class</code></p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="secondary" onClick={downloadTemplate}>
              <Download className="w-4 h-4" /> Download Template
            </Button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload CSV File</label>
            <label className="flex flex-col items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl px-4 py-8 hover:bg-gray-50 transition-colors">
              <Upload className="w-8 h-8 text-gray-400" />
              <div className="text-center">
                <span className="text-sm text-primary font-medium">{csvFile ? csvFile.name : 'Choose CSV file'}</span>
                <p className="text-xs text-gray-500 mt-1">Only .csv files accepted</p>
              </div>
              <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
            </label>
          </div>

          {csvRows.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview ({csvRows.length} rows)</h3>
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Child UID</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Class</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {csvRows.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-3 py-2">{row.name}</td>
                        <td className="px-3 py-2 font-mono text-xs">{row.childUid}</td>
                        <td className="px-3 py-2">{getClassDisplay(row.class)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {csvResult && (
            <div className={`rounded-xl p-4 ${csvResult.errors.length > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
              <p className="font-semibold text-sm">{csvResult.success}/{csvResult.total} students imported</p>
              {csvResult.success > 0 && csvResult.credentials && (
                <details className="mt-2">
                  <summary className="text-sm text-blue-600 cursor-pointer hover:underline">Show Login Credentials</summary>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1 text-left">Name</th>
                          <th className="px-2 py-1 text-left">Username</th>
                          <th className="px-2 py-1 text-left">Password</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvResult.credentials.map((c: any, i: number) => (
                          <tr key={i} className="border-t">
                            <td className="px-2 py-1">{c.name}</td>
                            <td className="px-2 py-1 font-mono">{c.username}</td>
                            <td className="px-2 py-1 font-mono">{c.password}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}
              {csvResult.errors.length > 0 && (
                <ul className="mt-2 text-xs text-red-600 space-y-1">
                  {csvResult.errors.map((err: string, i: number) => <li key={i}>{err}</li>)}
                </ul>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleBulkImport} loading={csvLoading} disabled={csvRows.length === 0 || (csvResult?.done)} className="flex-1">
              {csvLoading ? 'Importing...' : 'Import All'}
            </Button>
            {csvResult && csvResult.success > 0 ? (
              <Button variant="secondary" className="flex-1" onClick={() => { setShowCsvModal(false); setCsvResult(null); }}>Done</Button>
            ) : (
              <Button variant="secondary" className="flex-1" onClick={() => setShowCsvModal(false)}>Close</Button>
            )}
          </div>
        </div>
      </Modal>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Delete">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Are you sure you want to delete</p>
          <p className="font-semibold text-gray-800 mb-6">{studentToDelete?.name}?</p>
          <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(false)}>No</Button>
            <Button variant="primary" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>Yes</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showBulkDeleteModal} onClose={() => setShowBulkDeleteModal(false)} title="Confirm Bulk Delete">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-600 mb-2">Are you sure you want to delete ALL students from</p>
          <p className="font-semibold text-gray-800 mb-2">
            {bulkDeleteClass === '0' ? 'BALVATIKA' : `Class ${bulkDeleteClass}`}
          </p>
          <p className="text-sm text-red-600 mb-2">This will also delete all attendance and result records for these students.</p>
          <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowBulkDeleteModal(false)}>No</Button>
            <Button type="button" variant="primary" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => { console.log('Bulk delete clicked, class:', bulkDeleteClass); handleBulkDelete(); }}>Yes, Delete All</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showPromoteModal} onClose={() => setShowPromoteModal(false)} title="Confirm Promote Students">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Are you sure you want to promote all students from</p>
          <p className="font-semibold text-gray-800 mb-2">
            {promoteFromClass === '0' ? 'BALVATIKA' : `Class ${promoteFromClass}`}
          </p>
          <p className="text-gray-600 mb-2">to</p>
          <p className="font-semibold text-gray-800 mb-6">
            {promoteToClass === 'graduated' ? 'GRADUATED' : promoteToClass === '0' ? 'BALVATIKA' : `Class ${promoteToClass}`}
          </p>
          <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" className="flex-1 py-3" onClick={() => setShowPromoteModal(false)}>No</Button>
            <Button variant="primary" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3" onClick={handlePromoteStudents}>Yes, Promote All</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
