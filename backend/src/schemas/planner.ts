import { z } from 'zod';

export const generateScheduleSchema = z.object({
  target_role: z.string().min(1, 'Target role is required'),
  role_id: z.string().optional(),
  available_days: z.number().int().min(1).max(365, 'Maximum 365 days'),
  hours_per_day: z.number().min(0.5).max(16, 'Maximum 16 hours per day'),
  start_date: z.string().optional(),
  priorities: z.array(z.string()).optional(),
  include_interview_prep: z.boolean().default(true),
});

export const updateScheduleSchema = z.object({
  schedule_id: z.string().min(1),
  day: z.number().int().min(1),
  topic_id: z.string().min(1),
  completed: z.boolean(),
});

export type GenerateScheduleInput = z.infer<typeof generateScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
