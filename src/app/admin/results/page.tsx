'use client';

import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

interface Result {
  _id: string;
  studentName: string;
  rollNumber: string;
  class: string;
  exam: string;
  percentage: string;
  grade: string;
  subjects: Record<string, number>;
}

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
  const [results, setResults] = useState<Result[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<Result[]>([]);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResults = async () => {
    const res = await fetch('/api/results');
    const data = await res.json();
    setResults(data);
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const refetch = async () => {
    const res = await fetch('/api/results');
    const data = await res.json();
    setResults(data);
  };

  const filtered = results.filter(
    (r) =>
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadMsg('');
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const parsed = parseCSV(text);
        setPreview(parsed);
        if (parsed.length === 0) setUploadMsg('No valid rows found. Expected columns: Roll Number, Student Name, Class, Exam, then subject marks.');
      };
      reader.readAsText(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
        const parsed = parseJsonToResults(json);
        setPreview(parsed);
        if (parsed.length === 0) setUploadMsg('No valid rows found. Expected columns: Roll Number, Student Name, Class, Exam, then subject marks.');
      };
      reader.readAsArrayBuffer(file);
    } else {
      setUploadMsg('Unsupported file type. Please upload a .csv or .xlsx file.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const parseJsonToResults = (json: Record<string, unknown>[]): Result[] => {
    return json.map((row) => {
      const normalized: Record<string, unknown> = {};
      Object.keys(row).forEach((key) => {
        normalized[key.toLowerCase().trim()] = row[key];
      });
      return normalized;
    }).reduce<Result[]>((acc, row) => {
      const rollNumber = String(row['roll number'] || row['rollnumber'] || row['roll'] || '');
      const studentName = String(row['student name'] || row['studentname'] || row['name'] || '');
      const cls = String(row['class'] || row['std'] || '');
      const exam = String(row['exam'] || row['exam type'] || row['test'] || '');
      if (!rollNumber || !studentName) return acc;

      const subjects: Record<string, number> = {};
      let total = 0;
      let count = 0;
      Object.keys(row).forEach((key) => {
        const lower = key.toLowerCase().trim();
        const skip = ['roll number', 'rollnumber', 'roll', 'student name', 'studentname', 'name', 'class', 'std', 'exam', 'exam type', 'test', 'total', 'percentage', 'grade'];
        if (!skip.includes(lower)) {
          const mark = parseFloat(String(row[key]));
          if (!isNaN(mark)) {
            subjects[key] = mark;
            total += mark;
            count++;
          }
        }
      });

      const maxMarks = count * 100;
      const pct = maxMarks > 0 ? Math.round((total / maxMarks) * 100) : 0;

      acc.push({
        _id: '',
        rollNumber,
        studentName,
        class: cls,
        exam,
        subjects,
        percentage: `${pct}%`,
        grade: calculateGrade(pct),
      });
      return acc;
    }, []);
  };

  const parseCSV = (text: string): Result[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const dataLines = lines.slice(1);
    return parseJsonToResults(dataLines.map((line) => {
      const vals = line.split(',');
      const row: Record<string, unknown> = {};
      headers.forEach((h, i) => { row[h] = vals[i]?.trim() ?? ''; });
      return row;
    }));
  };

  const handleConfirmUpload = async () => {
    try {
      setUploadError('');
      setUploadSuccess('');
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preview),
      });
      if (!res.ok) throw new Error('Upload failed');
      setUploadSuccess(`${preview.length} result(s) uploaded successfully`);
      setPreview([]);
      setShowUploadModal(false);
      await fetchResults();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/results?id=${id}`, { method: 'DELETE' });
    setResults(results.filter((r) => r._id !== id));
  };

  const handleAddResult = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const rollNumber = fd.get('rollNumber') as string;
    const studentName = fd.get('studentName') as string;
    const cls = fd.get('class') as string;
    const exam = fd.get('exam') as string;
    const subjects: Record<string, number> = {};
    let total = 0;
    let count = 0;
    ['Math', 'Science', 'English', 'Social', 'Hindi'].forEach((sub) => {
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
        rollNumber,
        studentName,
        class: cls,
        exam,
        subjects,
        percentage: `${pct}%`,
        grade: calculateGrade(pct),
      }),
    });

    setShowModal(false);
    form.reset();
    await fetchResults();
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
            onClick={() => { setShowUploadModal(true); setPreview([]); setUploadMsg(''); }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            📥 Upload CSV / Excel
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            + Add Result
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <input
          type="text"
          placeholder="Search by student name or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
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
              <tr key={result._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{result.rollNumber}</td>
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
                  <div className="flex gap-2">
                    <button className="text-indigo-600 hover:text-indigo-800">View</button>
                    <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(result._id)}>Delete</button>
                  </div>
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

      {/* Add Result Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Result</h2>
            <form className="space-y-4" onSubmit={handleAddResult}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                  <input name="rollNumber" type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                  <input name="studentName" type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <input name="class" type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
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
                {['Math', 'Science', 'English', 'Social', 'Hindi'].map((sub) => (
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
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-2">Upload CSV or Excel File</h2>
            <p className="text-sm text-gray-500 mb-4">
              Expected columns: <span className="font-mono bg-gray-100 px-1 rounded">Roll Number</span>,{' '}
              <span className="font-mono bg-gray-100 px-1 rounded">Student Name</span>,{' '}
              <span className="font-mono bg-gray-100 px-1 rounded">Class</span>,{' '}
              <span className="font-mono bg-gray-100 px-1 rounded">Exam</span>, then subject marks columns
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="fileUpload"
              />
              <label
                htmlFor="fileUpload"
                className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                📁 Choose File
              </label>
              <p className="text-sm text-gray-500 mt-2">or drag and drop a .csv or .xlsx file</p>
            </div>

            {uploadMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{uploadMsg}</div>
            )}

            {preview.length > 0 && (
              <>
                <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">
                  Preview: {preview.length} result(s) found. Review below before importing.
                </div>
                <div className="max-h-64 overflow-y-auto mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
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
                          <td className="px-3 py-2 font-medium">{r.rollNumber}</td>
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
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleConfirmUpload}
                disabled={preview.length === 0}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import {preview.length} Result(s)
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
