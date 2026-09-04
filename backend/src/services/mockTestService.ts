import { mockTestRepository } from '../repositories/mockTestRepository.js';
import { aiService } from './ai/ai_service.js';
import { EXAM_TYPES, type ExamTypeKey } from '../schemas/mockTest.js';
import type {
  MockQuestion,
  MockTestSession,
  MockTestEvaluation,
  MockQuestionResult,
} from '../interfaces/mockTest.js';
import { AppError } from '../utils/AppError.js';

class MockTestService {
  async startTest(
    userId: string,
    options: {
      examType: string;
      subject: string;
      difficulty?: string;
      numQuestions?: number;
      timeLimitMinutes?: number;
    }
  ): Promise<MockTestSession> {
    const { examType, subject, difficulty, numQuestions, timeLimitMinutes } = options;
    const examKey = examType.toUpperCase() as ExamTypeKey;
    const examConfig = EXAM_TYPES[examKey];
    if (!examConfig) {
      throw new AppError(`Unsupported exam type: ${examType}`, 400, 'INVALID_EXAM_TYPE');
    }

    const numQ = numQuestions || 20;
    const timeLimit = timeLimitMinutes || examConfig.defaultTime;
    const diff = difficulty || 'medium';

    const existing = await mockTestRepository.getActiveTest(userId);
    if (existing) {
      throw new AppError('You already have an active test. Complete or abandon it first.', 400, 'ACTIVE_TEST_EXISTS');
    }

    let questions: MockQuestion[];
    try {
      questions = await this.generateQuestions(examKey, subject, diff, numQ, examConfig);
    } catch {
      questions = this.getDefaultQuestions(examKey, subject, diff, numQ);
    }

    const test = await mockTestRepository.create({
      userId,
      examType: examKey,
      subject,
      difficulty: diff,
      totalQuestions: questions.length,
      timeLimitMinutes: timeLimit,
      status: 'NOT_STARTED',
      totalScore: 0,
      maxScore: questions.reduce((sum, q) => sum + q.marks, 0),
      questions: JSON.stringify(questions),
      answers: JSON.stringify([]),
      metadata: JSON.stringify({
        examFullName: examConfig.fullName,
        sections: examConfig.sections,
        questionTypes: examConfig.questionTypes,
      }),
    });

    return {
      testId: test.id,
      examType: examKey,
      subject,
      difficulty: diff,
      totalQuestions: questions.length,
      timeLimitMinutes: timeLimit,
      questions: questions.map(q => ({
        ...q,
        correctAnswer: '',
        explanation: '',
      })),
      status: 'not_started',
    };
  }

  async startAttempt(testId: string): Promise<MockTestSession> {
    const test = await mockTestRepository.findById(testId);
    if (!test) throw new AppError('Test not found', 404, 'TEST_NOT_FOUND');

    let questions: MockQuestion[];
    try { questions = JSON.parse(test.questions as string); } catch { questions = []; }

    if (test.status === 'NOT_STARTED') {
      await mockTestRepository.update(testId, {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      });
    }

    return {
      testId: test.id,
      examType: test.examType,
      subject: test.subject,
      difficulty: test.difficulty,
      totalQuestions: questions.length,
      timeLimitMinutes: test.timeLimitMinutes,
      questions,
      status: test.status === 'COMPLETED' ? 'completed' : 'in_progress',
      startedAt: test.startedAt?.toISOString(),
    };
  }

