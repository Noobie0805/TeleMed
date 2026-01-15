import express from 'express';
import { verifyJWT, verifyRefreshJWT } from '../../middleware/auth.middleware.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
} from '../../controllers/auth/patient.controller.js';
import { registerDoctor } from '../../controllers/auth/doctor.controller.js';

const router = express.Router();

// Public routes
router.post('/register-patient', registerUser);
router.post('/register-doctor', registerDoctor);
router.post('/login', loginUser);

// Protected routes
router.post('/refresh', verifyRefreshJWT, refreshAccessToken);
router.post('/logout', verifyJWT, logoutUser);
router.get('/me', verifyJWT, (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, 'User profile fetched'));
});

export default router;
