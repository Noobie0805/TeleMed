import { AsyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/apiError.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { convertISTDateToUTC, getISTDateUTCBounds } from '../../utils/timezone.js';
import Appointment from '../../models/appointments.model.js'; // fix: import the model
import User from '../../models/users.model.js';

// Book appointment
const bookAppointment = AsyncHandler(async (req, res) => {
    const { doctorId, date, startTime, endTime, type = 'video' } = req.body;

    if (!doctorId || !date || !startTime || !endTime) {
        throw new ApiError(400, 'doctorId, date, startTime, and endTime are required');
    }

    // Validate date format (should be YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new ApiError(400, 'Invalid date format. Expected YYYY-MM-DD');
    }

    // Check doctor availability & verification
    const doctor = await User.findById(doctorId).select('role verificationStatus');

    if (!doctor || doctor.role !== 'doctor' || doctor.verificationStatus !== 'verified') {
        throw new ApiError(400, 'Doctor not available');
    }
    //for testing unverified 
    // if (!doctor || doctor.role !== 'doctor') {
    //     throw new ApiError(400, 'Doctor not available');
    // }

    // Convert date to IST midnight UTC for consistent storage and querying
    const istDateUTC = convertISTDateToUTC(date);
    const { start: dateStartUTC, end: dateEndUTC } = getISTDateUTCBounds(date);

    // CHECK FOR CONFLICTING APPOINTMENTS
    // Check for any appointment on the same date (IST) with the same start time
    const conflictingAppointment = await Appointment.findOne({
        doctorId,
        'slot.date': {
            $gte: dateStartUTC,
            $lt: dateEndUTC
        },
        'slot.startTime': startTime,
        status: { $in: ['scheduled', 'confirmed', 'ongoing'] }
    });

    if (conflictingAppointment) {
        throw new ApiError(409, 'This time slot is already booked');
    }

    const appointment = await Appointment.create({
        patientId: req.user._id,
        doctorId,
        slot: { date: istDateUTC, startTime, endTime },
        type,
        status: 'scheduled'
    });

    return res.status(201).json(new ApiResponse(201, appointment, 'Appointment booked successfully'));
});

// Delete appointment or cancel appointment 
const deleteAppointment = AsyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    if (!appointmentId) {
        throw new ApiError(400, 'Appointment ID is required');
    }
    const appointment = await Appointment.findOneAndDelete({
        _id: appointmentId,
        patientId: req.user._id,
        status: 'scheduled'
    });
    if (!appointment) {
        throw new ApiError(404, 'Appointment not found or cannot be deleted');
    }
    return res.status(200).json(new ApiResponse(200, appointment, 'Appointment deleted successfully'));
});

// Get my appointments (calendar view)
const getMyAppointments = AsyncHandler(async (req, res) => {
    const appointments = await Appointment.find({ patientId: req.user._id })
        .populate('doctorId', 'profile.name profile.doctor.specialty')
        .sort({ 'slot.date': 1 })
        .limit(20);

    return res.status(200).json(new ApiResponse(200, appointments));
});

export { getMyAppointments, bookAppointment, deleteAppointment };
