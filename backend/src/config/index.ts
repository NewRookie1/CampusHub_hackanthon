export const appConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET || 'skillswitch-dev-secret-prototype-2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    maxRetries: parseInt(process.env.AI_MAX_RETRIES || '2', 10),
    timeout: parseInt(process.env.AI_TIMEOUT || '30000', 10),
    cooldown: parseInt(process.env.AI_COOLDOWN || '60000', 10),
  },
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
} as const;

export type AppConfig = typeof appConfig;
