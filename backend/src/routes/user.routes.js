import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { listUsers, createUser, listDoctors, listPatients } from '../controllers/user.controller.js';

const router = Router();

// Public routes - no auth required
router.get('/doctors', listDoctors);
router.get('/patients', listPatients);

// Admin only routes
router.use(authMiddleware, roleMiddleware('admin'));

router.get('/', listUsers);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'health_worker']).withMessage('Role must be admin or health_worker'),
  ],
  validateRequest,
  createUser
);

export default router;
