import type { Request, Response } from 'express';

import { getCompareAlgorithms } from '../services/compare.service.js';

export async function getAlgorithms(_req: Request, res: Response) {
  const algorithms = await getCompareAlgorithms();

  res.json(algorithms);
}
