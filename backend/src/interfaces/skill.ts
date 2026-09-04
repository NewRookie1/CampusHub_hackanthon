export interface Skill {
  id: string;
  name: string;
  normalizedName: string;
  category: string;
  description?: string | null;
  aliases: string;
}

export enum SkillCategory {
  PROGRAMMING = 'PROGRAMMING',
  FRAMEWORK = 'FRAMEWORK',
  DATABASE = 'DATABASE',
  CLOUD = 'CLOUD',
  DEVOPS = 'DEVOPS',
  DATA_SCIENCE = 'DATA_SCIENCE',
  AI_ML = 'AI_ML',
  DESIGN = 'DESIGN',
  SECURITY = 'SECURITY',
  SOFT_SKILL = 'SOFT_SKILL',
  OTHER = 'OTHER',
}

export interface SkillWithProficiency extends Skill {
  proficiency: string;
  confidence?: number;
  context?: string | null;
  yearsExperience?: number;
  projects?: string[];
  certifications?: string[];
}

export interface RoleSkillRequirement {
  skillId: string;
  skill: Skill;
  proficiency: string;
  isRequired: boolean;
  weight: number;
  order: number;
}

export interface Role {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  level?: string | null;
  requiredSkills: RoleSkillRequirement[];
}

export interface SkillGapAnalysisResult {
  targetRole: string;
  roleId: string;
  existingSkills: SkillWithProficiency[];
  missingSkills: SkillWithProficiency[];
  weakSkills: SkillWithProficiency[];
  prioritySkills: SkillWithProficiency[];
  coverageScore: number;
  recommendations: string[];
}

export interface ResumeMatchResult {
  matchScore: number;
  matchingSkills: SkillWithProficiency[];
  missingSkills: SkillWithProficiency[];
  experienceMatch: {
    score: number;
    details: string[];
  };
  recommendation: string;
}

export interface SkillGraphNode {
  id: string;
  type: 'role' | 'skill' | 'project' | 'technology' | 'certification';
  label: string;
  data: Record<string, unknown>;
  metadata?: {
    proficiency?: string;
    isMissing?: boolean;
    isWeak?: boolean;
    priority?: number;
  };
}

export interface SkillGraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'requires' | 'related_to' | 'depends_on' | 'demonstrated_by' | 'missing_for';
  weight?: number;
  label?: string;
}

export interface SkillGraphData {
  nodes: SkillGraphNode[];
  edges: SkillGraphEdge[];
}

export interface ScheduleDay {
  day: number;
  date: string;
  topics: ScheduleTopic[];
  totalHours: number;
}

export interface ScheduleTopic {
  id: string;
  title: string;
  description: string;
  skillId?: string;
  skillName?: string;
  type: 'fundamentals' | 'skill' | 'practice' | 'project' | 'revision' | 'interview_prep';
  estimatedHours: number;
  resources?: string[];
  dependencies?: string[];
  completed?: boolean;
}

export interface GeneratedSchedule {
  title: string;
  description: string;
  totalDays: number;
  hoursPerDay: number;
  startDate: string;
  endDate: string;
  schedule: ScheduleDay[];
  metadata: {
    targetRole: string;
    roleId: string;
    missingSkillsCount: number;
    roadmapId?: string;
  };
}

export interface InterviewQuestion {
  id: string;
  stage: string;
  question: string;
  expectedTopics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitMinutes?: number;
  followUpQuestions?: string[];
}

export interface InterviewEvaluation {
  questionId: string;
  answer: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  technicalCorrectness: number;
  communication: number;
  clarity: number;
  relevance: number;
  problemSolving: number;
  completeness: number;
}

export interface InterviewSessionData {
  sessionId: string;
  currentStage: string;
  currentQuestionIndex: number;
  questions: InterviewQuestion[];
  evaluations: InterviewEvaluation[];
  totalScore: number;
  feedback: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}
