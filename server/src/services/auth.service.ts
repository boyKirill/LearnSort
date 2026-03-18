import { ModuleProgressStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { generateOpaqueToken, hashValue } from '../utils/crypto.js';
import { HttpError } from '../utils/http-error.js';
import { logger } from '../utils/logger.js';
import { signAccessToken } from '../utils/tokens.js';
import { ensureModuleProgressRecords } from './module-progress.service.js';

interface SessionUser {
  id: string;
  email: string;
  nickname: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function maskEmail(email: string) {
  const [localPart, domainPart] = email.split('@');

  if (!domainPart) {
    return 'redacted';
  }

  const visibleLocalPart = localPart.slice(0, 2);

  return `${visibleLocalPart}${'*'.repeat(Math.max(localPart.length - visibleLocalPart.length, 1))}@${domainPart}`;
}

function sanitizeUser(user: SessionUser) {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function createRefreshToken(userId: string) {
  const token = generateOpaqueToken();
  const tokenHash = hashValue(token);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  return token;
}

async function revokeRefreshToken(rawToken: string | undefined) {
  if (!rawToken) {
    return;
  }

  const tokenHash = hashValue(rawToken);

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

async function createSession(user: SessionUser) {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    nickname: user.nickname,
  });

  const refreshToken = await createRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  };
}

export async function registerUser(input: {
  email: string;
  nickname: string;
  password: string;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new HttpError(409, 'Пользователь с таким email уже существует.');
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      nickname: input.nickname.trim(),
      passwordHash,
      moduleProgress: {
        create: [],
      },
    },
  });

  await ensureModuleProgressRecords(user.id);

  logger.info('auth.register.success', {
    userId: user.id,
    email: maskEmail(user.email),
  });

  return createSession(user);
}

export async function loginUser(input: { email: string; password: string }) {
  const normalizedEmail = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    logger.warn('auth.login.failed', {
      email: maskEmail(normalizedEmail),
      reason: 'user_not_found',
    });
    throw new HttpError(401, 'Неверный email или пароль.');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    logger.warn('auth.login.failed', {
      userId: user.id,
      reason: 'invalid_password',
    });
    throw new HttpError(401, 'Неверный email или пароль.');
  }

  await ensureModuleProgressRecords(user.id);

  logger.info('auth.login.success', {
    userId: user.id,
  });

  return createSession(user);
}

export async function refreshSession(rawRefreshToken: string | undefined) {
  if (!rawRefreshToken) {
    throw new HttpError(401, 'Сессия истекла. Войдите снова.');
  }

  const tokenHash = hashValue(rawRefreshToken);

  const refreshToken = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!refreshToken) {
    logger.warn('auth.refresh.failed', {
      reason: 'refresh_token_not_found',
    });
    throw new HttpError(401, 'Сессия истекла. Войдите снова.');
  }

  await prisma.refreshToken.update({
    where: { id: refreshToken.id },
    data: {
      revokedAt: new Date(),
    },
  });

  logger.info('auth.refresh.success', {
    userId: refreshToken.userId,
  });

  return createSession(refreshToken.user);
}

export async function logoutUser(rawRefreshToken: string | undefined) {
  await revokeRefreshToken(rawRefreshToken);

  logger.info('auth.logout.success', {
    hadRefreshToken: Boolean(rawRefreshToken),
  });
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new HttpError(404, 'Пользователь не найден.');
  }

  return sanitizeUser(user);
}

export async function revokeAllRefreshTokensForUser(userId: string) {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function markModuleStartedIfNeeded(userId: string, moduleId: string) {
  await prisma.moduleProgress.upsert({
    where: {
      userId_moduleId: {
        userId,
        moduleId,
      },
    },
    update: {
      status: {
        set: ModuleProgressStatus.IN_PROGRESS,
      },
    },
    create: {
      userId,
      moduleId,
      status: ModuleProgressStatus.IN_PROGRESS,
      bestKnowledgeCheckPercent: 0,
    },
  });
}
