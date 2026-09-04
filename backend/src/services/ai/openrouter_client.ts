import { appConfig } from '../../config/index.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = appConfig.openrouter.baseUrl;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${appConfig.openrouter.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': appConfig.frontendUrl,
      'X-Title': 'SkillSwitch Prototype',
    };
  }

  async chatCompletion(
    request: ChatCompletionRequest,
    timeoutMs: number = 30000
  ): Promise<ChatCompletionResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.max_tokens ?? 2000,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new OpenRouterError(
          `OpenRouter API error: ${response.status} ${response.statusText}`,
          response.status,
          errorBody
        );
      }

      return (await response.json()) as ChatCompletionResponse;
    } catch (error) {
      if (error instanceof OpenRouterError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new OpenRouterError('Request timeout', 408, '');
      }
      throw new OpenRouterError(
        `Network error: ${error instanceof Error ? error.message : String(error)}`,
        500,
        ''
      );
    } finally {
      clearTimeout(timer);
    }
  }

  isConfigured(): boolean {
    return !!appConfig.openrouter.apiKey;
  }
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public body: string
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export const openRouterClient = new OpenRouterClient();
