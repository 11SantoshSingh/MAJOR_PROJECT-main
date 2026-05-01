const Patient = require('../models/Patient');
const { generateToken } = require('../config/jwt');

exports.registerPatient = async (req, res) => {
  try {
    const { name, email, password, age, phone, location, pincode } = req.body;

    if (!name || !email || !password || !age || !phone || !location || !pincode) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const patient = new Patient({ name, email, password, age, phone, location, pincode });
    await patient.save();

    const token = generateToken(patient._id, 'patient');

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        phone: patient.phone,
        location: patient.location,
        pincode: patient.pincode
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const patient = await Patient.findOne({ email }).select('+password');

    if (!patient) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await patient.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(patient._id, 'patient');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        phone: patient.phone,
        location: patient.location,
        pincode: patient.pincode
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.userId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.status(200).json({
      success: true,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        phone: patient.phone,
        location: patient.location,
        pincode: patient.pincode
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePatientProfile = async (req, res) => {
  try {
    const { name, age, phone, location, pincode } = req.body;
    const patient = await Patient.findByIdAndUpdate(
      req.user.userId,
      { name, age, phone, location, pincode, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        phone: patient.phone,
        location: patient.location,
        pincode: patient.pincode
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new password are required' });
    }
    
    const patient = await Patient.findById(req.user.userId).select('+password');
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const isPasswordValid = await patient.matchPassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Old password is incorrect' });
    }
    
    patient.password = newPassword;
    await patient.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logoutPatient = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};