import Appointment from "../models/appointments.model.js";
import AppointmentCleanupLog from "../models/appointmentsCleanupLogs.js";

const cleanupStaleSessions = async (triggeredBy = "cron") => {
    const TIMEOUT_MS = 45 * 60 * 1000;

    const staleSessions = await Appointment.find({
        status: "ongoing",
        "videoSession.startedAt": { $exists: true },
        "videoSession.startedAt": {
            $lt: new Date(Date.now() - TIMEOUT_MS),
        },
    });

    const results = { totalStale: staleSessions.length, updated: 0 };

    for (const appointment of staleSessions) {
        const previousStatus = appointment.status;

        appointment.noShowType = appointment.noShowType || "timeout";
        appointment.status = "no-show";

        await appointment.save();

        await AppointmentCleanupLog.create({
            appointmentId: appointment._id,
            previousStatus,
            newStatus: appointment.status,
            noShowType: appointment.noShowType,
            autoFixed: true,
            triggeredBy,
        });

        results.updated++;
    }

    return results;
};
export { cleanupStaleSessions };