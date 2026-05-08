'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FileText, ChevronDown, ChevronRight, Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

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
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetch(`/api/results?studentUsername=${user.username}&published=true`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch results');
        return r.json();
      })
      .then((data) => {
        setResults(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch((e) => {
        console.error('Failed to fetch results:', e);
        setError('Failed to load results. Please refresh the page.');
      })
      .finally(() => setLoading(false));
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
    if (mark >= 90) return 'A+'; if (mark >= 80) return 'A'; if (mark >= 70) return 'B+';
    if (mark >= 60) return 'B'; if (mark >= 50) return 'C'; if (mark >= 40) return 'D'; return 'F';
  };

  const drawRow = (doc: any, y: number, cells: { x: number; width: number; text: string }[], bold: boolean) => {
    if (bold) doc.setFont('helvetica', 'bold'); else doc.setFont('helvetica', 'normal');
    cells.forEach((c) => { doc.rect(c.x, y, c.width, 10); doc.text(c.text, c.x + 2, y + 7); });
  };

  const downloadReport = async (result: Result) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const totalMarks = Object.values(result.subjects).reduce((sum, m) => sum + m, 0);
    const maxMarks = Object.values(result.subjects).length * 100;
    doc.setFontSize(22); doc.setFont('helvetica', 'bold');
    doc.text('PRATHMIK KUMARSHALA-DEVLA', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(16); doc.text('SCHOOL REPORT CARD', pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    doc.text(`Student: ${result.studentName}`, 14, 32); doc.text(`Class: ${result.class}`, 14, 39);
    doc.text(`Exam: ${result.exam}`, 14, 46); doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 53);
    let y = 62;
    const colWidths = [90, 30, 30]; const startX = 14; const rowHeight = 10;
    drawRow(doc, y, [{ x: startX, width: colWidths[0], text: 'Subject' }, { x: startX + colWidths[0], width: colWidths[1], text: 'Marks' }, { x: startX + colWidths[0] + colWidths[1], width: colWidths[2], text: 'Grade' }], true);
    y += rowHeight;
    Object.entries(result.subjects).forEach(([sub, mark]) => {
      drawRow(doc, y, [{ x: startX, width: colWidths[0], text: sub }, { x: startX + colWidths[0], width: colWidths[1], text: `${mark}/100` }, { x: startX + colWidths[0] + colWidths[1], width: colWidths[2], text: getSubGrade(mark) }], false);
      y += rowHeight;
    });
    drawRow(doc, y, [{ x: startX, width: colWidths[0], text: 'TOTAL' }, { x: startX + colWidths[0], width: colWidths[1], text: `${totalMarks}/${maxMarks}` }, { x: startX + colWidths[0] + colWidths[1], width: colWidths[2], text: '' }], true);
    y += rowHeight;
    doc.text(`PERCENTAGE: ${result.percentage}`, 14, y + 10); doc.text(`GRADE: ${result.grade}`, 14, y + 18);
    doc.save(`${result.studentName}_${result.exam}_Report.pdf`);
  };

  const downloadAllResults = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const colWidths = [90, 30, 30]; const startX = 14; const rowHeight = 10;
    let y = 30;
    doc.setFontSize(22); doc.setFont('helvetica', 'bold');
    doc.text('PRATHMIK KUMARSHALA-DEVLA', pageWidth / 2, 10, { align: 'center' });
    doc.setFontSize(16); doc.text('STUDENT REPORT CARD', pageWidth / 2, y, { align: 'center' });
    y += 15;
    doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${user?.name}`, startX, y); y += 7;
    doc.text(`Username: ${user?.username}`, startX, y); y += 7;
    doc.text(`Class: ${user?.class}`, startX, y); y += 7;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, startX, y); y += 12;
    Object.entries(groupedByExam).forEach(([exam, rows]) => {
      const first = rows[0];
      const totalMarks = Object.values(first.subjects).reduce((sum, m) => sum + m, 0);
      const maxMarks = Object.values(first.subjects).length * 100;
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.text(exam, startX, y); y += 8;
      doc.setFontSize(11); drawRow(doc, y, [{ x: startX, width: colWidths[0], text: 'Subject' }, { x: startX + colWidths[0], width: colWidths[1], text: 'Marks' }, { x: startX + colWidths[0] + colWidths[1], width: colWidths[2], text: 'Grade' }], true);
      y += rowHeight;
      Object.entries(first.subjects).forEach(([sub, mark]) => {
        drawRow(doc, y, [{ x: startX, width: colWidths[0], text: sub }, { x: startX + colWidths[0], width: colWidths[1], text: `${mark}/100` }, { x: startX + colWidths[0] + colWidths[1], width: colWidths[2], text: getSubGrade(mark) }], false);
        y += rowHeight;
      });
      drawRow(doc, y, [{ x: startX, width: colWidths[0], text: 'TOTAL' }, { x: startX + colWidths[0], width: colWidths[1], text: `${totalMarks}/${maxMarks}` }, { x: startX + colWidths[0] + colWidths[1], width: colWidths[2], text: '' }], true);
      y += 15; doc.text(`PERCENTAGE: ${first.percentage}`, startX, y); y += 7; doc.text(`GRADE: ${first.grade}`, startX, y); y += 15;
    });
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.text('Overall Performance', startX, y); y += 10;
    doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    examSummaries.forEach((e) => { doc.text(`${e.exam}: ${e.avgPct} - ${e.grade}`, startX, y); y += 7; });
    doc.save(`${user?.name || 'Student'}_All_Results.pdf`);
  };

  if (loading) return <div><div className="mb-8"><h1 className="text-2xl lg:text-3xl font-bold text-gray-800">My Results</h1><p className="text-gray-500 mt-1 text-sm">View and download your exam results</p></div><Card className="p-12 text-center"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div><p className="text-gray-500">Loading results...</p></Card></div>;

  if (error) return <div><div className="mb-8"><h1 className="text-2xl lg:text-3xl font-bold text-gray-800">My Results</h1><p className="text-gray-500 mt-1 text-sm">View and download your exam results</p></div><EmptyState icon={<FileText className="w-8 h-8" />} title="Error loading results" description={error} /></div>;

  if (results.length === 0) return <div><div className="mb-8"><h1 className="text-2xl lg:text-3xl font-bold text-gray-800">My Results</h1><p className="text-gray-500 mt-1 text-sm">View and download your exam results</p></div><EmptyState icon={<FileText className="w-8 h-8" />} title="No results uploaded yet" description="Your results will appear here once your teacher uploads and publishes them." /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div><h1 className="text-2xl lg:text-3xl font-bold text-gray-800">My Results</h1><p className="text-gray-500 mt-1 text-sm">View and download your exam results</p></div>
        <Button variant="primary" onClick={downloadAllResults}><Download className="w-4 h-4" /> Download All</Button>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedByExam).map(([exam, rows]) => {
          const first = rows[0];
          const totalMarks = Object.values(first.subjects).reduce((sum, m) => sum + m, 0);
          const maxMarks = Object.values(first.subjects).length * 100;
          const isExpanded = expandedExam === exam;
          return (
            <Card key={exam} className="overflow-hidden">
              <button onClick={() => setExpandedExam(isExpanded ? null : exam)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">{first.grade}</div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{exam}</h3>
                    <p className="text-sm text-gray-500">{first.percentage} | Total: {totalMarks}/{maxMarks}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-gray-100 p-5 animate-slide-down">
                  <table className="w-full">
                    <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marks</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(first.subjects).map(([sub, mark]) => (
                        <tr key={sub}><td className="px-4 py-3 font-medium text-gray-800">{sub}</td><td className="px-4 py-3">{mark}/100</td><td className="px-4 py-3"><Badge variant={getSubGrade(mark) === 'F' ? 'danger' : getSubGrade(mark).startsWith('A') ? 'success' : getSubGrade(mark).startsWith('B') ? 'info' : 'warning'}>{getSubGrade(mark)}</Badge></td></tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold"><td className="px-4 py-3">Total</td><td className="px-4 py-3">{totalMarks}/{maxMarks}</td><td className="px-4 py-3"><Badge variant="success">{first.percentage} ({first.grade})</Badge></td></tr>
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Exam Summary</h2>
        <div className="space-y-3">
          {examSummaries.map((e, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <p className="font-medium text-gray-800 text-sm">{e.exam}</p>
              <div className="flex items-center gap-3"><span className="font-bold text-primary">{e.avgPct}</span><Badge variant={e.grade === 'A' || e.grade === 'A+' ? 'success' : e.grade === 'B' || e.grade === 'B+' ? 'info' : 'warning'}>{e.grade}</Badge></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}