import { z } from 'zod';

export const analyzeResumeSchema = z.object({
  resume_id: z.string().min(1, 'Resume ID is required'),
  target_role: z.string().min(1, 'Target role is required'),
});

export const matchResumeSchema = z.object({
  resume_id: z.string().min(1, 'Resume ID is required'),
  opportunity_id: z.string().min(1, 'Opportunity ID is required'),
});

export const uploadResumeSchema = z.object({
  file: z.object({
    originalname: z.string(),
    mimetype: z.string(),
    size: z.number(),
    buffer: z.instanceof(Buffer),
  }),
});

export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>;
export type MatchResumeInput = z.infer<typeof matchResumeSchema>;
