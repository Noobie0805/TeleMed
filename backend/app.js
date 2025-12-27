import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/v1/auth.routes.js';
import appointmentRoutes from './src/routes/v1/appointments.routes.js';
import adminRoutes from './src/routes/v1/admin.routes.js';
import vitalRoutes from './src/routes/v1/vitals.routes.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/vitals', vitalRoutes);

// ADD ERROR HANDLER
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

export { app };
