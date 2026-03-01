import ShareDB from 'sharedb';
import ShareDBMongo = require('sharedb-mongo');
import WebSocketJSONStream = require('@teamwork/websocket-json-stream');
import { MongoClient } from 'mongodb';
import { WebSocket as WSWebSocket } from 'ws';
import config from '@codera/config';
import { roomRepository } from '../modules/room/room.repository';
import type { RoomParticipant } from '@codera/types';

let backend: ShareDB | null = null;
let mongoClient: MongoClient | null = null;

/**
 * Initialize ShareDB backend with MongoDB adapter.
 */
export async function initShareDB(): Promise<ShareDB> {
  if (backend) return backend;

  // Connect to MongoDB
  mongoClient = new MongoClient(config.mongodbUrl);
  await mongoClient.connect();
  console.log('[ShareDB] Connected to MongoDB');

  const db = ShareDBMongo(config.mongodbUrl);

  backend = new ShareDB({ db });

  // ── Permission Middleware ──
  // Validate that the user has edit permission before allowing OT operations
  backend.use('apply', async (context: any, done: (err?: any) => void) => {
    try {
      const userId = context.agent?.custom?.userId;
      const roomId = context.collection === 'rooms' ? context.id : null;

      if (!roomId || !userId) {
        return done(); // Allow if no room context (shouldn't happen in practice)
      }

      const room = await roomRepository.findById(roomId);
      if (!room) {
        return done(new Error('Room not found'));
      }

      const participants = room.participants as unknown as RoomParticipant[];
      const participant = participants.find((p) => p.userId === userId);

      if (!participant) {
        return done(new Error('User not in room'));
      }

      if (!participant.canEdit) {
        return done(new Error('No edit permission'));
      }

      done();
    } catch (err) {
      done(err);
    }
  });

  console.log('[ShareDB] Backend initialized with permission middleware');
  return backend;
}

/**
 * Get the ShareDB backend instance.
 */
export function getShareDB(): ShareDB {
  if (!backend) {
    throw new Error('ShareDB not initialized. Call initShareDB() first.');
  }
  return backend;
}

/**
 * Handle a WebSocket connection for ShareDB.
 * Called when a client connects to the /sharedb path.
 */
export function handleShareDBConnection(ws: WSWebSocket, userId: string): void {
  if (!backend) {
    console.error('[ShareDB] Backend not initialized');
    ws.close();
    return;
  }

  const stream = new WebSocketJSONStream(ws);
  const agent = backend.listen(stream);

  // Attach userId to agent for permission middleware
  (agent as any).custom = { userId };

  console.log(`[ShareDB] Client connected: ${userId}`);
}

/**
 * Initialize or get an existing ShareDB document for a room.
 * Creates the doc with empty content if it doesn't exist.
 */
export async function initRoomDocument(roomId: string, initialContent: string = ''): Promise<void> {
  if (!backend) throw new Error('ShareDB not initialized');

  const connection = backend.connect();
  const doc = connection.get('rooms', roomId);

  return new Promise((resolve, reject) => {
    doc.fetch((err) => {
      if (err) return reject(err);

      if (doc.type === null) {
        // Document doesn't exist — create it
        doc.create({ content: initialContent }, (createErr) => {
          if (createErr) return reject(createErr);
          console.log(`[ShareDB] Created document for room ${roomId}`);
          resolve();
        });
      } else {
        resolve(); // Already exists
      }
    });
  });
}

/**
 * Get the authoritative content of a ShareDB document.
 * Used by run/submit to fetch code — never trust the client.
 */
export async function getShareDBDocument(roomId: string): Promise<string> {
  if (!backend) throw new Error('ShareDB not initialized');

  const connection = backend.connect();
  const doc = connection.get('rooms', roomId);

  return new Promise((resolve, reject) => {
    doc.fetch((err) => {
      if (err) return reject(err);
      if (!doc.data) return reject(new Error('Document not found'));
      resolve(doc.data.content || '');
    });
  });
}

/**
 * Graceful shutdown — close MongoDB connection.
 */
export async function shutdownShareDB(): Promise<void> {
  if (backend) {
    backend.close();
  }
  if (mongoClient) {
    await mongoClient.close();
  }
  console.log('[ShareDB] Shut down');
}
