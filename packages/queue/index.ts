import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null,
});

connection.on('error', (err) => {
  console.error('[redis] Connection error:', err.message);
});

export const WORKFLOW_QUEUE_NAME = 'workflow-execution';

export const workflowQueue = new Queue(WORKFLOW_QUEUE_NAME, { connection });

export type WorkflowJobData = {
  workflowId: string;
  contactId: string;
  nicheInstallId: string;
};

export { connection as redisConnection };

// BullMQ requires a Worker to use its own dedicated Redis connection,
// never one shared with a Queue — a Worker's blocking polling on a
// shared connection starves out other commands (like Queue.add())
// on that same socket, which is exactly what was causing jobs to
// sit in the waiting list and never get picked up.
export function createWorkerConnection() {
  return new IORedis(process.env.REDIS_URL as string, {
    maxRetriesPerRequest: null,
  });
}