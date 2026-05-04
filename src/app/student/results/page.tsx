'use client';

import { useState, useEffect } from 'react';

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

export default function StudentResults() {
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    fetch('/api/results')
      .then((r) => r.json())
      .then((data) => setResults(data));
  }, []);

  const groupedByExam = results.reduce<Record<string, Result[]>>((acc, r) => {
    if (!acc[r.exam]) acc[r.exam] = [];
    acc[r.exam].push(r);
    return acc;
  }, {});

  const examSummaries = Object.keys(groupedByExam).map((exam) => {
    const rows = groupedByExam[exam];
    const avgPct = Math.round(rows.reduce((sum, r) => sum + parseInt(r.percentage), 0) / rows.length);
    return { exam, avgPct: `${avgPct}%`, grade: rows[0]?.grade || '-' };
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Results</h1>
      <p className="text-gray-500 mb-8">View and download your exam results</p>

      {results.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
          No results uploaded yet. Contact your teacher.
        </div>
      ) : (
        <>
          {Object.entries(groupedByExam).map(([exam, rows]) => {
            const first = rows[0];
            const totalMarks = Object.values(first.subjects).reduce((sum, m) => sum + m, 0);
            const maxMarks = Object.values(first.subjects).length * 100;

            return (
              <div className="bg-white rounded-xl shadow p-6 mb-8" key={exam}>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{exam}</h2>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {first && Object.entries(first.subjects).map(([sub, mark]) => {
                      let subGrade = 'F';
                      if (mark >= 90) subGrade = 'A+';
                      else if (mark >= 80) subGrade = 'A';
                      else if (mark >= 70) subGrade = 'B+';
                      else if (mark >= 60) subGrade = 'B';
                      else if (mark >= 50) subGrade = 'C';
                      else if (mark >= 40) subGrade = 'D';
                      return (
                        <tr key={sub}>
                          <td className="px-4 py-3">{sub}</td>
                          <td className="px-4 py-3">{mark}/100</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium">
                              {subGrade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-4 py-3">Total</td>
                      <td className="px-4 py-3">{totalMarks}/{maxMarks}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                          {first.percentage} ({first.grade})
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Exam Summary</h2>
            <div className="space-y-3">
              {examSummaries.map((e, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{e.exam}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-indigo-600">{e.avgPct}</span>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm">{e.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
