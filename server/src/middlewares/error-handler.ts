import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { HttpError } from '../utils/http-error.js';
import { logger } from '../utils/logger.js';

function normalizeError(error: Error & { statusCode?: number }) {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new HttpError(400, 'Некорректные входные данные.');
  }

  if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
    return new HttpError(401, 'Сессия недействительна. Войдите снова.');
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new HttpError(400, 'Некорректные входные данные.');
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return new HttpError(409, 'Конфликт данных. Проверьте уникальные значения.');
    }

    if (error.code === 'P2025') {
      return new HttpError(404, 'Запрошенные данные не найдены.');
    }
  }

  return new HttpError(500, 'На сервере произошла ошибка. Попробуйте ещё раз позже.');
}

export function errorHandler(
  error: Error & { statusCode?: number; details?: unknown },
  req: Request,
  res: Response,
  next: NextFunction,
) {
  void next;
  const normalizedError = normalizeError(error);
  const statusCode = normalizedError.statusCode;

  logger.error('request.failed', {
    method: req.method,
    path: req.originalUrl.split('?')[0],
    statusCode,
    errorName: error.name,
    message: statusCode >= 500 ? 'internal_server_error' : normalizedError.message,
    userId: req.auth?.sub,
  });

  res.status(statusCode).json({
    message: normalizedError.message,
  });
}
