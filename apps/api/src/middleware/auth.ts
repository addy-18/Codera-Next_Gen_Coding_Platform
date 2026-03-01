import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.util';

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * JWT middleware — rejects request if no valid token is present.
 * Used for protected routes (e.g., /api/rooms).
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const token = header.split(' ')[1];
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional JWT middleware — extracts userId if token present, continues either way.
 * Used for backward-compatible routes (e.g., /submissions, /problems).
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.split(' ')[1];
      const payload = verifyToken(token);
      req.userId = payload.userId;
    } catch {
      // Token invalid — ignore, continue without userId
    }
  }

  next();
}
