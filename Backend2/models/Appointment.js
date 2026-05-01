const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required']
  },
  date: {
    type: String,
    required: [true, 'Please provide appointment date']
  },
  time: {
    type: String,
    required: [true, 'Please provide appointment time']
  },
  doctorSpecialty: {
    type: String,
    required: [true, 'Please provide doctor specialty']
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'rescheduled', 'completed'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);