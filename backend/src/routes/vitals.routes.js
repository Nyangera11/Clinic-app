import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createVital, getVitalsByPatient } from '../controllers/vitals.controller.js';

const router = Router();
router.use(authMiddleware);

router.post(
  '/',
  [
    body('patient_id').isInt().withMessage('patient_id is required'),
    body('BP').trim().notEmpty().withMessage('BP is required'),
    body('temperature').isFloat({ min: 20, max: 45 }).withMessage('Valid temperature is required'),
    body('glucose').isFloat({ min: 0 }).withMessage('Valid glucose reading is required'),
    body('SpO2').isFloat({ min: 0, max: 100 }).withMessage('Valid SpO2 reading is required'),
    body('timestamp').optional().isISO8601().withMessage('Valid timestamp is required'),
  ],
  validateRequest,
  createVital
);

router.get('/:patientId', [param('patientId').isInt().withMessage('Valid patient ID is required')], validateRequest, getVitalsByPatient);

export default router;
