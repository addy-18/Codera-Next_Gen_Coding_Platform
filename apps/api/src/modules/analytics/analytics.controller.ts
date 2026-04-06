import { Request, Response } from 'express';
import { analyticsService } from './analytics.service';

const router = require('express').Router();

router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const stats = await analyticsService.getUserAnalytics(userId);
    res.json(stats);
  } catch (error) {
    console.error('[AnalyticsController] GET /:userId Error:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

router.get('/:userId/trends', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.range as string) || 30;
    const trends = await analyticsService.getSubmissionTrends(userId, days);
    res.json(trends);
  } catch (error) {
    console.error('[AnalyticsController] GET /:userId/trends Error:', error);
    res.status(500).json({ error: 'Failed to fetch submission trends' });
  }
});

router.get('/:userId/problems', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const problems = await analyticsService.getProblemWiseStats(userId);
    res.json(problems);
  } catch (error) {
    console.error('[AnalyticsController] GET /:userId/problems Error:', error);
    res.status(500).json({ error: 'Failed to fetch problem stats' });
  }
});

export default router;
