import { roomRepository } from './room.repository';
import { authRepository } from '../auth/auth.repository';
import { submissionService } from '../submission/submission.service';
import { getShareDBDocument } from '../../loaders/sharedb';
import { broadcastToRoom } from '../../utils/websocket';
import type { RoomParticipant, RoomMode } from '@codera/types';

export const roomService = {
  /**
   * Create a new room — caller becomes host with edit permission.
   */
  async createRoom(data: { hostId: string; problemId: string; mode: RoomMode; hostUsername: string }) {
    const participants: RoomParticipant[] = [
      {
        userId: data.hostId,
        username: data.hostUsername,
        role: 'host',
        canEdit: true,
      },
    ];

    const room = await roomRepository.create({
      problemId: data.problemId,
      hostId: data.hostId,
      participants,
      mode: data.mode,
    });

    return room;
  },

  /**
   * Join an existing room as collaborator.
   */
  async joinRoom(roomId: string, userId: string, username: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new Error('Room not found');
    if (!room.isActive) throw new Error('Room is no longer active');

    const participants = room.participants as unknown as RoomParticipant[];

    // Check if already in room
    const existing = participants.find((p) => p.userId === userId);
    if (existing) {
      return room; // Already joined
    }

    const newParticipant: RoomParticipant = {
      userId,
      username,
      role: 'collaborator',
      canEdit: false,
    };

    participants.push(newParticipant);
    const updated = await roomRepository.updateParticipants(roomId, participants);

    // Broadcast user_joined event
    broadcastToRoom(roomId, {
      type: 'user_joined',
      userId,
      username,
    });

    // Broadcast updated presence
    broadcastToRoom(roomId, {
      type: 'presence_update',
      participants,
    });

    return updated;
  },

  /**
   * Leave a room.
   */
  async leaveRoom(roomId: string, userId: string, username: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new Error('Room not found');

    const participants = room.participants as unknown as RoomParticipant[];
    const filtered = participants.filter((p) => p.userId !== userId);

    await roomRepository.updateParticipants(roomId, filtered);

    // If host left, deactivate room
    if (room.hostId === userId) {
      await roomRepository.deactivate(roomId);
    }

    broadcastToRoom(roomId, {
      type: 'user_left',
      userId,
      username,
    });

    broadcastToRoom(roomId, {
      type: 'presence_update',
      participants: filtered,
    });
  },

  /**
   * Get room state.
   */
  async getRoom(roomId: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new Error('Room not found');
    return room;
  },

  /**
   * Toggle edit permission — host only.
   */
  async updatePermission(roomId: string, requesterId: string, targetUserId: string, canEdit: boolean) {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new Error('Room not found');

    if (room.hostId !== requesterId) {
      throw new Error('Only host can update permissions');
    }

    const participants = room.participants as unknown as RoomParticipant[];
    const target = participants.find((p) => p.userId === targetUserId);
    if (!target) throw new Error('Target user not found in room');

    target.canEdit = canEdit;
    await roomRepository.updateParticipants(roomId, participants);

    broadcastToRoom(roomId, {
      type: 'permission_update',
      targetUserId,
      canEdit,
    });

    // Also broadcast full presence so all clients get updated participant list
    broadcastToRoom(roomId, {
      type: 'presence_update',
      participants,
    });

    return { targetUserId, canEdit };
  },

  /**
   * Run code — anyone with canEdit. Fetches code from ShareDB (authoritative).
   */
  async runCode(roomId: string, userId: string, languageId: number) {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new Error('Room not found');

    const participants = room.participants as unknown as RoomParticipant[];
    const user = participants.find((p) => p.userId === userId);
    if (!user) throw new Error('User not in room');
    if (!user.canEdit) throw new Error('No edit permission — cannot run code');

    // Fetch authoritative code from ShareDB
    const code = await getShareDBDocument(roomId);

    // Use existing submission pipeline — mode = 'run' (sample testcases only)
    const submission = await submissionService.createSubmission({
      userId,
      problemId: room.problemId,
      languageId,
      sourceCode: code,
      mode: 'run',
    });

    // Broadcast that run was initiated
    broadcastToRoom(roomId, {
      type: 'run_result',
      executedBy: userId,
      submissionId: submission.id,
      output: '',
      status: 'queued',
      runtime: '',
    });

    return { submissionId: submission.id };
  },

  /**
   * Submit code — host only. Fetches code from ShareDB.
   * On AC, updates host's problemsSolved.
   */
  async submitCode(roomId: string, userId: string, languageId: number) {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new Error('Room not found');

    if (room.hostId !== userId) {
      throw new Error('Only host can submit');
    }

    // Fetch authoritative code from ShareDB
    const code = await getShareDBDocument(roomId);

    // Use existing submission pipeline — mode = 'submit' (all testcases)
    const submission = await submissionService.createSubmission({
      userId,
      problemId: room.problemId,
      languageId,
      sourceCode: code,
      mode: 'submit',
    });

    // Broadcast that submit was initiated
    broadcastToRoom(roomId, {
      type: 'submit_result',
      submittedBy: userId,
      submissionId: submission.id,
      verdict: 'judging',
      runtime: '',
      memory: '',
    });

    return { submissionId: submission.id };
  },

  /**
   * Called by the coordinator callback/aggregator when a room-based submission finishes.
   * Updates problemsSolved for host if AC.
   */
  async handleSubmissionResult(roomId: string, submissionId: string, verdict: string, runtime: string, memory: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) return;

    // Broadcast final result to all room participants
    broadcastToRoom(roomId, {
      type: 'submit_result',
      submittedBy: room.hostId,
      submissionId,
      verdict,
      runtime,
      memory,
    });

    // If accepted, update host's problemsSolved
    if (verdict === 'AC') {
      try {
        const host = await authRepository.findById(room.hostId);
        if (host && !host.problemsSolved.includes(room.problemId)) {
          await authRepository.addProblemSolved(room.hostId, room.problemId);
          console.log(`[RoomService] Added ${room.problemId} to ${room.hostId}'s solved problems`);
        }
      } catch (err) {
        console.error('[RoomService] Error updating problemsSolved:', err);
      }
    }
  },
};

export default roomService;
