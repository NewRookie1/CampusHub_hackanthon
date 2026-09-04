import { prisma } from '../config/prisma.js';
import { SkillGap, Prisma } from '@prisma/client';

export const skillGapRepository = {
  async findById(id: string): Promise<SkillGap | null> {
    return prisma.skillGap.findUnique({
      where: { id },
      include: { resume: true, role: true },
    });
  },

  async findByResumeAndRole(resumeId: string, roleId: string): Promise<SkillGap | null> {
    return prisma.skillGap.findFirst({ where: { resumeId, roleId } });
  },

  async create(data: Prisma.SkillGapUncheckedCreateInput): Promise<SkillGap> {
    return prisma.skillGap.create({ data });
  },

  async update(id: string, data: Prisma.SkillGapUpdateInput): Promise<SkillGap> {
    return prisma.skillGap.update({ where: { id }, data });
  },

  async findByUser(userId: string): Promise<SkillGap[]> {
    return prisma.skillGap.findMany({
      where: { resume: { userId } },
      include: { role: true, resume: true },
      orderBy: { createdAt: 'desc' },
    });
  },
};
