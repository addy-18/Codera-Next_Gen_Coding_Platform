import { Router, Request, Response } from 'express';
import { authService } from './auth.service';
import { requireAuth } from '../../middleware/auth';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user.
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: username, email, password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters',
      });
    }

    const result = await authService.register({ username, email, password });
    return res.status(201).json(result);
  } catch (err: any) {
    if (err.message === 'Email already registered' || err.message === 'Username already taken') {
      return res.status(409).json({ error: err.message });
    }
    console.error('[AuthController] Registration error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Login with email + password.
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: email, password',
      });
    }

    const result = await authService.login({ email, password });
    return res.json(result);
  } catch (err: any) {
    if (err.message === 'Invalid email or password') {
      return res.status(401).json({ error: err.message });
    }
    console.error('[AuthController] Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile (requires JWT).
 */
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const profile = await authService.getProfile(req.userId!);
    return res.json(profile);
  } catch (err: any) {
    if (err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    }
    console.error('[AuthController] Profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
