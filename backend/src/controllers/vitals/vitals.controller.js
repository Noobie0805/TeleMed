import { AsyncHandler } from '../../utils/AsyncHandler.js';
import Vital from '../../models/vitals.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
// import { verifyJWT } from '../../middlewares/auth.middleware.js';

// Health scoring thresholds
const HEALTH_THRESHOLDS = {
    STEPS_GOOD: 7000,
    HEART_RATE_GOOD: 80,
    MIN_READINGS_FOR_BONUS: 10,
    DAYS_QUERY_MIN: 1,
    DAYS_QUERY_MAX: 90
};

const logVital = AsyncHandler(async (req, res) => {
    const { type, value, unit, notes, source } = req.body;

    if (!type || value === undefined) {
        throw new ApiError(400, 'Type and value are required');
    }

    const vital = await Vital.create({
        patientId: req.user._id,
        type,
        value,
        unit,
        notes,
        source
    });

    return res.status(201).json(
        new ApiResponse(201, vital, 'Vital logged successfully')
    );
});

const getVitalsChartData = AsyncHandler(async (req, res) => {
    const { type, days = 7 } = req.query;

    if (!type) {
        throw new ApiError(400, 'Type parameter is required');
    }

    // Validate and sanitize days parameter
    const daysNum = parseInt(days, 10);
    if (isNaN(daysNum) || daysNum < HEALTH_THRESHOLDS.DAYS_QUERY_MIN || daysNum > HEALTH_THRESHOLDS.DAYS_QUERY_MAX) {
        throw new ApiError(400, `Days must be a number between ${HEALTH_THRESHOLDS.DAYS_QUERY_MIN} and ${HEALTH_THRESHOLDS.DAYS_QUERY_MAX}`);
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - daysNum * 24 * 60 * 60 * 1000);

    const vitals = await Vital.find({
        patientId: req.user._id,
        type,
        timestamp: { $gte: startDate, $lte: endDate }
    })
        .sort({ timestamp: 1 })
        .select('value timestamp unit');

    // Get unit from first vital record if available
    const unit = vitals.length > 0 ? vitals[0].unit : '';

    // Chart.js format
    const chartData = {
        labels: vitals.map(v => {
            const date = new Date(v.timestamp);
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }),
        datasets: [{
            label: `${type.replace('-', ' ')} (${unit || ''})`,
            data: vitals.map(v => {
                if (typeof v.value === 'object' && v.value !== null && v.value.systolic) {
                    return v.value.systolic; // Example for blood pressure
                }
                return v.value;
            }),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }]
    };

    return res.status(200).json(
        new ApiResponse(200, chartData, 'Chart data retrieved successfully')
    );
});

const getWeeklyHealthScore = AsyncHandler(async (req, res) => {
    const weekStart = new Date();
    // Get Monday of current week (getDay() returns 0-6, where 0=Sunday)
    const dayOffset = weekStart.getDay() === 0 ? -6 : 1 - weekStart.getDay();
    weekStart.setDate(weekStart.getDate() + dayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const vitals = await Vital.find({
        patientId: req.user._id,
        timestamp: { $gte: weekStart, $lte: weekEnd }
    });

    // Simple scoring (enhance later)
    const stepData = vitals.filter(v => v.type === 'steps');
    const hrData = vitals.filter(v => v.type === 'heart-rate');

    const avgSteps = stepData.reduce((sum, v) => sum + (v.value || 0), 0) / Math.max(1, stepData.length);
    const avgHR = hrData.reduce((sum, v) => sum + (v.value || 0), 0) / Math.max(1, hrData.length);

    // Calculate score based on health thresholds
    const score = Math.min(100, Math.max(0,
        (avgSteps > HEALTH_THRESHOLDS.STEPS_GOOD ? 40 : 20) +
        (avgHR < HEALTH_THRESHOLDS.HEART_RATE_GOOD ? 40 : 20) +
        (vitals.length >= HEALTH_THRESHOLDS.MIN_READINGS_FOR_BONUS ? 20 : 0)
    ));

    // Generate data-driven insights
    const insights = [];
    if (score > 80) {
        insights.push('Excellent week! Keep up the great work.');
    } else if (score > 60) {
        insights.push('Good progress! Continue maintaining your routine.');
    } else {
        insights.push('Increase daily activity to improve your health score.');
    }

    if (avgSteps < HEALTH_THRESHOLDS.STEPS_GOOD) {
        insights.push(`Aim for ${HEALTH_THRESHOLDS.STEPS_GOOD.toLocaleString()} steps daily. Current average: ${Math.round(avgSteps).toLocaleString()}.`);
    }

    if (avgHR >= HEALTH_THRESHOLDS.HEART_RATE_GOOD) {
        insights.push('Consider stress-reducing activities like meditation or light exercise.');
    }

    if (vitals.length < HEALTH_THRESHOLDS.MIN_READINGS_FOR_BONUS) {
        insights.push(`Log more health metrics to get better insights. Current: ${vitals.length} readings.`);
    }

    return res.status(200).json(
        new ApiResponse(200, {
            score: Math.round(score),
            avgSteps: Math.round(avgSteps),
            avgHR: Math.round(avgHR),
            totalReadings: vitals.length,
            insights
        }, 'Weekly health score calculated successfully')
    );
});

export {
    logVital,
    getVitalsChartData,
    getWeeklyHealthScore
};
