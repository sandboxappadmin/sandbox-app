import { createHmac, timingSafeEqual } from 'crypto';

const PAYMONGO_API_URL = 'https://api.paymongo.com/v2/checkout_sessions';

export const PLAN_PRICE_PHP = 299;
export const PLAN_PRICE_CENTAVOS = PLAN_PRICE_PHP * 100;

type CreateCheckoutSessionResult =
  | { ok: true; checkoutUrl: string; sessionId: string; raw: unknown }
  | { ok: false; error: string; raw: unknown };

// referenceNumber is set to the accountId — this is how we correlate the
// webhook event back to the right account later, since PayMongo echoes
// this value back rather than us needing to store a separate mapping.
export async function createCheckoutSession(
  referenceNumber: string,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
): Promise<CreateCheckoutSessionResult> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) {
    return { ok: false, error: 'PAYMONGO_SECRET_KEY is not set', raw: null };
  }

  const paymentMethodTypes = (process.env.PAYMONGO_PAYMENT_METHOD_TYPES ?? 'gcash,grab_pay,paymaya')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const authHeader = `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;

  let response: Response;
  try {
    response = await fetch(PAYMONGO_API_URL, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
             body: JSON.stringify({
        data: {
          attributes: {
            line_items: [
              {
                name: 'Sandbox App Subscription — Monthly',
                amount: PLAN_PRICE_CENTAVOS,
                currency: 'PHP',
                quantity: 1,
              },
            ],
            payment_method_types: paymentMethodTypes,
            success_url: successUrl,
            cancel_url: cancelUrl,
            reference_number: referenceNumber,
            send_email_receipt: true,
            billing: {
              email: customerEmail,
            },
          },
        },
      }),     
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error', raw: null };
  }

  let body: any;
  try {
    body = await response.json();
  } catch {
    body = await response.text().catch(() => null);
  }

  if (!response.ok) {
    const message = body?.errors?.[0]?.detail ?? `PayMongo returned HTTP ${response.status}`;
    return { ok: false, error: message, raw: body };
  }

  const checkoutUrl = body?.data?.attributes?.checkout_url;
  const sessionId = body?.data?.id;

  if (!checkoutUrl || !sessionId) {
    return { ok: false, error: 'Unexpected response shape from PayMongo', raw: body };
  }

  return { ok: true, checkoutUrl, sessionId, raw: body };
}

// PayMongo's documented signature schemes differ between an older format
// (t=<timestamp>,te=<test sig>,li=<live sig>) and a newer one (a plain
// HMAC-SHA256 hex digest of the raw body). We handle both rather than
// guess which one applies to this account — confirmed by the first real
// test webhook.
export function verifyPaymongoSignature(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret) return false;

  const expectedDirect = createHmac('sha256', secret).update(rawBody).digest('hex');

  if (signatureHeader.includes('t=') && (signatureHeader.includes('li=') || signatureHeader.includes('te='))) {
    // Older t=/te=/li= format
    const parts = Object.fromEntries(
      signatureHeader.split(',').map((p) => {
        const [k, v] = p.split('=');
        return [k, v];
      })
    );
    const timestamp = parts['t'];
    if (!timestamp) return false;

    const signedPayload = `${timestamp}.${rawBody}`;
    const expected = createHmac('sha256', secret).update(signedPayload).digest('hex');

    const candidate = parts['li'] || parts['te'];
    if (!candidate) return false;

    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(candidate));
    } catch {
      return false; // length mismatch — definitely not a match
    }
  }

  // Newer direct-HMAC format
  try {
    return timingSafeEqual(Buffer.from(expectedDirect), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}