import { Router } from 'express';

import { getKnowledgeCheck, submitAttempt } from '../controllers/knowledge-check.controller.js';
import {
  knowledgeAttemptSchema,
  knowledgeCheckIdSchema,
  slugSchema,
} from '../controllers/schemas.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireTrustedOrigin } from '../middlewares/origin-check.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.get(
  '/modules/:slug/knowledge-check',
  requireAuth,
  validate({ params: slugSchema }),
  asyncHandler(getKnowledgeCheck),
);

router.post(
  '/knowledge-checks/:knowledgeCheckId/attempts',
  requireAuth,
  requireTrustedOrigin,
  validate({ params: knowledgeCheckIdSchema, body: knowledgeAttemptSchema }),
  asyncHandler(submitAttempt),
);

export default router;
