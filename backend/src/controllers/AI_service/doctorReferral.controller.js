import { AsyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
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

    // Phase 4.2: Doctor matching logic (User has verificationStatus, profile.specialty)
    const doctors = await User.find({
        role: 'doctor',
        verificationStatus: 'verified',
        $or: [
            { 'profile.specialty': { $in: specialtyList } },
            { 'profile.specialty': { $regex: specialtyList.join('|'), $options: 'i' } }
        ],
        ...(location && { 'profile.city': location })
    })
        .select('profile.name profile.specialty avatar rating')
        .sort({ rating: -1 })
        .limit(5)
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
