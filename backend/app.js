import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./src/routes/v1/auth.routes.js";
import appointmentRoutes from "./src/routes/v1/appointments.routes.js";
import adminRoutes from "./src/routes/v1/admin.routes.js";
import vitalRoutes from "./src/routes/v1/vitals.routes.js";
import videoSessionRoutes from "./src/routes/v1/videoSession.routes.js";
import AIServiceRoutes from "./src/routes/v1/aiService.routes.js";
import "./src/utils/cleanupCron.js";

const app = express();


app.use(express.json());
app.use(cookieParser());


const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [];

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/vitals", vitalRoutes);
app.use("/api/v1/video", videoSessionRoutes);
app.use("/api/v1/ai", AIServiceRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export { app };
