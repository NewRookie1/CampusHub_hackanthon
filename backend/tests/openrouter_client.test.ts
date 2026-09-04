import { describe, it, expect } from 'vitest';
import { OpenRouterClient, OpenRouterError } from '../src/services/ai/openrouter_client.js';
import { appConfig } from '../src/config/index.js';

describe('OpenRouterClient', () => {
  it('should report configured when API key is set', () => {
    const client = new OpenRouterClient();
    expect(client.isConfigured()).toBe(!!appConfig.openrouter.apiKey);
  });
});

describe('OpenRouterError', () => {
  it('should store status code and body', () => {
    const err = new OpenRouterError('test error', 429, '{"error":"rate limited"}');
    expect(err.message).toBe('test error');
    expect(err.statusCode).toBe(429);
    expect(err.body).toBe('{"error":"rate limited"}');
    expect(err.name).toBe('OpenRouterError');
  });
});
