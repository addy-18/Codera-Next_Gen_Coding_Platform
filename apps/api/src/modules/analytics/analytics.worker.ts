import { Worker } from 'bullmq';
import config from '@codera/config';
import prisma from '@codera/db';
import { analyticsService } from './analytics.service';

export function startAnalyticsWorker() {
  const worker = new Worker('analytics-update', async (job) => {
    const { submissionId, userId, problemId } = job.data;
    console.log(`[AnalyticsWorker] Processing submission ${submissionId}`);

    // Fetch the finished submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { results: true },
    });

    if (!submission) return;

    // Fetch the problem for difficulty tagging
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    const isAccepted = submission.verdict === 'Accepted' || submission.verdict === 'AC';

    // ── Parse runtime from the first result that has timing info ──────────────
    // Judge0 returns time as a string like "0.042" (seconds) — convert to ms.
    let runtimeMs: number | null = null;
    if (isAccepted && submission.results.length > 0) {
      const timings = submission.results
        .map((r) => parseFloat(r.time ?? ''))
        .filter((v) => !isNaN(v));
      if (timings.length > 0) {
        runtimeMs = (timings.reduce((a, b) => a + b, 0) / timings.length) * 1000;
      }
    }

    // ── Upsert UserAnalytics ────────────────────────────────────────────────
    // First get current state so we can recalculate rolling averages
    const existing = await prisma.userAnalytics.findUnique({ where: { userId } });

    const prevTotal = existing?.totalSubmissions ?? 0;
    const prevAccepted = existing?.acceptedSubmissions ?? 0;
    const prevAvgRuntime = existing?.avgRuntime ?? 0;
    const prevStreak = existing?.streak ?? 0;
    const prevLastActive = existing?.lastActiveDate;

    const newTotal = prevTotal + 1;
    const newAccepted = prevAccepted + (isAccepted ? 1 : 0);
    const newAcceptanceRate = newTotal > 0 ? (newAccepted / newTotal) * 100 : 0;

    // Rolling average runtime (only include accepted submissions with timing)
    let newAvgRuntime = prevAvgRuntime;
    if (runtimeMs !== null) {
      // We track how many accepted submissions had timing, use accepted count
      const prevAcceptedWithTime = prevAccepted; // approximation
      newAvgRuntime =
        prevAvgRuntime > 0
          ? (prevAvgRuntime * prevAcceptedWithTime + runtimeMs) / (prevAcceptedWithTime + 1)
          : runtimeMs;
    }

    // ── Streak logic ────────────────────────────────────────────────────────
    const todayStr = new Date().toISOString().split('T')[0];
    let newStreak = prevStreak;

    if (prevLastActive) {
      const prevDateStr = prevLastActive.toISOString().split('T')[0];
      if (prevDateStr === todayStr) {
        // Already active today — streak unchanged
        newStreak = prevStreak;
      } else {
        // Check if yesterday was the last active day
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (prevDateStr === yesterdayStr) {
          newStreak = prevStreak + 1; // Extend streak
        } else {
          newStreak = 1; // Streak broken — reset to 1 for today
        }
      }
    } else {
      newStreak = 1; // First ever submission
    }

    await prisma.userAnalytics.upsert({
      where: { userId },
      update: {
        totalSubmissions: newTotal,
        acceptedSubmissions: newAccepted,
        acceptanceRate: newAcceptanceRate,
        avgRuntime: newAvgRuntime,
        easySolved: { increment: (isAccepted && problem?.difficulty === 'Easy') ? 1 : 0 },
        mediumSolved: { increment: (isAccepted && problem?.difficulty === 'Medium') ? 1 : 0 },
        hardSolved: { increment: (isAccepted && problem?.difficulty === 'Hard') ? 1 : 0 },
        problemsSolved: { increment: isAccepted ? 1 : 0 },
        streak: newStreak,
        lastActiveDate: new Date(),
      },
      create: {
        userId,
        totalSubmissions: 1,
        acceptedSubmissions: isAccepted ? 1 : 0,
        acceptanceRate: isAccepted ? 100 : 0,
        avgRuntime: runtimeMs ?? 0,
        easySolved: (isAccepted && problem?.difficulty === 'Easy') ? 1 : 0,
        mediumSolved: (isAccepted && problem?.difficulty === 'Medium') ? 1 : 0,
        hardSolved: (isAccepted && problem?.difficulty === 'Hard') ? 1 : 0,
        problemsSolved: isAccepted ? 1 : 0,
        streak: 1,
        lastActiveDate: new Date(),
      }
    });

    // ── Update global Problem Analytics ────────────────────────────────────
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

    // ── Compute Daily Activity ──────────────────────────────────────────────
    await prisma.dailyActivity.upsert({
      where: {
        userId_date: {
          userId,
          date: todayStr,
        }
      },
      update: {
        submissionsCount: { increment: 1 },
        acceptedCount: { increment: isAccepted ? 1 : 0 },
      },
      create: {
        userId,
        date: todayStr,
        submissionsCount: 1,
        acceptedCount: isAccepted ? 1 : 0,
      }
    });

    // ── Invalidate caches ───────────────────────────────────────────────────
    await analyticsService.invalidateUserCache(userId);

    console.log(`[AnalyticsWorker] Metrics updated — User: ${userId} | Rate: ${newAcceptanceRate.toFixed(1)}% | Streak: ${newStreak} | AvgRuntime: ${newAvgRuntime.toFixed(2)}ms`);

  }, { connection: { url: config.redisUrl } });

  worker.on('failed', (job, err) => {
    console.error(`[AnalyticsWorker] Job ${job?.id} failed:`, err);
  });
}
