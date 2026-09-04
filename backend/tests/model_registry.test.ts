import { describe, it, expect } from 'vitest';
import { MODEL_REGISTRY, getModelsByCapability, getModel } from '../src/services/ai/model_registry.js';

describe('Model Registry', () => {
  it('should have 3 models registered', () => {
    expect(Object.keys(MODEL_REGISTRY)).toHaveLength(3);
  });

  it('Gemma should be a generation model', () => {
    const gemma = MODEL_REGISTRY['google/gemma-4-26b-a4b-it:free'];
    expect(gemma).toBeDefined();
    expect(gemma.capability).toBe('generation');
    expect(gemma.name).toBe('Gemma');
  });

  it('LFM should be an embedding model', () => {
    const lfm = MODEL_REGISTRY['liquid/lfm-2.5-embedding-350m:free'];
    expect(lfm).toBeDefined();
    expect(lfm.capability).toBe('embedding');
    expect(lfm.name).toBe('LFM Embedding');
  });

  it('Ling should be a generation model', () => {
    const ling = MODEL_REGISTRY['inclusionai/ling-3.0-flash-fin:free'];
    expect(ling).toBeDefined();
    expect(ling.capability).toBe('generation');
    expect(ling.name).toBe('Ling');
  });

  it('getModelsByCapability should return only generation models for generation', () => {
    const genModels = getModelsByCapability('generation');
    expect(genModels.length).toBe(2);
    genModels.forEach((m) => expect(m.capability).toBe('generation'));
  });

  it('getModelsByCapability should return only embedding models for embedding', () => {
    const embModels = getModelsByCapability('embedding');
    expect(embModels.length).toBe(1);
    expect(embModels[0].capability).toBe('embedding');
  });

  it('getModel should return undefined for unknown model', () => {
    expect(getModel('unknown-model')).toBeUndefined();
  });

  it('Gemma should have Ling as fallback', () => {
    const gemma = MODEL_REGISTRY['google/gemma-4-26b-a4b-it:free'];
    expect(gemma.fallbacks).toContain('inclusionai/ling-3.0-flash-fin:free');
  });

  it('Ling should have Gemma as fallback', () => {
    const ling = MODEL_REGISTRY['inclusionai/ling-3.0-flash-fin:free'];
    expect(ling.fallbacks).toContain('google/gemma-4-26b-a4b-it:free');
  });

  it('LFM should have no fallbacks (embedding-only)', () => {
    const lfm = MODEL_REGISTRY['liquid/lfm-2.5-embedding-350m:free'];
    expect(lfm.fallbacks).toHaveLength(0);
  });

  it('Gemma should have priority 1 (higher priority than Ling)', () => {
    const gemma = MODEL_REGISTRY['google/gemma-4-26b-a4b-it:free'];
    const ling = MODEL_REGISTRY['inclusionai/ling-3.0-flash-fin:free'];
    expect(gemma.priority).toBeLessThan(ling.priority);
  });
});
