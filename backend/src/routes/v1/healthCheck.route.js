import express from 'express';
import { ApiResponse } from '../../utils/apiResponse.js';
import { AsyncHandler } from '../../utils/asyncHandler.js';

const healthCheckHandler = AsyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, null, 'API is healthy'));
});

const router = express.Router();
router.get('/health', healthCheckHandler);

export default router;