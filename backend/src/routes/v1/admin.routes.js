import express from 'express';
import { verifyJWT, authorizeRoles } from '../../middleware/auth.middleware.js';
import { verifyDoctor, getPendingDoctors } from '../../controllers/admin/admin.controller.js';

const router = express.Router();

router.use(verifyJWT, authorizeRoles('admin')); // Admin only

router.get('/pending-doctors', getPendingDoctors);
router.put('/doctors/:doctorId/verify', verifyDoctor);

export default router;
