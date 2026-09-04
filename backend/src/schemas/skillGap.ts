import { z } from 'zod';

export const skillGapAnalyzeSchema = z.object({
  resume_id: z.string().min(1, 'Resume ID is required'),
  target_role: z.string().min(1, 'Target role is required'),
  role_id: z.string().optional(),
});

export const skillGapCompareSchema = z.object({
  resume_id: z.string().min(1, 'Resume ID is required'),
  role_ids: z.array(z.string()).min(1, 'At least one role ID required'),
});

export type SkillGapAnalyzeInput = z.infer<typeof skillGapAnalyzeSchema>;
export type SkillGapCompareInput = z.infer<typeof skillGapCompareSchema>;
