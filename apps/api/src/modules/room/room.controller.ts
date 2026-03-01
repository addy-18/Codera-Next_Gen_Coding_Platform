import { Router, Request, Response } from 'express';
import { roomService } from './room.service';
import { authService } from '../auth/auth.service';
import type { RoomMode } from '@codera/types';

import { getActiveConnections } from '../../utils/websocket';

const router = Router();

// Debug websocket connections
router.get('/debug/ws', (req, res) => {
  res.json(getActiveConnections());
});

/**
 * POST /api/rooms
 * Create a new room.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { problemId, mode } = req.body;
    const userId = req.userId!;

    if (!problemId) {
      return res.status(400).json({ error: 'Missing required field: problemId' });
    }

    const profile = await authService.getProfile(userId);

    const room = await roomService.createRoom({
      hostId: userId,
      problemId,
      mode: (mode as RoomMode) || 'practice',
      hostUsername: profile.username,
    });

    return res.status(201).json({
      roomId: room.id,
      problemId: room.problemId,
      hostId: room.hostId,
      participants: room.participants,
      mode: room.mode,
      isActive: room.isActive,
    });
  } catch (err: any) {
    console.error('[RoomController] Error creating room:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/rooms/:roomId/join
 * Join a room as collaborator.
 */
router.post('/:roomId/join', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId!;

    const profile = await authService.getProfile(userId);
    const room = await roomService.joinRoom(roomId, userId, profile.username);

    return res.json({
      roomId: room.id,
      participants: room.participants,
    });
  } catch (err: any) {
    if (err.message === 'Room not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Room is no longer active') {
      return res.status(410).json({ error: err.message });
    }
    console.error('[RoomController] Error joining room:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/rooms/:roomId
 * Get room state.
 */
router.get('/:roomId', async (req: Request, res: Response) => {
  try {
    const room = await roomService.getRoom(req.params.roomId);
    return res.json(room);
  } catch (err: any) {
    if (err.message === 'Room not found') {
      return res.status(404).json({ error: err.message });
    }
    console.error('[RoomController] Error fetching room:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/rooms/:roomId/permissions
 * Toggle edit permission for a participant (host only).
 */
router.patch('/:roomId/permissions', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { targetUserId, canEdit } = req.body;
    const userId = req.userId!;

    if (!targetUserId || canEdit === undefined) {
      return res.status(400).json({ error: 'Missing required fields: targetUserId, canEdit' });
    }

    const result = await roomService.updatePermission(roomId, userId, targetUserId, canEdit);
    return res.json(result);
  } catch (err: any) {
    if (err.message === 'Only host can update permissions') {
      return res.status(403).json({ error: err.message });
    }
    if (err.message === 'Room not found' || err.message === 'Target user not found in room') {
      return res.status(404).json({ error: err.message });
    }
    console.error('[RoomController] Error updating permissions:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/rooms/:roomId/run
 * Run code (anyone with edit permission).
 */
router.post('/:roomId/run', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { languageId } = req.body;
    const userId = req.userId!;

    if (!languageId) {
      return res.status(400).json({ error: 'Missing required field: languageId' });
    }

    const result = await roomService.runCode(roomId, userId, Number(languageId));
    return res.json(result);
  } catch (err: any) {
    if (err.message === 'No edit permission — cannot run code') {
      return res.status(403).json({ error: err.message });
    }
    if (err.message === 'Room not found' || err.message === 'User not in room') {
      return res.status(404).json({ error: err.message });
    }
    console.error('[RoomController] Error running code:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/rooms/:roomId/submit
 * Submit code (host only).
 */
router.post('/:roomId/submit', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { languageId } = req.body;
    const userId = req.userId!;

    if (!languageId) {
      return res.status(400).json({ error: 'Missing required field: languageId' });
    }

    const result = await roomService.submitCode(roomId, userId, Number(languageId));
    return res.json(result);
  } catch (err: any) {
    if (err.message === 'Only host can submit') {
      return res.status(403).json({ error: 'Only host can submit.' });
    }
    if (err.message === 'Room not found') {
      return res.status(404).json({ error: err.message });
    }
    console.error('[RoomController] Error submitting code:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/rooms/:roomId/leave
 * Leave a room.
 */
router.post('/:roomId/leave', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId!;

    const profile = await authService.getProfile(userId);
    await roomService.leaveRoom(roomId, userId, profile.username);

    return res.json({ message: 'Left room' });
  } catch (err: any) {
    if (err.message === 'Room not found') {
      return res.status(404).json({ error: err.message });
    }
    console.error('[RoomController] Error leaving room:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
