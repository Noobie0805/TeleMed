import { AsyncHandler } from "../../utils/AsyncHandler.js";
import User from "../../models/users.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Appointment from "../../models/appointments.model.js";
import mongoose from "mongoose";

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

const getPlatformOverview = AsyncHandler(async (req, res) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [overview, revenue] = await Promise.all([
        // Users + appointments stats
        Promise.all([
            User.countDocuments({ role: 'patient' }),
            User.countDocuments({ role: 'doctor', isVerified: true }),
            User.countDocuments({ role: 'doctor', isVerified: false }),
            Appointment.countDocuments({ status: 'completed', createdAt: { $gte: thirtyDaysAgo } }),
        ]),
        // Monthly revenue (platform commission 20%)
        Appointment.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$fees' },
                    platformCommission: { $sum: { $multiply: ['$fees', 0.2] } }
                }
            }
        ])
    ]);

    const [totalPatients, verifiedDoctors, pendingDoctors, monthlyConsults] = overview;
    const metrics = {
        totalPatients,
        verifiedDoctors,
        pendingDoctors,
        monthlyConsults: monthlyConsults || 0,
        ...(revenue[0] || { totalRevenue: 0, platformCommission: 0 })
    };

    return res.status(200).json(
        new ApiResponse(200, metrics, "Platform overview loaded")
    );
});

const getRevenueReport = AsyncHandler(async (req, res) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const revenue = await Appointment.aggregate([
        {
            $match: {
                status: 'completed',
                createdAt: { $gte: thirtyDaysAgo }
            }
        },
        {
            $group: {
                _id: {
                    day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                },
                dailyRevenue: { $sum: '$fees' },
                consultations: { $sum: 1 },
                topDoctor: { $first: '$doctorId' }
            }
        },
        { $sort: { '_id.day': -1 } },
        { $limit: 30 }
    ]);

    return res.status(200).json(
        new ApiResponse(200, revenue, "Revenue report loaded")
    );
});

const getAuditLogs = AsyncHandler(async (req, res) => {
    // Assuming AuditLog model or from appointment/user changes
    const logs = await Appointment.find({
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        $or: [{ status: 'cancelled' }, { status: 'no-show' }]
    })
        .populate('doctorId patientId', 'profile.name')
        .select('status notes updatedAt doctorId patientId')
        .sort({ updatedAt: -1 })
        .limit(50)
        .lean();

    return res.status(200).json(
        new ApiResponse(200, logs, "Audit logs loaded")
    );
});

export { verifyDoctor, getPendingDoctors, getPlatformOverview, getRevenueReport, getAuditLogs };