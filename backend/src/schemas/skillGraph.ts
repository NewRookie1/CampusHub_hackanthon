import { z } from 'zod';

export const getSkillGraphSchema = z.object({
  role_id: z.string().min(1, 'Role ID is required'),
  user_id: z.string().optional(),
  depth: z.number().int().min(1).max(5).default(2),
});

export type GetSkillGraphInput = z.infer<typeof getSkillGraphSchema>;
