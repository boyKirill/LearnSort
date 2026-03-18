import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../utils/http-error.js';
import { verifyAccessToken } from '../utils/tokens.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(new HttpError(401, 'Требуется авторизация.'));
    return;
  }

  try {
    const token = header.replace('Bearer ', '').trim();
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    next(new HttpError(401, 'Сессия недействительна. Войдите снова.'));
  }
}
