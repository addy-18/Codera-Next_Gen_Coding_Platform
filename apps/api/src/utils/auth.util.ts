import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import config from '@codera/config';
import type { AuthPayload } from '@codera/types';

export function generateToken(userId: string): string {
  const secret: Secret = config.jwtSecret;
  const options: SignOptions = {
    expiresIn: '7d',
  };
  return jwt.sign({ userId }, secret, options);
}

export function verifyToken(token: string): AuthPayload {
  const secret: Secret = config.jwtSecret;
  return jwt.verify(token, secret) as AuthPayload;
}
