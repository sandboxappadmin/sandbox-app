import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
  const hex = process.env.SMS_CREDENTIAL_ENCRYPTION_KEY;
  if (!hex) {
    throw new Error('SMS_CREDENTIAL_ENCRYPTION_KEY is not set');
  }
  const key = Buffer.from(hex, 'hex');
  if (key.length !== 32) {
    throw new Error('SMS_CREDENTIAL_ENCRYPTION_KEY must be a 32-byte key, given as 64 hex characters');
  }
  return key;
}

// Stored format: iv:authTag:ciphertext, all hex — safe as a single string column.
export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12); // standard IV size for GCM
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext.toString('hex')}`;
}

export function decryptSecret(encoded: string): string {
  const key = getKey();
  const [ivHex, authTagHex, ciphertextHex] = encoded.split(':');
  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error('Malformed encrypted value');
  }

  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, 'hex')),
    decipher.final(),
  ]);
  return plaintext.toString('utf8');
}