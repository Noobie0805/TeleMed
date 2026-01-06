import mongoose from 'mongoose';

const appointmentCleanupLogSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
        index: true
    },
    previousStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    noShowType: { type: String, default: null },
    autoFixed: { type: Boolean, default: false },
    triggeredBy: { type: String, enum: ['cron', 'manual'], default: 'cron' },
    createdAt: { type: Date, default: Date.now, index: true }
},
    {
        timestamps: true
    });

export default mongoose.model('AppointmentCleanupLog', appointmentCleanupLogSchema);