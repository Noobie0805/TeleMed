import { AsyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Appointment from "../../models/appointments.model.js";
import crypto from "crypto";

//doctor krega start..
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
        throw new ApiError(400, `Cannot start appointment in '${appointment.status}' state`);
    }

    // 10‑minute window
    const WINDOW_MS = 10 * 60 * 1000;
    const now = Date.now();
    const slotTime = new Date(appointment.slot.date).getTime();

    // console.log({
    //     now: new Date(now).toISOString(),
    //     slotDate: appointment.slot.date,
    //     slotMs: slotTime,
    //     diffMinutes: (now - slotTime) / 60000,
    // });


    if (now < slotTime - WINDOW_MS || now > slotTime + WINDOW_MS) {
        throw new ApiError(400, "Current time is outside allowed start window");
    }

    appointment.videoSession = appointment.videoSession || {};

    if (appointment.videoSession.startedAt) {
        throw new ApiError(400, "Video session already started");
    }

    appointment.videoSession.startWindow = new Date(now - WINDOW_MS);
    appointment.videoSession.endWindow = new Date(now + WINDOW_MS);
    appointment.videoSession.roomName = `room-${appointment._id}-${crypto.randomBytes(4).toString("hex")}`;
    appointment.videoSession.passCode = crypto.randomBytes(6).toString("base64url");
    appointment.videoSession.startedAt = new Date();

    appointment.status = "ongoing";
    await appointment.save();

    return res.status(200).json(
        new ApiResponse(200, {
            roomName: appointment.videoSession.roomName,
            passCode: appointment.videoSession.passCode,
        }, "Video session started")
    );
});

// Patient join krega session
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
        throw new ApiError(400, `Cannot join appointment in '${appointment.status}' state`);
    }

    if (!appointment.videoSession || !appointment.videoSession.startWindow || !appointment.videoSession.endWindow) {
        throw new ApiError(400, "Video session not properly initialized");
    }

    const now = Date.now();
    const startWindow = appointment.videoSession.startWindow.getTime();
    const endWindow = appointment.videoSession.endWindow.getTime();

    if (now < startWindow || now > endWindow) {
        appointment.noShowType = "patient-absent";
        appointment.status = "no-show";
        await appointment.save();
        throw new ApiError(400, "Joining window has expired or is not yet open");
    }

    return res.status(200).json(
        new ApiResponse(200, {
            roomName: appointment.videoSession.roomName,
            passCode: appointment.videoSession.passCode,
        }, "Joined video session")
    );
});

// Doctor hi session end krega
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
        throw new ApiError(400, `Cannot end appointment in '${appointment.status}' state`);
    }

    appointment.videoSession = appointment.videoSession || {};
    appointment.videoSession.endedAt = new Date();
    appointment.status = "completed";
    await appointment.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Video session ended")
    );
});

export { startSession, joinSession, endSession };
