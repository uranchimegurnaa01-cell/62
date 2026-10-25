export type OptionKey = 'А' | 'Б' | 'В' | 'Г';

export interface QuestionOption {
  key: OptionKey;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
  correctAnswer: OptionKey;
  explanation: string;
}

export interface StudentInfo {
  fullName: string;
  className: string;
  studentCode?: string;
  startedAt?: number;
}

export type ViolationType =
  | 'tab_switch'
  | 'window_blur'
  | 'fullscreen_exit'
  | 'copy_attempt'
  | 'paste_attempt'
  | 'cut_attempt'
  | 'context_menu'
  | 'forbidden_key'
  | 'dev_shortcut'
  | 'screen_off';

export interface CheatViolation {
  id: string;
  type: ViolationType;
  title: string;
  description: string;
  timestamp: number;
  timeFormatted: string;
}

export type SubmissionReason = 'manual' | 'timeout' | 'violation_limit';

export interface ExamSubmission {
  id: string;
  studentName: string;
  studentClass: string;
  studentCode: string;
  answers: Record<number, OptionKey>;
  score: number;
  totalQuestions: number;
  percentage: number;
  startedAt: number;
  submittedAt: number;
  durationSeconds: number;
  violations: CheatViolation[];
  submissionReason: SubmissionReason;
  isFlagged: boolean;
}

export type ExamScreen = 'welcome' | 'exam' | 'result' | 'teacher_panel';
