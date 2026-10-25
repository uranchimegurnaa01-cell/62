import { ExamSubmission, CheatViolation } from '../types';

const STORAGE_KEY = 'mxt12_exam_submissions';
const ACTIVE_SESSION_KEY = 'mxt12_active_session';

export function getSubmissions(): ExamSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getSampleSubmissions();
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Failed to parse submissions:', e);
    return getSampleSubmissions();
  }
}

export function saveSubmission(submission: ExamSubmission): void {
  try {
    const current = getSubmissions();
    // Add new submission to front
    const updated = [submission, ...current.filter((s) => s.id !== submission.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    clearActiveSession();
  } catch (e) {
    console.error('Failed to save submission:', e);
  }
}

export function clearSubmissions(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

export function saveActiveSession(session: {
  studentName: string;
  studentClass: string;
  studentCode: string;
  answers: Record<number, string>;
  startedAt: number;
  violations: CheatViolation[];
  secondsRemaining: number;
}): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save active session:', e);
  }
}

export function getActiveSession() {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearActiveSession(): void {
  localStorage.removeItem(ACTIVE_SESSION_KEY);
}

export function exportSubmissionsToCSV(submissions: ExamSubmission[]): void {
  const headers = [
    'Д/д',
    'Сурагчийн нэр',
    'Анги бүлэг',
    'Бүртгэлийн код',
    'Авсан оноо',
    'Нийт асуулт',
    'Хувь (%)',
    'Хуулах оролдлогын тоо',
    'Сэжигтэй эсэх',
    'Дууссан хэлбэр',
    'Зарцуулсан хугацаа (мин:сек)',
    'Огноо цаг',
    'Зөрчлийн дэлгэрэнгүй',
  ];

  const rows = submissions.map((s, index) => {
    const minutes = Math.floor(s.durationSeconds / 60);
    const seconds = s.durationSeconds % 60;
    const timeSpent = `${minutes}м ${seconds < 10 ? '0' : ''}${seconds}с`;
    const dateStr = new Date(s.submittedAt).toLocaleString('mn-MN');
    const reasonsMap: Record<string, string> = {
      manual: 'Өөрөө илгээсэн',
      timeout: 'Цаг дууссан',
      violation_limit: 'Зөрчил хэтэрсэн',
    };
    const violationsDetail = s.violations
      .map((v) => `[${v.timeFormatted}] ${v.title}: ${v.description}`)
      .join(' | ');

    return [
      index + 1,
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${s.studentClass.replace(/"/g, '""')}"`,
      `"${(s.studentCode || '-').replace(/"/g, '""')}"`,
      s.score,
      s.totalQuestions,
      `${s.percentage}%`,
      s.violations.length,
      s.isFlagged ? 'ТИЙМ (СЭЖИГТЭЙ)' : 'ҮГҮЙ',
      `"${reasonsMap[s.submissionReason] || s.submissionReason}"`,
      `"${timeSpent}"`,
      `"${dateStr}"`,
      `"${violationsDetail.replace(/"/g, '""')}"`,
    ].join(',');
  });

  // UTF-8 BOM (\uFEFF) ensures Cyrillic renders correctly in Microsoft Excel
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `MXT12_Shalgalt_Dun_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getSampleSubmissions(): ExamSubmission[] {
  const now = Date.now();
  return [
    {
      id: 'sub-sample-1',
      studentName: 'Батбаяр Төмөр',
      studentClass: '12А',
      studentCode: 'ST1204',
      answers: { 1: 'Б', 2: 'Г', 3: 'А', 4: 'Б', 5: 'Б', 6: 'Б', 7: 'Б', 8: 'А', 9: 'Б', 10: 'А', 11: 'Б', 12: 'Б', 13: 'А', 14: 'А', 15: 'В' },
      score: 15,
      totalQuestions: 15,
      percentage: 100,
      startedAt: now - 35 * 60 * 1000,
      submittedAt: now - 12 * 60 * 1000,
      durationSeconds: 1380,
      violations: [],
      submissionReason: 'manual',
      isFlagged: false,
    },
    {
      id: 'sub-sample-2',
      studentName: 'Энхжин Мөнхбат',
      studentClass: '12Б',
      studentCode: 'ST1219',
      answers: { 1: 'Б', 2: 'Г', 3: 'А', 4: 'Б', 5: 'А', 6: 'Б', 7: 'Б', 8: 'А', 9: 'Б', 10: 'А', 11: 'А', 12: 'Б', 13: 'А', 14: 'А', 15: 'В' },
      score: 13,
      totalQuestions: 15,
      percentage: 86.7,
      startedAt: now - 50 * 60 * 1000,
      submittedAt: now - 18 * 60 * 1000,
      durationSeconds: 1920,
      violations: [
        {
          id: 'v-1',
          type: 'tab_switch',
          title: 'Таб солих оролдлого',
          description: 'Хөтөчийн өөр цонх руу шилжсэн эсвэл өөр програм нээсэн',
          timestamp: now - 25 * 60 * 1000,
          timeFormatted: '10:45:12',
        },
      ],
      submissionReason: 'manual',
      isFlagged: true,
    },
    {
      id: 'sub-sample-3',
      studentName: 'Ариунболд Дорж',
      studentClass: '12А',
      studentCode: 'ST1201',
      answers: { 1: 'А', 2: 'Г', 3: 'А', 4: 'Б', 5: 'В', 6: 'Б', 7: 'А', 8: 'Б', 9: 'Б', 10: 'А', 11: 'Б', 12: 'Г', 13: 'А', 14: 'А', 15: 'А' },
      score: 9,
      totalQuestions: 15,
      percentage: 60,
      startedAt: now - 80 * 60 * 1000,
      submittedAt: now - 40 * 60 * 1000,
      durationSeconds: 2400,
      violations: [
        {
          id: 'v-2',
          type: 'copy_attempt',
          title: 'Текст хуулах оролдлого',
          description: 'Асуултын текстийг хуулбарлах (Copy/Ctrl+C) үйлдэл хийгдсэн',
          timestamp: now - 60 * 60 * 1000,
          timeFormatted: '10:12:05',
        },
        {
          id: 'v-3',
          type: 'tab_switch',
          title: 'Дэлгэцнээс гарсан',
          description: 'Апп-аас гарч өөр цонх руу шилжсэн',
          timestamp: now - 55 * 60 * 1000,
          timeFormatted: '10:17:33',
        },
      ],
      submissionReason: 'timeout',
      isFlagged: true,
    },
  ];
}
