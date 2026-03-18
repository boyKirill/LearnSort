import { Router } from 'express';

import authRoutes from './auth.routes.js';
import compareRoutes from './compare.routes.js';
import knowledgeCheckRoutes from './knowledge-check.routes.js';
import modulesRoutes from './modules.routes.js';
import profileRoutes from './profile.routes.js';
import progressRoutes from './progress.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/modules', modulesRoutes);
router.use('/', knowledgeCheckRoutes);
router.use('/progress', progressRoutes);
router.use('/profile', profileRoutes);
router.use('/compare', compareRoutes);

export default router;
