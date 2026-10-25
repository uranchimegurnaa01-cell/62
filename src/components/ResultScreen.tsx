import React, { useEffect, useState } from 'react';
import { ExamSubmission, Question } from '../types';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Users,
  Award,
} from 'lucide-react';

interface ResultScreenProps {
  submission: ExamSubmission;
  questions: Question[];
  onRetake: () => void;
  onOpenTeacherPanel: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  submission,
  questions,
  onRetake,
  onOpenTeacherPanel,
}) => {
  const [showReview, setShowReview] = useState<boolean>(true);
  const [filterReview, setFilterReview] = useState<'all' | 'incorrect'>('all');

  useEffect(() => {
    if (submission.percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }
  }, [submission.percentage]);

  const minutes = Math.floor(submission.durationSeconds / 60);
  const seconds = submission.durationSeconds % 60;

  // Grade classification
  const getGradeInfo = (pct: number) => {
    if (pct >= 90) return { label: 'Онцгой (A)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (pct >= 80) return { label: 'Маш сайн (B)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (pct >= 70) return { label: 'Сайн (C)', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    if (pct >= 60) return { label: 'Хангалттай (D)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Хангалтгүй (F)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const grade = getGradeInfo(submission.percentage);

  const filteredQuestions = questions.filter((q) => {
    if (filterReview === 'incorrect') {
      return submission.answers[q.id] !== q.correctAnswer;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h1 className="text-sm font-bold text-slate-900">Шалгалтын дүн тайлан</h1>
          </div>
          <button
            type="button"
            onClick={onOpenTeacherPanel}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            Багшийн самбар
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-5">
        {/* Result Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center relative overflow-hidden">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
            Шалгалт амжилттай дууслаа
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Таны шалгалтын хариу болон хуулалтын хяналтын бүртгэл баталгаажлаа.
          </p>

          {/* Big Score Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 inline-block w-full max-w-sm mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Таны авсан оноо
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-mono">
                {submission.score}
              </span>
              <span className="text-xl font-bold text-slate-400">
                / {submission.totalQuestions}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-sm font-bold text-indigo-600">
                {submission.percentage}%
              </span>
              <span aria-hidden="true">·</span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${grade.color}`}
              >
                {grade.label}
              </span>
            </div>
          </div>

          {/* Student Info Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left pt-3 border-t border-slate-100">
            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <p className="text-[11px] text-slate-400">Сурагч</p>
              <p className="text-xs font-bold text-slate-900 truncate">
                {submission.studentName}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <p className="text-[11px] text-slate-400">Анги бүлэг</p>
              <p className="text-xs font-bold text-slate-900">
                {submission.studentClass}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <p className="text-[11px] text-slate-400">Зарцуулсан цаг</p>
              <p className="text-xs font-bold text-slate-900">
                {minutes}м {seconds < 10 ? '0' : ''}{seconds}с
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <p className="text-[11px] text-slate-400">Дууссан шалтгаан</p>
              <p className="text-xs font-bold text-slate-900">
                {submission.submissionReason === 'manual'
                  ? 'Өөрөө илгээсэн'
                  : submission.submissionReason === 'timeout'
                  ? '40 мин дууссан'
                  : 'Зөрчил хэтэрсэн'}
              </p>
            </div>
          </div>
        </div>

        {/* Anti-cheat Proctoring Report Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {submission.violations.length === 0 ? (
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Хуулалтын хяналтын бүртгэл (Proctor Audit)
                </h3>
                <p className="text-xs text-slate-500">
                  Шалгалтын үеэр хийгдсэн үйлдлүүдийн автомат хяналт
                </p>
              </div>
            </div>

            <div
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                submission.violations.length === 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {submission.violations.length === 0
                ? 'Зөрчилгүй'
                : `${submission.violations.length} зөрчил илэрсэн`}
            </div>
          </div>

          {submission.violations.length === 0 ? (
            <div className="pt-3 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Та шалгалтын явцад таб солиогүй, хуулах оролдлого хийлгүй шударгаар
                өгсөн байна. Баяр хүргэе!
              </span>
            </div>
          ) : (
            <div className="pt-3 space-y-2">
              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-800">
                <p className="font-semibold mb-1">
                  Дараах сэжигтэй үйлдлүүд бүртгэгдэж багшийн журналд хадгалагдлаа:
                </p>
                <div className="space-y-1.5 mt-2">
                  {submission.violations.map((v, i) => (
                    <div
                      key={v.id || i}
                      className="flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-rose-100"
                    >
                      <span className="font-mono text-[11px] font-bold text-rose-600 shrink-0 mt-0.5">
                        {v.timeFormatted}
                      </span>
                      <div>
                        <strong className="text-slate-900">{v.title}:</strong>{' '}
                        <span className="text-slate-600">{v.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Question Review Accordion */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Асуулт, хариултын шалгалт (Түлхүүр)
              </h3>
              <p className="text-xs text-slate-500">
                Зөв хариулт болон багшийн тайлбартай танилцах
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowReview(!showReview)}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              {showReview ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {showReview && (
            <div className="p-4 sm:p-5 space-y-4">
              {/* Filter tabs */}
              <div className="flex items-center gap-1.5 pb-2">
                <button
                  type="button"
                  onClick={() => setFilterReview('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    filterReview === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Бүх асуулт ({questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterReview('incorrect')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    filterReview === 'incorrect'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Буруу хариулсан ({questions.length - submission.score})
                </button>
              </div>

              {/* Questions list */}
              <div className="space-y-4">
                {filteredQuestions.map((q) => {
                  const studentAns = submission.answers[q.id];
                  const isCorrect = studentAns === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-rose-200 bg-rose-50/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {q.id}-р асуулт
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold">
                          {isCorrect ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Зөв
                            </span>
                          ) : (
                            <span className="text-rose-700 flex items-center gap-1">
                              <XCircle className="w-4 h-4 text-rose-600" />
                              Буруу
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-3">
                        {q.text}
                      </p>

                      <div className="space-y-1.5 mb-3">
                        {q.options.map((opt) => {
                          const isChosen = studentAns === opt.key;
                          const isRight = q.correctAnswer === opt.key;

                          let optionStyle = 'bg-white border-slate-200 text-slate-700';
                          if (isRight) {
                            optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold';
                          } else if (isChosen && !isRight) {
                            optionStyle = 'bg-rose-50 border-rose-300 text-rose-950 line-through';
                          }

                          return (
                            <div
                              key={opt.key}
                              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${optionStyle}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{opt.key}.</span>
                                <span>{opt.text}</span>
                              </div>
                              {isRight && (
                                <span className="text-[11px] font-bold text-emerald-700 shrink-0">
                                  Зөв хариулт
                                </span>
                              )}
                              {isChosen && !isRight && (
                                <span className="text-[11px] font-bold text-rose-700 shrink-0">
                                  Таны сонголт
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation from PDF */}
                      <div className="p-2.5 rounded-lg bg-slate-100/80 border border-slate-200 text-[11px] text-slate-700">
                        <strong className="text-slate-900">Зөв хариултын тайлбар:</strong>{' '}
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onRetake}
            className="flex-1 h-12 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Шалгалт дахин эхлүүлэх</span>
          </button>
          <button
            type="button"
            onClick={onOpenTeacherPanel}
            className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Users className="w-4 h-4" />
            <span>Багшийн нэгдсэн самбар</span>
          </button>
        </div>
      </main>
    </div>
  );
};
