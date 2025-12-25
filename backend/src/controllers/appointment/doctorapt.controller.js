import { AsyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import User from "../../models/users.model.js";
import Appointment from "../../models/appointments.model.js";

// get doctor schedule__________________________________________________________
const getDoctorSchedule = AsyncHandler(async (req, res) => {
    const { date } = req.query;
    const filter = {
        doctorId: req.user._id,
        status: { $in: ['scheduled', 'confirmed', 'ongoing'] }
    };
    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        filter['slot.date'] = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointmentsOfDay = await Appointment.find(filter)
        .populate('patientId', 'profile.name profile.age profile.gender')
        .sort({ 'slot.date': 1, 'slot.time': 1 })
        .select('-videoRoom');

    return res.status(200).json(new ApiResponse(200, appointmentsOfDay));

});

// booking confirmation_____________________________________________________

const confirmBooking = AsyncHandler(async (req, res) => {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctorId: req.user._id,
        status: 'scheduled'
    });

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found or cannot be confirmed');
    }

    appointment.status = 'confirmed';
    await appointment.save();

    return res.status(200).json(new ApiResponse(200, appointment, 'Appointment confirmed successfully'));
});

// cancel appointment by doctor_____________________________________________________

const cancelBooking = AsyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const { reason } = req.body; // Add reason for cancellation

    const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctorId: req.user._id,
        status: { $in: ['scheduled', 'confirmed'] }
    });

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found or cannot be cancelled');
    }

    appointment.status = 'cancelled';
    if (reason) {
        appointment.notes = reason;
    }
    await appointment.save();

    return res.status(200).json(new ApiResponse(200, appointment, 'Appointment cancelled successfully'));
});

// getting waiting patients_____________________________________________________

const getWaitingPatients = AsyncHandler(async (req, res) => {
    const waitingAppointments = await Appointment.find({
        doctorId: req.user._id,
        status: 'confirmed'
    })
        .populate('patientId', 'profile.name profile.age profile.gender')
        .sort({ 'slot.date': 1, 'slot.time': 1 })
        .limit(50);

    return res.status(200).json(new ApiResponse(200, waitingAppointments));
});

//getting patient's history_____________________________________________________
const getPatientHistory = AsyncHandler(async (req, res) => {
    const { patientId } = req.params;

    const hasAccess = await Appointment.findOne({
        doctorId: req.user._id,
        patientId: patientId,
    });

    if (!hasAccess) {
        throw new ApiError(403, "You don't have access to this patient's history");
    }

    const history = await Appointment.find({
        doctorId: req.user._id,
        patientId: patientId,
        status: 'completed'
    })
        .sort({ createdAt: -1 })
        .limit(100);

    return res.status(200).json(new ApiResponse(200, history, 'Patient history retrieved successfully'));
});


export { getDoctorSchedule, confirmBooking, cancelBooking, getWaitingPatients, getPatientHistory };
