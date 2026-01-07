import { AsyncHandler } from '../../utils/AsyncHandler.js';
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import User from "../../models/users.model.js";


const getDoctorStatus = AsyncHandler(async (req, res) => {
    const stats = await User.aggregate([
        { $match: { role: "doctor" } },
        { $group: { _id: "$verificationStatus", count: { $sum: 1 } } },
        {
            $group: {
                _id: null,
                statuses: { $push: { status: "$_id", count: "$count" } },
                totalDoctors: { $sum: "$count" }
            }
        },
    ]);

    // Recent pending doctors for admin dashboard
    const pendingDoctors = await User.find({
        role: "doctor",
        verificationStatus: "pending",
    })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("profile.name email verificationStatus createdAt")
        .lean();

    return res.status(200).json(
        new ApiResponse(200, {
            ...(stats[0] || { statuses: [], totalDoctors: 0 }),
            pendingDoctors,
            pendingCount: pendingDoctors.length,
        }, "Doctor verification stats loaded")
    );
});
const updateDoctorVerification = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const doctor = await User.findById(id);
    if (!doctor || doctor.role !== "doctor") {
        throw new ApiError(404, "Doctor not found");
    }

    const previousStatus = doctor.verificationStatus;
    doctor.verificationStatus = status;

    if (notes) {
        doctor.profile.notes = notes; // Store verification notes
    }

    await doctor.save();

    // TODO: Email notification to doctor
    // sendEmail(doctor.email, `Verification ${status === 'verified' ? 'Approved' : 'Rejected'}`);

    return res.status(200).json(
        new ApiResponse(200, doctor, "Doctor verification updated")
    );
});


export { getDoctorStatus, updateDoctorVerification };