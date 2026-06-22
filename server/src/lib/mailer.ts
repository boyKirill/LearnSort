import nodemailer, { type SendMailOptions } from 'nodemailer';

import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';
import { logger } from '../utils/logger.js';

export const mailer = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_SECURE || env.MAIL_PORT === 465,
  requireTLS: !env.MAIL_SECURE && env.MAIL_PORT !== 465,
  connectionTimeout: 15_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
  auth: env.MAIL_USER
    ? {
        user: env.MAIL_USER.trim(),
        pass: env.MAIL_PASSWORD.trim(),
      }
    : undefined,
});

export async function sendMailOrThrow(
  context: 'email-change' | 'password-change',
  options: SendMailOptions,
) {
  try {
    await mailer.sendMail(options);
  } catch (error) {
    const baseError =
      error instanceof Error
        ? error
        : new Error('Unknown mailer error');
    const mailError = baseError as Error & { code?: string; command?: string };

    logger.error('mailer.send.failed', {
      context,
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      to: options.to?.toString?.() ?? String(options.to ?? ''),
      errorName: mailError.name,
      errorCode: mailError.code,
      command: mailError.command,
      message: mailError.message,
    });

    throw new HttpError(
      503,
      'Не удалось отправить письмо подтверждения. Проверьте настройки почты и попробуйте ещё раз.',
    );
  }
}
