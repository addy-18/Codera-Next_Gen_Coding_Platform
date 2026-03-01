import prisma from '@codera/db';

export const authRepository = {
  async createUser(data: { username: string; email: string; passwordHash: string }) {
    return prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async addProblemSolved(userId: string, problemId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        problemsSolved: { push: problemId },
      },
    });
  },
};

export default authRepository;
