import mongoose from 'mongoose';

const symptomSessionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    symptoms: [{
        name: { type: String, required: true },
        severity: { type: Number, min: 1, max: 10, required: true },
        duration: String
    }],
    urgency: { type: String, enum: ['mild', 'moderate', 'severe'] },
    suggestedSpecialities: [String],
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    aiSessionId: String,
    emergencyOverride: { type: Boolean, default: false }

}, {
    timestamps: true
});

export default mongoose.model('SymptomSession', symptomSessionSchema);