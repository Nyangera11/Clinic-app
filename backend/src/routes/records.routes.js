import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createMedicalRecord, getRecordsByPatient } from '../controllers/records.controller.js';

const router = Router();
router.use(authMiddleware);

router.post(
  '/',
  [
    body('patientId').isInt().withMessage('Valid patientId is required'),
    body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
    body('treatment').trim().notEmpty().withMessage('Treatment is required'),
    body('notes').optional().trim(),
  ],
  validateRequest,
  createMedicalRecord
);

router.get('/:patientId', [param('patientId').isInt().withMessage('Valid patient ID is required')], validateRequest, getRecordsByPatient);

export default router;
