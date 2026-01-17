import { getDoctorReferrals } from "../../controllers/AI_service/doctorReferral.controller.js";
import { sendChatMessage } from "../../controllers/AI_service/chatbot.controller.js";
import { submitSymptoms } from "../../controllers/AI_service/symptomChecker.controller.js";
import { scheduleFromReferral } from "../../controllers/AI_service/scheduling.controller.js";
import { verifyJWT, authorizeRoles } from "../../middleware/auth.middleware.js";
import express from 'express';

const router = express.Router();

router.use(verifyJWT, authorizeRoles('patient'));

router.post('/schedule', scheduleFromReferral);
router.get('/doctorReferrals', getDoctorReferrals);
router.post('/chat', sendChatMessage);
router.post('/symptoms', submitSymptoms);

export default router;