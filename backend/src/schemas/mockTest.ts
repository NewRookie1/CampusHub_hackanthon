import { z } from 'zod';

export const EXAM_TYPES = {
  GATE: {
    name: 'GATE',
    fullName: 'Graduate Aptitude Test in Engineering',
    subjects: [
      'Computer Science and Information Technology',
      'Electronics and Communication Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Data Science and Artificial Intelligence',
    ],
    questionTypes: ['MCQ', 'MSQ', 'NAT'],
    defaultTime: 180,
    totalMarks: 100,
    sections: ['General Aptitude', 'Engineering Mathematics', 'Core Subject'],
  },
  TOEFL: {
    name: 'TOEFL',
    fullName: 'Test of English as a Foreign Language',
    subjects: ['Reading', 'Listening', 'Speaking', 'Writing'],
    questionTypes: ['MCQ', 'ESSAY', 'SPEAKING'],
    defaultTime: 120,
    totalMarks: 120,
    sections: ['Reading Comprehension', 'Listening Comprehension', 'Speaking', 'Writing'],
  },
  GRE: {
    name: 'GRE',
    fullName: 'Graduate Record Examinations',
    subjects: ['Verbal Reasoning', 'Quantitative Reasoning', 'Analytical Writing'],
    questionTypes: ['MCQ', 'ESSAY', 'FILL_IN'],
    defaultTime: 195,
    totalMarks: 340,
    sections: ['Verbal Reasoning', 'Quantitative Reasoning', 'Analytical Writing'],
  },
  GMAT: {
    name: 'GMAT',
    fullName: 'Graduate Management Admission Test',
    subjects: ['Quantitative', 'Verbal', 'Integrated Reasoning', 'Analytical Writing'],
    questionTypes: ['MCQ', 'ESSAY'],
    defaultTime: 195,
    totalMarks: 800,
    sections: ['Quantitative Reasoning', 'Verbal Reasoning', 'Integrated Reasoning', 'Analytical Writing'],
  },
  CAT: {
    name: 'CAT',
    fullName: 'Common Admission Test',
    subjects: ['Quantitative Aptitude', 'Data Interpretation', 'Verbal Ability', 'Logical Reasoning'],
    questionTypes: ['MCQ', 'TITA'],
    defaultTime: 120,
    totalMarks: 198,
    sections: ['Quantitative Aptitude', 'Data Interpretation & Logical Reasoning', 'Verbal Ability & Reading Comprehension'],
  },
  UPSC: {
    name: 'UPSC',
    fullName: 'Union Public Service Commission Civil Services',
    subjects: ['General Studies', 'CSAT', 'Optional Subject'],
    questionTypes: ['MCQ', 'ESSAY'],
    defaultTime: 180,
    totalMarks: 200,
    sections: ['General Studies Paper I', 'General Studies Paper II (CSAT)', 'Essay', 'Optional Subject'],
  },
  JEE: {
    name: 'JEE',
    fullName: 'Joint Entrance Examination',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    questionTypes: ['MCQ', 'NUMERIC'],
    defaultTime: 180,
    totalMarks: 300,
    sections: ['Physics', 'Chemistry', 'Mathematics'],
  },
  NEET: {
    name: 'NEET',
    fullName: 'National Eligibility cum Entrance Test',
    subjects: ['Physics', 'Chemistry', 'Biology'],
    questionTypes: ['MCQ'],
    defaultTime: 200,
    totalMarks: 720,
    sections: ['Physics', 'Chemistry', 'Botany', 'Zoology'],
  },
} as const;

export type ExamTypeKey = keyof typeof EXAM_TYPES;

export const startMockTestSchema = z.object({
  exam_type: z.enum(['GATE', 'TOEFL', 'GRE', 'GMAT', 'CAT', 'UPSC', 'JEE', 'NEET']),
  subject: z.string().min(1, 'Subject is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  num_questions: z.number().int().min(5).max(50).default(20),
  time_limit_minutes: z.number().int().min(10).max(300).optional(),
});

export const submitAnswerSchema = z.object({
  test_id: z.string().min(1),
  question_index: z.number().int().min(0),
  answer: z.string().min(1, 'Answer is required'),
  time_taken_seconds: z.number().int().min(0).optional(),
});

export const getMockTestSchema = z.object({
  test_id: z.string().min(1),
});

export type StartMockTestInput = z.infer<typeof startMockTestSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
