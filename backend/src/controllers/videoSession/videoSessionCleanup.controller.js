import { ApiResponse } from "../../utils/apiResponse.js";
import { AsyncHandler } from "../../utils/asyncHandler.js";
// import { ApiError } from "../../utils/ApiError";
import { cleanupStaleSessions } from "../../services/appointmentsCleanup.service.js";

const appointmentCleanup = AsyncHandler(async (req, res) => {
    const triggeredBy = req.user ? "manual" : "cron";
    const results = await cleanupStaleSessions(triggeredBy);

    return res.status(200).json(
        new ApiResponse(200, results, "Appointment cleanup completed")
    );
});

export { appointmentCleanup };