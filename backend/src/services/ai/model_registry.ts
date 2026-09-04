export type ModelCapability = 'generation' | 'embedding';

export interface ModelConfig {
  id: string;
  name: string;
  capability: ModelCapability;
  priority: number;
  fallbacks: string[];
  timeout: number;
  cooldown: number;
  maxTokens: number;
  temperature: number;
}

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  'google/gemma-4-26b-a4b-it:free': {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'Gemma',
    capability: 'generation',
    priority: 1,
    fallbacks: ['inclusionai/ling-3.0-flash-fin:free'],
    timeout: 30000,
    cooldown: 60000,
    maxTokens: 4000,
    temperature: 0.7,
  },
  'liquid/lfm-2.5-embedding-350m:free': {
    id: 'liquid/lfm-2.5-embedding-350m:free',
    name: 'LFM Embedding',
    capability: 'embedding',
    priority: 1,
    fallbacks: [],
    timeout: 15000,
    cooldown: 30000,
    maxTokens: 0,
    temperature: 0,
  },
  'inclusionai/ling-3.0-flash-fin:free': {
    id: 'inclusionai/ling-3.0-flash-fin:free',
    name: 'Ling',
    capability: 'generation',
    priority: 2,
    fallbacks: ['google/gemma-4-26b-a4b-it:free'],
    timeout: 30000,
    cooldown: 60000,
    maxTokens: 4000,
    temperature: 0.7,
  },
};

export function getModelsByCapability(capability: ModelCapability): ModelConfig[] {
  return Object.values(MODEL_REGISTRY)
    .filter((m) => m.capability === capability)
    .sort((a, b) => a.priority - b.priority);
}

export function getModel(modelId: string): ModelConfig | undefined {
  return MODEL_REGISTRY[modelId];
}
