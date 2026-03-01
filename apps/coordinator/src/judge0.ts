import axios, { AxiosInstance } from 'axios';
import config from '@codera/config';
import type { Judge0SubmissionPayload, Judge0SubmissionResponse, Judge0CallbackBody } from '@codera/types';

class Judge0Client {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.judge0Url,
      timeout: 30_000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Submit a single testcase to Judge0 (no callback — we poll instead).
   * Each testcase = one independent execution.
   */
  async submitTestcase(payload: {
    sourceCode: string;
    languageId: number;
    stdin: string;
    expectedOutput: string;
    submissionId: string;
    testcaseIndex: number;
  }): Promise<Judge0SubmissionResponse> {
    const body: Judge0SubmissionPayload = {
      source_code: payload.sourceCode,
      language_id: payload.languageId,
      stdin: payload.stdin,
      expected_output: payload.expectedOutput,
    };

    const response = await this.client.post<Judge0SubmissionResponse>(
      '/submissions?base64_encoded=false&wait=false',
      body
    );

    console.log(
      `[Judge0] Submitted testcase ${payload.testcaseIndex} for ${payload.submissionId}, token: ${response.data.token}`
    );

    return response.data;
  }

  /**
   * Poll Judge0 for a submission result by token.
   * Returns the full result body (same shape as the callback body).
   */
  async getResult(token: string): Promise<Judge0CallbackBody> {
    const response = await this.client.get<Judge0CallbackBody>(
      `/submissions/${token}?base64_encoded=false&fields=token,stdout,stderr,compile_output,message,exit_code,time,memory,status`
    );
    return response.data;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/about');
      return true;
    } catch {
      return false;
    }
  }
}

export const judge0Client = new Judge0Client();
export default judge0Client;
