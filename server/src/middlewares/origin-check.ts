import type { NextFunction, Request, Response } from 'express';

import { allowedOrigins } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';

function normalizeOrigin(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function matchesAllowedOrigin(value: string | undefined) {
  const normalizedOrigin = normalizeOrigin(value);

  return Boolean(normalizedOrigin && allowedOrigins.includes(normalizedOrigin));
}

export function requireTrustedOrigin(req: Request, _res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (matchesAllowedOrigin(origin) || matchesAllowedOrigin(referer)) {
    next();
    return;
  }

  next(new HttpError(403, 'Запрос отклонён из-за недоверенного источника.'));
}
