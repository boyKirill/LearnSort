import { createHash, randomBytes } from 'node:crypto';

export function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function generateOpaqueToken(length = 48): string {
  return randomBytes(length).toString('base64url');
}
