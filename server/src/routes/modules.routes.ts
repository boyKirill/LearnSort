import { Router } from 'express';

import {
  completeModuleController,
  getModule,
  listModules,
  startModuleController,
} from '../controllers/modules.controller.js';
import { slugSchema } from '../controllers/schemas.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireTrustedOrigin } from '../middlewares/origin-check.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(listModules));
router.get('/:slug', validate({ params: slugSchema }), asyncHandler(getModule));
router.post(
  '/:slug/start',
  requireTrustedOrigin,
  validate({ params: slugSchema }),
  asyncHandler(startModuleController),
);
router.post(
  '/:slug/complete',
  requireTrustedOrigin,
  validate({ params: slugSchema }),
  asyncHandler(completeModuleController),
);

export default router;
