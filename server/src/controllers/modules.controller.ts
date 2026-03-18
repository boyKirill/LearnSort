import type { Request, Response } from 'express';

import {
  completeModule,
  getModuleBySlugForUser,
  listModulesForUser,
  startModule,
} from '../services/module.service.js';

export async function listModules(req: Request, res: Response) {
  const modules = await listModulesForUser(req.auth!.sub);

  res.json(modules);
}

export async function getModule(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const moduleItem = await getModuleBySlugForUser(req.auth!.sub, slug);

  res.json(moduleItem);
}

export async function startModuleController(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const result = await startModule(req.auth!.sub, slug);

  res.json(result);
}

export async function completeModuleController(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const result = await completeModule(req.auth!.sub, slug);

  res.json(result);
}
