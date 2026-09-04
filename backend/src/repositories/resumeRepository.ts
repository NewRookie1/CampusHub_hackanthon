import { prisma } from '../config/prisma.js';

export const resumeRepository = {
  async findById(id: string) {
    return prisma.resume.findUnique({
      where: { id },
      include: {
        extractedSkills: { include: { skill: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  },

  async findByUser(userId: string) {
    return prisma.resume.findMany({
      where: { userId },
      include: { extractedSkills: { include: { skill: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: any) {
    return prisma.resume.create({ data });
  },

  async update(id: string, data: any) {
    return prisma.resume.update({ where: { id }, data });
  },

  async delete(id: string) {
    await prisma.resume.delete({ where: { id } });
  },

  async addSkills(resumeId: string, skills: Array<{ skillId: string; proficiency?: string; confidence?: number; context?: string }>) {
    for (const s of skills) {
      try {
        await prisma.resumeSkill.create({
          data: {
            resumeId,
            skillId: s.skillId,
            proficiency: s.proficiency || 'BEGINNER',
            confidence: s.confidence ?? 0.8,
            context: s.context,
          },
        });
      } catch {
        // Skip duplicates
      }
    }
  },

  async getSkills(resumeId: string) {
    return prisma.resumeSkill.findMany({
      where: { resumeId },
      include: { skill: true },
    });
  },

  async deleteSkills(resumeId: string) {
    await prisma.resumeSkill.deleteMany({ where: { resumeId } });
  },
};
