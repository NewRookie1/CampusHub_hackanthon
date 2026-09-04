import { resumeService } from './resumeService.js';
import { skillIntelligence } from './skillIntelligence.js';
import { skillGapRepository } from '../repositories/skillGapRepository.js';
import { roleRepository } from '../repositories/roleRepository.js';
import { SkillGapAnalysisResult } from '../interfaces/skill.js';
import { AppError } from '../utils/AppError.js';

class SkillGapService {
  async analyzeSkillGap(
    resumeId: string,
    targetRole: string,
    roleId?: string,
    userId?: string
  ): Promise<SkillGapAnalysisResult> {
    let role;
    if (roleId) {
      role = await roleRepository.findById(roleId);
    } else {
      role = await skillIntelligence.getRoleByTitle(targetRole);
    }

    if (!role) {
      throw new AppError(`Role "${targetRole}" not found`, 404, 'ROLE_NOT_FOUND');
    }

    const resumeSkills = await resumeService.getResumeSkills(resumeId);
    const roleSkills = await skillIntelligence.getRoleSkills(role.id);

    if (roleSkills.length === 0) {
      throw new AppError('No skills defined for this role', 400, 'NO_ROLE_SKILLS');
    }

    const analysis = await skillIntelligence.analyzeSkillGap(resumeSkills, roleSkills);
    analysis.targetRole = role.title;
    analysis.roleId = role.id;

    if (userId) {
      await skillGapRepository.create({
        resumeId,
        roleId: role.id,
        missingSkills: JSON.stringify(analysis.missingSkills),
        weakSkills: JSON.stringify(analysis.weakSkills),
        prioritySkills: JSON.stringify(analysis.prioritySkills),
        coverageScore: analysis.coverageScore,
        recommendations: JSON.stringify(analysis.recommendations),
      });
    }

    return analysis;
  }

  async getHistory(userId: string) {
    return skillGapRepository.findByUser(userId);
  }

  async getComparison(resumeId: string, roleIds: string[]) {
    const results: SkillGapAnalysisResult[] = [];
    for (const roleId of roleIds) {
      const role = await roleRepository.findById(roleId);
      if (!role) continue;
      const resumeSkills = await resumeService.getResumeSkills(resumeId);
      const roleSkills = await skillIntelligence.getRoleSkills(roleId);
      const analysis = await skillIntelligence.analyzeSkillGap(resumeSkills, roleSkills);
      analysis.targetRole = role.title;
      analysis.roleId = role.id;
      results.push(analysis);
    }
    return results;
  }
}

export const skillGapService = new SkillGapService();
