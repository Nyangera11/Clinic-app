import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { diagnosePatient, generatePrescription } from '../controllers/ai.controller.js';

const router = Router();
router.use(authMiddleware);

router.post(
  '/diagnose',
  [
    body('patientId').isInt().withMessage('Valid patientId is required'),
    body('symptoms').trim().notEmpty().withMessage('Symptoms are required'),
    body('vitals').isObject().withMessage('Vitals object is required'),
  ],
  validateRequest,
  diagnosePatient
);

router.post(
  '/prescription',
  [
    body('patientId').isInt().withMessage('Valid patientId is required'),
    body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
  ],
  validateRequest,
  generatePrescription
);

export default router;
