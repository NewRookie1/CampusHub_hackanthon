import { resumeService } from './resumeService.js';
import { skillIntelligence } from './skillIntelligence.js';
import { opportunityRepository } from '../repositories/opportunityRepository.js';
import { matchResultRepository } from '../repositories/matchResultRepository.js';
import { AppError } from '../utils/AppError.js';

class MatchingService {
  async matchResumeToOpportunity(
    resumeId: string,
    opportunityId: string,
    userId: string
  ) {
    const resume = await resumeService.getResumeById(resumeId);
    if (!resume) throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');

    const opportunity = await opportunityRepository.findById(opportunityId);
    if (!opportunity) throw new AppError('Opportunity not found', 404, 'OPPORTUNITY_NOT_FOUND');

    const resumeSkills = await resumeService.getResumeSkills(resumeId);
    let requiredSkills: any[] = [];
    let preferredSkills: any[] = [];
    try { requiredSkills = JSON.parse(opportunity.requiredSkills as string); } catch { requiredSkills = []; }
    try { preferredSkills = JSON.parse(opportunity.preferredSkills as string); } catch { preferredSkills = []; }

    const matchResult = await skillIntelligence.computeMatchScore(
      resumeSkills,
      requiredSkills,
      preferredSkills
    );

    const saved = await matchResultRepository.findOrCreate(userId, opportunityId, resumeId, {
      matchScore: matchResult.matchScore,
      matchingSkills: JSON.stringify(matchResult.matchingSkills),
      missingSkills: JSON.stringify(matchResult.missingSkills),
      experienceMatch: JSON.stringify(matchResult.experienceMatch),
      recommendation: matchResult.recommendation,
      status: 'MATCHED',
    });

    return {
      match_id: saved.id,
      match_score: matchResult.matchScore,
      matching_skills: matchResult.matchingSkills.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        proficiency: s.proficiency,
      })),
      missing_skills: matchResult.missingSkills.map(s => ({
        name: s.name,
        category: s.category,
        proficiency: s.proficiency,
      })),
      experience_match: matchResult.experienceMatch,
      recommendation: matchResult.recommendation,
      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        company: (opportunity as any).companyProfile?.companyName,
        location: opportunity.location,
        type: opportunity.type,
      },
    };
  }

  async getOpportunityMatches(userId: string) {
    return matchResultRepository.findByUser(userId);
  }

  async getMatchById(matchId: string) {
    const match = await matchResultRepository.findById(matchId);
    if (!match) throw new AppError('Match not found', 404, 'MATCH_NOT_FOUND');
    return match;
  }

  async findBestOpportunities(userId: string, resumeId: string, limit: number = 10) {
    const resumeSkills = await resumeService.getResumeSkills(resumeId);
    const opportunities = await opportunityRepository.findMany({ page: 1, limit: 100 });

    const scored = await Promise.all(
      opportunities.data.map(async (opp) => {
        let required: any[] = [];
        let preferred: any[] = [];
        try { required = JSON.parse(opp.requiredSkills as string); } catch { required = []; }
        try { preferred = JSON.parse(opp.preferredSkills as string); } catch { preferred = []; }
        const match = await skillIntelligence.computeMatchScore(resumeSkills, required, preferred);
        return {
          opportunity: opp,
          score: match.matchScore,
          match,
        };
      })
    );

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }
}

export const matchingService = new MatchingService();
