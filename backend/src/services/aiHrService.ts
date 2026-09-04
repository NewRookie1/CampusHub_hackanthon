import { interviewRepository } from '../repositories/interviewRepository.js';
import { roleRepository } from '../repositories/roleRepository.js';
import { OpenAIService } from '../ml/openaiService.js';
import {
  InterviewQuestion,
  InterviewEvaluation,
  InterviewSessionData,
} from '../interfaces/skill.js';
import { AppError } from '../utils/AppError.js';

class AiHrService {
  private openai: OpenAIService;

  constructor() {
    this.openai = new OpenAIService();
  }

  async startSession(
    userId: string,
    options: {
      roleId?: string;
      stage?: string;
      difficulty?: string;
      numQuestions?: number;
    }
  ): Promise<InterviewSessionData> {
    const { roleId, stage, difficulty, numQuestions } = options;
    const numQ = numQuestions || 5;

    let roleTitle = 'General';
    if (roleId) {
      const role = await roleRepository.findById(roleId);
      if (role) roleTitle = role.title;
    }

    const questions = await this.generateQuestions(roleTitle, stage || 'HR_INTERVIEW', difficulty || 'medium', numQ);

    const session = await interviewRepository.create({
      userId,
      roleId: roleId || undefined,
      stage: stage || 'HR_INTERVIEW',
      status: 'IN_PROGRESS',
      questions: JSON.stringify(questions),
      evaluations: JSON.stringify([]),
      totalScore: 0,
      currentQuestion: 0,
    });

    return {
      sessionId: session.id,
      currentStage: session.stage,
      currentQuestionIndex: 0,
      questions,
      evaluations: [],
      totalScore: 0,
      feedback: '',
      status: 'in_progress',
    };
  }

  async evaluateAnswer(
    sessionId: string,
    questionId: string,
    answer: string
  ): Promise<{
    evaluation: InterviewEvaluation;
    nextQuestion: InterviewQuestion | null;
    sessionComplete: boolean;
    currentScore: number;
  }> {
    const session = await interviewRepository.findById(sessionId);
    if (!session) throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    if (session.status !== 'IN_PROGRESS') throw new AppError('Session is not in progress', 400, 'SESSION_INACTIVE');

    let questions: InterviewQuestion[];
    try {
      questions = JSON.parse(session.questions as string);
    } catch {
      questions = [];
    }

    const question = questions.find(q => q.id === questionId);
    if (!question) throw new AppError('Question not found', 404, 'QUESTION_NOT_FOUND');

    const evaluation = await this.evaluateResponse(question, answer);

    let evaluations: InterviewEvaluation[];
    try {
      evaluations = JSON.parse(session.evaluations as string);
    } catch {
      evaluations = [];
    }
    evaluations.push(evaluation);

    const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;

    const currentIdx = questions.findIndex(q => q.id === questionId);
    const nextQuestion = currentIdx < questions.length - 1 ? questions[currentIdx + 1] : null;
    const sessionComplete = !nextQuestion;

    await interviewRepository.update(sessionId, {
      evaluations: JSON.stringify(evaluations),
      totalScore,
      currentQuestion: currentIdx + 1,
      status: sessionComplete ? 'COMPLETED' : 'IN_PROGRESS',
      completedAt: sessionComplete ? new Date() : undefined,
      feedback: sessionComplete ? this.generateOverallFeedback(evaluations, totalScore) : undefined,
    });

    return {
      evaluation,
      nextQuestion,
      sessionComplete,
      currentScore: totalScore,
    };
  }

  async getSession(sessionId: string): Promise<InterviewSessionData> {
    const session = await interviewRepository.findById(sessionId);
    if (!session) throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');

    let questions: InterviewQuestion[];
    let evaluations: InterviewEvaluation[];
    try { questions = JSON.parse(session.questions as string); } catch { questions = []; }
    try { evaluations = JSON.parse(session.evaluations as string); } catch { evaluations = []; }

    return {
      sessionId: session.id,
      currentStage: session.stage,
      currentQuestionIndex: session.currentQuestion,
      questions,
      evaluations,
      totalScore: session.totalScore,
      feedback: session.feedback || '',
      status: session.status === 'COMPLETED' ? 'completed' : session.status === 'ABANDONED' ? 'abandoned' : 'in_progress',
    };
  }

  async getUserSessions(userId: string) {
    return interviewRepository.findByUser(userId);
  }

  async abandonSession(sessionId: string) {
    const session = await interviewRepository.findById(sessionId);
    if (!session) throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    await interviewRepository.update(sessionId, { status: 'ABANDONED' });
  }

  private async generateQuestions(
    role: string,
    stage: string,
    difficulty: string,
    count: number
  ): Promise<InterviewQuestion[]> {
    const prompt = `Generate ${count} interview questions for a ${role} position.
Stage: ${stage}
Difficulty: ${difficulty}

Return a JSON array of objects with these fields:
- id: unique string (use "q1", "q2", etc.)
- question: the interview question text
- expectedTopics: array of key topics the answer should cover
- difficulty: "easy", "medium", or "hard"
- followUpQuestions: array of 1-2 follow-up questions

Make questions realistic and relevant to the ${stage.replace(/_/g, ' ').toLowerCase()} stage.`;

    try {
      const response = await this.openai.generateJson(prompt);
      if (Array.isArray(response)) {
        return response.map((q: any, i: number) => ({
          id: q.id || `q${i + 1}`,
          stage: stage,
          question: q.question,
          expectedTopics: q.expectedTopics || [],
          difficulty: q.difficulty || difficulty,
          followUpQuestions: q.followUpQuestions || [],
        }));
      }
    } catch {
      // Fallback to default questions if AI fails
    }

    return this.getDefaultQuestions(role, stage, count);
  }

