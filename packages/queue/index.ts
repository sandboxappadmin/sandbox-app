import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// BullMQ requires this exact option when connecting to most managed
// Redis providers (Upstash included) — without it, BullMQ's internal
// retry logic conflicts with how the connection is managed.
const connection = new IORedis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null,
});

export const WORKFLOW_QUEUE_NAME = 'workflow-execution';

export const workflowQueue = new Queue(WORKFLOW_QUEUE_NAME, { connection });

// The exact shape of every job enqueued when a trigger fires.
// Both apps/web (producer) and apps/api (consumer) import this type
// so they can never drift out of sync with each other.
export type WorkflowJobData = {
  workflowId: string;
  contactId: string;
  nicheInstallId: string;
};

export { connection as redisConnection };