import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../utils/http-error.js';

const blockedQueryParamNames = new Set([
  'access_token',
  'accesstoken',
  'code',
  'debug',
  'emailchangetoken',
  'password',
  'refresh_token',
  'refreshtoken',
  'secret',
  'stack',
  'token',
  'trace',
]);

export function applyNoStoreCache(req: Request, res: Response, next: NextFunction) {
  void req;
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
}

export function rejectSensitiveQueryParams(req: Request, _res: Response, next: NextFunction) {
  const blockedParams = Object.keys(req.query).filter((key) =>
    blockedQueryParamNames.has(key.trim().toLowerCase()),
  );

  if (blockedParams.length > 0) {
    next(
      new HttpError(
        400,
        'Чувствительные данные запрещено передавать в URL. Используйте тело запроса.',
      ),
    );
    return;
  }

  next();
}
