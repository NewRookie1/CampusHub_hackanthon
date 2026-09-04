import { describe, it, expect } from 'vitest';
import { getModelsByCapability } from '../src/services/ai/model_registry.js';

describe('Model Router - capability routing', () => {
  it('should not route embedding requests to generation models', () => {
    const embModels = getModelsByCapability('embedding');
    embModels.forEach((m) => {
      expect(m.capability).toBe('embedding');
    });
  });

  it('should not route generation requests to embedding models', () => {
    const genModels = getModelsByCapability('generation');
    genModels.forEach((m) => {
      expect(m.capability).toBe('generation');
    });
  });

  it('generation models should have fallbacks defined', () => {
    const genModels = getModelsByCapability('generation');
    genModels.forEach((m) => {
      expect(m.fallbacks.length).toBeGreaterThan(0);
    });
  });

  it('embedding model should have no fallbacks (only LFM supports embedding)', () => {
    const embModels = getModelsByCapability('embedding');
    expect(embModels[0].fallbacks).toHaveLength(0);
  });
});
