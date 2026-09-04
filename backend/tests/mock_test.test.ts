import { describe, it, expect } from 'vitest';
import { EXAM_TYPES, startMockTestSchema } from '../src/schemas/mockTest.js';

describe('Mock Test Schema', () => {
  it('should define 8 exam types', () => {
    expect(Object.keys(EXAM_TYPES)).toHaveLength(8);
  });

  it('GATE should have CS subject', () => {
    expect(EXAM_TYPES.GATE.subjects).toContain('Computer Science and Information Technology');
  });

  it('TOEFL should have 4 subjects', () => {
    expect(EXAM_TYPES.TOEFL.subjects).toHaveLength(4);
  });

  it('should validate start test input', () => {
    const result = startMockTestSchema.safeParse({
      exam_type: 'GATE',
      subject: 'Computer Science and Information Technology',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid exam type', () => {
    const result = startMockTestSchema.safeParse({
      exam_type: 'INVALID',
      subject: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('should default difficulty to medium', () => {
    const result = startMockTestSchema.parse({
      exam_type: 'TOEFL',
      subject: 'Reading',
    });
    expect(result.difficulty).toBe('medium');
  });

  it('should default num_questions to 20', () => {
    const result = startMockTestSchema.parse({
      exam_type: 'GRE',
      subject: 'Verbal Reasoning',
    });
    expect(result.num_questions).toBe(20);
  });

  it('GRE should have 3 subjects', () => {
    expect(EXAM_TYPES.GRE.subjects).toHaveLength(3);
  });

  it('JEE should have Physics, Chemistry, Mathematics', () => {
    expect(EXAM_TYPES.JEE.subjects).toEqual(['Physics', 'Chemistry', 'Mathematics']);
  });

  it('NEET should have Physics, Chemistry, Biology', () => {
    expect(EXAM_TYPES.NEET.subjects).toEqual(['Physics', 'Chemistry', 'Biology']);
  });
});
