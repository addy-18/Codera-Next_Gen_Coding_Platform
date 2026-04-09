import prisma from '@codera/db';
import { redis } from '../../loaders/redis';

export class AnalyticsService {
  /** Retrieves a user's pre-computed analytics profile from the database. */
  async getUserAnalytics(userId: string) {
    // Try cache first — but don't let Redis errors block the response
    try {
      const cached = await redis.get(`analytics:user:${userId}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (cacheErr) {
      console.warn('[AnalyticsService] Redis cache read failed, falling through to DB:', (cacheErr as Error).message);
    }

    const analytics = await prisma.userAnalytics.findUnique({
      where: { userId },
    });

    if (!analytics) {
      // Return zero-state analytics if user has no entries yet
      return {
        userId,
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        acceptanceRate: 0,
        avgRuntime: 0,
        avgMemory: 0,
        fastestRuntime: 0,
        bestMemory: 0,
        problemsSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        streak: 0,
        difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
      };
    }

    const difficultyBreakdown = {
      easy: analytics.easySolved,
      medium: analytics.mediumSolved,
      hard: analytics.hardSolved,
    };

    const response = { ...analytics, difficultyBreakdown };

    // Cache the response for 1 hour — best-effort, don't fail if Redis is down
    try {
      await redis.set(`analytics:user:${userId}`, JSON.stringify(response), 'EX', 3600);
    } catch (cacheErr) {
      console.warn('[AnalyticsService] Redis cache write failed:', (cacheErr as Error).message);
    }

    return response;
  }

  /** Gets an array of submissions aggregated by day. */
  async getSubmissionTrends(userId: string, rangeDays: number = 30) {
    // Try cache first
    try {
      const cached = await redis.get(`analytics:trends:${userId}:${rangeDays}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (cacheErr) {
      console.warn('[AnalyticsService] Redis trends cache read failed:', (cacheErr as Error).message);
    }

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - rangeDays);

    const trends = await prisma.dailyActivity.findMany({
      where: {
        userId,
        date: {
          gte: dateThreshold.toISOString().split('T')[0],
        },
      },
      orderBy: { date: 'asc' },
    });

    // Cache best-effort
    try {
      await redis.set(`analytics:trends:${userId}:${rangeDays}`, JSON.stringify(trends), 'EX', 3600);
    } catch (cacheErr) {
      console.warn('[AnalyticsService] Redis trends cache write failed:', (cacheErr as Error).message);
    }

    return trends;
  }

  /** Gets aggregated problem statuses for this user for detailed graphs */
  async getProblemWiseStats(userId: string) {
    const submissions = await prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        problemId: true,
        status: true,
        verdict: true,
        createdAt: true,
      },
    });

    return submissions;
  }

  /** Invalidates cache for a user */
  async invalidateUserCache(userId: string) {
    try {
      const keys = await redis.keys(`analytics:*:${userId}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (err) {
      console.warn('[AnalyticsService] Cache invalidation failed:', (err as Error).message);
    }
  }
}

export const analyticsService = new AnalyticsService();
