import prisma from '@codera/db';
import { Redis } from 'ioredis';
import config from '@codera/config';

// Connect to Redis for caching
const redis = new Redis(config.redisUrl);

export class AnalyticsService {
  /** Retrieves a user's pre-computed analytics profile from the database. */
  async getUserAnalytics(userId: string) {
    const cached = await redis.get(`analytics:user:${userId}`);
    if (cached) {
      return JSON.parse(cached);
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
      };
    }

    const difficultyBreakdown = {
      easy: analytics.easySolved,
      medium: analytics.mediumSolved,
      hard: analytics.hardSolved,
    };

    const response = { ...analytics, difficultyBreakdown };
    
    // Cache the response for 1 hour
    await redis.set(`analytics:user:${userId}`, JSON.stringify(response), 'EX', 3600);
    return response;
  }

  /** Gets an array of submissions aggregated by day. */
  async getSubmissionTrends(userId: string, rangeDays: number = 30) {
    const cached = await redis.get(`analytics:trends:${userId}:${rangeDays}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - rangeDays);

    const trends = await prisma.dailyActivity.findMany({
      where: {
        userId,
        // Since `date` is a string like "2024-03-24", doing a string comparison
        // correctly filters YYYY-MM-DD. We format our threshold correctly:
        date: {
          gte: dateThreshold.toISOString().split('T')[0],
        },
      },
      orderBy: { date: 'asc' },
    });

    await redis.set(`analytics:trends:${userId}:${rangeDays}`, JSON.stringify(trends), 'EX', 3600);
    return trends;
  }

  /** Gets aggregated problem statuses for this user for detailed graphs */
  async getProblemWiseStats(userId: string) {
    // Return all submissions uniquely identifying the best runtimes.
    // Instead of querying `ProblemAnalytics` (which is global), we extract the user's specific attempts
    // from the `Submission` table itself for table display.
    const submissions = await prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        problemId: true,
        status: true,
        verdict: true,
        createdAt: true,
      }
    });

    return submissions;
  }

  /** Invalidates cache for a user natively */
  async invalidateUserCache(userId: string) {
    const keys = await redis.keys(`analytics:*:${userId}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export const analyticsService = new AnalyticsService();
