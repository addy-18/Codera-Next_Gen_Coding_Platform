import { WebSocket, WebSocketServer, RawData } from 'ws';
import Redis from 'ioredis';
import config from '@codera/config';
import type { WSClientMessage, SubmissionEvent, RoomEvent } from '@codera/types';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
  subscribedSubmissions?: Set<string>;
  roomId?: string; // Room the user is currently in
}

// userId → WebSocket
const userConnections = new Map<string, AuthenticatedWebSocket>();

export function getActiveConnections() {
  return Array.from(userConnections.entries()).map(([uId, ws]) => ({
    userId: uId,
    roomId: ws.roomId,
    readyState: ws.readyState,
  }));
}

// submissionId → Set of subscriber Redis channels
const activeSubscriptions = new Set<string>();

// Dedicated Redis clients for Pub/Sub
let subscriber: Redis | null = null;
let publisher: Redis | null = null;

function getSubscriber(): Redis {
  if (!subscriber) {
    subscriber = new Redis(config.redisUrl);
    subscriber.on('error', (err) =>
      console.error('[WS-PubSub] Subscriber error:', err.message)
    );

    subscriber.on('message', (channel, message) => {
      handleRedisMessage(channel, message);
    });
  }
  return subscriber;
}

function getPublisher(): Redis {
  if (!publisher) {
    publisher = new Redis(config.redisUrl);
    publisher.on('error', (err) =>
      console.error('[WS-PubSub] Publisher error:', err.message)
    );
  }
  return publisher;
}

/**
 * Setup native WebSocket server (noServer mode — upgrades routed from server.ts).
 */
export function setupWebSocket(): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });
  console.log('[WebSocket] Server initialized (noServer mode, path /ws)');

  // Initialize Redis subscriber
  getSubscriber();

  // Heartbeat — detect stale connections
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      const authWs = ws as AuthenticatedWebSocket;
      if (authWs.isAlive === false) {
        console.log(`[WebSocket] Terminating stale connection for user ${authWs.userId}`);
        return authWs.terminate();
      }
      authWs.isAlive = false;
      authWs.ping();
    });
  }, 30_000);

  wss.on('close', () => clearInterval(heartbeat));

  wss.on('connection', (ws: AuthenticatedWebSocket) => {
    ws.isAlive = true;
    ws.subscribedSubmissions = new Set();

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data: RawData) => {
      handleMessage(ws, data);
    });

    ws.on('close', () => {
      handleDisconnect(ws);
    });

    ws.on('error', (err) => {
      console.error(`[WebSocket] Error for user ${ws.userId}:`, err.message);
    });

    // Welcome
    send(ws, {
      type: 'connected',
      message: 'Connected to Codera WebSocket server',
      serverId: config.serverId,
    });
  });

  return wss;
}

// ── Message router ──
function handleMessage(ws: AuthenticatedWebSocket, data: RawData): void {
  try {
    const message = JSON.parse(data.toString()) as WSClientMessage;

    switch (message.type) {
      case 'auth':
        handleAuth(ws, message.userId);
        break;

      case 'subscribe_submission':
        handleSubscribeSubmission(ws, message.submissionId);
        break;

      case 'join_room':
        handleJoinRoom(ws, message.roomId);
        break;

      case 'leave_room':
        handleLeaveRoom(ws, message.roomId);
        break;

      case 'cursor_update':
        // Broadcast cursor position to other users in the same room
        if (ws.userId && ws.roomId) {
          userConnections.forEach((otherWs) => {
            if (
              otherWs !== ws &&
              otherWs.readyState === WebSocket.OPEN &&
              otherWs.roomId === ws.roomId
            ) {
              send(otherWs, {
                type: 'cursor_update',
                userId: ws.userId,
                username: message.username,
                position: message.position,
                color: message.color,
              });
            }
          });
        }
        break;

      case 'language_change':
        // Broadcast language change to other users
        if (ws.userId && ws.roomId) {
          userConnections.forEach((otherWs) => {
            if (
              otherWs !== ws &&
              otherWs.readyState === WebSocket.OPEN &&
              otherWs.roomId === ws.roomId
            ) {
              send(otherWs, {
                type: 'language_change',
                userId: ws.userId,
                languageId: message.languageId,
              });
            }
          });
        }
        break;

      case 'ping':
        send(ws, { type: 'pong', timestamp: Date.now() });
        break;

      default:
        send(ws, { type: 'error', message: `Unknown message type` });
    }
  } catch {
    send(ws, { type: 'error', message: 'Invalid JSON message' });
  }
}

