import { aiService } from '../services/ai/ai_service.js';

export class OpenAIService {
  async generateJson(prompt: string): Promise<any> {
    return aiService.generateJson(prompt);
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    return aiService.generateText(prompt, systemPrompt);
  }

  isAvailable(): boolean {
    return aiService.isAvailable();
  }
}
