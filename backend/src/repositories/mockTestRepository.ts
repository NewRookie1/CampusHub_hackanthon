import { prisma } from '../config/prisma.js';
import { MockTest, MockTestResult, Prisma } from '@prisma/client';

export const mockTestRepository = {
  async findById(id: string): Promise<MockTest | null> {
    return prisma.mockTest.findUnique({
      where: { id },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  },

  async findByUser(userId: string): Promise<MockTest[]> {
    return prisma.mockTest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: Prisma.MockTestUncheckedCreateInput): Promise<MockTest> {
    return prisma.mockTest.create({ data });
  },

  async update(id: string, data: Prisma.MockTestUpdateInput): Promise<MockTest> {
    return prisma.mockTest.update({ where: { id }, data });
  },

  async getActiveTest(userId: string): Promise<MockTest | null> {
    return prisma.mockTest.findFirst({
      where: { userId, status: { in: ['NOT_STARTED', 'IN_PROGRESS'] } },
    });
  },

  async getResults(testId: string): Promise<MockTestResult[]> {
    return prisma.mockTestResult.findMany({
      where: { mockTestId: testId },
      orderBy: { questionIndex: 'asc' },
    });
  },

  async createResult(data: Prisma.MockTestResultUncheckedCreateInput): Promise<MockTestResult> {
    return prisma.mockTestResult.create({ data });
  },

  async createResults(data: Prisma.MockTestResultUncheckedCreateInput[]): Promise<number> {
    const result = await prisma.mockTestResult.createMany({ data });
    return result.count;
  },

  async getStats(userId: string) {
    const tests = await prisma.mockTest.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { examType: true, percentage: true, totalScore: true, maxScore: true },
    });

    const byExamType: Record<string, { count: number; avgPercentage: number; bestPercentage: number }> = {};
    for (const t of tests) {
      if (!byExamType[t.examType]) {
        byExamType[t.examType] = { count: 0, avgPercentage: 0, bestPercentage: 0 };
      }
      byExamType[t.examType].count++;
      byExamType[t.examType].avgPercentage += t.percentage || 0;
      byExamType[t.examType].bestPercentage = Math.max(byExamType[t.examType].bestPercentage, t.percentage || 0);
    }
    for (const key of Object.keys(byExamType)) {
      byExamType[key].avgPercentage /= byExamType[key].count;
    }

    return {
      totalTests: tests.length,
      byExamType,
    };
  },

  async delete(id: string): Promise<void> {
    await prisma.mockTestResult.deleteMany({ where: { mockTestId: id } });
    await prisma.mockTest.delete({ where: { id } });
  },
};
