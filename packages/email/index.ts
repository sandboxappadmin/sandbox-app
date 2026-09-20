import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function createResendDomain(domain: string) {
  return resend.domains.create({ name: domain });
}

// Read-only status check — no side effects. Use this for a plain refresh.
export async function getResendDomain(resendDomainId: string) {
  return resend.domains.get(resendDomainId);
}

// Explicitly asks Resend to re-run DNS verification now, rather than
// waiting for Resend's own background check. This resets status to
// "pending" until the new check completes, so only call this when the
// user deliberately wants to force a re-check (e.g. right after fixing
// DNS records) — never on a routine status refresh.
export async function forceReverifyResendDomain(resendDomainId: string) {
  return resend.domains.verify(resendDomainId);
}

export async function deleteResendDomain(resendDomainId: string) {
  return resend.domains.remove(resendDomainId);
}

export function mapResendStatus(status: string | undefined): 'PENDING' | 'VERIFIED' | 'FAILED' {
  if (status === 'verified') return 'VERIFIED';
  if (status === 'failed' || status === 'temporary_failure') return 'FAILED';
  return 'PENDING'; // covers 'pending' and 'not_started'
}