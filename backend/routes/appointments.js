import express from 'express';
import Appointment from '../models/Appointment.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Schedule an appointment
router.post('/', async (req, res) => {
  try {
    const { patientId, doctorId, datetime } = req.body;
    if (!patientId || !doctorId || !datetime) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    // Generate a unique room name
    const roomName = 'telemed-' + new Date().getTime() + '-' + Math.random().toString(36).substring(2, 10);
    const appointment = new Appointment({ patientId, doctorId, datetime, roomName });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get appointment details by ID (protected)
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email role')
      .populate('doctorId', 'name email role');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    // Only allow patient or doctor to access
    const userId = req.user.userId;
    if (
      appointment.patientId._id.toString() !== userId &&
      appointment.doctorId._id.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router; 