// ── Auth ──
function handleAuth(ws: AuthenticatedWebSocket, userId: string): void {
  if (!userId) {
    send(ws, { type: 'auth_error', message: 'Missing userId' });
    return;
  }

  // Close existing connection for this user
  const existing = userConnections.get(userId);
  if (existing && existing !== ws) {
    existing.close(1000, 'New connection established');
  }

  ws.userId = userId;
  userConnections.set(userId, ws);

  console.log(`[WebSocket] User ${userId} authenticated`);
  send(ws, { type: 'auth_success', userId, serverId: config.serverId });
}

// ── Room join/leave ──
function handleJoinRoom(ws: AuthenticatedWebSocket, roomId: string): void {
  if (!ws.userId) {
    send(ws, { type: 'error', message: 'Authenticate first' });
    return;
  }

  ws.roomId = roomId;
  console.log(`[WebSocket] User ${ws.userId} joined room ${roomId}`);
  send(ws, { type: 'room_joined', roomId });
}

function handleLeaveRoom(ws: AuthenticatedWebSocket, roomId: string): void {
  if (ws.roomId === roomId) {
    ws.roomId = undefined;
    console.log(`[WebSocket] User ${ws.userId} left room ${roomId}`);
    send(ws, { type: 'room_left', roomId });
  }
}

// ── Subscribe to submission updates via Redis Pub/Sub ──
function handleSubscribeSubmission(ws: AuthenticatedWebSocket, submissionId: string): void {
  if (!ws.userId) {
    send(ws, { type: 'error', message: 'Authenticate first' });
    return;
  }

  if (!submissionId) {
    send(ws, { type: 'error', message: 'Missing submissionId' });
    return;
  }

  const channel = `submission:${submissionId}`;
  ws.subscribedSubmissions!.add(submissionId);

  // Subscribe to Redis channel if not already
  if (!activeSubscriptions.has(channel)) {
    activeSubscriptions.add(channel);
    getSubscriber().subscribe(channel).catch((err) => {
      console.error(`[WS-PubSub] Failed to subscribe to ${channel}:`, err.message);
    });
    console.log(`[WS-PubSub] Subscribed to ${channel}`);
  }

  send(ws, { type: 'subscribed', submissionId });
}

// ── Handle Redis Pub/Sub message → forward to interested WebSocket clients ──
function handleRedisMessage(channel: string, message: string): void {
  // channel = "submission:{submissionId}"
  const submissionId = channel.replace('submission:', '');

  try {
    const event = JSON.parse(message) as SubmissionEvent;

    // Forward to all connected users who subscribed to this submission
    userConnections.forEach((ws) => {
      if (
        ws.readyState === WebSocket.OPEN &&
        ws.subscribedSubmissions?.has(submissionId)
      ) {
        send(ws, event);
      }
    });
  } catch (err) {
    console.error(`[WS-PubSub] Failed to parse message on ${channel}:`, err);
  }
}

// ── Room Broadcasting ──
/**
 * Broadcast an event to all connected users in a room.
 * This is called from roomService for room-scoped events.
 */
export function broadcastToRoom(roomId: string, event: RoomEvent | object): void {
  let sent = 0;
  userConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN && ws.roomId === roomId) {
      send(ws, event);
      sent++;
    }
  });
  console.log(`[WebSocket] Broadcast to room ${roomId}: ${(event as any).type} (${sent} clients)`);
}

// ── Disconnect ──
function handleDisconnect(ws: AuthenticatedWebSocket): void {
  if (ws.userId) {
    console.log(`[WebSocket] User ${ws.userId} disconnected`);
    userConnections.delete(ws.userId);
  }

  // Clean up submission subscriptions that have no listeners
  if (ws.subscribedSubmissions) {
    for (const subId of ws.subscribedSubmissions) {
      const channel = `submission:${subId}`;

      // Check if any other client is subscribed to this channel
      let hasOtherSubscriber = false;
      userConnections.forEach((otherWs) => {
        if (otherWs.subscribedSubmissions?.has(subId)) {
          hasOtherSubscriber = true;
        }
      });

      if (!hasOtherSubscriber) {
        activeSubscriptions.delete(channel);
        getSubscriber().unsubscribe(channel).catch(() => {});
      }
    }
  }
}

// ── Send helper ──
function send(ws: WebSocket, data: object): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

export { getPublisher };
