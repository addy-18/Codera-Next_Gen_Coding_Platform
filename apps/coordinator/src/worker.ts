import { Worker, Queue } from 'bullmq';
import fs from 'fs';
import path from 'path';
import config from '@codera/config';
import prisma from '@codera/db';
import type { SubmissionJobPayload, Verdict } from '@codera/types';
import { mapJudge0StatusToVerdict, JUDGE0_STATUS } from '@codera/types';
import { judge0Client } from './judge0';
import { aggregator } from './aggregator';
import { publishSubmissionEvent } from './publisher';

// Parse Redis URL for BullMQ connection (avoids ioredis type mismatch)
function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port, 10) || 6379,
    password: parsed.password || undefined,
    maxRetriesPerRequest: null as null,
  };
}

const connection = parseRedisUrl(config.redisUrl);
const analyticsQueue = new Queue('analytics-update', { connection });

// Polling constants
const POLL_INTERVAL_MS = 1500;   // Check every 1.5 seconds
const MAX_POLL_ATTEMPTS = 120;   // Give up after ~3 minutes

/**
 * Start the BullMQ worker consuming from `submission-queue`.
 *
 * For each job:
 * 1. Load submission from DB
 * 2. Discover testcases on local FS
 * 3. Submit each testcase independently to Judge0
 * 4. Poll Judge0 for results until all testcases are finished
 * 5. Persist results, publish events, compute final verdict
 */
// Map Judge0 language IDs to full-boilerplate file extensions
const LANG_EXT_MAP: Record<number, string> = {
  54: 'cpp',   // C++ (GCC 9.2.0)
  76: 'cpp',   // C++ (Clang 7.0.1)
  62: 'java',  // Java (OpenJDK 13.0.1)
  71: 'py',    // Python (3.8.1)
  70: 'py',    // Python (2.7.17)
};

/** Number of testcases to run in 'run' mode (Run Code button) */
const RUN_MODE_LIMIT = 3;

