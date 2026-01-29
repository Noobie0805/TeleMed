import { AsyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { getISTTodayUTCBounds } from "../../utils/timezone.js";
import Appointment from "../../models/appointments.model.js";
import Vital from "../../models/vitals.model.js";
import mongoose from "mongoose";


// get doctor schedule__________________________________________________________
const getDoctorSchedule = AsyncHandler(async (req, res) => {
    const { start: startUTC, end: endUTC } = getISTTodayUTCBounds();

    const appointments = await Appointment.find({
        doctorId: req.user._id,
        "slot.date": {
            $gte: startUTC,
            $lt: endUTC,
        },
        status: { $in: ["scheduled", "confirmed", "ongoing"] },
    })
        .populate("patientId", "profile.name profile.phone")
        .sort({ "slot.date": 1, "slot.startTime": 1 })
        .lean();

    const schedule = appointments.map((apt) => ({
        id: apt._id,
        patient: apt.patientId.profile.name,
        time: `${apt.slot.startTime} - ${apt.slot.endTime}`,
        status: apt.status,
        type: apt.type,
        fees: apt.fees,
    }));

    return res.status(200).json(
        new ApiResponse(200, schedule, "Today's schedule loaded")
    );
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
    const { reason } = req.body;

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
    const { start: startUTC, end: endUTC } = getISTTodayUTCBounds();

    const waiting = await Appointment.find({
        doctorId: req.user._id,
        status: "confirmed",
        "slot.date": {
            $gte: startUTC,
            $lt: endUTC,
        },
    })
        .populate("patientId", "profile.name profile.phone profile.avatar")
        .sort({ "slot.date": 1, "slot.startTime": 1 })
        .limit(10)
        .lean();

    return res.status(200).json(
        new ApiResponse(200, waiting, "Waiting patients loaded")
    );
});

// getting patient's history_____________________________________________________
const getPatientHistory = AsyncHandler(async (req, res) => {
    const { patientId } = req.params;

    // Past appointments with this patient
    const appointments = await Appointment.find({
        doctorId: req.user._id,
        patientId,
        status: "completed",
    })
        .populate("patientId", "profile.name profile.phone")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    // Recent vitals trends (last 30 days)
    const vitalsTrends = await Vital.aggregate([
        {
            $match: {
                patientId: new mongoose.Types.ObjectId(patientId),
                timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
        },
        {
            $group: {
                _id: "$type",
                recentReadings: { $push: { value: "$value", timestamp: "$timestamp" } },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
        { $limit: 5 },
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            appointments,
            vitalsTrends,
        }, "Patient history loaded")
    );
});

const getDoctorPerformance = AsyncHandler(async (req, res) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const metrics = await Appointment.aggregate([
        { $match: { doctorId: req.user._id, createdAt: { $gte: thirtyDaysAgo } } },
        {
            $group: {
                _id: null,
                totalAppointments: { $sum: 1 },
                completed: {
                    $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                },
                noShows: {
                    $sum: { $cond: [{ $eq: ["$status", "no-show"] }, 1, 0] },
                },
                avgRating: { $avg: "$patientRating" },
                totalRevenue: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "completed"] }, "$fees", 0]
                    }
                },
                avgFees: { $avg: "$fees" },
            },
        },
        {
            $project: {
                completionRate: {
                    $round: [
                        { $multiply: [{ $divide: ["$completed", "$totalAppointments"] }, 100] },
                        1,
                    ],
                },
                avgRating: { $round: ["$avgRating", 1] },
                totalRevenue: 1,
                totalAppointments: 1,
                noShows: 1,
            },
        },
    ]);

    return res.status(200).json(
        new ApiResponse(200, metrics[0] || {}, "Performance metrics loaded")
    );
});

export {
    getDoctorSchedule,
    confirmBooking,
    cancelBooking,
    getWaitingPatients,
    getPatientHistory,
    getDoctorPerformance
};
