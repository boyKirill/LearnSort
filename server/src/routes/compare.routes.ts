import { Router } from 'express';

import { getAlgorithms } from '../controllers/compare.controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/algorithms', requireAuth, asyncHandler(getAlgorithms));

export default router;
