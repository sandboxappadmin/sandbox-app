const SMSGATE_URL = 'https://app.smsgate.agnsys.pro/v1/messages';

type SendSmsResult =
  | { ok: true; raw: unknown }
  | { ok: false; error: string; raw: unknown };

function extractErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object' && 'error' in body) {
    const err = (body as { error: unknown }).error;
    if (typeof err === 'string') return err;
  }
  return `SMSGate returned HTTP ${status}`;
}

// apiKey is now required and explicit — each account brings its own,
// so there's no sensible global default to fall back to.
export async function sendSmsGateMessage(
  apiKey: string,
  to: string,
  content: string,
  options?: { deviceId?: string; simCardId?: string }
): Promise<SendSmsResult> {
  if (!apiKey) {
    return { ok: false, error: 'No SMSGate API key provided for this account', raw: null };
  }

  let response: Response;
  try {
    response = await fetch(SMSGATE_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        content,
        ...(options?.deviceId ? { deviceId: options.deviceId } : {}),
        ...(options?.simCardId ? { simCardId: options.simCardId } : {}),
      }),
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error', raw: null };
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = await response.text().catch(() => null);
  }

  if (!response.ok) {
    return { ok: false, error: extractErrorMessage(body, response.status), raw: body };
  }

  return { ok: true, raw: body };
}