import { AsyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import User from "../../models/users.model.js";
import Appointment from "../../models/appointments.model.js";
import SymptomSession from "../../models/symptomSession.model.js";

const scheduleFromReferral = AsyncHandler(async (req, res) => {
    const { doctorId, symptomSessionId, preferredDate, startTime } = req.body;
    const patientId = req.user._id;

    // Validate required inputs
    if (!doctorId || !symptomSessionId || !preferredDate) {
        throw new ApiError(400, "doctorId, symptomSessionId, and preferredDate are required");
    }

    if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
        throw new ApiError(400, "startTime must be in HH:mm format");
    }

    // Validate preferredDate is in the future
    const appointmentDate = new Date(preferredDate);
    if (isNaN(appointmentDate.getTime())) {
        throw new ApiError(400, "Invalid date format");
    }

    const now = new Date();
    if (appointmentDate <= now) {
        throw new ApiError(400, "Appointment date must be in the future");
    }

    // Verify doctor exists and is verified
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor' || doctor.verificationStatus !== 'verified') {
        throw new ApiError(400, "Doctor not found or not verified");
    }

    // Verify symptom session exists
    const symptomSession = await SymptomSession.findById(symptomSessionId);
    if (!symptomSession) {
        throw new ApiError(404, "Symptom session not found");
    }

    // Check for booking conflicts (doctor already has an appointment at this time)
    const existingAppointment = await Appointment.findOne({
        doctorId,
        'slot.date': appointmentDate,
        'slot.startTime': startTime,
        status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
        throw new ApiError(409, "Doctor is not available at the requested time");
    }

    // Calculate end time (30-min default duration)
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date(appointmentDate);
    endDate.setHours(hours, minutes + 30);
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    // Phase 4.3: Auto-booking CTA
    const appointment = await Appointment.create({
        patientId,
        doctorId,
        slot: {
            date: appointmentDate,
            startTime,
            endTime,
            duration: 30
        },
        type: 'video',
        fees: 500,
        symptomContext: symptomSessionId,  // Phase 5.2: Attach to appointment
        status: 'scheduled'
    });

    // TODO: Queue async notification to doctor
    // Example: await notificationQueue.enqueue({ type: 'appointment_booked', doctorId, appointmentId: appointment._id });

    return res.status(201).json(
        new ApiResponse(201, appointment, "Appointment scheduled from AI referral")
    );
});

export { scheduleFromReferral };
