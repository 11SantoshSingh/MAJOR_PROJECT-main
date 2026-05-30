const Patient = require('../models/Patient');
const Prediction = require('../models/Prediction');
const { generateToken } = require('../config/jwt');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

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

    // Set token as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      token,
      message: 'Patient registered successfully',
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

    // Set token as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      token,
      message: 'Login successful',
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
  // Clear auth cookie
  try {
    res.clearCookie('token');
  } catch (e) {
    // ignore
  }
  res.status(200).json({ success: true, message: 'Logout successful' });
};

exports.savePrediction = async (req, res) => {
  try {
    const { result } = req.body;
    if (!result) return res.status(400).json({ error: 'No result provided' });
    const prediction = new Prediction({ patient: req.user.userId, result });
    await prediction.save();
    res.status(201).json({ success: true, prediction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadAndPredict = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File upload required' });

    const mlBase = process.env.ML_API_URL || process.env.REACT_APP_ML_API_URL;
    if (!mlBase) return res.status(500).json({ error: 'ML API URL not configured' });

    const apiKey = process.env.ML_API_KEY || process.env.API_KEY;

    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), { filename: req.file.originalname });

    const headers = form.getHeaders();
    if (apiKey) headers['x-api-key'] = apiKey;

    const mlResp = await axios.post(`${mlBase}/predict`, form, { headers, maxContentLength: Infinity, maxBodyLength: Infinity });
    const result = mlResp.data;

    // persist prediction if authenticated
    try {
      if (req.user && req.user.userId) {
        const prediction = new Prediction({ patient: req.user.userId, result });
        await prediction.save();
      }
    } catch (e) {
      // ignore persistence errors
    }

    // Optionally remove uploaded file to save disk space
    try { fs.unlinkSync(req.file.path); } catch (e) {}

    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};