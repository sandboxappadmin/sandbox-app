'use server';

import { createHash } from 'crypto';
import { getCurrentUserWithRole } from '@/lib/roles';
import { assertActiveAccount } from '@/lib/account-guard';

export async function getUploadSignature() {
  const user = await getCurrentUserWithRole();
  await assertActiveAccount(user.accountId);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Photo uploads are not configured yet.');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'sandbox-app/listings';

  // Cloudinary's signing rule: alphabetically sorted params, joined with &, secret appended, SHA-1
  const signature = createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  return { cloudName, apiKey, timestamp, folder, signature };
}