import { describe, it, expect, beforeEach } from 'vitest';
import { HealthManager } from '../src/services/ai/health_manager.js';

describe('HealthManager', () => {
  let hm: HealthManager;

  beforeEach(() => {
    hm = new HealthManager();
  });

  it('should mark all models as available initially', () => {
    expect(hm.isAvailable('google/gemma-4-26b-a4b-it:free')).toBe(true);
    expect(hm.isAvailable('liquid/lfm-2.5-embedding-350m:free')).toBe(true);
    expect(hm.isAvailable('inclusionai/ling-3.0-flash-fin:free')).toBe(true);
  });

  it('should return false for unknown model', () => {
    expect(hm.isAvailable('unknown')).toBe(false);
  });

  it('should record success and reset failures', () => {
    hm.recordFailure('google/gemma-4-26b-a4b-it:free');
    hm.recordFailure('google/gemma-4-26b-a4b-it:free');
    hm.recordSuccess('google/gemma-4-26b-a4b-it:free', 150);
    const h = hm.getHealth('google/gemma-4-26b-a4b-it:free');
    expect(h?.failures).toBe(0);
    expect(h?.latency).toBe(150);
  });

  it('should put model in cooldown after failure threshold', () => {
    for (let i = 0; i < 3; i++) {
      hm.recordFailure('google/gemma-4-26b-a4b-it:free');
    }
    expect(hm.isAvailable('google/gemma-4-26b-a4b-it:free')).toBe(false);
  });

  it('should recover model after cooldown expires', () => {
    for (let i = 0; i < 3; i++) {
      hm.recordFailure('google/gemma-4-26b-a4b-it:free');
    }
    const h = hm.getHealth('google/gemma-4-26b-a4b-it:free');
    if (h) h.cooldownUntil = Date.now() - 1;
    expect(hm.isAvailable('google/gemma-4-26b-a4b-it:free')).toBe(true);
  });

  it('should return health summary', () => {
    const summary = hm.getHealthSummary();
    expect(Object.keys(summary)).toHaveLength(3);
  });
});
