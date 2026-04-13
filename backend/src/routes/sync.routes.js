import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { syncBulkData } from '../controllers/sync.controller.js';

const router = Router();
router.use(authMiddleware);

router.post('/', validateRequest, syncBulkData);

export default router;
