import { Router } from 'express';
import { body, query } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  sendSMS,
  sendEmail,
  getNotifications,
  notifyAppointmentCreated,
  notifyAppointmentReminder,
  notifyPrescriptionReady,
  notifyPrescriptionReminder,
} from '../controllers/notification.controller.js';

const router = Router();
router.use(authMiddleware);

/**
 * @swagger
 * /api/notifications/send-sms:
 *   post:
 *     summary: Send SMS notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - message
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               message:
 *                 type: string
 */
router.post(
  '/send-sms',
  [
    body('phoneNumber').isMobilePhone().withMessage('Valid phone number is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  validateRequest,
  sendSMS
);

/**
 * @swagger
 * /api/notifications/send-email:
 *   post:
 *     summary: Send email notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 */
router.post(
  '/send-email',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  validateRequest,
  sendEmail
);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications for a recipient
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: recipient
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [SMS, EMAIL]
 */
router.get(
  '/',
  [
    query('recipient').notEmpty().withMessage('Recipient is required'),
  ],
  validateRequest,
  getNotifications
);

/**
 * @swagger
 * /api/notifications/appointment-created:
 *   post:
 *     summary: Notify patient of appointment creation
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/appointment-created',
  [
    body('appointmentDetails').isObject().withMessage('Appointment details are required'),
  ],
  validateRequest,
  notifyAppointmentCreated
);

/**
 * @swagger
 * /api/notifications/appointment-reminder:
 *   post:
 *     summary: Send appointment reminder
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/appointment-reminder',
  [
    body('appointmentDetails').isObject().withMessage('Appointment details are required'),
  ],
  validateRequest,
  notifyAppointmentReminder
);

/**
 * @swagger
 * /api/notifications/prescription-ready:
 *   post:
 *     summary: Notify patient that prescription is ready
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/prescription-ready',
  [
    body('prescriptionDetails').isObject().withMessage('Prescription details are required'),
  ],
  validateRequest,
  notifyPrescriptionReady
);

/**
 * @swagger
 * /api/notifications/prescription-reminder:
 *   post:
 *     summary: Send medication reminder
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/prescription-reminder',
  [
    body('prescriptionDetails').isObject().withMessage('Prescription details are required'),
  ],
  validateRequest,
  notifyPrescriptionReminder
);

export default router;
