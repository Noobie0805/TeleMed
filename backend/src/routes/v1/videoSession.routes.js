import express from 'express';
import { verifyJWT, authorizeRoles } from '../../middleware/auth.middleware.js';
import { startSession, joinSession, endSession } from '../../controllers/videoSession/videoSession.controller.js';

const router = express.Router();

router.use(verifyJWT);

router.post('/start/:appointmentId', authorizeRoles('doctor'), startSession);
router.get('/join/:appointmentId', authorizeRoles('patient'), joinSession);
router.post('/end/:appointmentId', authorizeRoles('doctor'), endSession);

export default router;