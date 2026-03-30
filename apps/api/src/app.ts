import express from 'express';
import cors from 'cors';
import { submissionRouter, problemRouter, authRouter, roomRouter, snippetRouter, aiRouter } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requireAuth } from './middleware/auth';
import config from '@codera/config';

const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (config.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(`[HTTP] ${req.method} ${req.path}`);
    next();
  });
}

import { getActiveConnections } from './utils/websocket';

// ── Health Check ──
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    serverId: config.serverId,
    timestamp: new Date().toISOString(),
  });
});

app.get('/debug/ws', (_req, res) => {
  res.json(getActiveConnections());
});

// ── Routes ──
app.use('/submissions', submissionRouter);
app.use('/problems', problemRouter);
app.use('/api/auth', authRouter);
app.use('/api/rooms', requireAuth, roomRouter);
app.use('/api/snippets', snippetRouter);
app.use('/api/ai', aiRouter);

// ── 404 ──
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Error Handler ──
app.use(errorHandler);

export default app;
