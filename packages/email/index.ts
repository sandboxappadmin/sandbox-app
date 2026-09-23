import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function createResendDomain(domain: string) {
  return resend.domains.create({ name: domain });
}

export async function getResendDomain(resendDomainId: string) {
  return resend.domains.get(resendDomainId);
}

export async function forceReverifyResendDomain(resendDomainId: string) {
  return resend.domains.verify(resendDomainId);
}

export async function deleteResendDomain(resendDomainId: string) {
  return resend.domains.remove(resendDomainId);
}

export function mapResendStatus(status: string | undefined): 'PENDING' | 'VERIFIED' | 'FAILED' {
  if (status === 'verified') return 'VERIFIED';
  if (status === 'failed' || status === 'temporary_failure') return 'FAILED';
  return 'PENDING';
}

type SendEmailResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendEmail(params: {
  from: string;
  to: string;
  subject: string;
  text: string;
}): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send(params);
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id ?? '' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}