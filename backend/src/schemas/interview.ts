import { z } from 'zod';

export const startInterviewSchema = z.object({
  role_id: z.string().optional(),
  stage: z.enum(['HR_INTERVIEW', 'TECHNICAL_INTERVIEW', 'BEHAVIORAL_INTERVIEW']).default('HR_INTERVIEW'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  num_questions: z.number().int().min(1).max(20).default(5),
});

export const evaluateAnswerSchema = z.object({
  session_id: z.string().min(1),
  question_id: z.string().min(1),
  answer: z.string().min(1, 'Answer cannot be empty'),
});

export const getNextQuestionSchema = z.object({
  session_id: z.string().min(1),
});

export const completeInterviewSchema = z.object({
  session_id: z.string().min(1),
});

export type StartInterviewInput = z.infer<typeof startInterviewSchema>;
export type EvaluateAnswerInput = z.infer<typeof evaluateAnswerSchema>;
