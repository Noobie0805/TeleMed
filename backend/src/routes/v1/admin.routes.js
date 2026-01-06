import express from 'express';
import { verifyJWT, authorizeRoles } from '../../middleware/auth.middleware.js';
import { verifyDoctor, getPendingDoctors } from '../../controllers/admin/admin.controller.js';
import { appointmentCleanup } from '../../controllers/videoSession/videoSessionCleanup.controller.js';

const router = express.Router();

router.use(verifyJWT, authorizeRoles('admin')); // Admin only

router.get('/pending-doctors', getPendingDoctors);// Get list of pending doctors
router.put('/doctors/:doctorId/verify', verifyDoctor);// Verify or reject doctor
router.post('/appointments/cleanup', appointmentCleanup); // cleanup the old inconsistent appointments

export default router;
