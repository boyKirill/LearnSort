import { VerificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { env } from '../config/env.js';
import { mailer } from '../lib/mailer.js';
import { prisma } from '../lib/prisma.js';
import { generateVerificationCode, hashValue } from '../utils/crypto.js';
import { HttpError } from '../utils/http-error.js';
import { logger } from '../utils/logger.js';
import { signAccessToken } from '../utils/tokens.js';
import { getCurrentUser } from './auth.service.js';

export async function getProfile(userId: string) {
  return getCurrentUser(userId);
}

export async function updateNickname(userId: string, nickname: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      nickname: nickname.trim(),
    },
  });

  logger.info('profile.nickname.updated', {
    userId,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accessToken: signAccessToken({
      sub: user.id,
      email: user.email,
      nickname: user.nickname,
    }),
  };
}

async function createVerificationRecord(input: {
  userId: string;
  type: VerificationType;
  pendingEmail?: string;
  pendingPasswordHash?: string;
}) {
  const code = generateVerificationCode();

  await prisma.emailVerificationCode.deleteMany({
    where: {
      userId: input.userId,
      type: input.type,
      usedAt: null,
    },
  });

  await prisma.emailVerificationCode.create({
    data: {
      userId: input.userId,
      type: input.type,
      codeHash: hashValue(code),
      pendingEmail: input.pendingEmail,
      pendingPasswordHash: input.pendingPasswordHash,
      expiresAt: new Date(Date.now() + env.VERIFICATION_CODE_TTL_MINUTES * 60 * 1000),
    },
  });

  return code;
}

export async function requestEmailChange(userId: string, newEmail: string) {
  const normalizedEmail = newEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new HttpError(404, 'Пользователь не найден.');
  }

  if (user.email === normalizedEmail) {
    throw new HttpError(400, 'Укажите новый email, отличный от текущего.');
  }

  const emailTaken = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (emailTaken) {
    throw new HttpError(409, 'Этот email уже используется.');
  }

  const code = await createVerificationRecord({
    userId,
    type: VerificationType.EMAIL_CHANGE,
    pendingEmail: normalizedEmail,
  });

  await Promise.all([
    mailer.sendMail({
      from: env.MAIL_FROM,
      to: normalizedEmail,
      subject: 'Код подтверждения смены email в SortLearn',
      text: `Здравствуйте!\n\nКод подтверждения для смены email в SortLearn: ${code}\nКод действует ${env.VERIFICATION_CODE_TTL_MINUTES} минут.\n\nЕсли вы не инициировали смену email, просто проигнорируйте это письмо.`,
    }),
    mailer.sendMail({
      from: env.MAIL_FROM,
      to: user.email,
      subject: 'Уведомление о запросе смены email в SortLearn',
      text: `Здравствуйте!\n\nПо вашей учётной записи был создан запрос на смену email на адрес ${normalizedEmail}.\nЕсли это были не вы, рекомендуем немедленно сменить пароль и проверить активные сессии.`,
    }),
  ]);

  logger.info('profile.email.change.requested', {
    userId,
    pendingEmail: normalizedEmail,
  });

  return {
    message: 'Код подтверждения отправлен на новый email. Проверьте входящие письма.',
  };
}

export async function confirmEmailChange(userId: string, code: string) {
  const record = await prisma.emailVerificationCode.findFirst({
    where: {
      userId,
      type: VerificationType.EMAIL_CHANGE,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!record || record.codeHash !== hashValue(code.trim()) || !record.pendingEmail) {
    throw new HttpError(400, 'Неверный или истёкший код подтверждения.');
  }

  const pendingEmail = record.pendingEmail;

  const user = await prisma.$transaction(async (tx) => {
    await tx.emailVerificationCode.update({
      where: { id: record.id },
      data: {
        usedAt: new Date(),
      },
    });

    return tx.user.update({
      where: { id: userId },
      data: {
        email: pendingEmail,
        isEmailVerified: true,
      },
    });
  });

  logger.info('profile.email.change.confirmed', {
    userId,
    email: user.email,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accessToken: signAccessToken({
      sub: user.id,
      email: user.email,
      nickname: user.nickname,
    }),
    message: 'Email успешно обновлён.',
  };
}

export async function requestPasswordChange(userId: string, newPassword: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new HttpError(404, 'Пользователь не найден.');
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

  if (isSamePassword) {
    throw new HttpError(400, 'Новый пароль должен отличаться от текущего.');
  }

  const pendingPasswordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
  const code = await createVerificationRecord({
    userId,
    type: VerificationType.PASSWORD_CHANGE,
    pendingPasswordHash,
  });

  await mailer.sendMail({
    from: env.MAIL_FROM,
    to: user.email,
    subject: 'Код подтверждения смены пароля в SortLearn',
    text: `Здравствуйте!\n\nКод подтверждения для смены пароля в SortLearn: ${code}\nКод действует ${env.VERIFICATION_CODE_TTL_MINUTES} минут.\n\nЕсли это были не вы, срочно смените пароль после входа в систему.`,
  });

  logger.info('profile.password.change.requested', {
    userId,
  });

  return {
    message: 'Код подтверждения отправлен на текущий email.',
  };
}

export async function confirmPasswordChange(userId: string, code: string) {
  const record = await prisma.emailVerificationCode.findFirst({
    where: {
      userId,
      type: VerificationType.PASSWORD_CHANGE,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!record || record.codeHash !== hashValue(code.trim()) || !record.pendingPasswordHash) {
    throw new HttpError(400, 'Неверный или истёкший код подтверждения.');
  }

  const pendingPasswordHash = record.pendingPasswordHash;

  await prisma.$transaction(async (tx) => {
    await tx.emailVerificationCode.update({
      where: { id: record.id },
      data: {
        usedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        passwordHash: pendingPasswordHash,
      },
    });

    await tx.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  });

  logger.info('profile.password.change.confirmed', {
    userId,
  });

  return {
    message: 'Пароль успешно обновлён. Выполните вход заново.',
  };
}
