export interface MockQuestion {
  id: string;
  index: number;
  question: string;
  type: 'MCQ' | 'MSQ' | 'NAT' | 'ESSAY' | 'FILL_IN' | 'NUMERIC' | 'TITA' | 'SPEAKING';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
  negativeMarks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  section: string;
}

export interface MockTestSession {
  testId: string;
  examType: string;
  subject: string;
  difficulty: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  questions: MockQuestion[];
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: string;
}

export interface MockTestAnswer {
  questionIndex: number;
  answer: string;
  timeTaken?: number;
}

export interface MockTestEvaluation {
  testId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  timeTaken: number;
  sectionWise: Record<string, { correct: number; total: number; score: number }>;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  detailedResults: MockQuestionResult[];
}

export interface MockQuestionResult {
  questionIndex: number;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  score: number;
  maxScore: number;
  explanation: string;
}

export interface MockTestStats {
  totalTests: number;
  byExamType: Record<string, {
    count: number;
    avgPercentage: number;
    bestPercentage: number;
  }>;
}
