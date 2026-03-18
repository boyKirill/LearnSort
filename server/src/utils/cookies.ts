import type { CookieOptions, Response } from 'express';

import { env, isProduction } from '../config/env.js';

export function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: '/api/auth',
    priority: 'high',
  };
}

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(env.COOKIE_NAME, token, refreshCookieOptions());
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(env.COOKIE_NAME, refreshCookieOptions());
}
