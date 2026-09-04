import { roleRepository } from '../repositories/roleRepository.js';
import { skillGraphRepository } from '../repositories/skillGraphRepository.js';
import { skillIntelligence } from './skillIntelligence.js';
import { userRepository } from '../repositories/userRepository.js';
import { SkillGraphNode, SkillGraphEdge, SkillGraphData } from '../interfaces/skill.js';
import { AppError } from '../utils/AppError.js';

class SkillGraphService {
  async generateGraph(roleId: string, userId?: string): Promise<SkillGraphData> {
    const role = await roleRepository.findById(roleId);
    if (!role) throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');

    const roleSkills = await skillIntelligence.getRoleSkills(roleId);

    let userSkillMap = new Map<string, string>();
    if (userId) {
      const studentProfile = await userRepository.getStudentProfile(userId);
      if (studentProfile?.skills) {
        for (const ss of studentProfile.skills) {
          userSkillMap.set(ss.skill.normalizedName, ss.proficiency);
        }
      }
    }

    const nodes: SkillGraphNode[] = [];
    const edges: SkillGraphEdge[] = [];

    nodes.push({
      id: `role-${role.id}`,
      type: 'role',
      label: role.title,
      data: { description: role.description, category: role.category },
    });

    for (const rs of roleSkills) {
      const skill = rs.skill;
      const isMissing = !userSkillMap.has(skill.normalizedName);
      const userProf = userSkillMap.get(skill.normalizedName);
      const isWeak = userProf ? this.isWeakSkill(userProf, rs.proficiency) : false;

      nodes.push({
        id: `skill-${skill.id}`,
        type: 'skill',
        label: skill.name,
        data: {
          category: skill.category,
          requiredProficiency: rs.proficiency,
          weight: rs.weight,
          isRequired: rs.isRequired,
        },
        metadata: {
          proficiency: userProf || undefined,
          isMissing,
          isWeak,
          priority: rs.weight,
        },
      });

      edges.push({
        id: `edge-role-${skill.id}`,
        source: `role-${role.id}`,
        target: `skill-${skill.id}`,
        type: 'requires',
        weight: rs.weight,
        label: rs.isRequired ? 'required' : 'preferred',
      });

      for (const related of roleSkills) {
        if (related.skillId !== rs.skillId) {
          const exists = edges.find(
            e => e.source === `skill-${skill.id}` && e.target === `skill-${related.skillId}`
          );
          if (!exists) {
            edges.push({
              id: `edge-${skill.id}-${related.skillId}`,
              source: `skill-${skill.id}`,
              target: `skill-${related.skillId}`,
              type: 'related_to',
              weight: 0.5,
            });
          }
        }
      }
    }

    if (userId) {
      for (const rs of roleSkills) {
        if (!userSkillMap.has(rs.skill.normalizedName)) {
          for (const [userSkillName] of userSkillMap) {
            const relatedSkill = roleSkills.find(
              r => r.skill.normalizedName === userSkillName
            );
            if (relatedSkill) {
              const existingEdge = edges.find(
                e => e.source === `skill-${relatedSkill.skillId}` && e.target === `skill-${rs.skillId}` && e.type === 'demonstrated_by'
              );
              if (!existingEdge) {
                edges.push({
                  id: `edge-demo-${relatedSkill.skillId}-${rs.skillId}`,
                  source: `skill-${relatedSkill.skillId}`,
                  target: `skill-${rs.skillId}`,
                  type: 'demonstrated_by',
                  weight: 0.3,
                });
              }
            }
          }
        }
      }
    }

    const graphData: SkillGraphData = { nodes, edges };

    await skillGraphRepository.upsert(roleId, userId || null, {
      roleId,
      userId: userId || undefined,
      nodes: JSON.stringify(nodes),
      edges: JSON.stringify(edges),
      metadata: JSON.stringify({
        totalSkills: roleSkills.length,
        missingSkills: nodes.filter(n => n.metadata?.isMissing).length,
        weakSkills: nodes.filter(n => n.metadata?.isWeak).length,
        generatedAt: new Date().toISOString(),
      }),
    });

    return graphData;
  }

  private isWeakSkill(userLevel: string, requiredLevel: string): boolean {
    const order: Record<string, number> = {
      BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3, EXPERT: 4,
    };
    return (order[userLevel] || 0) < (order[requiredLevel] || 0);
  }

  async getGraph(roleId: string, userId?: string): Promise<SkillGraphData | null> {
    if (userId) {
      const existing = await skillGraphRepository.findByRoleAndUser(roleId, userId);
      if (existing) {
        return {
          nodes: JSON.parse(existing.nodes as string),
          edges: JSON.parse(existing.edges as string),
        };
      }
    }
    const existing = await skillGraphRepository.findByRole(roleId);
    if (existing) {
      return {
        nodes: JSON.parse(existing.nodes as string),
        edges: JSON.parse(existing.edges as string),
      };
    }
    return this.generateGraph(roleId, userId);
  }
}

export const skillGraphService = new SkillGraphService();