/** Small helper to sleep for ms */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function startWorker(): void {
  const worker = new Worker<SubmissionJobPayload>(
    'submission-queue',
    async (job) => {
      const { submissionId, mode } = job.data;
      console.log(`[Worker] Processing job for submission ${submissionId} (mode=${mode})`);

      try {
        // 1. Load submission from DB
        const submission = await prisma.submission.findUnique({
          where: { id: submissionId },
        });

        if (!submission) {
          throw new Error(`Submission ${submissionId} not found`);
        }

        // 2. Locate problem on local FS
        const basePath = config.problemsBasePath.startsWith('.')
          ? path.resolve(__dirname, '..', '..', '..', 'problems')
          : config.problemsBasePath;
        const problemDir = path.resolve(basePath, submission.problemId);

        if (!fs.existsSync(problemDir)) {
          throw new Error(`Problem directory not found: ${problemDir}`);
        }

        // 3. Inject user code into full-boilerplate
        const finalSource = buildFinalSource(
          problemDir,
          submission.languageId,
          submission.sourceCode
        );

        // 4. Discover and optionally limit testcases
        let testcases = discoverTestcases(problemDir);
        if (testcases.length === 0) {
          throw new Error(`No testcases found in ${problemDir}`);
        }

        if (mode === 'run') {
          testcases = testcases.slice(0, RUN_MODE_LIMIT);
        }

        console.log(
          `[Worker] Using ${testcases.length} testcases for problem ${submission.problemId} (mode=${mode})`
        );

        // 5. Register aggregation
        aggregator.register(submissionId, testcases.length);

        // 6. Update submission status to 'running'
        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: 'running',
            totalTests: testcases.length,
          },
        });

        // Publish status update via Pub/Sub
        await publishSubmissionEvent(submissionId, {
          type: 'status_update',
          submissionId,
          status: 'running',
        });

        // 7. Submit each testcase to Judge0 and collect tokens
        const tokenMap: { token: string; testcaseIndex: number }[] = [];

        for (const tc of testcases) {
          const result = await judge0Client.submitTestcase({
            sourceCode: finalSource,
            languageId: submission.languageId,
            stdin: tc.input,
            expectedOutput: tc.expectedOutput,
            submissionId,
            testcaseIndex: tc.index,
          });
          tokenMap.push({ token: result.token, testcaseIndex: tc.index });
        }

        console.log(
          `[Worker] All ${testcases.length} testcases submitted to Judge0 for ${submissionId}. Starting polling...`
        );

        // 8. Poll Judge0 for results
        const pending = new Set(tokenMap.map((t) => t.token));
        let attempts = 0;
        let finalized = false;

        while (pending.size > 0 && attempts < MAX_POLL_ATTEMPTS && !finalized) {
          await sleep(POLL_INTERVAL_MS);
          attempts++;

          for (const entry of tokenMap) {
            if (!pending.has(entry.token)) continue;

            try {
              const result = await judge0Client.getResult(entry.token);
              const statusId = result.status?.id;

              // Still processing — skip
              if (statusId !== undefined && statusId < JUDGE0_STATUS.ACCEPTED) {
                continue;
              }

              // Finished — process this testcase result
              pending.delete(entry.token);

              const verdict: Verdict = statusId
                ? mapJudge0StatusToVerdict(statusId)
                : 'INTERNAL_ERROR';

              console.log(
                `[Worker] Poll result for ${submissionId} testcase ${entry.testcaseIndex}: ${verdict} (status=${statusId})`
              );

              // Persist result in DB
              await prisma.submissionResult.upsert({
                where: {
                  submissionId_testcaseIndex: {
                    submissionId,
                    testcaseIndex: entry.testcaseIndex,
                  },
                },
                update: {
                  status: verdict,
                  time: result.time ?? null,
                  memory: result.memory ? String(result.memory) : null,
                  stdout: result.stdout?.substring(0, 500) ?? null,
                  stderr: (result.stderr || result.compile_output)?.substring(0, 500) ?? null,
                },
                create: {
                  submissionId,
                  testcaseIndex: entry.testcaseIndex,
                  status: verdict,
                  time: result.time ?? null,
                  memory: result.memory ? String(result.memory) : null,
                  stdout: result.stdout?.substring(0, 500) ?? null,
                  stderr: (result.stderr || result.compile_output)?.substring(0, 500) ?? null,
                },
              });

              // Publish per-test event live
              await publishSubmissionEvent(submissionId, {
                type: 'test_result',
                submissionId,
                testcaseIndex: entry.testcaseIndex,
                verdict,
                time: result.time,
                memory: result.memory ? String(result.memory) : null,
              });

              // Update in-memory aggregation
              const isLast = aggregator.recordResult(submissionId, {
                testcaseIndex: entry.testcaseIndex,
                status: verdict,
                verdict,
                time: result.time,
                memory: result.memory ? String(result.memory) : null,
              });

              // If last testcase → compute final verdict and stop polling
              if (isLast) {
                const final_ = aggregator.computeFinalVerdict(submissionId);

                await prisma.submission.update({
                  where: { id: submissionId },
                  data: {
                    status: 'finished',
                    verdict: final_.verdict,
                    passedTests: final_.passedTests,
                    totalTests: final_.totalTests,
                  },
                });

                await publishSubmissionEvent(submissionId, {
                  type: 'final_verdict',
                  submissionId,
                  verdict: final_.verdict,
                  passedTests: final_.passedTests,
                  totalTests: final_.totalTests,
                  results: final_.results.map((r) => ({
                    testcaseIndex: r.testcaseIndex,
                    status: r.status,
                    time: r.time,
                    memory: r.memory,
                  })),
                });

                console.log(
                  `[Worker] FINAL VERDICT for ${submissionId}: ${final_.verdict} (${final_.passedTests}/${final_.totalTests})`
                );

                // Publish to analytics queue for aggregation
                const submissionObj = await prisma.submission.findUnique({
                  where: { id: submissionId },
                });
                if (submissionObj) {
                  await analyticsQueue.add('update', { 
                    submissionId,
                    userId: submissionObj.userId,
                    problemId: submissionObj.problemId 
                  });
                }

                finalized = true;
                break; // Stop iterating remaining tokens — all done
              }
            } catch (pollErr: any) {
              console.error(
                `[Worker] Poll error for token ${entry.token}:`,
                pollErr.message
              );
              // Continue polling other tokens
            }
          }
        }

        // If we ran out of attempts, fail remaining testcases
        if (pending.size > 0) {
          console.error(
            `[Worker] Timed out waiting for ${pending.size} testcases for ${submissionId}`
          );

          // Mark submission as finished with error
          await prisma.submission.update({
            where: { id: submissionId },
            data: { status: 'finished', verdict: 'INTERNAL_ERROR' },
          });

          await publishSubmissionEvent(submissionId, {
            type: 'final_verdict',
            submissionId,
            verdict: 'INTERNAL_ERROR',
            passedTests: 0,
            totalTests: testcases.length,
            results: [],
          });
        }
      } catch (err) {
        console.error(`[Worker] Failed to process submission ${submissionId}:`, err);

        // Mark submission as finished with error
        await prisma.submission.update({
          where: { id: submissionId },
          data: { status: 'finished', verdict: 'INTERNAL_ERROR' },
        });

        await publishSubmissionEvent(submissionId, {
          type: 'final_verdict',
          submissionId,
          verdict: 'INTERNAL_ERROR',
          passedTests: 0,
          totalTests: 0,
          results: [],
        });

        throw err; // Let BullMQ handle retry
      }
    },
    {
      connection,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  console.log('[Worker] BullMQ worker started on queue: submission-queue');
}

