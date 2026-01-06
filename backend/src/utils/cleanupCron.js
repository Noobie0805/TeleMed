import cron from "node-cron";
import { cleanupStaleSessions } from "../services/appointmentsCleanup.service.js";

cron.schedule("*/30 * * * *", async () => {
    console.log("Running appointment cleanup cron job...");
    try {
        const results = await cleanupStaleSessions("cron");
        console.log("Cleanup completed:", results);
    } catch (error) {
        console.error("Cleanup cron job failed:", error);
    }
});

console.log("Appointment cleanup cron scheduled (every 30 minutes)");
export default cron;
