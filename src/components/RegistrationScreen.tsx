import React, { useState } from 'react';
import { StudentInfo } from '../types';
import {
  EXAM_TITLE,
  EXAM_SUBTITLE,
  EXAM_TOPIC,
  EXAM_DURATION_MINUTES,
} from '../data/examQuestions';
import {
  ShieldAlert,
  Clock,
  Smartphone,
  BookOpen,
  ArrowRight,
  User,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface RegistrationScreenProps {
  onStartExam: (info: StudentInfo) => void;
  onOpenTeacherPanel: () => void;
  totalQuestions: number;
}

const DEFAULT_CLASSES = ['12А', '12Б', '12В', '12Г', '12Д', 'Бусад'];

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  onStartExam,
  onOpenTeacherPanel,
  totalQuestions,
}) => {
  const [fullName, setFullName] = useState('');
  const [selectedClass, setSelectedClass] = useState('12А');
  const [customClass, setCustomClass] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Сурагчийн бүтэн нэрээ оруулна уу.');
      return;
    }

    const finalClass = selectedClass === 'Бусад' ? customClass.trim() : selectedClass;
    if (!finalClass) {
      setErrorMsg('Анги бүлгээ оруулна уу.');
      return;
    }

    if (!agreed) {
      setErrorMsg('Шалгалтын дүрэм болон хуулалтын эсрэг нөхцөлийг зөвшөөрнө үү.');
      return;
    }

    onStartExam({
      fullName: trimmedName,
      className: finalClass,
      studentCode: studentCode.trim() || undefined,
      startedAt: Date.now(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              XII
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900">
                {EXAM_TITLE}
              </h1>
              <p className="text-xs text-slate-500">12-р ангийн улсын сорил</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenTeacherPanel}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            Багшийн самбар
          </button>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-2xl mx-auto px-4 pt-6 w-full flex-1">
        {/* Exam Title Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Мэдлэгийн түвшин тогтоох шалгалт</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 leading-tight">
            {EXAM_SUBTITLE}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-4">
            <strong className="text-slate-800">Сэдэв:</strong> {EXAM_TOPIC}
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Clock className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-500">Хугацаа</p>
                <p className="text-sm font-bold text-slate-900">
                  {EXAM_DURATION_MINUTES} минут
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-500">Асуултын тоо</p>
                <p className="text-sm font-bold text-slate-900">{totalQuestions} асуулт</p>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-100 text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-[11px] text-amber-700">Хяналтын горим</p>
                <p className="text-sm font-bold text-amber-900">Хуулалтын эсрэг</p>
              </div>
            </div>
          </div>
        </div>

        {/* Proctoring Rules Notice */}
        <div className="bg-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-200/80 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm text-amber-950 space-y-1.5">
              <h3 className="font-bold text-amber-900 text-sm sm:text-base">
                Шалгалт өгөх чухал дүрэм ба заавар:
              </h3>
              <ul className="list-disc pl-4 space-y-1 text-slate-700 text-xs sm:text-xs leading-relaxed">
                <li>
                  <strong className="text-slate-900">Хугацаа дуусах:</strong> 40 минут
                  дуусахад шалгалтын систем <em>автоматаар хаагдаж</em>, таны бөглөсөн
                  хариултууд хураагдана.
                </li>
                <li>
                  <strong className="text-slate-900">Таб солих хориотой:</strong> Шалгалтын
                  явацад өөр цонх, таб руу шилжих, апп-аас гарах оролдлого хийхийг
                  хориглоно.
                </li>
                <li>
                  <strong className="text-slate-900">Хуулах оролдлогын бүртгэл:</strong>{' '}
                  Текст хуулбарлах (Copy/Paste), хориглосон товчлуур дарах, таб солих бүх
                  үйлдлийг систем цаг минутаар бүртгэж багшийн самбарт илгээнэ.
                </li>
                <li>
                  <strong className="text-slate-900">Гар утасны дэлгэц:</strong> Дэлгэц бүтэн
                  горимоор ажиллах тул шалгалт эхлэхээс дуусах хүртэл дэлгэцээ бүү хаагаарай.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Student Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Сурагчийн мэдээлэл оруулах
            </h3>
            <p className="text-xs text-slate-500">
              Та шалгалтаа эхлүүлэхийн өмнө өөрийн нэр, ангиа үнэн зөв оруулна уу.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label
              htmlFor="student-name"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Сурагчийн овог, нэр <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="student-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Жишээ: Батбаярын Төмөр"
                className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Анги, бүлэг <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {DEFAULT_CLASSES.map((cls) => (
                <button
                  type="button"
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`h-11 rounded-xl text-xs font-bold transition-all border ${
                    selectedClass === cls
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>

            {selectedClass === 'Бусад' && (
              <div className="mt-2.5">
                <input
                  type="text"
                  value={customClass}
                  onChange={(e) => setCustomClass(e.target.value)}
                  placeholder="Ангийн нэрээ бичнэ үү (Жишээ: 12Е)"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Student ID / Optional */}
          <div>
            <label
              htmlFor="student-code"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Сурагчийн код / Бүртгэлийн дугаар{' '}
              <span className="text-slate-400 font-normal">(Сонголттой)</span>
            </label>
            <input
              id="student-code"
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="Жишээ: ST1208"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
            />
          </div>

          {/* Agreement Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                Би шалгалтын 40 минутын хугацаа, таб солихгүй байх болон хуулалтын эсрэг
                дүрмийг ойлгож, өөрийн мэдлэгээрээ шударгаар өгөхийг баталгаажуулж байна.
              </span>
            </label>
          </div>

          {/* Start Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full h-13 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <span>Шалгалт эхлүүлэх</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Шалгалт эхэлмэгц цагийн тоолуур шууд эхэлнэ.
            </p>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 mt-6 text-center text-xs text-slate-400">
        Мэдээллийн технологи XII анги · Цахим үнэлгээний систем
      </footer>
    </div>
  );
};