// ── Code Injection ──

/**
 * Read the full-boilerplate file for the given language and inject user code.
 * The boilerplate contains a placeholder: `// {{USER_CODE}}` (or `# {{USER_CODE}}` for Python).
 */
function buildFinalSource(
  problemDir: string,
  languageId: number,
  userCode: string
): string {
  const ext = LANG_EXT_MAP[languageId];
  if (!ext) {
    throw new Error(`Unsupported language ID: ${languageId}`);
  }

  const boilerplatePath = path.join(problemDir, `fullboilerplate.${ext}`);
  if (!fs.existsSync(boilerplatePath)) {
    throw new Error(`Full-boilerplate not found: ${boilerplatePath}`);
  }

  const template = fs.readFileSync(boilerplatePath, 'utf-8');

  // Replace the placeholder with user code
  const placeholder = ext === 'py' ? '# {{USER_CODE}}' : '// {{USER_CODE}}';
  if (!template.includes(placeholder)) {
    throw new Error(`Boilerplate missing placeholder (${placeholder}) in ${boilerplatePath}`);
  }

  return template.replace(placeholder, userCode);
}

// ── Testcase Discovery ──

interface Testcase {
  index: number;
  input: string;
  expectedOutput: string;
}

/**
 * Discover testcases from the problem directory.
 *
 * Expected layout:
 *   problems/{problemId}/inputs/1.txt
 *   problems/{problemId}/outputs/1.txt
 *   problems/{problemId}/inputs/2.txt
 *   problems/{problemId}/outputs/2.txt
 *   ...
 */
function discoverTestcases(problemDir: string): Testcase[] {
  const inputsDir = path.join(problemDir, 'inputs');
  const outputsDir = path.join(problemDir, 'outputs');

  if (!fs.existsSync(inputsDir) || !fs.existsSync(outputsDir)) {
    return [];
  }

  const files = fs.readdirSync(inputsDir);
  const testcases: Testcase[] = [];
  const pattern = /^(\d+)\.txt$/;

  for (const file of files) {
    const match = file.match(pattern);
    if (!match) continue;

    const index = parseInt(match[1], 10);
    const inputPath = path.join(inputsDir, file);
    const outputPath = path.join(outputsDir, file);

    if (!fs.existsSync(outputPath)) {
      console.warn(`[Worker] Missing output file for testcase ${index}: ${outputPath}`);
      continue;
    }

    testcases.push({
      index,
      input: fs.readFileSync(inputPath, 'utf-8'),
      expectedOutput: fs.readFileSync(outputPath, 'utf-8'),
    });
  }

  // Sort by index
  return testcases.sort((a, b) => a.index - b.index);
}
