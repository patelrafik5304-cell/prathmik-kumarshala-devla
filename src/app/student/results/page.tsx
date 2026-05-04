'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import jsPDF from 'jspdf';

interface Result {
  id: string;
  studentUsername: string;
  studentName: string;
  rollNumber: string;
  class: string;
  exam: string;
  percentage: string;
  grade: string;
  subjects: Record<string, number>;
  published: boolean;
}

export default function StudentResults() {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    fetch('/api/results')
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        const myResults = all.filter((r: Result) => r.studentUsername === user?.username && r.published);
        setResults(myResults);
      });
  }, [user]);

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

  const getSubGrade = (mark: number) => {
    if (mark >= 90) return 'A+';
    if (mark >= 80) return 'A';
    if (mark >= 70) return 'B+';
    if (mark >= 60) return 'B';
    if (mark >= 50) return 'C';
    if (mark >= 40) return 'D';
    return 'F';
  };

  const drawRow = (doc: jsPDF, y: number, cells: { x: number; width: number; text: string }[], bold: boolean) => {
    if (bold) doc.setFont('helvetica', 'bold');
    else doc.setFont('helvetica', 'normal');
    cells.forEach((c) => {
      doc.rect(c.x, y, c.width, 10);
      doc.text(c.text, c.x + 2, y + 7);
    });
  };

  const downloadReport = (result: Result) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const totalMarks = Object.values(result.subjects).reduce((sum, m) => sum + m, 0);
    const maxMarks = Object.values(result.subjects).length * 100;

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PRATHMIK KUMARSHALA-DEVLA', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(16);
    doc.text('SCHOOL REPORT CARD', pageWidth / 2, 25, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student: ${result.studentName}`, 14, 32);
    doc.text(`Class: ${result.class}`, 14, 39);
    doc.text(`Exam: ${result.exam}`, 14, 46);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 53);

    let y = 62;
    const colWidths = [90, 30, 30];
    const startX = 14;
    const rowHeight = 10;

    drawRow(doc, y, [
      { x: startX, width: colWidths[0], text: 'Subject' },
      { x: startX + colWidths[0], width: colWidths[1], text: 'Marks' },
      { x: startX + colWidths[0] + colWidths[1], width: colWidths[2], text: 'Grade' },
    ], true);
    y += rowHeight;

    Object.entries(result.subjects).forEach(([sub, mark]) => {
      drawRow(doc, y, [
        { x: startX, width: colWidths[0], text: sub },
        { x: startX + colWidths[0], width: colWidths[1], text: `${mark}/100` },
        { x: startX + colWidths[0] + colWidths[1], width: colWidths[2], text: getSubGrade(mark) },
      ], false);
      y += rowHeight;
    });

    drawRow(doc, y, [
      { x: startX, width: colWidths[0], text: 'TOTAL' },
      { x: startX + colWidths[0], width: colWidths[1], text: `${totalMarks}/${maxMarks}` },
      { x: startX + colWidths[0] + colWidths[1], width: colWidths[2], text: '' },
    ], true);
    y += rowHeight;

    doc.text(`PERCENTAGE: ${result.percentage}`, 14, y + 10);
    doc.text(`GRADE: ${result.grade}`, 14, y + 18);

    doc.save(`${result.studentName}_${result.exam}_Report.pdf`);
  };

  const downloadAllResults = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const colWidths = [90, 30, 30];
    const startX = 14;
    const rowHeight = 10;
    let y = 30;

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PRATHMIK KUMARSHALA-DEVLA', pageWidth / 2, 10, { align: 'center' });
    doc.setFontSize(16);
    doc.text('STUDENT REPORT CARD', pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${user?.name}`, startX, y);
    y += 7;
    doc.text(`Username: ${user?.username}`, startX, y);
    y += 7;
    doc.text(`Class: ${user?.class}`, startX, y);
    y += 7;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, startX, y);
    y += 12;

    Object.entries(groupedByExam).forEach(([exam, rows]) => {
      const first = rows[0];
      const totalMarks = Object.values(first.subjects).reduce((sum, m) => sum + m, 0);
      const maxMarks = Object.values(first.subjects).length * 100;

      if (y > 250) { doc.addPage(); y = 20; }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(exam, startX, y);
      y += 8;

      doc.setFontSize(11);
      drawRow(doc, y, [
        { x: startX, width: colWidths[0], text: 'Subject' },
        { x: startX + colWidths[0], width: colWidths[1], text: 'Marks' },
        { x: startX + colWidths[0] + colWidths[1], width: colWidths[2], text: 'Grade' },
      ], true);
      y += rowHeight;

      Object.entries(first.subjects).forEach(([sub, mark]) => {
        drawRow(doc, y, [
          { x: startX, width: colWidths[0], text: sub },
          { x: startX + colWidths[0], width: colWidths[1], text: `${mark}/100` },
          { x: startX + colWidths[0] + colWidths[1], width: colWidths[2], text: getSubGrade(mark) },
        ], false);
        y += rowHeight;
      });

      drawRow(doc, y, [
        { x: startX, width: colWidths[0], text: 'TOTAL' },
        { x: startX + colWidths[0], width: colWidths[1], text: `${totalMarks}/${maxMarks}` },
        { x: startX + colWidths[0] + colWidths[1], width: colWidths[2], text: '' },
      ], true);
      y += 15;
      doc.text(`PERCENTAGE: ${first.percentage}`, startX, y);
      y += 7;
      doc.text(`GRADE: ${first.grade}`, startX, y);
      y += 15;
    });

    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Overall Performance', startX, y);
    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    examSummaries.forEach((e) => {
      doc.text(`${e.exam}: ${e.avgPct} - ${e.grade}`, startX, y);
      y += 7;
    });

    doc.save(`${user?.name || 'Student'}_All_Results.pdf`);
  };

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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">{exam}</h2>
                  <button
                    onClick={() => downloadReport(first)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {first && Object.entries(first.subjects).map(([sub, mark]) => (
                      <tr key={sub}>
                        <td className="px-4 py-3">{sub}</td>
                        <td className="px-4 py-3">{mark}/100</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium">
                            {getSubGrade(mark)}
                          </span>
                        </td>
                      </tr>
                    ))}
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Exam Summary</h2>
              <button
                onClick={downloadAllResults}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download All
              </button>
            </div>
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
