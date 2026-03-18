import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { asyncHandler } from '../middlewares/async-handler.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireTrustedOrigin } from '../middlewares/origin-check.js';
import { validate } from '../middlewares/validate.js';
import { login, logout, me, refresh, register } from '../controllers/auth.controller.js';
import { loginSchema, registerSchema } from '../controllers/schemas.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Слишком много попыток. Подождите немного и попробуйте снова.',
  },
});

const refreshLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Слишком много попыток обновления сессии. Подождите немного.',
  },
});

router.post('/register', authLimiter, validate({ body: registerSchema }), asyncHandler(register));
router.post('/login', authLimiter, validate({ body: loginSchema }), asyncHandler(login));
router.post('/refresh', refreshLimiter, requireTrustedOrigin, asyncHandler(refresh));
router.post('/logout', requireTrustedOrigin, asyncHandler(logout));
router.get('/me', requireAuth, asyncHandler(me));

export default router;
