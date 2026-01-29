import { AsyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { getISTDateTimeUTC } from "../../utils/timezone.js";
import Appointment from "../../models/appointments.model.js";
import crypto from "crypto";

/**
 * DOCTOR STARTS SESSION
 */
const startSession = AsyncHandler(async (req, res) => {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    if (appointment.doctorId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to start this appointment");
    }

    if (appointment.type !== "video") {
        throw new ApiError(400, "Only video appointments can start a session");
    }

    if (appointment.status !== "confirmed") {
        throw new ApiError(
            400,
            `Cannot start appointment in '${appointment.status}' state`
        );
    }

    //  Time calculations - convert IST date + time to UTC
    const WINDOW_MS = 10 * 60 * 1000; // 10 min
    const now = Date.now();

    // appointment.slot.date is stored as IST midnight UTC
    // appointment.slot.startTime is in IST (HH:mm format)
    // Convert to UTC for proper time comparison
    const scheduledTime = getISTDateTimeUTC(appointment.slot.date, appointment.slot.startTime);
    const scheduledTimeMs = scheduledTime.getTime();

    // Doctor allowed ±10 minutes from scheduled start
    if (
        now < scheduledTimeMs - WINDOW_MS ||
        now > scheduledTimeMs + WINDOW_MS
    ) {
        throw new ApiError(
            400,
            "Current time is outside allowed start window (±10 min)"
        );
    }

    if (appointment.videoSession?.startedAt) {
        throw new ApiError(400, "Video session already started");
    }

    const durationMs = appointment.slot.duration * 60 * 1000;

    appointment.videoSession = {
        startWindow: new Date(scheduledTimeMs - WINDOW_MS),
        endWindow: new Date(scheduledTimeMs + durationMs + WINDOW_MS),
        roomName: `room-${appointment._id}-${crypto.randomBytes(4).toString("hex")}`,
        passCode: crypto.randomBytes(6).toString("base64url"),
        startedAt: new Date()
    };

    appointment.status = "ongoing";
    await appointment.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                roomName: appointment.videoSession.roomName,
                passCode: appointment.videoSession.passCode
            },
            "Video session started"
        )
    );
});

/**
 * PATIENT JOINS SESSION
 */
const joinSession = AsyncHandler(async (req, res) => {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.type !== "video") {
        throw new ApiError(404, "Video appointment not found");
    }

    if (appointment.patientId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to join this appointment");
    }

    if (appointment.status !== "ongoing") {
        throw new ApiError(
            400,
            `Cannot join appointment in '${appointment.status}' state`
        );
    }

    const { startWindow, endWindow } = appointment.videoSession || {};
    if (!startWindow || !endWindow) {
        throw new ApiError(400, "Video session not initialized");
    }

    const now = Date.now();

    //  Too early → NOT a no-show
    if (now < startWindow.getTime()) {
        throw new ApiError(400, "Session has not started yet");
    }

    //  Too late → patient no-show
    if (now > endWindow.getTime()) {
        appointment.status = "no-show";
        appointment.noShowType = "patient-absent";
        await appointment.save();

        throw new ApiError(400, "Joining window expired");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                roomName: appointment.videoSession.roomName,
                passCode: appointment.videoSession.passCode
            },
            "Joined video session"
        )
    );
});

/**
 * DOCTOR ENDS SESSION
 */
const endSession = AsyncHandler(async (req, res) => {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    if (appointment.doctorId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to end this appointment");
    }

    if (appointment.status !== "ongoing") {
        throw new ApiError(
            400,
            `Cannot end appointment in '${appointment.status}' state`
        );
    }

    appointment.videoSession.endedAt = new Date();
    appointment.status = "completed";
    await appointment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Video session ended"));
});

export { startSession, joinSession, endSession };