  private async evaluateResponse(
    question: InterviewQuestion,
    answer: string
  ): Promise<InterviewEvaluation> {
    const prompt = `Evaluate this interview response:

Question: ${question.question}
Expected topics: ${question.expectedTopics.join(', ')}
Difficulty: ${question.difficulty}

Candidate's answer: "${answer}"

Provide a JSON evaluation with these fields:
- score: number 0-100
- strengths: array of strengths (2-3 items)
- weaknesses: array of weaknesses (1-2 items)
- feedback: constructive feedback string (2-3 sentences)
- technicalCorrectness: 0-100
- communication: 0-100
- clarity: 0-100
- relevance: 0-100
- problemSolving: 0-100
- completeness: 0-100`;

    try {
      const response = await this.openai.generateJson(prompt);
      if (response && typeof response === 'object') {
        return {
          questionId: question.id,
          answer,
          score: Math.min(100, Math.max(0, response.score || 50)),
          strengths: response.strengths || [],
          weaknesses: response.weaknesses || [],
          feedback: response.feedback || '',
          technicalCorrectness: Math.min(100, response.technicalCorrectness || 50),
          communication: Math.min(100, response.communication || 50),
          clarity: Math.min(100, response.clarity || 50),
          relevance: Math.min(100, response.relevance || 50),
          problemSolving: Math.min(100, response.problemSolving || 50),
          completeness: Math.min(100, response.completeness || 50),
        };
      }
    } catch {
      // Fallback to heuristic evaluation
    }

    return this.heuristicEvaluation(question, answer);
  }

  private heuristicEvaluation(question: InterviewQuestion, answer: string): InterviewEvaluation {
    const words = answer.split(/\s+/).length;
    const hasRelevantTerms = question.expectedTopics.some(topic =>
      answer.toLowerCase().includes(topic.toLowerCase())
    );

    let score = 40;
    if (words > 20) score += 15;
    if (words > 50) score += 10;
    if (hasRelevantTerms) score += 20;
    if (answer.includes('because') || answer.includes('example')) score += 10;
    if (answer.includes('I believe') || answer.includes('In my experience')) score += 5;

    return {
      questionId: question.id,
      answer,
      score: Math.min(100, score),
      strengths: words > 30 ? ['Detailed response'] : ['Clear communication'],
      weaknesses: words < 20 ? ['Response too brief'] : [],
      feedback: words < 30
        ? 'Try to provide more detailed responses with examples.'
        : 'Good response. Consider adding more specific examples.',
      technicalCorrectness: Math.min(100, score + 5),
      communication: Math.min(100, words > 30 ? 70 : 50),
      clarity: Math.min(100, words > 20 ? 65 : 45),
      relevance: hasRelevantTerms ? 75 : 45,
      problemSolving: Math.min(100, score),
      completeness: Math.min(100, words > 40 ? 70 : 40),
    };
  }

  private generateOverallFeedback(evaluations: InterviewEvaluation[], totalScore: number): string {
    const strengths = [...new Set(evaluations.flatMap(e => e.strengths))].slice(0, 5);
    const weaknesses = [...new Set(evaluations.flatMap(e => e.weaknesses))].slice(0, 5);

    let feedback = `Overall Score: ${Math.round(totalScore)}/100.\n`;
    if (strengths.length > 0) feedback += `Strengths: ${strengths.join(', ')}.\n`;
    if (weaknesses.length > 0) feedback += `Areas to improve: ${weaknesses.join(', ')}.\n`;

    if (totalScore >= 80) feedback += 'Excellent performance! You are well-prepared for interviews.';
    else if (totalScore >= 60) feedback += 'Good performance with room for improvement.';
    else if (totalScore >= 40) feedback += 'Average performance. Focus on the identified weak areas.';
    else feedback += 'Needs significant improvement. Review fundamentals and practice more.';

    return feedback;
  }

  private getDefaultQuestions(role: string, stage: string, count: number): InterviewQuestion[] {
    const questionsByStage: Record<string, string[]> = {
      HR_INTERVIEW: [
        'Tell me about yourself and your background.',
        'Why are you interested in this position?',
        'What are your strengths and weaknesses?',
        'Where do you see yourself in 5 years?',
        'Why should we hire you?',
        'Tell me about a challenge you overcame.',
        'How do you handle pressure and deadlines?',
        'What motivates you in your work?',
      ],
      TECHNICAL_INTERVIEW: [
        'Explain a technical project you have worked on.',
        'How would you design a system for this use case?',
        'What is your approach to debugging complex issues?',
        'Explain the difference between two related technologies.',
        'How do you ensure code quality in your projects?',
        'Describe your experience with version control and collaboration.',
        'What testing strategies do you use?',
        'How do you stay updated with new technologies?',
      ],
      BEHAVIORAL_INTERVIEW: [
        'Describe a time you had to work with a difficult team member.',
        'Tell me about a time you failed and what you learned.',
        'How do you prioritize tasks when everything seems urgent?',
        'Describe a situation where you had to make a quick decision.',
        'Tell me about a time you went above and beyond.',
        'How do you handle constructive criticism?',
        'Describe your ideal work environment.',
      ],
    };

    const pool = questionsByStage[stage] || questionsByStage.HR_INTERVIEW;
    return pool.slice(0, count).map((q, i) => ({
      id: `q${i + 1}`,
      stage: stage,
      question: q,
      expectedTopics: [],
      difficulty: 'medium' as const,
      followUpQuestions: [],
    }));
  }
}

export const aiHrService = new AiHrService();
