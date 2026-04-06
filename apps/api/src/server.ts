import http from 'http';
import { WebSocketServer } from 'ws';
import config from '@codera/config';
import app from './app';
import { setupWebSocket } from './utils/websocket';
import { redis } from './loaders/redis';
import { initShareDB, handleShareDBConnection, shutdownShareDB } from './loaders/sharedb';
import { verifyToken } from './utils/auth.util';

import { getActiveConnections } from './utils/websocket';

app.get('/debug/ws', (req, res) => {
  res.json(getActiveConnections());
});

const server = http.createServer(app);

// Create both WebSocket servers in noServer mode
const mainWss = setupWebSocket();      // Room events + submissions (/ws)
const shareDBWss = new WebSocketServer({ noServer: true }); // ShareDB OT (/sharedb)

// Single upgrade handler — routes to correct WebSocket server
server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '', `http://${request.headers.host}`);
  console.log('[Upgrade] Incoming req to:', url.pathname);

  if (url.pathname === '/ws') {
    console.log('[Upgrade] Routing to mainWss');
    mainWss.handleUpgrade(request, socket, head, (ws) => {
      mainWss.emit('connection', ws, request);
    });
  } else if (url.pathname === '/sharedb') {
    // Extract userId from query param (token-based auth)
    const token = url.searchParams.get('token');
    let userId = 'anonymous';

    if (token) {
      try {
        const payload = verifyToken(token);
        userId = payload.userId;
      } catch {
        console.error('[ShareDB] Invalid token on WebSocket upgrade');
        socket.destroy();
        return;
      }
    }

    shareDBWss.handleUpgrade(request, socket, head, (ws) => {
      shareDBWss.emit('connection', ws);
      handleShareDBConnection(ws, userId);
    });
  } else {
    // Unknown path — reject
    console.log('[Upgrade] Rejected unknown path:', url.pathname);
    socket.destroy();
  }
});

// ── Start Server ──
async function start() {
  try {
    // Initialize ShareDB before starting the server
    await initShareDB();

    // Start background background queues locally in Dev/Prod (in scalable envs, we could extract this)
    import('./modules/analytics/analytics.worker').then(({ startAnalyticsWorker }) => startAnalyticsWorker());

    server.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║              Codera API Server Started                   ║
╠══════════════════════════════════════════════════════════╣
║  Server ID:    ${config.serverId.padEnd(40)}║
║  HTTP Port:    ${String(config.port).padEnd(40)}║
║  WebSocket:    ws://localhost:${config.port}/ws${' '.repeat(24)}║
║  ShareDB:      ws://localhost:${config.port}/sharedb${' '.repeat(20)}║
║  Environment:  ${config.nodeEnv.padEnd(40)}║
╚══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

start();

// ── Graceful Shutdown ──
async function shutdown() {
  console.log('[Server] Shutting down...');
  server.close();
  await redis.quit();
  await shutdownShareDB();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default server;
