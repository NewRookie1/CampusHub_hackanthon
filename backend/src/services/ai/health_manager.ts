import { MODEL_REGISTRY } from './model_registry.js';

export interface ModelHealth {
  available: boolean;
  failures: number;
  lastFailure: number;
  latency: number;
  cooldownUntil: number;
}

export class HealthManager {
  private health: Map<string, ModelHealth> = new Map();
  private readonly failureThreshold = 3;

  constructor() {
    for (const modelId of Object.keys(MODEL_REGISTRY)) {
      this.health.set(modelId, {
        available: true,
        failures: 0,
        lastFailure: 0,
        latency: 0,
        cooldownUntil: 0,
      });
    }
  }

  isAvailable(modelId: string): boolean {
    const h = this.health.get(modelId);
    if (!h) return false;
    if (!h.available) {
      if (Date.now() > h.cooldownUntil) {
        h.available = true;
        h.failures = 0;
        return true;
      }
      return false;
    }
    return true;
  }

  recordSuccess(modelId: string, latencyMs: number): void {
    const h = this.health.get(modelId);
    if (!h) return;
    h.failures = 0;
    h.latency = latencyMs;
    h.available = true;
  }

  recordFailure(modelId: string): void {
    const h = this.health.get(modelId);
    if (!h) return;
    h.failures++;
    h.lastFailure = Date.now();
    const config = MODEL_REGISTRY[modelId];
    if (h.failures >= this.failureThreshold) {
      h.available = false;
      h.cooldownUntil = Date.now() + (config?.cooldown || 60000);
    }
  }

  getHealth(modelId: string): ModelHealth | undefined {
    return this.health.get(modelId);
  }

  getHealthSummary(): Record<string, ModelHealth> {
    const summary: Record<string, ModelHealth> = {};
    for (const [k, v] of this.health) {
      summary[k] = { ...v };
    }
    return summary;
  }
}

export const healthManager = new HealthManager();
