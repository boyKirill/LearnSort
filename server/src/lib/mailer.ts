import nodemailer from 'nodemailer';

import { env } from '../config/env.js';

export const mailer = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_SECURE || env.MAIL_PORT === 465,
  auth: env.MAIL_USER
    ? {
        user: env.MAIL_USER,
        pass: env.MAIL_PASSWORD,
      }
    : undefined,
});
