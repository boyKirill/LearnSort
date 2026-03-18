import type { Request, Response } from 'express';

import {
  getKnowledgeCheckByModuleSlug,
  submitKnowledgeAttempt,
} from '../services/knowledge-check.service.js';

export async function getKnowledgeCheck(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const result = await getKnowledgeCheckByModuleSlug(req.auth!.sub, slug);

  res.json(result);
}

export async function submitAttempt(req: Request, res: Response) {
  const knowledgeCheckId = Array.isArray(req.params.knowledgeCheckId)
    ? req.params.knowledgeCheckId[0]
    : req.params.knowledgeCheckId;
  const result = await submitKnowledgeAttempt(
    req.auth!.sub,
    knowledgeCheckId,
    req.body.answers,
  );

  res.status(201).json(result);
}
