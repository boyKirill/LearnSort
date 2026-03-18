import type { Request, Response } from 'express';

import {
  confirmEmailChange,
  confirmPasswordChange,
  getProfile,
  requestEmailChange,
  requestPasswordChange,
  updateNickname,
} from '../services/profile.service.js';

export async function getProfileController(req: Request, res: Response) {
  const profile = await getProfile(req.auth!.sub);

  res.json(profile);
}

export async function updateNicknameController(req: Request, res: Response) {
  const result = await updateNickname(req.auth!.sub, req.body.nickname);

  res.json(result);
}

export async function requestEmailChangeController(req: Request, res: Response) {
  const result = await requestEmailChange(req.auth!.sub, req.body.newEmail);

  res.status(202).json(result);
}

export async function confirmEmailChangeController(req: Request, res: Response) {
  const result = await confirmEmailChange(req.auth!.sub, req.body.code);

  res.json(result);
}

export async function requestPasswordChangeController(req: Request, res: Response) {
  const result = await requestPasswordChange(req.auth!.sub, req.body.newPassword);

  res.status(202).json(result);
}

export async function confirmPasswordChangeController(req: Request, res: Response) {
  const result = await confirmPasswordChange(req.auth!.sub, req.body.code);

  res.json(result);
}
