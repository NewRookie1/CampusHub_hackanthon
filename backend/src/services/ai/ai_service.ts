import { modelRouter } from './model_router.js';
import { healthManager } from './health_manager.js';
import { openRouterClient } from './openrouter_client.js';
import type { ChatMessage } from './openrouter_client.js';

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  model: string;
  type: 'generation' | 'embedding';
  content: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  fallback_used: boolean;
  latency: number;
}

class AIService {
  async generateJson(prompt: string, options?: GenerateOptions): Promise<any> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'You are a helpful assistant. Always respond with valid JSON only, no markdown formatting.',
      },
      { role: 'user', content: prompt },
    ];

    const result = await modelRouter.route('generation', messages, {
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 4000,
    });

    const content = result.response.choices?.[0]?.message?.content || '{}';
    const cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(cleaned);
  }

  async generateText(
    prompt: string,
    systemPrompt?: string,
    options?: GenerateOptions
  ): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
      { role: 'user', content: prompt },
    ];

    const result = await modelRouter.route('generation', messages, {
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 4000,
    });

    return result.response.choices?.[0]?.message?.content || '';
  }

  isAvailable(): boolean {
    return openRouterClient.isConfigured();
  }

  getHealth() {
    return healthManager.getHealthSummary();
  }
}

export const aiService = new AIService();
