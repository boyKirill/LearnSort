import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import {
  confirmEmailChangeController,
  confirmPasswordChangeController,
  getProfileController,
  requestEmailChangeController,
  requestPasswordChangeController,
  updateNicknameController,
} from '../controllers/profile.controller.js';
import {
  codeConfirmSchema,
  emailChangeRequestSchema,
  nicknameSchema,
  passwordChangeRequestSchema,
} from '../controllers/schemas.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireTrustedOrigin } from '../middlewares/origin-check.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Слишком много запросов. Подождите немного и попробуйте снова.',
  },
});

router.use(requireAuth);

router.get('/', asyncHandler(getProfileController));
router.put(
  '/nickname',
  requireTrustedOrigin,
  validate({ body: nicknameSchema }),
  asyncHandler(updateNicknameController),
);
router.post(
  '/email/change-request',
  sensitiveLimiter,
  requireTrustedOrigin,
  validate({ body: emailChangeRequestSchema }),
  asyncHandler(requestEmailChangeController),
);
router.post(
  '/email/confirm',
  sensitiveLimiter,
  requireTrustedOrigin,
  validate({ body: codeConfirmSchema }),
  asyncHandler(confirmEmailChangeController),
);
router.post(
  '/password/change-request',
  sensitiveLimiter,
  requireTrustedOrigin,
  validate({ body: passwordChangeRequestSchema }),
  asyncHandler(requestPasswordChangeController),
);
router.post(
  '/password/confirm',
  sensitiveLimiter,
  requireTrustedOrigin,
  validate({ body: codeConfirmSchema }),
  asyncHandler(confirmPasswordChangeController),
);

export default router;
