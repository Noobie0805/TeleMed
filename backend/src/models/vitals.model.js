import mongoose from 'mongoose';

const vitalsSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: [
            'blood-pressure',
            'heart-rate',
            'blood-glucose',
            'steps',
            'weight',
            'temperature',
            'blood-oxygen'
        ],
        required: true
    },
    value: mongoose.Schema.Types.Mixed, // "120/80", 72, 110, 7500, 72.5, 98.6, 97
    unit: String, // "mmHg", "bpm", "mg/dL", "steps", "kg", "F", "%"
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    source: {
        type: String,
        enum: ['manual', 'device', 'wearable', 'app'],
        default: 'manual'
    },
    notes: String // "morning reading", "post-meal", "after exercise"
}, { timestamps: true });

// Indexes for dashboard charts
vitalsSchema.index({ patientId: 1, type: 1, timestamp: -1 }); // Recent first
vitalsSchema.index({ patientId: 1, timestamp: 1 }); // Time range queries

export default mongoose.model('Vital', vitalsSchema);
