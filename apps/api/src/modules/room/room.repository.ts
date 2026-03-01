import prisma from '@codera/db';
import type { RoomParticipant, RoomMode } from '@codera/types';

export const roomRepository = {
  async create(data: {
    problemId: string;
    hostId: string;
    participants: RoomParticipant[];
    mode: RoomMode;
  }) {
    return prisma.room.create({
      data: {
        problemId: data.problemId,
        hostId: data.hostId,
        participants: JSON.parse(JSON.stringify(data.participants)),
        mode: data.mode,
        isActive: true,
      },
    });
  },

  async findById(id: string) {
    return prisma.room.findUnique({ where: { id } });
  },

  async updateParticipants(id: string, participants: RoomParticipant[]) {
    return prisma.room.update({
      where: { id },
      data: { participants: JSON.parse(JSON.stringify(participants)) },
    });
  },

  async deactivate(id: string) {
    return prisma.room.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async findActiveByHost(hostId: string) {
    return prisma.room.findMany({
      where: { hostId, isActive: true },
    });
  },
};

export default roomRepository;
