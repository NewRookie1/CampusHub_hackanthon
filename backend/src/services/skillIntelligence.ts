import { skillRepository } from '../repositories/skillRepository.js';
import { roleRepository } from '../repositories/roleRepository.js';
import {
  Skill,
  SkillWithProficiency,
  SkillGapAnalysisResult,
  RoleSkillRequirement,
} from '../interfaces/skill.js';
import { proficiencyToScore } from '../utils/proficiency.js';

const SKILL_SYNONYMS: Record<string, string[]> = {
  javascript: ['js', 'ecmascript', 'es6', 'es2015', 'node.js', 'nodejs'],
  typescript: ['ts'],
  python: ['py', 'python3', 'python programming'],
  react: ['reactjs', 'react.js', 'react framework'],
  nodejs: ['node', 'node.js', 'nodejs'],
  postgresql: ['postgres', 'psql'],
  mongodb: ['mongo'],
  docker: ['docker containerization'],
  kubernetes: ['k8s'],
  'machine learning': ['ml', 'machine-learning'],
  'deep learning': ['dl', 'deep-learning'],
  'natural language processing': ['nlp', 'text processing'],
  'computer vision': ['cv', 'image processing'],
  sql: ['mysql', 'mssql', 'structured query language'],
  html: ['html5'],
  css: ['css3', 'scss', 'sass', 'less'],
  git: ['github', 'gitlab', 'version control'],
  aws: ['amazon web services'],
  gcp: ['google cloud', 'google cloud platform'],
  azure: ['microsoft azure'],
  'rest api': ['restful', 'rest', 'rest apis'],
  graphql: ['gql'],
  fastapi: ['fast api', 'fast-api'],
  flask: ['python flask'],
  django: ['python django'],
  express: ['expressjs', 'express.js'],
};

class SkillIntelligenceService {
  private skillCache: Map<string, Skill> = new Map();
  private roleSkillCache: Map<string, RoleSkillRequirement[]> = new Map();

