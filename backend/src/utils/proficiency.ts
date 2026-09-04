export const PROFICIENCY_ORDER: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

export function compareProficiency(a: string, b: string): number {
  return (PROFICIENCY_ORDER[a] || 0) - (PROFICIENCY_ORDER[b] || 0);
}

export function isProficiencyAtLeast(level: string, minimum: string): boolean {
  return (PROFICIENCY_ORDER[level] || 0) >= (PROFICIENCY_ORDER[minimum] || 0);
}

export function proficiencyToScore(level: string): number {
  return (PROFICIENCY_ORDER[level] || 1) / 4;
}

export function scoreToProficiency(score: number): string {
  if (score >= 0.75) return 'EXPERT';
  if (score >= 0.5) return 'ADVANCED';
  if (score >= 0.25) return 'INTERMEDIATE';
  return 'BEGINNER';
}
