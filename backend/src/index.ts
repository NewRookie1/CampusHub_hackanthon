import express from 'express';
import cors from 'cors';
import { appConfig } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthManager } from './services/ai/health_manager.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ai: {
      configured: !!appConfig.openrouter.apiKey,
      models: healthManager.getHealthSummary(),
    },
  });
});

app.use('/api', routes);

app.use(errorHandler);

const PORT = appConfig.port;
app.listen(PORT, () => {
  console.log(`Skill Match Backend running on port ${PORT}`);
});

export default app;
