import { prisma } from '../config/prisma.js';

export const matchResultRepository = {
  async findById(id: string) {
    return prisma.matchResult.findUnique({
      where: { id },
      include: { opportunity: true, resume: true },
    });
  },

  async findByUser(userId: string) {
    return prisma.matchResult.findMany({
      where: { userId },
      include: { opportunity: { include: { companyProfile: true } } },
      orderBy: { matchScore: 'desc' },
    });
  },

  async findOrCreate(
    userId: string,
    opportunityId: string,
    resumeId: string | null,
    data: any
  ) {
    const existing = await prisma.matchResult.findFirst({
      where: { userId, opportunityId },
    });

    if (existing) {
      return prisma.matchResult.update({
        where: { id: existing.id },
        data: { ...data, updatedAt: new Date() },
      });
    }

    return prisma.matchResult.create({
      data: { userId, opportunityId, resumeId: resumeId || undefined, ...data },
    });
  },

  async create(data: any) {
    return prisma.matchResult.create({ data });
  },

  async update(id: string, data: any) {
    return prisma.matchResult.update({ where: { id }, data });
  },
};
