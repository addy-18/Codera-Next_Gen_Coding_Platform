import bcrypt from 'bcryptjs';
import { authRepository } from './auth.repository';
import { generateToken } from '../../utils/auth.util';

const SALT_ROUNDS = 10;

export const authService = {
  async register(data: { username: string; email: string; password: string }) {
    // Check if email already exists
    const existingEmail = await authRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await authRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await authRepository.createUser({
      username: data.username,
      email: data.email,
      passwordHash,
    });

    // Generate JWT
    const token = generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        problemsSolved: user.problemsSolved,
      },
    };
  },

  async login(data: { email: string; password: string }) {
    const user = await authRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        problemsSolved: user.problemsSolved,
      },
    };
  },

  async getProfile(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      problemsSolved: user.problemsSolved,
      createdAt: user.createdAt,
    };
  },
};

export default authService;
