// ─── Submission Status ───
export type SubmissionStatus = 'queued' | 'running' | 'finished';

// ─── Verdict ───
export type Verdict =
  | 'AC'    // Accepted
  | 'WA'    // Wrong Answer
  | 'TLE'   // Time Limit Exceeded
  | 'MLE'   // Memory Limit Exceeded
  | 'RTE'   // Runtime Error
  | 'CE'    // Compilation Error
  | 'INTERNAL_ERROR'
  | 'PENDING';

// ─── BullMQ Job Payload ───
export type SubmissionMode = 'run' | 'submit';

export interface SubmissionJobPayload {
  submissionId: string;
  mode: SubmissionMode;
}

// ─── Judge0 ───
export interface Judge0SubmissionPayload {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
  callback_url?: string;
}

export interface Judge0SubmissionResponse {
  token: string;
}

export interface Judge0CallbackBody {
  token?: string;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  exit_code?: number | null;
  time?: string | null;
  memory?: number | null;
  status?: {
    id: number;
    description: string;
  };
}

export const JUDGE0_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_SIGXFSZ: 8,
  RUNTIME_ERROR_SIGFPE: 9,
  RUNTIME_ERROR_SIGABRT: 10,
  RUNTIME_ERROR_NZEC: 11,
  RUNTIME_ERROR_OTHER: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
} as const;

export function mapJudge0StatusToVerdict(statusId: number): Verdict {
  switch (statusId) {
    case JUDGE0_STATUS.ACCEPTED:
      return 'AC';
    case JUDGE0_STATUS.WRONG_ANSWER:
      return 'WA';
    case JUDGE0_STATUS.TIME_LIMIT_EXCEEDED:
      return 'TLE';
    case JUDGE0_STATUS.COMPILATION_ERROR:
      return 'CE';
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGSEGV:
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGXFSZ:
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGFPE:
    case JUDGE0_STATUS.RUNTIME_ERROR_SIGABRT:
    case JUDGE0_STATUS.RUNTIME_ERROR_NZEC:
    case JUDGE0_STATUS.RUNTIME_ERROR_OTHER:
      return 'RTE';
    case JUDGE0_STATUS.INTERNAL_ERROR:
    case JUDGE0_STATUS.EXEC_FORMAT_ERROR:
      return 'INTERNAL_ERROR';
    default:
      return 'PENDING';
  }
}

// ─── WebSocket / Pub/Sub Events ───
export interface TestResultEvent {
  type: 'test_result';
  submissionId: string;
  testcaseIndex: number;
  verdict: Verdict;
  time?: string | null;
  memory?: string | null;
}

export interface FinalVerdictEvent {
  type: 'final_verdict';
  submissionId: string;
  verdict: Verdict;
  passedTests: number;
  totalTests: number;
  results: Array<{
    testcaseIndex: number;
    status: string;
    time?: string | null;
    memory?: string | null;
  }>;
}

export interface StatusUpdateEvent {
  type: 'status_update';
  submissionId: string;
  status: SubmissionStatus;
}

export type SubmissionEvent = TestResultEvent | FinalVerdictEvent | StatusUpdateEvent;

// ─── WebSocket Client Messages ───
export interface WSAuthMessage {
  type: 'auth';
  userId: string;
}

export interface WSSubscribeMessage {
  type: 'subscribe_submission';
  submissionId: string;
}

export interface WSPingMessage {
  type: 'ping';
}

export interface WSCursorUpdateMessage {
  type: 'cursor_update';
  username: string;
  position: { lineNumber: number; column: number };
  color: string;
}

export interface WSLanguageChangeMessage {
  type: 'language_change';
  languageId: number;
}

export type WSClientMessage = WSAuthMessage | WSSubscribeMessage | WSPingMessage | WSJoinRoomMessage | WSLeaveRoomMessage | WSCursorUpdateMessage | WSLanguageChangeMessage;

// ─── Auth Types ───
export interface AuthPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    problemsSolved: string[];
  };
}

// ─── Room / Collaboration Types ───
export type RoomRole = 'host' | 'collaborator';
export type RoomMode = 'interview' | 'practice';

export interface RoomParticipant {
  userId: string;
  username: string;
  role: RoomRole;
  canEdit: boolean;
}

// ─── Room WebSocket Events ───
export interface WSJoinRoomMessage {
  type: 'join_room';
  roomId: string;
}

export interface WSLeaveRoomMessage {
  type: 'leave_room';
  roomId: string;
}

export interface PermissionUpdateEvent {
  type: 'permission_update';
  targetUserId: string;
  canEdit: boolean;
}

export interface RunResultEvent {
  type: 'run_result';
  executedBy: string;
  submissionId: string;
  output: string;
  status: string;
  runtime: string;
}

export interface SubmitResultEvent {
  type: 'submit_result';
  submittedBy: string;
  submissionId: string;
  verdict: string;
  runtime: string;
  memory: string;
}

export interface UserJoinedEvent {
  type: 'user_joined';
  userId: string;
  username: string;
}

export interface UserLeftEvent {
  type: 'user_left';
  userId: string;
  username: string;
}

export interface PresenceUpdateEvent {
  type: 'presence_update';
  participants: RoomParticipant[];
}

export type RoomEvent =
  | PermissionUpdateEvent
  | RunResultEvent
  | SubmitResultEvent
  | UserJoinedEvent
  | UserLeftEvent
  | PresenceUpdateEvent;