  async submitAnswer(
    testId: string,
    questionIndex: number,
    answer: string,
    timeTakenSeconds?: number
  ): Promise<{ saved: boolean; nextQuestion: number | null }> {
    const test = await mockTestRepository.findById(testId);
    if (!test) throw new AppError('Test not found', 404, 'TEST_NOT_FOUND');
    if (test.status === 'COMPLETED') throw new AppError('Test already completed', 400, 'TEST_COMPLETED');

    let answers: { questionIndex: number; answer: string; timeTaken?: number }[];
    try { answers = JSON.parse(test.answers as string); } catch { answers = []; }

    const existing = answers.findIndex(a => a.questionIndex === questionIndex);
    const entry = { questionIndex, answer, timeTaken: timeTakenSeconds };
    if (existing >= 0) {
      answers[existing] = entry;
    } else {
      answers.push(entry);
    }

    await mockTestRepository.update(testId, { answers: JSON.stringify(answers) });

    let questions: MockQuestion[];
    try { questions = JSON.parse(test.questions as string); } catch { questions = []; }

    const nextIdx = answers.length < questions.length
      ? questions.findIndex(q => !answers.some(a => a.questionIndex === q.index))
      : -1;

    return { saved: true, nextQuestion: nextIdx >= 0 ? nextIdx : null };
  }

  async completeTest(testId: string): Promise<MockTestEvaluation> {
    const test = await mockTestRepository.findById(testId);
    if (!test) throw new AppError('Test not found', 404, 'TEST_NOT_FOUND');
    if (test.status === 'COMPLETED') throw new AppError('Test already completed', 400, 'TEST_COMPLETED');

    let questions: MockQuestion[];
    let answers: { questionIndex: number; answer: string; timeTaken?: number }[];
    try { questions = JSON.parse(test.questions as string); } catch { questions = []; }
    try { answers = JSON.parse(test.answers as string); } catch { answers = []; }

    let evaluation: MockTestEvaluation;
    try {
      evaluation = await this.aiEvaluate(questions, answers, test);
    } catch {
      evaluation = this.heuristicEvaluate(questions, answers, test);
    }

    await mockTestRepository.update(testId, {
      status: 'COMPLETED',
      completedAt: new Date(),
      totalScore: evaluation.totalScore,
      percentage: evaluation.percentage,
      timeTaken: evaluation.timeTaken,
      feedback: evaluation.feedback,
    });

    const resultData = evaluation.detailedResults.map((r) => ({
      mockTestId: testId,
      userId: test.userId,
      questionIndex: r.questionIndex,
      question: r.question,
      questionType: r.type,
      options: JSON.stringify(r.options || []),
      correctAnswer: r.correctAnswer,
      userAnswer: r.userAnswer,
      isCorrect: r.isCorrect,
      score: r.score,
      maxScore: r.maxScore,
      explanation: r.explanation,
    }));

    if (resultData.length > 0) {
      await mockTestRepository.createResults(resultData);
    }

    return evaluation;
  }

  async getTest(testId: string): Promise<MockTestSession> {
    const test = await mockTestRepository.findById(testId);
    if (!test) throw new AppError('Test not found', 404, 'TEST_NOT_FOUND');

    let questions: MockQuestion[];
    try { questions = JSON.parse(test.questions as string); } catch { questions = []; }

    return {
      testId: test.id,
      examType: test.examType,
      subject: test.subject,
      difficulty: test.difficulty,
      totalQuestions: questions.length,
      timeLimitMinutes: test.timeLimitMinutes,
      questions,
      status: test.status === 'COMPLETED' ? 'completed' : test.status === 'IN_PROGRESS' ? 'in_progress' : 'not_started',
      startedAt: test.startedAt?.toISOString(),
    };
  }

  async getUserTests(userId: string) {
    return mockTestRepository.findByUser(userId);
  }

  async getTestResults(testId: string) {
    return mockTestRepository.getResults(testId);
  }

  async getStats(userId: string) {
    return mockTestRepository.getStats(userId);
  }

  async abandonTest(testId: string) {
    const test = await mockTestRepository.findById(testId);
    if (!test) throw new AppError('Test not found', 404, 'TEST_NOT_FOUND');
    await mockTestRepository.update(testId, { status: 'ABANDONED' });
  }