  async normalizeSkillName(name: string): Promise<string> {
    let normalized = name.toLowerCase().trim();
    normalized = normalized.replace(/[^a-z0-9\s.+#]/g, '').trim();
    for (const [canonical, synonyms] of Object.entries(SKILL_SYNONYMS)) {
      if (synonyms.includes(normalized) || normalized === canonical) {
        return canonical;
      }
    }
    return normalized;
  }

  async extractSkillsFromText(text: string): Promise<Array<{ name: string; confidence: number; context?: string }>> {
    const results: Array<{ name: string; confidence: number; context?: string }> = [];
    const seen = new Set<string>();

    const allSkills = await skillRepository.findMany({});
    for (const skill of allSkills) {
      let aliases: string[] = [];
      try {
        aliases = JSON.parse(skill.aliases);
      } catch {
        aliases = [];
      }
      const namesToCheck = [skill.normalizedName, skill.name.toLowerCase(), ...aliases.map(a => a.toLowerCase())];
      for (const checkName of namesToCheck) {
        const regex = new RegExp(`\\b${this.escapeRegex(checkName)}\\b`, 'gi');
        if (regex.test(text)) {
          const key = skill.normalizedName;
          if (!seen.has(key)) {
            seen.add(key);
            const context = this.extractContextAround(text, text.toLowerCase().indexOf(checkName.toLowerCase()), 100);
            results.push({
              name: skill.name,
              confidence: this.calculateContextConfidence(context, checkName),
              context,
            });
          }
          break;
        }
      }
    }

    const techPatterns = [
      /\b(python|java|javascript|typescript|c\+\+|c#|go|rust|ruby|php|swift|kotlin|scala|r|matlab|perl)\b/gi,
      /\b(react|angular|vue|nextjs|nuxtjs|svelte|express|fastapi|flask|django|spring|rails|laravel|symfony)\b/gi,
      /\b(postgresql|mysql|mongodb|redis|sqlite|elasticsearch|cassandra|dynamodb|firebase|supabase)\b/gi,
      /\b(aws|gcp|azure|docker|kubernetes|terraform|jenkins|ci\/cd|nginx|linux|git)\b/gi,
      /\b(tensorflow|pytorch|keras|scikit-learn|sklearn|pandas|numpy|scipy|opencv|nlp|machine learning|deep learning)\b/gi,
      /\b(figma|sketch|photoshop|illustrator|adobe xd|ui\/ux|canva)\b/gi,
      /\b(rest|restful|graphql|grpc|websocket|api)\b/gi,
    ];

    for (const pattern of techPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const skillName = match[1].toLowerCase();
        const key = await this.normalizeSkillName(skillName);
        if (!seen.has(key)) {
          seen.add(key);
          const context = this.extractContextAround(text, match.index, 100);
          results.push({ name: skillName, confidence: 0.7, context });
        }
      }
    }

    return results;
  }

  private extractContextAround(text: string, index: number, range: number): string {
    if (index < 0) return '';
    const start = Math.max(0, index - range);
    const end = Math.min(text.length, index + range);
    return text.slice(start, end).trim();
  }

  private calculateContextConfidence(context: string, _skillName: string): number {
    let confidence = 0.8;
    const lowerContext = context.toLowerCase();
    if (lowerContext.includes('experience') || lowerContext.includes('proficient')) confidence += 0.1;
    if (lowerContext.includes('beginner') || lowerContext.includes('learning')) confidence -= 0.2;
    if (lowerContext.includes('expert') || lowerContext.includes('advanced')) confidence += 0.15;
    return Math.min(1, Math.max(0.3, confidence));
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async findOrCreateSkill(name: string): Promise<Skill> {
    const normalized = await this.normalizeSkillName(name);
    const cached = this.skillCache.get(normalized);
    if (cached) return cached;

    const existing = await skillRepository.findByName(normalized);
    if (existing) {
      this.skillCache.set(normalized, existing as Skill);
      return existing as Skill;
    }

    const created = await skillRepository.findOrCreate(name);
    this.skillCache.set(normalized, created as Skill);
    return created as Skill;
  }

  async getRoleSkills(roleId: string): Promise<RoleSkillRequirement[]> {
    const cached = this.roleSkillCache.get(roleId);
    if (cached) return cached;

    const role = await roleRepository.findById(roleId);
    if (!role) return [];

    const skills = ((role as any).requiredSkills || []) as RoleSkillRequirement[];
    this.roleSkillCache.set(roleId, skills);
    return skills;
  }

  async getRoleByTitle(title: string) {
    return roleRepository.findByTitle(title);
  }

  async analyzeSkillGap(
    resumeSkills: SkillWithProficiency[],
    roleSkills: RoleSkillRequirement[]
  ): Promise<SkillGapAnalysisResult> {
    const resumeSkillMap = new Map<string, SkillWithProficiency>();
    for (const rs of resumeSkills) {
      resumeSkillMap.set(rs.normalizedName || rs.name.toLowerCase(), rs);
    }

    const existing: SkillWithProficiency[] = [];
    const missing: SkillWithProficiency[] = [];
    const weak: SkillWithProficiency[] = [];
    const priority: SkillWithProficiency[] = [];

    let totalWeight = 0;
    let matchedWeight = 0;

    for (const req of roleSkills) {
      const skill = req.skill;
      const normalized = skill.normalizedName || skill.name.toLowerCase();
      const studentSkill = resumeSkillMap.get(normalized);

      const skillData: SkillWithProficiency = {
        ...skill,
        proficiency: studentSkill?.proficiency || 'BEGINNER',
        confidence: studentSkill?.confidence,
        context: studentSkill?.context,
      };

      totalWeight += req.weight;

      if (studentSkill) {
        existing.push(skillData);
        const studentScore = proficiencyToScore(studentSkill.proficiency as any);
        const requiredScore = proficiencyToScore(req.proficiency as any);
        matchedWeight += req.weight * Math.min(studentScore / requiredScore, 1);

        if (studentScore < requiredScore) {
          weak.push({ ...skillData, proficiency: req.proficiency });
          if (req.isRequired) priority.push(skillData);
        }
      } else {
        missing.push({ ...skillData, proficiency: req.proficiency });
        if (req.isRequired) priority.push(skillData);
      }
    }

    const coverageScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

    const recommendations = this.generateRecommendations(existing, missing, weak, priority);

    return {
      targetRole: '',
      roleId: '',
      existingSkills: existing,
      missingSkills: missing,
      weakSkills: weak,
      prioritySkills: priority,
      coverageScore,
      recommendations,
    };
  }

  private generateRecommendations(
    existing: SkillWithProficiency[],
    missing: SkillWithProficiency[],
    weak: SkillWithProficiency[],
    priority: SkillWithProficiency[]
  ): string[] {
    const recs: string[] = [];

    if (missing.length > 0) {
      const missingNames = missing.slice(0, 5).map(s => s.name).join(', ');
      recs.push(`Focus on learning: ${missingNames}`);
    }

    if (weak.length > 0) {
      const weakNames = weak.slice(0, 3).map(s => s.name).join(', ');
      recs.push(`Strengthen these skills: ${weakNames}`);
    }

    if (priority.length > 0) {
      recs.push(`${priority.length} high-priority skills need attention`);
    }

    if (existing.length > 0) {
      recs.push(`Build on your existing skills: ${existing.slice(0, 3).map(s => s.name).join(', ')}`);
    }

    return recs;
  }

  async computeMatchScore(
    resumeSkills: SkillWithProficiency[],
    opportunityRequired: any[],
    opportunityPreferred: any[]
  ): Promise<{
    matchScore: number;
    matchingSkills: SkillWithProficiency[];
    missingSkills: SkillWithProficiency[];
    experienceMatch: { score: number; details: string[] };
    recommendation: string;
  }> {
    const resumeMap = new Map<string, SkillWithProficiency>();
    for (const rs of resumeSkills) {
      resumeMap.set(rs.normalizedName || rs.name.toLowerCase(), rs);
    }

    const matching: SkillWithProficiency[] = [];
    const missing: SkillWithProficiency[] = [];

    let requiredWeight = 0;
    let matchedRequiredWeight = 0;
    let preferredMatched = 0;

    for (const req of (opportunityRequired || [])) {
      const skillName = typeof req === 'string' ? req : req.skill || req.name || '';
      const normalized = skillName.toLowerCase();
      requiredWeight += 1;
      const studentSkill = resumeMap.get(normalized);
      if (studentSkill) {
        matching.push(studentSkill);
        matchedRequiredWeight += 1;
      } else {
        missing.push({
          id: '',
          name: skillName,
          normalizedName: normalized,
          category: 'OTHER',
          aliases: '[]',
          proficiency: 'INTERMEDIATE',
        });
      }
    }

    for (const pref of (opportunityPreferred || [])) {
      const skillName = typeof pref === 'string' ? pref : pref.skill || pref.name || '';
      const normalized = skillName.toLowerCase();
      if (resumeMap.has(normalized)) {
        preferredMatched++;
        const skill = resumeMap.get(normalized)!;
        if (!matching.find(m => m.normalizedName === normalized)) {
          matching.push(skill);
        }
      }
    }

    const requiredScore = requiredWeight > 0 ? (matchedRequiredWeight / requiredWeight) * 70 : 35;
    const preferredTotal = (opportunityPreferred || []).length;
    const preferredScore = preferredTotal > 0 ? (preferredMatched / preferredTotal) * 30 : 15;
    const matchScore = Math.round(Math.min(100, requiredScore + preferredScore));

    const details: string[] = [];
    if (matching.length > 0) details.push(`Matched ${matching.length} skills`);
    if (missing.length > 0) details.push(`Missing ${missing.length} required skills`);
    if (preferredMatched > 0) details.push(`Matched ${preferredMatched} preferred skills`);

    let recommendation = '';
    if (matchScore >= 80) recommendation = 'Strong match. You are well-qualified for this role.';
    else if (matchScore >= 60) recommendation = 'Good match. Consider strengthening missing skills before applying.';
    else if (matchScore >= 40) recommendation = 'Moderate match. Focus on acquiring the missing required skills.';
    else recommendation = 'Low match. Consider building fundamental skills before applying.';

    return {
      matchScore,
      matchingSkills: matching,
      missingSkills: missing,
      experienceMatch: { score: matchScore, details },
      recommendation,
    };
  }
}

export const skillIntelligence = new SkillIntelligenceService();
