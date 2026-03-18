import type { Request, Response } from 'express';

import { getProgressOverview } from '../services/progress.service.js';

export async function getMyProgress(req: Request, res: Response) {
  const result = await getProgressOverview(req.auth!.sub);

  res.json(result);
}
