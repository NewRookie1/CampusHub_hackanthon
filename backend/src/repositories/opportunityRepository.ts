import { prisma } from '../config/prisma.js';

export const opportunityRepository = {
  async findById(id: string) {
    return prisma.opportunity.findUnique({
      where: { id },
      include: { companyProfile: true },
    });
  },

  async findMany(filter: {
    type?: string;
    category?: string;
    location?: string;
    isRemote?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { status: 'active' };
    if (filter.type) where.type = filter.type;
    if (filter.category) where.category = filter.category;
    if (filter.location) where.location = { contains: filter.location };
    if (filter.isRemote !== undefined) where.isRemote = filter.isRemote;
    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search } },
        { description: { contains: filter.search } },
      ];
    }

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        include: { companyProfile: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.opportunity.count({ where }),
    ]);

    return { data, total };
  },

  async create(data: any) {
    return prisma.opportunity.create({ data });
  },

  async getRequiredSkills(opportunityId: string) {
    const opp = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      select: { requiredSkills: true, preferredSkills: true },
    });
    return opp;
  },
};
