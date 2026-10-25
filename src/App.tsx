import React, { useState, useEffect } from 'react';
import {
  StudentInfo,
  ExamSubmission,
  ExamScreen as ScreenType,
} from './types';
import { EXAM_QUESTIONS, EXAM_DURATION_MINUTES } from './data/examQuestions';
import { RegistrationScreen } from './components/RegistrationScreen';
import { ExamScreen } from './components/ExamScreen';
import { ResultScreen } from './components/ResultScreen';
import { TeacherPanel } from './components/TeacherPanel';
import { getSubmissions, saveSubmission } from './services/storage';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  const [activeStudent, setActiveStudent] = useState<StudentInfo | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState<ExamSubmission | null>(null);
  const [submissionsList, setSubmissionsList] = useState<ExamSubmission[]>([]);

  // Load existing submissions on start
  useEffect(() => {
    setSubmissionsList(getSubmissions());
  }, []);

  const handleStartExam = (info: StudentInfo) => {
    setActiveStudent(info);
    setCurrentScreen('exam');
  };

  const handleFinishExam = (submission: ExamSubmission) => {
    saveSubmission(submission);
    setCurrentSubmission(submission);
    setSubmissionsList(getSubmissions());
    setCurrentScreen('result');
  };

  const handleRetake = () => {
    setActiveStudent(null);
    setCurrentSubmission(null);
    setCurrentScreen('welcome');
  };

  const handleOpenTeacherPanel = () => {
    setSubmissionsList(getSubmissions());
    setCurrentScreen('teacher_panel');
  };

  const handleBackToExam = () => {
    if (currentSubmission) {
      setCurrentScreen('result');
    } else {
      setCurrentScreen('welcome');
    }
  };

  const handleRefreshSubmissions = () => {
    setSubmissionsList(getSubmissions());
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      {currentScreen === 'welcome' && (
        <RegistrationScreen
          onStartExam={handleStartExam}
          onOpenTeacherPanel={handleOpenTeacherPanel}
          totalQuestions={EXAM_QUESTIONS.length}
        />
      )}

      {currentScreen === 'exam' && activeStudent && (
        <ExamScreen
          student={activeStudent}
          questions={EXAM_QUESTIONS}
          durationMinutes={EXAM_DURATION_MINUTES}
          onFinishExam={handleFinishExam}
        />
      )}

      {currentScreen === 'result' && currentSubmission && (
        <ResultScreen
          submission={currentSubmission}
          questions={EXAM_QUESTIONS}
          onRetake={handleRetake}
          onOpenTeacherPanel={handleOpenTeacherPanel}
        />
      )}

      {currentScreen === 'teacher_panel' && (
        <TeacherPanel
          submissions={submissionsList}
          onBackToExam={handleBackToExam}
          onRefreshData={handleRefreshSubmissions}
        />
      )}
    </div>
  );
}
