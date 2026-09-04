import { prisma } from '../config/prisma.js';
import { SkillGraph, Prisma } from '@prisma/client';

export const skillGraphRepository = {
  async findById(id: string): Promise<SkillGraph | null> {
    return prisma.skillGraph.findUnique({ where: { id } });
  },

  async findByRoleAndUser(roleId: string, userId: string): Promise<SkillGraph | null> {
    return prisma.skillGraph.findFirst({ where: { roleId, userId } });
  },

  async findByRole(roleId: string): Promise<SkillGraph | null> {
    return prisma.skillGraph.findFirst({ where: { roleId, userId: null } });
  },

  async create(data: Prisma.SkillGraphUncheckedCreateInput): Promise<SkillGraph> {
    return prisma.skillGraph.create({ data });
  },

  async upsert(roleId: string, userId: string | null, data: Prisma.SkillGraphUncheckedCreateInput): Promise<SkillGraph> {
    const existing = userId
      ? await this.findByRoleAndUser(roleId, userId)
      : await this.findByRole(roleId);

    if (existing) {
      return prisma.skillGraph.update({
        where: { id: existing.id },
        data: { nodes: data.nodes, edges: data.edges, metadata: data.metadata },
      });
    }

    return prisma.skillGraph.create({ data });
  },
};
