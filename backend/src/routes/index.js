import { Router } from 'express';
import authRoutes from './auth.routes.js';
import patientRoutes from './patient.routes.js';
import vitalsRoutes from './vitals.routes.js';
import aiRoutes from './ai.routes.js';
import recordsRoutes from './records.routes.js';
import syncRoutes from './sync.routes.js';
import userRoutes from './user.routes.js';
import appointmentsRoutes from './appointments.routes.js';
import prescriptionRoutes from './prescription.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/vitals', vitalsRoutes);
router.use('/ai', aiRoutes);
router.use('/records', recordsRoutes);
router.use('/sync', syncRoutes);
router.use('/users', userRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/notifications', notificationRoutes);

export default router;
