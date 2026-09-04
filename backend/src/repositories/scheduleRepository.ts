import { prisma } from '../config/prisma.js';
import { Schedule, Prisma } from '@prisma/client';

export const scheduleRepository = {
  async findById(id: string): Promise<Schedule | null> {
    return prisma.schedule.findUnique({
      where: { id },
      include: { role: true, roadmap: true },
    });
  },

  async findByUser(userId: string): Promise<Schedule[]> {
    return prisma.schedule.findMany({
      where: { userId },
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: Prisma.ScheduleUncheckedCreateInput): Promise<Schedule> {
    return prisma.schedule.create({ data });
  },

  async update(id: string, data: Prisma.ScheduleUpdateInput): Promise<Schedule> {
    return prisma.schedule.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.schedule.delete({ where: { id } });
  },
};
