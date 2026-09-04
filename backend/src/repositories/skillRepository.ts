import { prisma } from '../config/prisma.js';

export const skillRepository = {
  async findByName(name: string) {
    return prisma.skill.findFirst({
      where: {
        OR: [
          { normalizedName: name.toLowerCase().trim() },
        ],
      },
    });
  },

  async findMany(filter: { category?: string; search?: string }) {
    const where: any = {};
    if (filter.category) where.category = filter.category;
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search } },
        { normalizedName: { contains: filter.search.toLowerCase() } },
      ];
    }
    return prisma.skill.findMany({ where, orderBy: { name: 'asc' } });
  },

  async create(data: any) {
    return prisma.skill.create({ data });
  },

  async createMany(skills: any[]) {
    const results = [];
    for (const skill of skills) {
      try {
        const created = await prisma.skill.create({ data: skill });
        results.push(created);
      } catch {
        // Skip duplicates
      }
    }
    return { count: results.length };
  },

  async findById(id: string) {
    return prisma.skill.findUnique({ where: { id } });
  },

  async findOrCreate(name: string, category: string = 'OTHER') {
    const normalized = name.toLowerCase().trim();
    const existing = await this.findByName(normalized);
    if (existing) return existing;
    return this.create({
      name,
      normalizedName: normalized,
      category,
      aliases: '[]',
    });
  },

  async getRelatedSkills(skillId: string) {
    const relations = await prisma.skillRelation.findMany({
      where: { skillId },
      include: { relatedSkill: true },
    });
    return relations.map(r => r.relatedSkill);
  },

  async addRelation(skillId: string, relatedSkillId: string, type: string = 'related_to', strength: number = 1.0) {
    await prisma.skillRelation.upsert({
      where: { skillId_relatedSkillId: { skillId, relatedSkillId } },
      update: { relationType: type, strength },
      create: { skillId, relatedSkillId, relationType: type, strength },
    });
  },
};
