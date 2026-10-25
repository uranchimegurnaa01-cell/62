import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StudentInfo,
  Question,
  OptionKey,
  ExamSubmission,
  CheatViolation,
  SubmissionReason,
} from '../types';
import { useExamProctor } from '../hooks/useExamProctor';
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  Send,
  X,
} from 'lucide-react';

interface ExamScreenProps {
  student: StudentInfo;
  questions: Question[];
  durationMinutes: number;
  onFinishExam: (submission: ExamSubmission) => void;
}

export const ExamScreen: React.FC<ExamScreenProps> = ({
  student,
  questions,
  durationMinutes,
  onFinishExam,
}) => {
  const totalQuestions = questions.length;
  const initialSeconds = durationMinutes * 60;

  // Answers state
  const [answers, setAnswers] = useState<Record<number, OptionKey>>({});
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);
  const hasFinishedRef = useRef<boolean>(false);

  // Anti-cheat hook
  const {
    violations,
    violationCount,
    latestViolationAlert,
    dismissViolationAlert,
    isFullscreen,
    requestFullscreen,
    exitFullscreen,
  } = useExamProctor({
    enabled: true,
    maxViolations: 5,
    onViolationLimitReached: () => {
      triggerSubmit('violation_limit');
    },
  });

  // Calculate score and package submission
  const triggerSubmit = useCallback(
    (reason: SubmissionReason) => {
      if (hasFinishedRef.current) return;
      hasFinishedRef.current = true;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      const endTime = Date.now();
      const elapsedSeconds = Math.min(
        initialSeconds,
        Math.max(1, Math.round((endTime - startTimeRef.current) / 1000))
      );

      // Score calculation
      let correctCount = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) {
          correctCount++;
        }
      });

      const percentage = Math.round((correctCount / totalQuestions) * 1000) / 10;

      const submission: ExamSubmission = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        studentName: student.fullName,
        studentClass: student.className,
        studentCode: student.studentCode || '',
        answers,
        score: correctCount,
        totalQuestions,
        percentage,
        startedAt: startTimeRef.current,
        submittedAt: endTime,
        durationSeconds: elapsedSeconds,
        violations,
        submissionReason: reason,
        isFlagged: violations.length > 0,
      };

      onFinishExam(submission);
    },
    [answers, initialSeconds, onFinishExam, questions, student, totalQuestions, violations]
  );

  // 40-minute Countdown Timer
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          setIsAutoSubmitting(true);
          setTimeout(() => {
            triggerSubmit('timeout');
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [triggerSubmit]);

  // Request fullscreen automatically on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      requestFullscreen();
    }, 400);
    return () => clearTimeout(timer);
  }, [requestFullscreen]);

  // Current question data
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Format timer
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isTimeCritical = secondsRemaining <= 300; // < 5 mins

  const handleSelectOption = (key: OptionKey) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: key,
    }));
  };

  const toggleBookmark = (id: number) => {
    setBookmarked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 select-none pb-24 flex flex-col justify-between">
      {/* Sticky Mobile/Desktop Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Student Info */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                {student.className}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {student.fullName}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="truncate">
                    {answeredCount}/{totalQuestions} хариулсан
                  </span>
                </div>
              </div>
            </div>

            {/* Middle & Right: Timer & Proctor Status */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Anti-cheat status badge */}
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  violationCount > 0
                    ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
                title={
                  violationCount > 0
                    ? `${violationCount} хуулах оролдлого бүртгэгдсэн`
                    : 'Хяналтын систем идэвхтэй'
                }
              >
                {violationCount > 0 ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Зөрчил: {violationCount}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Хяналттай</span>
                  </>
                )}
              </div>

              {/* 40 Min Timer */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs sm:text-sm font-bold border transition-colors ${
                  isTimeCritical
                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs animate-pulse'
                    : 'bg-slate-900 text-white border-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {minutes.toString().padStart(2, '0')}:
                  {seconds.toString().padStart(2, '0')}
                </span>
              </div>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={isFullscreen ? exitFullscreen : requestFullscreen}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                title={isFullscreen ? 'Бүтэн дэлгэцээс гарах' : 'Бүтэн дэлгэц'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Progress bar line */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Question Card Area */}
      <main className="max-w-3xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 w-full flex-1">
        {/* Anti-cheat banner alert when violation occurs */}
        {latestViolationAlert && (
          <div className="mb-4 bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 shadow-lg animate-bounce">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-rose-900">
                    ⚠️ АНХААРУУЛГА: Хуулах оролдлого бүртгэгдлээ! (Нийт зөрчил:{' '}
                    {violationCount}/5)
                  </h4>
                  <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                    {latestViolationAlert.title}: {latestViolationAlert.description}
                  </p>
                  <p className="text-[11px] font-semibold text-rose-900 mt-1">
                    Энэхүү үйлдэл нь багшийн бүртгэлийн самбарт цаг хугацаатайгаа шууд
                    илгээгдлээ.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={dismissViolationAlert}
                className="text-rose-500 hover:text-rose-800 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Question Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 mb-4">
          {/* Question Header & Bookmark */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                Асуулт {currentIndex + 1} / {totalQuestions}
              </span>
              {answers[currentQuestion.id] && (
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Хариулсан
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => toggleBookmark(currentQuestion.id)}
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                bookmarked[currentQuestion.id]
                  ? 'bg-amber-100 text-amber-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  bookmarked[currentQuestion.id]
                    ? 'fill-amber-500 text-amber-500'
                    : ''
                }`}
              />
              <span className="hidden sm:inline">
                {bookmarked[currentQuestion.id] ? 'Тэмдэглэсэн' : 'Эргэж харах'}
              </span>
            </button>
          </div>

          {/* Question Text */}
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-6 leading-relaxed">
            {currentQuestion.text}
          </h2>

          {/* Options List */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.key;
              return (
                <button
                  type="button"
                  key={option.key}
                  onClick={() => handleSelectOption(option.key)}
                  className={`w-full p-3.5 sm:p-4 rounded-xl text-left transition-all border flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500 text-indigo-950 shadow-xs ring-1 ring-indigo-500'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {/* Option letter badge */}
                  <div
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {option.key}
                  </div>
                  <div className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                    {option.text}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Navigator trigger & Prev/Next */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`h-11 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-500'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Өмнөх</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNavigatorOpen(true)}
            className="h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4 text-indigo-600" />
            <span>Асуултын жагсаалт</span>
          </button>

          {currentIndex === totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Илгээх</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Дараах</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>

      {/* Floating Bottom Bar with direct Submit action */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 px-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Хариулсан:{' '}
            <strong className="text-slate-900 font-bold">
              {answeredCount}/{totalQuestions}
            </strong>
          </div>
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Шалгалт дуусгах</span>
          </button>
        </div>
      </footer>

      {/* Question Navigator Modal/Drawer */}
      {isNavigatorOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Асуултын хуваарилалт
                </h3>
                <p className="text-xs text-slate-500">
                  {answeredCount} / {totalQuestions} асуултад хариулсан
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNavigatorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-3 text-[11px] text-slate-600 mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-indigo-600" />
                <span>Хариулсан</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-500" />
                <span>Тэмдэглэсэн</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300" />
                <span>Хариулаагүй</span>
              </div>
            </div>

            {/* Questions Numbers Grid */}
            <div className="grid grid-cols-5 gap-2.5 max-h-64 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]);
                const isMarked = Boolean(bookmarked[q.id]);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    type="button"
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsNavigatorOpen(false);
                    }}
                    className={`h-11 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all border relative cursor-pointer ${
                      isCurrent
                        ? 'ring-2 ring-indigo-500 ring-offset-2'
                        : ''
                    } ${
                      isAnswered
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : isMarked
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isMarked && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 mt-2">
              <button
                type="button"
                onClick={() => setIsNavigatorOpen(false)}
                className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs cursor-pointer"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 sm:p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Шалгалт дуусгах уу?
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Та нийт <strong>{totalQuestions}</strong> асуултаас{' '}
              <strong className="text-indigo-600 font-bold">
                {answeredCount}
              </strong>
              -д нь хариулсан байна.
              {answeredCount < totalQuestions && (
                <span className="block text-amber-700 font-semibold mt-1">
                  ⚠️ Хариулаагүй {totalQuestions - answeredCount} асуулт байна!
                </span>
              )}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 h-11 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Үргэлжлүүлэх
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false);
                  triggerSubmit('manual');
                }}
                className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Тийм, дуусгах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Submit Notice on Timeout */}
      {isAutoSubmitting && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              40 минутын хугацаа дууслаа!
            </h3>
            <p className="text-xs text-slate-600">
              Шалгалтын систем автоматаар хаагдаж, хариултыг илгээж байна...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
