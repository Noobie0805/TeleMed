import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'ongoing', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled'
    },
    slot: {
        date: { type: Date, required: true },
        time: String, // "10:00-10:30"
        duration: { type: Number, default: 30 } // minutes
    },
    type: {
        type: String,
        enum: ['video', 'audio', 'chat'],
        default: 'video'
    },
    videoSession: {
        roomName: { type: String },
        passCode: { type: String },
        sessionId: { type: String },
        doctorToken: { type: String },
        patientToken: { type: String },
        startWindow: { type: Date },
        endWindow: { type: Date },
        startedAt: { type: Date },
        endedAt: { type: Date }
    },
    notes: String,
    fees: Number,
    noShowType: String // "doctor-late" | "patient-absent"
}, { timestamps: true });

appointmentSchema.index({ patientId: 1, status: 1 });
appointmentSchema.index({ doctorId: 1, 'slot.date': 1 });

export default mongoose.model('Appointment', appointmentSchema);
