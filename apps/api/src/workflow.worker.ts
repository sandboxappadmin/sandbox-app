import { Worker, Job } from 'bullmq';
import { WORKFLOW_QUEUE_NAME, workflowQueue, createWorkerConnection, type WorkflowJobData } from '@repo/queue';
import { prisma } from '@repo/database';
import { Resend } from 'resend';
import { sendSmsGateMessage } from '@repo/sms';
import { decryptSecret } from '@repo/crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

async function processStep(step: { type: string; config: any }, contactId: string) {
  switch (step.type) {
        case 'ADD_TAG': {
      const tagName = step.config?.tagName;
      if (!tagName) {
        console.log('[workflow] ADD_TAG step has no tagName configured, skipping');
        return;
      }

      const contact = await prisma.contact.findUnique({ where: { id: contactId } });
      if (!contact) {
        console.log(`[workflow] Contact ${contactId} not found, skipping ADD_TAG step`);
        return;
      }

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

            case 'SEND_EMAIL': {
      const message = step.config?.message;
      if (!message) return;

      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
        include: { nicheInstall: true },
      });
      if (!contact?.email) {
        console.log(`[workflow] Contact ${contactId} has no email address, skipping SEND_EMAIL step`);
        return;
      }

      const verifiedDomain = await prisma.sendingDomain.findFirst({
        where: { accountId: contact.nicheInstall.accountId, status: 'VERIFIED' },
      });

      const fromAddress = verifiedDomain
        ? `Sandbox App <hello@${verifiedDomain.domain}>`
        : process.env.EMAIL_FROM_ADDRESS || 'Sandbox App <onboarding@resend.dev>';

      try {
        const { data, error } = await resend.emails.send({
          from: fromAddress,
          to: contact.email,
          subject: step.config?.subject || 'A message from your workspace',
          text: message,
        });

        if (error) {
          console.error(`[workflow] Resend rejected the email to ${contact.email}:`, error.message);
        } else {
          console.log(`[workflow] Sent email to ${contact.email} from ${fromAddress}, id: ${data?.id}`);
        }
      } catch (err) {
        console.error('[workflow] Failed to send email:', err);
      }
      break;
    }

      case 'SEND_SMS': {
  const message = step.config?.message;
  if (!message) {
    console.log('[workflow] SEND_SMS step has no message configured, skipping');
    return;
  }

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: { nicheInstall: true },
  });
  if (!contact?.phone) {
    console.log(`[workflow] Contact ${contactId} has no phone number, skipping SEND_SMS step`);
    return;
  }

  const credential = await prisma.smsProviderCredential.findUnique({
    where: { accountId: contact.nicheInstall.accountId },
  });

  if (!credential) {
    console.log(
      `[workflow] Account ${contact.nicheInstall.accountId} hasn't connected SMSGate yet — skipping SEND_SMS step`
    );
    return;
  }

  const apiKey = decryptSecret(credential.encryptedApiKey);

  const result = await sendSmsGateMessage(apiKey, contact.phone, message, {
    deviceId: step.config?.deviceId,
    simCardId: step.config?.simCardId,
  });

  if (!result.ok) {
    console.error(`[workflow] SMSGate rejected the message to ${contact.phone}:`, result.error, result.raw);
  } else {
    console.log(`[workflow] Sent SMS to ${contact.phone}`, result.raw);
  }
  break;
}

    default:
      console.log(`[workflow] No handler yet for step type "${step.type}"`);
  }
}

async function checkRenewals() {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const dueSoon = await prisma.subscription.findMany({
    where: {
      renewalReminderSentAt: null,
      OR: [
        { status: 'TRIALING', trialEndsAt: { gte: now, lte: threeDaysFromNow } },
        { status: 'ACTIVE', currentPeriodEnd: { gte: now, lte: threeDaysFromNow } },
      ],
    },
    include: { account: { include: { users: true } } },
  });

  for (const sub of dueSoon) {
    const owner = sub.account.users.find((u) => u.role === 'OWNER') ?? sub.account.users[0];
    if (!owner) continue;

    const endDate = sub.status === 'TRIALING' ? sub.trialEndsAt : sub.currentPeriodEnd;
    const label = sub.status === 'TRIALING' ? 'trial' : 'subscription';

    await prisma.notification.create({
      data: {
        userId: owner.id,
        type: 'SUBSCRIPTION_RENEWAL_DUE',
        title: `Your ${label} ends soon`,
        body: `Your ${label} ends on ${endDate?.toLocaleDateString()}. Renew to avoid losing access.`,
        linkUrl: '/trial-expired',
      },
    });

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { renewalReminderSentAt: now },
    });

    console.log(`[renewal-check] Notified account ${sub.accountId} (${label} ending ${endDate?.toISOString()})`);
  }

  console.log(`[renewal-check] Checked, ${dueSoon.length} notification(s) sent`);
}

export function startWorkflowWorker() {
  const worker = new Worker<WorkflowJobData>(
    WORKFLOW_QUEUE_NAME,
    async (job: Job<WorkflowJobData>) => {
      if (job.name === 'check-renewals') {
        return checkRenewals();
      }

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

    workflowQueue.add(
    'check-renewals',
    {},
    {
      repeat: { pattern: '0 9 * * *' }, // daily at 9am server time
      jobId: 'daily-renewal-check', // stable id — re-registering on every restart won't duplicate it
    }
  );

  worker.on('completed', (job) => console.log(`[workflow] Job ${job.id} completed`));
  worker.on('failed', (job, err) => console.error(`[workflow] Job ${job?.id} failed:`, err));

  console.log('[workflow] Worker started, listening for jobs...');
  return worker;
}