import { Worker, Job } from 'bullmq';
import { WORKFLOW_QUEUE_NAME, workflowQueue, createWorkerConnection, type WorkflowJobData } from '@repo/queue';
import { prisma } from '@repo/database';

async function processStep(step: { type: string; config: any }, contactId: string) {
  switch (step.type) {
    case 'ADD_TAG': {
  const tagName = step.config?.tagName;
  if (!tagName) {
    console.log('[workflow] ADD_TAG step has no tagName configured, skipping');
    return;
  }

      const contact = await prisma.contact.findUnique({ where: { id: contactId } });
      if (!contact) return;

      const tag = await prisma.tag.upsert({
        where: { nicheInstallId_name: { nicheInstallId: contact.nicheInstallId, name: tagName } },
        update: {},
        create: { nicheInstallId: contact.nicheInstallId, name: tagName },
      });

      await prisma.contact.update({
        where: { id: contactId },
        data: { tags: { connect: { id: tag.id } } },
      });

      console.log(`[workflow] Added tag "${tagName}" to contact ${contactId}`);
      break;
    }

    case 'SEND_EMAIL':
    case 'SEND_SMS': {
      console.log(
        `[workflow] (stub) Would ${step.type === 'SEND_EMAIL' ? 'email' : 'text'} contact ${contactId}: "${step.config?.message ?? ''}"`
      );
      break;
    }

    default:
      console.log(`[workflow] No handler yet for step type "${step.type}"`);
  }
}

export function startWorkflowWorker() {
  const worker = new Worker<WorkflowJobData>(
    WORKFLOW_QUEUE_NAME,
    async (job: Job<WorkflowJobData>) => {
      const { workflowId, contactId } = job.data;

      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { steps: { orderBy: { order: 'asc' } } },
      });

            if (!workflow) {
        console.log(`[workflow] Workflow ${workflowId} not found, skipping job`);
        return;
      }
      if (!workflow.isActive) {
        console.log(`[workflow] Workflow ${workflowId} is not active, skipping job`);
        return;
      }

      const startIndex = (job.data as any).__stepIndex ?? 0;

      for (let i = startIndex; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];

                if (step.type === 'WAIT') {
          const delayHours = (step.config as any)?.delayHours ?? 0;
          const delayMs = delayHours * 60 * 60 * 1000;

          await workflowQueue.add(
            'run-workflow',
            { ...job.data, __stepIndex: i + 1 },
            { delay: delayMs }
          );
          return;
        }

        await processStep({ type: step.type, config: step.config }, contactId);
      }
    },
        { connection: createWorkerConnection() }
  );

  worker.on('completed', (job) => console.log(`[workflow] Job ${job.id} completed`));
  worker.on('failed', (job, err) => console.error(`[workflow] Job ${job?.id} failed:`, err));

  console.log('[workflow] Worker started, listening for jobs...');
  return worker;
}