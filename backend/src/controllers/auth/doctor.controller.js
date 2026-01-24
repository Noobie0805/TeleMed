import { AsyncHandler } from '../../utils/asyncHandler.js';
import User from '../../models/users.model.js';
import { ApiError } from '../../utils/apiError.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export const registerDoctor = AsyncHandler(async (req, res) => {
    const {
        name, email, password, phone,
        specialty, experience, qualifications, licenseNumber
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, 'Email already registered');
    }

    const normalizedQualifications =
        Array.isArray(qualifications) ? qualifications :
            (qualifications ? [qualifications] : []);

    const doctor = await User.create({
        email,
        password,
        role: 'doctor',
        profile: {
            name,
            phone,
            specialty,
            experience: Number.isFinite(Number(experience)) ? Number(experience) : 0,
            qualifications: normalizedQualifications,
            licenseNumber
        },
        verificationStatus: 'pending',
        isActive: false,
        verificationDocs: req.body.verificationDocs || []
    });

    console.log(`New doctor pending verification: ${doctor.email}`);

    return res.status(201).json(new ApiResponse(201, {
        id: doctor._id,
        email: doctor.email,
        status: 'pending verification'
    }, 'Doctor registered successfully - awaiting admin approval'));
});
