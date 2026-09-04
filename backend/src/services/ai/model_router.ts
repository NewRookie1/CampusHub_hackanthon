import {
  getModelsByCapability,
  type ModelCapability,
  type ModelConfig,
} from './model_registry.js';
import { healthManager } from './health_manager.js';
import { openRouterClient, OpenRouterError, type ChatMessage } from './openrouter_client.js';
import { appConfig } from '../../config/index.js';

export interface RouteResult {
  model: string;
  response: any;
  latency: number;
  fallbackUsed: boolean;
}

export class ModelRouter {
  private maxRetries: number;

  constructor() {
    this.maxRetries = appConfig.openrouter.maxRetries;
  }

  async route(
    capability: ModelCapability,
    messages: ChatMessage[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<RouteResult> {
    const candidates = getModelsByCapability(capability);
    if (candidates.length === 0) {
      throw new Error(`No models available for capability: ${capability}`);
    }

    const available = candidates.filter((m) => healthManager.isAvailable(m.id));
    if (available.length === 0) {
      for (const m of candidates) {
        healthManager.getHealth(m.id);
        const h = healthManager.getHealth(m.id);
        if (h) {
          h.available = true;
          h.failures = 0;
        }
      }
      return this.attemptWithFallback(candidates, messages, options);
    }

    return this.attemptWithFallback(available, messages, options);
  }

  private async attemptWithFallback(
    models: ModelConfig[],
    messages: ChatMessage[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<RouteResult> {
    let lastError: Error | null = null;

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        try {
          const start = Date.now();
          const response = await openRouterClient.chatCompletion(
            {
              model: model.id,
              messages,
              temperature: options?.temperature ?? model.temperature,
              max_tokens: options?.maxTokens ?? (model.maxTokens || undefined),
            },
            model.timeout
          );
          const latency = Date.now() - start;

          healthManager.recordSuccess(model.id, latency);

          return {
            model: model.id,
            response,
            latency,
            fallbackUsed: i > 0 || attempt > 0,
          };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          healthManager.recordFailure(model.id);

          if (error instanceof OpenRouterError) {
            if (error.statusCode === 429 || error.statusCode >= 500) {
              if (attempt < this.maxRetries - 1) {
                await this.delay(1000 * (attempt + 1));
                continue;
              }
            }
          }
          break;
        }
      }
    }

    throw lastError || new Error('All models failed');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const modelRouter = new ModelRouter();