  async deleteTest(testId: string) {
    const test = await mockTestRepository.findById(testId);
    if (!test) throw new AppError('Test not found', 404, 'TEST_NOT_FOUND');
    await mockTestRepository.delete(testId);
  }

  private async generateQuestions(
    examType: ExamTypeKey,
    subject: string,
    difficulty: string,
    count: number,
    examConfig: typeof EXAM_TYPES[ExamTypeKey]
  ): Promise<MockQuestion[]> {
    const prompt = `Generate ${count} ${difficulty} level ${examType} exam questions for the subject: ${subject}.

Exam format: ${examConfig.fullName}
Sections: ${examConfig.sections.join(', ')}
Question types: ${examConfig.questionTypes.join(', ')}

Return a JSON array of objects with these fields:
- id: unique string (use "q1", "q2", etc.)
- index: zero-based index (0, 1, 2...)
- question: the question text
- type: "MCQ" for multiple choice
- options: array of 4 options (for MCQ)
- correctAnswer: the correct option letter (A, B, C, or D)
- explanation: brief explanation of the correct answer
- marks: marks for this question (typically 1 or 2)
- negativeMarks: negative marks for wrong answer (typically 0.33 or 0)
- difficulty: "easy", "medium", or "hard"
- topic: the specific topic within the subject
- section: which section this belongs to

Make questions realistic, exam-quality, and aligned with actual ${examType} standards.`;

    const response = await aiService.generateJson(prompt);
    if (Array.isArray(response)) {
      return response.map((q: any, i: number) => ({
        id: q.id || `q${i + 1}`,
        index: q.index ?? i,
        question: q.question || `Question ${i + 1}`,
        type: q.type || 'MCQ',
        options: q.options || [],
        correctAnswer: q.correctAnswer || 'A',
        explanation: q.explanation || '',
        marks: q.marks || 1,
        negativeMarks: q.negativeMarks || 0,
        difficulty: q.difficulty || difficulty,
        topic: q.topic || subject,
        section: q.section || examConfig.sections[0],
      }));
    }
    throw new Error('Invalid AI response format');
  }

  private async aiEvaluate(
    questions: MockQuestion[],
    answers: { questionIndex: number; answer: string; timeTaken?: number }[],
    test: { id: string; examType: string; subject: string }
  ): Promise<MockTestEvaluation> {
    const answerMap = new Map(answers.map(a => [a.questionIndex, a]));
    const results: MockQuestionResult[] = [];
    let totalScore = 0;
    let maxScore = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    const totalTime = answers.reduce((sum, a) => sum + (a.timeTaken || 0), 0);

    for (const q of questions) {
      maxScore += q.marks;
      const userAnswer = answerMap.get(q.index);

      if (!userAnswer) {
        unattempted++;
        results.push({
          questionIndex: q.index,
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          userAnswer: null,
          isCorrect: null,
          score: 0,
          maxScore: q.marks,
          explanation: q.explanation,
        });
        continue;
      }

      const isCorrect = userAnswer.answer.toUpperCase().trim() === q.correctAnswer.toUpperCase().trim();
      const score = isCorrect ? q.marks : -q.negativeMarks;
      totalScore += score;

      if (isCorrect) correct++;
      else incorrect++;

      results.push({
        questionIndex: q.index,
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswer.answer,
        isCorrect,
        score,
        maxScore: q.marks,
        explanation: q.explanation,
      });
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    const topicResults: Record<string, { correct: number; total: number; score: number }> = {};
    for (const r of results) {
      const q = questions.find(q => q.index === r.questionIndex);
      const topic = q?.topic || 'General';
      if (!topicResults[topic]) topicResults[topic] = { correct: 0, total: 0, score: 0 };
      topicResults[topic].total++;
      if (r.isCorrect) topicResults[topic].correct++;
      topicResults[topic].score += r.score;
    }

    const feedback = this.generateFeedback(percentage, correct, incorrect, unattempted, questions.length);
    const strengths = Object.entries(topicResults)
      .filter(([, v]) => v.total > 0 && v.correct / v.total >= 0.7)
      .map(([k]) => k);
    const weaknesses = Object.entries(topicResults)
      .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.5)
      .map(([k]) => k);

    return {
      testId: test.id,
      totalScore,
      maxScore,
      percentage: Math.round(percentage * 100) / 100,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unattempted,
      timeTaken: totalTime,
      sectionWise: topicResults,
      feedback,
      strengths,
      weaknesses,
      detailedResults: results,
    };
  }

