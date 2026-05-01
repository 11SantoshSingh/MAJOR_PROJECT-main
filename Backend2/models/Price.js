const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Hospital ID is required']
  },
  specialty: {
    type: String,
    required: [true, 'Specialty is required'],
    enum: ['Pulmonologist', 'General Physician', 'Chest Specialist', 'Internal Medicine', 'Cardiologist', 'Neurologist']
  },
  charges: {
    type: Number,
    required: [true, 'Charges are required'],
    min: 0
  }
}, { timestamps: true });

priceSchema.index({ hospitalId: 1, specialty: 1 }, { unique: true });

module.exports = mongoose.model('Price', priceSchema);