import express from 'express';
import { verifyJWT, authorizeRoles } from '../../middleware/auth.middleware.js';
import {
    bookAppointment,
    getMyAppointments,
    deleteAppointment
} from '../../controllers/appointment/patientapt.controller.js';
import {
    getDoctorSchedule,
    confirmBooking,
    cancelBooking,
    getWaitingPatients,
    getPatientHistory
} from '../../controllers/appointment/doctorapt.controller.js';

const router = express.Router();

router.use(verifyJWT);

router.post('/book', bookAppointment);
router.get('/my-appointments', getMyAppointments);
router.delete('/:appointmentId', deleteAppointment);

router.get('/schedule', authorizeRoles('doctor'), getDoctorSchedule);
router.put('/confirm/:appointmentId', authorizeRoles('doctor'), confirmBooking);
router.put('/cancel/:appointmentId', authorizeRoles('doctor'), cancelBooking);
router.get('/waiting-patients', authorizeRoles('doctor'), getWaitingPatients);
router.get('/patient/:patientId/history', authorizeRoles('doctor'), getPatientHistory);

export default router;
