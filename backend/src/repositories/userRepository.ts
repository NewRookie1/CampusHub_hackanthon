import { prisma } from '../config/prisma.js';
import { User, Prisma } from '@prisma/client';

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true },
    });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  async getStudentProfile(userId: string) {
    return prisma.studentProfile.findUnique({
      where: { userId },
      include: { skills: { include: { skill: true } } },
    });
  },

  async upsertStudentProfile(userId: string, data: Prisma.StudentProfileUpsertArgs['update']) {
    return prisma.studentProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data as any },
    });
  },
};
