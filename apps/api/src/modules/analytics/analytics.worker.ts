import { Worker } from 'bullmq';
import config from '@codera/config';
import prisma from '@codera/db';
import { analyticsService } from './analytics.service';

export function startAnalyticsWorker() {
  const worker = new Worker('analytics-update', async (job) => {
    const { submissionId, userId, problemId } = job.data;
    console.log(`[AnalyticsWorker] Processing submission ${submissionId}`);

    // Fetch the recent submission results
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { results: true },
    });

    if (!submission) return;

    // Fetch the problem
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    const isAccepted = submission.verdict === 'Accepted' || submission.verdict === 'AC';
    
    // Process UserAnalytics
    const userAnalytics = await prisma.userAnalytics.upsert({
      where: { userId },
      update: {
        totalSubmissions: { increment: 1 },
        acceptedSubmissions: { increment: isAccepted ? 1 : 0 },
        easySolved: { increment: (isAccepted && problem?.difficulty === 'Easy') ? 1 : 0 },
        mediumSolved: { increment: (isAccepted && problem?.difficulty === 'Medium') ? 1 : 0 },
        hardSolved: { increment: (isAccepted && problem?.difficulty === 'Hard') ? 1 : 0 },
        problemsSolved: { increment: isAccepted ? 1 : 0 },
        lastActiveDate: new Date(),
      },
      create: {
        userId,
        totalSubmissions: 1,
        acceptedSubmissions: isAccepted ? 1 : 0,
        easySolved: (isAccepted && problem?.difficulty === 'Easy') ? 1 : 0,
        mediumSolved: (isAccepted && problem?.difficulty === 'Medium') ? 1 : 0,
        hardSolved: (isAccepted && problem?.difficulty === 'Hard') ? 1 : 0,
        problemsSolved: isAccepted ? 1 : 0,
        lastActiveDate: new Date(),
      }
    });

    // Update global Problem Analytics
    await prisma.problemAnalytics.upsert({
      where: { problemId },
      update: {
        totalAttempts: { increment: 1 },
      },
      create: {
        problemId,
        totalAttempts: 1,
      }
    });

    // Compute Daily Activity
    const dateStr = new Date().toISOString().split('T')[0];
    await prisma.dailyActivity.upsert({
      where: {
        userId_date: {
          userId,
          date: dateStr,
        }
      },
      update: {
        submissionsCount: { increment: 1 },
        acceptedCount: { increment: isAccepted ? 1 : 0 },
      },
      create: {
        userId,
        date: dateStr,
        submissionsCount: 1,
        acceptedCount: isAccepted ? 1 : 0,
      }
    });

    // Invalidate caches seamlessly
    await analyticsService.invalidateUserCache(userId);

    console.log(`[AnalyticsWorker] Completed metrics update for User: ${userId}`);

  }, { connection: { url: config.redisUrl } });

  worker.on('failed', (job, err) => {
    console.error(`[AnalyticsWorker] Job ${job?.id} failed:`, err);
  });
}
