import { Router, Request, Response } from 'express';
import { aiService } from './ai.service';
import { requireAuth } from '../../middleware/auth';

const router = Router();

/**
 * POST /api/ai/analyze
 * Request body: { problemName, problemDescription, code, language, verdict }
 */
router.post('/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const { problemName, problemDescription, code, language, verdict } = req.body;
    
    if (!problemName || !code || !language || !verdict) {
      return res.status(400).json({ error: 'Missing required fields for AI analysis' });
    }

    const feedback = await aiService.getFeedback(
      problemName,
      problemDescription || 'No description provided.',
      code,
      language,
      verdict
    );

    return res.json({ feedback });
  } catch (err: any) {
    console.error('[AIController] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error while fetching AI feedback' });
  }
});

export default router;
