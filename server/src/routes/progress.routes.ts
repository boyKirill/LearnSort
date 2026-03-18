import { Router } from 'express';

import { getMyProgress } from '../controllers/progress.controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/me', requireAuth, asyncHandler(getMyProgress));

export default router;