  private heuristicEvaluate(
    questions: MockQuestion[],
    answers: { questionIndex: number; answer: string; timeTaken?: number }[],
    test: { id: string; examType: string; subject: string }
  ): MockTestEvaluation {
    const answerMap = new Map(answers.map(a => [a.questionIndex, a]));
    const results: MockQuestionResult[] = [];
    let totalScore = 0;
    let maxScore = 0;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    const totalTime = answers.reduce((sum, a) => sum + (a.timeTaken || 0), 0);

    for (const q of questions) {
      maxScore += q.marks;
      const userAnswer = answerMap.get(q.index);

      if (!userAnswer) {
        unattempted++;
        results.push({
          questionIndex: q.index,
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          userAnswer: null,
          isCorrect: null,
          score: 0,
          maxScore: q.marks,
          explanation: q.explanation,
        });
        continue;
      }

      const isCorrect = userAnswer.answer.toUpperCase().trim() === q.correctAnswer.toUpperCase().trim();
      const score = isCorrect ? q.marks : -q.negativeMarks;
      totalScore += score;

      if (isCorrect) correct++;
      else incorrect++;

      results.push({
        questionIndex: q.index,
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswer.answer,
        isCorrect,
        score,
        maxScore: q.marks,
        explanation: q.explanation,
      });
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const feedback = this.generateFeedback(percentage, correct, incorrect, unattempted, questions.length);

    return {
      testId: test.id,
      totalScore,
      maxScore,
      percentage: Math.round(percentage * 100) / 100,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unattempted,
      timeTaken: totalTime,
      sectionWise: {},
      feedback,
      strengths: [],
      weaknesses: [],
      detailedResults: results,
    };
  }

  private generateFeedback(
    percentage: number,
    correct: number,
    incorrect: number,
    unattempted: number,
    total: number
  ): string {
    const accuracy = (correct + incorrect) > 0 ? (correct / (correct + incorrect)) * 100 : 0;
    let feedback = `Score: ${Math.round(percentage)}% (${correct}/${total} correct).\n`;
    feedback += `Accuracy: ${Math.round(accuracy)}% | Attempted: ${correct + incorrect}/${total}.\n`;

    if (percentage >= 80) feedback += 'Excellent performance! You are well-prepared.';
    else if (percentage >= 60) feedback += 'Good performance. Focus on weak areas for improvement.';
    else if (percentage >= 40) feedback += 'Average. Review concepts and practice more.';
    else feedback += 'Needs significant improvement. Revisit fundamentals.';

    if (unattempted > total * 0.2) feedback += `\nWarning: ${unattempted} questions were unattempted. Practice time management.`;

    return feedback;
  }

  private getDefaultQuestions(
    examType: ExamTypeKey,
    subject: string,
    difficulty: string,
    count: number
  ): MockQuestion[] {
    const defaults: Record<string, { q: string; opts: string[]; ans: string; topic: string }[]> = {
      GATE: [
        { q: 'What is the time complexity of binary search?', opts: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], ans: 'B', topic: 'Algorithms' },
        { q: 'Which data structure uses FIFO principle?', opts: ['Stack', 'Queue', 'Tree', 'Graph'], ans: 'B', topic: 'Data Structures' },
        { q: 'What is the NORMAL form of a relation where every non-key attribute is fully functionally dependent on the primary key?', opts: ['1NF', '2NF', '3NF', 'BCNF'], ans: 'B', topic: 'Databases' },
        { q: 'In networking, which layer is responsible for end-to-end communication?', opts: ['Physical Layer', 'Data Link Layer', 'Network Layer', 'Transport Layer'], ans: 'D', topic: 'Computer Networks' },
        { q: 'What is the output of printf("%d", sizeof(1.0f))? (on 32-bit system)', opts: ['2', '4', '8', '16'], ans: 'B', topic: 'Programming' },
      ],
      TOEFL: [
        { q: 'Which of the following is an example of an independent clause?', opts: ['Running quickly', 'The dog barked loudly', 'Having finished dinner', 'In the morning'], ans: 'B', topic: 'Grammar' },
        { q: 'What does the word "ubiquitous" mean?', opts: ['Rare', 'Everywhere', 'Unique', 'Uncertain'], ans: 'B', topic: 'Vocabulary' },
        { q: 'In academic writing, which tone is most appropriate?', opts: ['Casual', 'Formal', 'Emotional', 'Humorous'], ans: 'B', topic: 'Writing' },
        { q: 'Which transition word indicates contrast?', opts: ['Furthermore', 'However', 'Therefore', 'Additionally'], ans: 'B', topic: 'Reading' },
        { q: 'What is the main purpose of a thesis statement?', opts: ['To provide background', 'To state the main argument', 'To conclude', 'To list sources'], ans: 'B', topic: 'Writing' },
      ],
      GRE: [
        { q: 'If x + y = 10 and x - y = 4, what is x?', opts: ['6', '7', '8', '5'], ans: 'B', topic: 'Quantitative' },
        { q: 'Choose the word that best completes the analogy: Artist : Painting :: Chef : ?', opts: ['Kitchen', 'Recipe', 'Food', 'Restaurant'], ans: 'C', topic: 'Verbal' },
        { q: 'What is the area of a circle with radius 7?', opts: ['49π', '14π', '7π', '28π'], ans: 'A', topic: 'Quantitative' },
        { q: 'The word "ephemeral" most nearly means:', opts: ['Permanent', 'Brief', 'Elegant', 'Massive'], ans: 'B', topic: 'Verbal' },
        { q: 'In a right triangle with legs 3 and 4, what is the hypotenuse?', opts: ['6', '7', '5', '12'], ans: 'C', topic: 'Quantitative' },
      ],
      CAT: [
        { q: 'If a train travels 360 km in 4 hours, what is its speed?', opts: ['80 km/h', '90 km/h', '100 km/h', '70 km/h'], ans: 'B', topic: 'Quantitative Aptitude' },
        { q: 'Find the next number: 2, 6, 12, 20, ?', opts: ['28', '30', '32', '24'], ans: 'B', topic: 'Logical Reasoning' },
        { q: 'What is the profit percentage if cost price is 80 and selling price is 100?', opts: ['20%', '25%', '30%', '15%'], ans: 'B', topic: 'Quantitative Aptitude' },
        { q: 'Choose the odd one out: Apple, Mango, Potato, Banana', opts: ['Apple', 'Mango', 'Potato', 'Banana'], ans: 'C', topic: 'Verbal Ability' },
        { q: 'A is twice as old as B. If A is 40, how old is B?', opts: ['30', '20', '25', '35'], ans: 'B', topic: 'Quantitative Aptitude' },
      ],
    };

    const pool = defaults[examType] || defaults.GATE;
    return pool.slice(0, Math.min(count, pool.length)).map((q, i) => ({
      id: `q${i + 1}`,
      index: i,
      question: q.q,
      type: 'MCQ' as const,
      options: q.opts,
      correctAnswer: q.ans,
      explanation: `The correct answer is ${q.ans}.`,
      marks: 1,
      negativeMarks: 0.33,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      topic: q.topic,
      section: 'General',
    }));
  }
}

export const mockTestService = new MockTestService();
