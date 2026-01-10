import express from 'express';
import { verifyJWT, authorizeRoles } from '../../middleware/auth.middleware.js';
import { verifyDoctor, getPendingDoctors, getPlatformOverview, getRevenueReport, getAuditLogs } from '../../controllers/admin/admin.controller.js';
import { appointmentCleanup } from '../../controllers/videoSession/videoSessionCleanup.controller.js';
import { getDoctorStatus, updateDoctorVerification } from '../../controllers/admin/doctorStatus.controller.js';
import { getAppointmentStats } from '../../controllers/admin/appointmentStatus.controller.js';

const router = express.Router();

router.use(verifyJWT, authorizeRoles('admin')); // Admin only

router.get('/pending-doctors', getPendingDoctors);// Get list of pending doctors
router.put('/doctors/:doctorId/verify', verifyDoctor);// Verify or reject doctor
router.post('/appointments/cleanup', appointmentCleanup); // cleanup the old inconsistent appointments and store them in separate logsDB
router.get('/appointments/status', getAppointmentStats); // Get appointment statistics
router.get('/doctors/status', getDoctorStatus); // Get doctor verification status stats
router.patch('/doctors/:id/verify', updateDoctorVerification); // Update doctor verification status
router.get('/platform/overview', getPlatformOverview); // Get platform overview stats
router.get('/platform/revenue', getRevenueReport); // Get revenue report
router.get('/audit-logs', getAuditLogs); // Get audit logs



export default router;