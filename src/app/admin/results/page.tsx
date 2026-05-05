'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Plus, Download, FileText, Check, X, Edit2, Eye, EyeOff, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import * as XLSX from 'xlsx';

interface Result {
  id: string;
  studentUsername: string;
  studentName: string;
  class: string;
  exam: string;
  percentage: string;
  grade: string;
  subjects: Record<string, number>;
  published: boolean;
}

const SUBJECTS = ['Math', 'Science', 'English', 'Social', 'Hindi'];

function calculateGrade(pct: number): string {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
}

export default function ResultsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<{ id: string; username: string; name: string; class: string }[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resultToDelete, setResultToDelete] = useState<Result | null>(null);
  const [preview, setPreview] = useState<Result[]>([]);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [editExam, setEditExam] = useState('');
  const [editMarks, setEditMarks] = useState<Record<string, number>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/results').then((r) => r.json()).then((data) => setResults(Array.isArray(data) ? data : []));
    fetch('/api/students').then((r) => r.json()).then((data) => setStudents(Array.isArray(data) ? data : []));
  }, []);

  const classes = ['all', ...[...new Set(students.map((s) => s.class))].sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0))];
  const filtered = filterClass === 'all' ? results : results.filter((r) => r.class === filterClass);

  const downloadCSV = () => {
    const classStudents = filterClass === 'all' ? students : students.filter((s) => s.class === filterClass);
    if (classStudents.length === 0) { alert('No students found for the selected class.'); return; }
    const header = ['Username', 'Name', 'Class', 'Exam', ...SUBJECTS].join(',');
    const rows = classStudents.map((s) => { const vals = [s.username, s.name, s.class, 'Mid-term']; SUBJECTS.forEach(() => vals.push('')); return vals.join(','); });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results_${filterClass === 'all' ? 'all' : filterClass}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMsg('');
    setPreview([]);
    const ext = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();
    if (ext === 'csv') {
      reader.onload = (ev) => { const text = ev.target?.result as string; parseCSVText(text); };
      reader.readAsText(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      reader.onload = (ev) => { const data = new Uint8Array(ev.target?.result as ArrayBuffer); const workbook = XLSX.read(data, { type: 'array' }); const sheet = workbook.Sheets[workbook.SheetNames[0]]; const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet); parseJsonRows(json); };
      reader.readAsArrayBuffer(file);
    } else { alert('Please upload a .csv or .xlsx file.'); return; }
  };

  const parseCSVText = (text: string) => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    const lines = text.trim().split('\n');
    if (lines.length < 2) { setUploadMsg('CSV file has no data rows.'); return; }
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rawRows = lines.slice(1).map((line) => { const vals = line.split(','); const row: Record<string, string> = {}; headers.forEach((h, i) => { row[h] = vals[i]?.trim() ?? ''; }); if (row['name']) row['student name'] = row['name']; else if (row['student']) row['student name'] = row['student']; return row; });
    const rows = rawRows.filter((row) => !!row['username'] && !!row['student name']);
    processRows(rows);
  };

  const parseJsonRows = (json: Record<string, unknown>[]) => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    const rows = json.map((row) => { const normalized: Record<string, string> = {}; Object.keys(row).forEach((key) => { const k = key.toLowerCase().trim(); normalized[k] = String(row[key] ?? ''); }); if (normalized['student'] && !normalized['student name']) normalized['student name'] = normalized['student']; return normalized; }).filter((row) => row['username'] && row['student name']);
    processRows(rows);
  };

  const processRows = (rows: Record<string, string>[]) => {
    if (rows.length === 0) { setUploadMsg('No valid data found.'); return; }
    const processed = rows.map((row) => {
      const subjects: Record<string, number> = {};
      let total = 0; let count = 0;
      SUBJECTS.forEach((sub) => { const mark = parseFloat(row[sub.toLowerCase()] || ''); if (!isNaN(mark)) { subjects[sub] = mark; total += mark; count++; } });
      const maxMarks = count * 100;
      const pct = maxMarks > 0 ? Math.round((total / maxMarks) * 100) : 0;
      return { id: '', studentUsername: row['username'], studentName: row['student name'], class: row['class'], exam: row['exam'] || 'Mid-term', subjects, percentage: `${pct}%`, grade: calculateGrade(pct), published: false };
    });
    setPreview(processed);
    setShowUploadModal(true);
  };

  const handleConfirmUpload = async () => {
    setUploadMsg('');
    setUploadSuccess('');
    setActionLoading(true);
    if (preview.length === 0) { setUploadMsg('No results to upload.'); setActionLoading(false); return; }
    try {
      const res = await fetch('/api/results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ records: preview, replace: true }) });
      const data = await res.json();
      if (res.ok && data.success) {
        setPreview([]);
        setShowUploadModal(false);
        const r = await fetch('/api/results');
        const d = await r.json();
        setResults(Array.isArray(d) ? d : []);
        setUploadSuccess(`${data.count} result(s) uploaded!`);
      } else { setUploadMsg(data.error || `Upload failed (status ${res.status})`); }
    } catch (err: any) { setUploadMsg(err.message || 'Network error'); }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!resultToDelete) return;
    setActionLoading(true);
    const deletedId = resultToDelete.id;
    // Optimistic update
    setResults(prev => prev.filter((r) => r.id !== deletedId));
    setShowDeleteModal(false);
    setResultToDelete(null);
    try {
      await fetch(`/api/results?id=${deletedId}`, { method: 'DELETE' });
    } catch (err) {
      // Revert on error
      const r = await fetch('/api/results');
      const d = await r.json();
      setResults(Array.isArray(d) ? d : []);
    }
    setActionLoading(false);
  };

  const openDeleteModal = (result: Result) => {
    setResultToDelete(result);
    setShowDeleteModal(true);
  };

  const handleBulkPublish = async () => {
    if (filterClass === 'all') {
      alert('Please select a specific class to bulk publish.');
      return;
    }
    setBulkActionLoading(true);
    const toUpdate = filtered.filter(r => !r.published);
    // Optimistic update
    setResults(prev => prev.map(r => r.class === filterClass ? { ...r, published: true } : r));
    try {
      const promises = toUpdate.map(r =>
        fetch('/api/results', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: r.id, published: true }) })
      );
      await Promise.all(promises);
    } catch (err) {
      // Revert on error
      const r = await fetch('/api/results');
      const d = await r.json();
      setResults(Array.isArray(d) ? d : []);
    }
    setBulkActionLoading(false);
  };

  const handleBulkUnpublish = async () => {
    if (filterClass === 'all') {
      alert('Please select a specific class to bulk unpublish.');
      return;
    }
    setBulkActionLoading(true);
    const toUpdate = filtered.filter(r => r.published);
    // Optimistic update
    setResults(prev => prev.map(r => r.class === filterClass ? { ...r, published: false } : r));
    try {
      const promises = toUpdate.map(r =>
        fetch('/api/results', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: r.id, published: false }) })
      );
      await Promise.all(promises);
    } catch (err) {
      // Revert on error
      const r = await fetch('/api/results');
      const d = await r.json();
      setResults(Array.isArray(d) ? d : []);
    }
    setBulkActionLoading(false);
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    // Optimistic update
    setResults(prev => prev.map((r) => r.id === id ? { ...r, published: !current } : r));
    try {
      const res = await fetch('/api/results', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, published: !current }) });
      if (!res.ok) {
        // Revert on error
        setResults(prev => prev.map((r) => r.id === id ? { ...r, published: current } : r));
      }
    } catch (err) {
      // Revert on error
      setResults(prev => prev.map((r) => r.id === id ? { ...r, published: current } : r));
    }
  };

  const openEdit = (result: Result) => {
    setEditingResult(result);
    setEditExam(result.exam);
    setEditMarks({ ...result.subjects });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingResult) return;
    setActionLoading(true);
    const subjects = { ...editMarks };
    let total = 0; let count = 0;
    SUBJECTS.forEach((sub) => { const val = subjects[sub]; if (val !== undefined && !isNaN(val)) { total += val; count++; } });
    const maxMarks = count * 100;
    const pct = maxMarks > 0 ? Math.round((total / maxMarks) * 100) : 0;
    try {
      const res = await fetch('/api/results', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingResult.id, exam: editExam, subjects, percentage: `${pct}%`, grade: calculateGrade(pct) }) });
      const data = await res.json();
      if (res.ok) {
        setShowEditModal(false);
        setEditingResult(null);
        const r = await fetch('/api/results');
        const d = await r.json();
        setResults(Array.isArray(d) ? d : []);
      } else { alert('Edit failed: ' + (data.error || 'Unknown error')); }
    } catch (err: any) { alert('Edit failed: ' + err.message); }
    setActionLoading(false);
  };

  const handleAddResult = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const student = students.find((s) => s.id === selectedStudent);
    const subjects: Record<string, number> = {};
    let total = 0; let count = 0;
    SUBJECTS.forEach((sub) => { const val = parseInt(fd.get(sub) as string); if (!isNaN(val)) { subjects[sub] = val; total += val; count++; } });
    const maxMarks = count * 100;
    const pct = maxMarks > 0 ? Math.round((total / maxMarks) * 100) : 0;
    try {
      await fetch('/api/results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentUsername: student?.username, studentName: student?.name, class: student?.class, exam: fd.get('exam'), subjects, percentage: `${pct}%`, grade: calculateGrade(pct) }) });
      setShowAddModal(false);
      setSelectedStudent('');
      form.reset();
      const r = await fetch('/api/results');
      const d = await r.json();
      setResults(Array.isArray(d) ? d : []);
    } catch (err: any) { alert('Add failed: ' + err.message); }
    setActionLoading(false);
  };

  return (
    <div>
      <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Results Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Upload and manage student results</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={downloadCSV}><Download className="w-4 h-4" /> Generate CSV</Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4" /> Upload Results</Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4" /> Add Result</Button>
        </div>
      </div>

      <Card className="p-4 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Class</label>
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all bg-white">
          {classes.map((c) => (<option key={c} value={c}>{c === 'all' ? 'All Classes' : c === '0' ? 'BALVATIKA' : `Class ${c}`}</option>))}
        </select>
      </Card>

      {isAdmin && (
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-blue-800">Bulk Actions for {filterClass === 'all' ? 'All Classes' : `Class ${filterClass === '0' ? 'BALVATIKA' : filterClass}`}</h3>
              <p className="text-sm text-blue-600 mt-1">Publish or unpublish all results in the selected class</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="bg-green-600 hover:bg-green-700 text-white"
                loading={bulkActionLoading}
                disabled={filtered.length === 0}
                onClick={handleBulkPublish}
              >
                <Check className="w-4 h-4" /> Publish All
              </Button>
              <Button
                variant="primary"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                loading={bulkActionLoading}
                disabled={filtered.length === 0}
                onClick={handleBulkUnpublish}
              >
                <EyeOff className="w-4 h-4" /> Unpublish All
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 font-mono text-sm text-primary">{result.studentUsername}</td>
                  <td className="px-4 py-4 font-medium text-gray-800">{result.studentName}</td>
                  <td className="px-4 py-4 text-gray-600">{result.class}</td>
                  <td className="px-4 py-4 text-gray-600">{result.exam}</td>
                  <td className="px-4 py-4 font-semibold">{result.percentage}</td>
                  <td className="px-4 py-4"><Badge variant={result.grade === 'A' || result.grade === 'A+' ? 'success' : result.grade === 'B' || result.grade === 'B+' ? 'info' : result.grade === 'C' ? 'warning' : 'danger'}>{result.grade}</Badge></td>
                  <td className="px-4 py-4"><Badge variant={result.published ? 'success' : 'warning'}>{result.published ? 'Published' : 'Unpublished'}</Badge></td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => openEdit(result)}><Edit2 className="w-3 h-3" /></Button>
                      <Button variant="ghost" className={`px-2 py-1 text-xs ${result.published ? 'text-orange-600' : 'text-green-600'}`} onClick={() => handleTogglePublish(result.id, result.published)}>{result.published ? 'Unpublish' : 'Publish'}</Button>
                      {isAdmin && (
                        <Button variant="ghost" className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => openDeleteModal(result)}><Trash2 className="w-3 h-3" /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (<tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">No results found</td></tr>)}
            </tbody>
          </table>
        </div>
      </Card>

      {uploadSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-up flex items-center gap-3">
          <Check className="w-4 h-4" /> {uploadSuccess}
          <button onClick={() => setUploadSuccess('')} className="underline text-sm">Dismiss</button>
        </div>
      )}

      {/* Add Result Modal */}
      <Modal open={showAddModal} onClose={() => { setShowAddModal(false); setSelectedStudent(''); }} title="Add Result">
        <form className="space-y-4" onSubmit={handleAddResult}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Student</label>
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all bg-white" required>
              <option value="">Choose a student...</option>
              {students.map((s) => (<option key={s.id} value={s.id}>{s.name} ({s.username}) - {s.class === '0' ? 'BALVATIKA' : `Class ${s.class}`}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Username</label><input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500" value={students.find((s) => s.id === selectedStudent)?.username || ''} readOnly /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Student Name</label><input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500" value={students.find((s) => s.id === selectedStudent)?.name || ''} readOnly /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Class</label><input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500" value={students.find((s) => s.id === selectedStudent)?.class || ''} readOnly /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Exam Type</label><select name="exam" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white"><option>Mid-term</option><option>Final</option><option>Unit Test</option></select></div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subjects (Marks)</label>
            {SUBJECTS.map((sub) => (<div key={sub} className="flex items-center gap-3 mb-2"><span className="w-20 text-sm font-medium">{sub}</span><input name={sub} type="number" min="0" max="100" placeholder="Marks" className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl outline-none focus:border-primary transition-all" /><span className="text-sm text-gray-500">/100</span></div>))}
          </div>
          <div className="flex gap-3 pt-2"><Button type="submit" loading={actionLoading} className="flex-1">Save Result</Button><Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowAddModal(false); setSelectedStudent(''); }}>Cancel</Button></div>
        </form>
      </Modal>

      {/* Upload Preview Modal */}
      <Modal open={showUploadModal} onClose={() => { setShowUploadModal(false); setPreview([]); setUploadMsg(''); }} title="Preview Upload">
        <p className="text-sm text-gray-500 mb-4">{preview.length} result(s) will be added. Existing results for same student + exam will be replaced.</p>
        {preview.length > 0 && (
          <div className="max-h-64 overflow-y-auto mb-4 border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Exam</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">%</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.map((r, i) => (<tr key={i}><td className="px-3 py-2 font-mono text-sm text-primary">{r.studentUsername}</td><td className="px-3 py-2">{r.studentName}</td><td className="px-3 py-2">{r.class}</td><td className="px-3 py-2">{r.exam}</td><td className="px-3 py-2">{r.percentage}</td><td className="px-3 py-2"><Badge variant="info">{r.grade}</Badge></td></tr>))}
              </tbody>
            </table>
          </div>
        )}
        {uploadMsg && (<div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{uploadMsg}</div>)}
        <div className="flex gap-3"><Button onClick={handleConfirmUpload} loading={actionLoading} className="flex-1">Upload {preview.length} Result(s)</Button><Button variant="secondary" className="flex-1" onClick={() => { setShowUploadModal(false); setPreview([]); setUploadMsg(''); }}>Cancel</Button></div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={showEditModal} onClose={() => { setShowEditModal(false); setEditingResult(null); }} title={`Edit Result — ${editingResult?.studentName}`}>
        {editingResult && (
          <form className="space-y-4" onSubmit={handleSaveEdit}>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Username</label><input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500" value={editingResult.studentUsername} readOnly /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Class</label><input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500" value={editingResult.class} readOnly /></div>
            </div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Exam Type</label><select value={editExam} onChange={(e) => setEditExam(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white"><option>Mid-term</option><option>Final</option><option>Unit Test</option></select></div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subjects (Marks)</label>
              {SUBJECTS.map((sub) => (<div key={sub} className="flex items-center gap-3 mb-2"><span className="w-20 text-sm font-medium">{sub}</span><input type="number" min="0" max="100" value={editMarks[sub] ?? ''} onChange={(e) => setEditMarks({ ...editMarks, [sub]: parseInt(e.target.value) || 0 })} className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl outline-none focus:border-primary transition-all" /><span className="text-sm text-gray-500">/100</span></div>))}
            </div>
            <div className="flex gap-3 pt-2"><Button type="submit" loading={actionLoading} className="flex-1">Save Changes</Button><Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowEditModal(false); setEditingResult(null); }}>Cancel</Button></div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Delete">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-600 mb-2">Are you sure you want to delete the result for</p>
          <p className="font-semibold text-gray-800 mb-2">{resultToDelete?.studentName}</p>
          <p className="text-sm text-gray-500 mb-2">{resultToDelete?.exam} Exam — {resultToDelete?.percentage} ({resultToDelete?.grade})</p>
          <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(false)}>No</Button>
            <Button variant="primary" className="flex-1 bg-red-600 hover:bg-red-700 text-white" loading={actionLoading} onClick={handleDelete}>Yes, Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
