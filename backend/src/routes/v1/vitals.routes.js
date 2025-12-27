import express from 'express';
import { logVital, getVitalsChartData, getWeeklyHealthScore } from '../../controllers/vitals/vitals.controller.js';
import { verifyJWT } from '../../middleware/auth.middleware.js';

const router = express.Router();
//karlo verify user pehle
router.use(verifyJWT);
// ab apna route dedo jo bhi hai

router.post('/log', logVital);
router.get('/chart-data', getVitalsChartData);
router.get('/weekly-health-score', getWeeklyHealthScore);

export default router;