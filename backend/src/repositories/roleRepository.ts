import { prisma } from '../config/prisma.js';

export const roleRepository = {
  async findById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        requiredSkills: {
          include: { skill: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  },

  async findByTitle(title: string) {
    return prisma.role.findFirst({
      where: { title: { equals: title } },
      include: {
        requiredSkills: {
          include: { skill: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  },

  async findMany(filter: { category?: string; search?: string }) {
    const where: any = {};
    if (filter.category) where.category = filter.category;
    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search } },
        { description: { contains: filter.search } },
      ];
    }
    return prisma.role.findMany({
      where,
      include: { requiredSkills: { include: { skill: true } } },
      orderBy: { title: 'asc' },
    });
  },

  async create(data: any) {
    return prisma.role.create({ data });
  },

  async createWithSkills(
    roleData: { title: string; description?: string; category?: string; level?: string },
    skills: Array<{ skillId: string; proficiency?: string; isRequired?: boolean; weight?: number; order?: number }>
  ) {
    return prisma.role.create({
      data: {
        ...roleData,
        requiredSkills: {
          create: skills.map(s => ({
            skillId: s.skillId,
            proficiency: s.proficiency || 'INTERMEDIATE',
            isRequired: s.isRequired ?? true,
            weight: s.weight ?? 1.0,
            order: s.order ?? 0,
          })),
        },
      },
      include: { requiredSkills: { include: { skill: true } } },
    });
  },
};
