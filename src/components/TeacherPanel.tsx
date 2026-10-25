import React, { useState, useMemo } from 'react';
import { ExamSubmission, CheatViolation } from '../types';
import { exportSubmissionsToCSV, clearSubmissions } from '../services/storage';
import {
  Users,
  Search,
  Download,
  ShieldAlert,
  ShieldCheck,
  Clock,
  ArrowLeft,
  Trash2,
  Eye,
  X,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';

interface TeacherPanelProps {
  submissions: ExamSubmission[];
  onBackToExam: () => void;
  onRefreshData: () => void;
}

export const TeacherPanel: React.FC<TeacherPanelProps> = ({
  submissions,
  onBackToExam,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const [activeViolationModal, setActiveViolationModal] = useState<ExamSubmission | null>(null);

  // Extract unique classes
  const classesList = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => set.add(s.studentClass));
    return ['ALL', ...Array.from(set).sort()];
  }, [submissions]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchSearch =
        s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = selectedClass === 'ALL' || s.studentClass === selectedClass;
      const matchFlagged = !onlyFlagged || s.isFlagged;
      return matchSearch && matchClass && matchFlagged;
    });
  }, [submissions, searchQuery, selectedClass, onlyFlagged]);

  // Overall Statistics
  const totalStudents = submissions.length;
  const flaggedCount = submissions.filter((s) => s.isFlagged).length;
  const avgScore = totalStudents > 0
    ? (submissions.reduce((acc, s) => acc + s.score, 0) / totalStudents).toFixed(1)
    : '0';
  const avgPercentage = totalStudents > 0
    ? Math.round(submissions.reduce((acc, s) => acc + s.percentage, 0) / totalStudents)
    : 0;

  const handleExport = () => {
    exportSubmissionsToCSV(filteredSubmissions);
  };

  const handleClear = () => {
    if (window.confirm('Бүх сурагчдын шалгалтын бүртгэлийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.')) {
      clearSubmissions();
      onRefreshData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToExam}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Шалгалт руу буцах</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                Б
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900">
                  Багшийн хяналтын нэгдсэн самбар
                </h1>
                <p className="text-xs text-slate-500">
                  Мэдээллийн технологи XII · Шалгалтын дүн ба хуулалтын бүртгэл
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={submissions.length === 0}
              className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel (CSV) татах</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              title="Бүртгэл цэвэрлэх"
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500 font-semibold mb-1">Нийт шалгалт өгсөн</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {totalStudents}
              </span>
              <span className="text-xs text-slate-400">сурагч</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500 font-semibold mb-1">Дундаж оноо</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-mono">
                {avgScore}
              </span>
              <span className="text-xs text-slate-500">/ 15 ({avgPercentage}%)</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-rose-600 font-semibold mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Сэжигтэй (Зөрчилтэй)
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono">
                {flaggedCount}
              </span>
              <span className="text-xs text-rose-500">
                ({totalStudents > 0 ? Math.round((flaggedCount / totalStudents) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-emerald-600 font-semibold mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Шударга өгсөн
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
                {totalStudents - flaggedCount}
              </span>
              <span className="text-xs text-emerald-500">
                ({totalStudents > 0 ? Math.round(((totalStudents - flaggedCount) / totalStudents) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Сурагчийн нэр, кодоор хайх..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Class filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {classesList.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'Бүх анги' : `${c} анги`}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Flagged only */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyFlagged}
                onChange={(e) => setOnlyFlagged(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <span className="text-rose-700 font-semibold">Зөвхөн хуулах оролдлоготой</span>
            </label>
          </div>
        </div>

        {/* Submissions Roster */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Сурагчдын жагсаалт ({filteredSubmissions.length})
            </h3>
            <span className="text-xs text-slate-400">
              Хамгийн сүүлийн үр дүнгүүд
            </span>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs sm:text-sm">
              Шалгалтын бүртгэл олдсонгүй.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Сурагч</th>
                    <th className="py-3 px-3">Анги</th>
                    <th className="py-3 px-3">Оноо</th>
                    <th className="py-3 px-3">Хувь</th>
                    <th className="py-3 px-3">Хугацаа</th>
                    <th className="py-3 px-3">Хуулалтын хяналт</th>
                    <th className="py-3 px-3 text-right">Зөрчлийн түүх</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.map((s) => {
                    const min = Math.floor(s.durationSeconds / 60);
                    const sec = s.durationSeconds % 60;
                    const dateStr = new Date(s.submittedAt).toLocaleTimeString('mn-MN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          s.isFlagged ? 'bg-rose-50/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">
                            {s.studentName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {s.studentCode ? `Код: ${s.studentCode}` : dateStr}
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-xs">
                            {s.studentClass}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {s.score}
                          </span>
                          <span className="text-slate-400">/{s.totalQuestions}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-semibold text-xs ${
                              s.percentage >= 80
                                ? 'text-emerald-700'
                                : s.percentage >= 60
                                ? 'text-indigo-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {s.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-mono text-xs">
                          {min}м {sec < 10 ? '0' : ''}{sec}с
                        </td>
                        <td className="py-3 px-3">
                          {s.violations.length === 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              Зөрчилгүй
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                              {s.violations.length} зөрчил
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveViolationModal(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Харах</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Violation Detail Modal */}
      {activeViolationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeViolationModal.studentName} ({activeViolationModal.studentClass})
                </h3>
                <p className="text-xs text-slate-500">
                  Хуулалтын хяналтын нарийвчилсан бүртгэл
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveViolationModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Summary */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl mb-4 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Оноо</span>
                <span className="font-bold text-slate-900 text-sm">
                  {activeViolationModal.score} / {activeViolationModal.totalQuestions} (
                  {activeViolationModal.percentage}%)
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Хугацаа</span>
                <span className="font-bold text-slate-900 text-sm">
                  {Math.floor(activeViolationModal.durationSeconds / 60)} мин
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Зөрчлийн тоо</span>
                <span
                  className={`font-bold text-sm ${
                    activeViolationModal.violations.length > 0
                      ? 'text-rose-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {activeViolationModal.violations.length} удаа
                </span>
              </div>
            </div>

            {/* Detailed Violation Log List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {activeViolationModal.violations.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Энэ сурагч шалгалтын явцад ямар нэг хуулах оролдлого, таб солих үйлдэл
                    хийгээгүй.
                  </span>
                </div>
              ) : (
                activeViolationModal.violations.map((v, idx) => (
                  <div
                    key={v.id || idx}
                    className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        {v.title}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {v.timeFormatted}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs">{v.description}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveViolationModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
