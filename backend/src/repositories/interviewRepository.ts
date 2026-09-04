import { prisma } from '../config/prisma.js';
import { InterviewSession, Prisma } from '@prisma/client';

export const interviewRepository = {
  async findById(id: string): Promise<InterviewSession | null> {
    return prisma.interviewSession.findUnique({
      where: { id },
      include: { role: true, user: { select: { id: true, firstName: true, lastName: true } } },
    });
  },

  async findByUser(userId: string): Promise<InterviewSession[]> {
    return prisma.interviewSession.findMany({
      where: { userId },
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: Prisma.InterviewSessionUncheckedCreateInput): Promise<InterviewSession> {
    return prisma.interviewSession.create({ data });
  },

  async update(id: string, data: Prisma.InterviewSessionUpdateInput): Promise<InterviewSession> {
    return prisma.interviewSession.update({ where: { id }, data });
  },

  async getActiveSession(userId: string): Promise<InterviewSession | null> {
    return prisma.interviewSession.findFirst({
      where: { userId, status: 'IN_PROGRESS' },
      include: { role: true },
    });
  },
};
