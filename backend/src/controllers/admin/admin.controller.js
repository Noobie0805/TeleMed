import { AsyncHandler } from "../../utils/AsyncHandler.js";
import User from "../../models/users.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";


const verifyDoctor = AsyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const { status, notes } = req.body; // 'verified' | 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
        throw new ApiError(400, "Invalid status. Use 'verified' or 'rejected'.");
    }

    const doctor = await User.findOne({
        _id: doctorId,
        role: 'doctor',
        verificationStatus: 'pending'
    }).select('-password -refreshToken -refreshTokenExpiry');

    if (!doctor) {
        throw new ApiError(404, 'Doctor not found or already verified');
    }

    doctor.verificationStatus = status;

    // Note: profile.notes is not defined in users.model.js; add it to the schema if you want to persist notes.
    // if (notes) doctor.profile.notes = notes;

    doctor.isActive = status === 'verified';

    await doctor.save();

    return res.status(200).json(new ApiResponse(200, doctor, `Doctor ${status}`));
});

const getPendingDoctors = AsyncHandler(async (req, res) => {
    const pendingDoctors = await User.find({
        role: 'doctor',
        verificationStatus: 'pending'
    }).select('-password -refreshToken -refreshTokenExpiry');

    return res.status(200).json(new ApiResponse(200, pendingDoctors));
});

export { verifyDoctor, getPendingDoctors };