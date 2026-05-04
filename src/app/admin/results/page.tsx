'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<{ id: string; username: string; name: string; class: string }[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [preview, setPreview] = useState<Result[]>([]);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/results')
      .then((r) => r.json())
      .then((data) => setResults(Array.isArray(data) ? data : []));
    fetch('/api/students')
      .then((r) => r.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []));
  }, []);

  const classes = ['all', ...[...new Set(students.map((s) => s.class))].sort((a, b) => {
    const numA = parseInt(a) || 0;
    const numB = parseInt(b) || 0;
    return numA - numB;
  })];

  const filtered = filterClass === 'all' ? results : results.filter((r) => r.class === filterClass);

  const downloadCSV = () => {
    const classStudents = filterClass === 'all' ? students : students.filter((s) => s.class === filterClass);

    if (classStudents.length === 0) {
      alert('No students found for the selected class.');
      return;
    }

    const header = ['Username', 'Student Name', 'Class', 'Exam', ...SUBJECTS].join(',');
    const rows = classStudents.map((s) => {
      const vals = [s.username, s.name, s.class, 'Mid-term'];
      SUBJECTS.forEach(() => vals.push(''));
      return vals.join(',');
    });

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

    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        parseCSVText(text);
      };
      reader.readAsText(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
        parseJsonRows(json);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a .csv or .xlsx file.');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const parseCSVText = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      setUploadMsg('CSV file has no data rows.');
      return;
    }
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows = lines.slice(1).map((line) => {
      const vals = line.split(',');
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = vals[i]?.trim() ?? ''; });
      return row;
    }).filter((row) => row['username'] && row['student name']);
    processRows(rows);
  };

  const parseJsonRows = (json: Record<string, unknown>[]) => {
    const rows = json.map((row) => {
      const normalized: Record<string, string> = {};
      Object.keys(row).forEach((key) => {
        normalized[key.toLowerCase().trim()] = String(row[key] ?? '');
      });
      return normalized;
    }).filter((row) => row['username'] && row['student name']);
    processRows(rows);
  };

  const processRows = (rows: Record<string, string>[]) => {
    if (rows.length === 0) {
      setUploadMsg('No valid data found. CSV must have columns: Username, Student Name, Class, Exam, and subject marks.');
      return;
    }

    const processed = rows.map((row) => {
      const subjects: Record<string, number> = {};
      let total = 0;
      let count = 0;
      SUBJECTS.forEach((sub) => {
        const mark = parseFloat(row[sub.toLowerCase()] || '');
        if (!isNaN(mark)) {
          subjects[sub] = mark;
          total += mark;
          count++;
        }
      });
      const maxMarks = count * 100;
      const pct = maxMarks > 0 ? Math.round((total / maxMarks) * 100) : 0;

      return {
        id: '',
        studentUsername: row['username'],
        studentName: row['student name'],
        class: row['class'],
        exam: row['exam'] || 'Mid-term',
        subjects,
        percentage: `${pct}%`,
        grade: calculateGrade(pct),
      };
    });

    setPreview(processed);
    setShowUploadModal(true);
  };

  const handleConfirmUpload = async () => {
    setUploadMsg('');
    setUploadSuccess('');
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: preview, replace: true }),
      });
      const data = await res.json();
      if (data.success) {
        setUploadSuccess(`${data.count} result(s) uploaded successfully`);
        setPreview([]);
        setShowUploadModal(false);
        fetch('/api/results')
          .then((r) => r.json())
          .then((d) => setResults(Array.isArray(d) ? d : []));
      } else {
        setUploadMsg(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setUploadMsg(err.message || 'Network error');
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/results?id=${id}`, { method: 'DELETE' });
    setResults(results.filter((r) => r.id !== id));
  };

  const handleAddResult = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const student = students.find((s) => s.id === selectedStudent);
    const subjects: Record<string, number> = {};
    let total = 0;
    let count = 0;
    SUBJECTS.forEach((sub) => {
      const val = parseInt(fd.get(sub) as string);
      if (!isNaN(val)) {
        subjects[sub] = val;
        total += val;
        count++;
      }
    });
    const maxMarks = count * 100;
    const pct = maxMarks > 0 ? Math.round((total / maxMarks) * 100) : 0;

    await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentUsername: student?.username,
        studentName: student?.name,
        class: student?.class,
        exam: fd.get('exam'),
        subjects,
        percentage: `${pct}%`,
        grade: calculateGrade(pct),
      }),
    });

    setShowAddModal(false);
    setSelectedStudent('');
    form.reset();
    fetch('/api/results')
      .then((r) => r.json())
      .then((d) => setResults(Array.isArray(d) ? d : []));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Results Management</h1>
          <p className="text-gray-500">Upload and manage student results</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Generate CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Upload CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            + Add Result
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Class</label>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        >
          {classes.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All Classes' : `Class ${c}`}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((result) => (
              <tr key={result.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-indigo-600">{result.studentUsername}</td>
                <td className="px-6 py-4">{result.studentName}</td>
                <td className="px-6 py-4">{result.class}</td>
                <td className="px-6 py-4">{result.exam}</td>
                <td className="px-6 py-4 font-medium">{result.percentage}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium">
                    {result.grade}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(result.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No results found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {uploadSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {uploadSuccess}
          <button onClick={() => setUploadSuccess('')} className="ml-4 underline">Dismiss</button>
        </div>
      )}

      {/* Add Result Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Result</h2>
            <form className="space-y-4" onSubmit={handleAddResult}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Choose a student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.username}) - Class {s.class}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" value={students.find((s) => s.id === selectedStudent)?.username || ''} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" value={students.find((s) => s.id === selectedStudent)?.name || ''} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" value={students.find((s) => s.id === selectedStudent)?.class || ''} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                  <select name="exam" className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option>Mid-term</option>
                    <option>Final</option>
                    <option>Unit Test</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subjects (Marks)</label>
                {SUBJECTS.map((sub) => (
                  <div key={sub} className="flex items-center gap-3 mb-2">
                    <span className="w-20 text-sm">{sub}</span>
                    <input name={sub} type="number" min="0" max="100" placeholder="Marks" className="flex-1 px-3 py-1 border border-gray-300 rounded" />
                    <span className="text-sm text-gray-500">/100</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  Save Result
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); setSelectedStudent(''); }} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Preview Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl">
            <h2 className="text-xl font-bold mb-2">Preview Upload</h2>
            <p className="text-sm text-gray-500 mb-4">
              {preview.length} result(s) will be added. Existing results for same student + exam will be replaced.
            </p>

            {preview.length > 0 && (
              <div className="max-h-64 overflow-y-auto mb-4 border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {preview.map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-mono text-indigo-600">{r.studentUsername}</td>
                        <td className="px-3 py-2">{r.studentName}</td>
                        <td className="px-3 py-2">{r.class}</td>
                        <td className="px-3 py-2">{r.exam}</td>
                        <td className="px-3 py-2">{r.percentage}</td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                            {r.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {uploadMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{uploadMsg}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleConfirmUpload}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Upload {preview.length} Result(s)
              </button>
              <button
                onClick={() => { setShowUploadModal(false); setPreview([]); setUploadMsg(''); }}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
