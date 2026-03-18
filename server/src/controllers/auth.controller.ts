import type { Request, Response } from 'express';

import { env } from '../config/env.js';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from '../services/auth.service.js';
import { clearRefreshCookie, setRefreshCookie } from '../utils/cookies.js';

export async function register(req: Request, res: Response) {
  const session = await registerUser(req.body);

  setRefreshCookie(res, session.refreshToken);

  res.status(201).json({
    accessToken: session.accessToken,
    user: session.user,
  });
}

export async function login(req: Request, res: Response) {
  const session = await loginUser(req.body);

  setRefreshCookie(res, session.refreshToken);

  res.json({
    accessToken: session.accessToken,
    user: session.user,
  });
}

export async function refresh(req: Request, res: Response) {
  const session = await refreshSession(req.cookies[env.COOKIE_NAME] as string | undefined);

  setRefreshCookie(res, session.refreshToken);

  res.json({
    accessToken: session.accessToken,
    user: session.user,
  });
}

export async function logout(req: Request, res: Response) {
  await logoutUser(req.cookies[env.COOKIE_NAME] as string | undefined);
  clearRefreshCookie(res);

  res.json({
    message: 'Вы вышли из системы.',
  });
}

export async function me(req: Request, res: Response) {
  const user = await getCurrentUser(req.auth!.sub);

  res.json(user);
}
