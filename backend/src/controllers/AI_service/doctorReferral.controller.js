import { AsyncHandler } from "../../utils/AsyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import User from "../../models/users.model.js";
// import Appointment from "../../models/appointments.model.js";

const getDoctorReferrals = AsyncHandler(async (req, res) => {
    const { specialties, urgency, location } = req.query;  // From AI symptom output

    // Validate required parameters
    if (!specialties || specialties.trim() === '') {
        throw new ApiError(400, "Specialties parameter is required");
    }

    const specialtyList = specialties
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    if (specialtyList.length === 0) {
        throw new ApiError(400, "At least one valid specialty must be provided");
    }

    // Phase 4.2: Doctor matching logic
    const doctors = await User.find({
        role: 'doctor',
        'doctor.verified': true,
        'doctor.specialties': { $in: specialtyList },
        ...(location && { 'profile.city': location })
    })
        .select('profile.name avatar doctor.specialties availability rating')
        .sort({ rating: -1, availability: 1 })
        .limit(3)
        .lean();

    // Determine next steps based on urgency
    const nextSteps = urgency === 'high'
        ? ['video_chat', 'book_appointment', 'symptom_tracker']
        : ['book_appointment', 'video_chat', 'symptom_tracker'];

    return res.json(
        new ApiResponse(200, {
            doctors,
            urgency: urgency || 'normal',
            nextSteps
        }, "Doctor referrals generated")
    );
});

export { getDoctorReferrals };
