const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false 
  },
  age: {
    type: Number,
    required: [true, 'Please provide age']
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
    validate: [(val) => validator.isMobilePhone(val, 'any'), 'Please provide a valid phone number']
  },
  location: {
    type: String,
    required: [true, 'Please provide location']
  },
  pincode: {
    type: String,
    required: [true, 'Please provide pincode'],
    validate: [(val) => validator.isPostalCode(val, 'any'), 'Please provide a valid pincode']
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

patientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

patientSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Patient', patientSchema);