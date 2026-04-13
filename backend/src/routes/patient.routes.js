import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { listPatients, createPatient, getPatientById, updatePatient } from '../controllers/patient.controller.js';

const router = Router();
router.use(authMiddleware);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: List patients with optional search
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for name, location, or contact
 *     responses:
 *       200:
 *         description: List of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   DOB:
 *                     type: string
 *                     format: date
 *                   gender:
 *                     type: string
 *                     enum: [male, female, other]
 *                   location:
 *                     type: string
 *                   contact:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get(
  '/',
  [query('q').optional().isString().withMessage('Search query must be text')],
  validateRequest,
  listPatients
);

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Create a new patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - DOB
 *               - gender
 *               - location
 *               - contact
 *             properties:
 *               name:
 *                 type: string
 *               DOB:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               location:
 *                 type: string
 *               contact:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  [
    // Accept both 'name' and 'firstName'/'lastName'
    body().custom((value, { req }) => {
      const name = req.body.name || `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim();
      if (!name) {
        throw new Error('Name (or firstName/lastName) is required');
      }
      return true;
    }),
    // All other fields are optional - service will provide defaults
    body('DOB').optional({ checkFalsy: false }).escape(),
    body('dateOfBirth').optional({ checkFalsy: false }).escape(),
    body('gender').optional({ checkFalsy: false }).isIn(['male', 'female', 'other']).escape(),
    body('location').optional({ checkFalsy: false }).trim().escape(),
    body('village').optional({ checkFalsy: false }).trim().escape(),
    body('contact').optional({ checkFalsy: false }).trim().escape(),
    body('phone').optional({ checkFalsy: false }).trim().escape(),
    body('email').optional({ checkFalsy: false }).isEmail().escape(),
  ],
  validateRequest,
  createPatient
);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient details
 *       404:
 *         description: Patient not found
 */
router.get('/:id', [param('id').isInt().withMessage('Valid patient ID is required')], validateRequest, getPatientById);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Update patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               DOB:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               location:
 *                 type: string
 *               contact:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       404:
 *         description: Patient not found
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Valid patient ID is required'),
    body('name').optional().trim().notEmpty(),
    body('DOB').optional().isDate(),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('location').optional().trim().notEmpty(),
    body('contact').optional().trim().notEmpty(),
  ],
  validateRequest,
  updatePatient
);

export default router;
