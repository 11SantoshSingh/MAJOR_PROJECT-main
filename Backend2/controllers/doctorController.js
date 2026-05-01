const Doctor = require('../models/Doctor');
const { generateToken } = require('../config/jwt');
const fs = require('fs');
const path = require('path');

exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    const doctor = await Doctor.findOne({ email }).select('+password');
    if (!doctor) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isPasswordCorrect = await doctor.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    console.log('Doctor logged in, ID:', doctor._id.toString());

    const token = generateToken(doctor._id.toString(), 'doctor');

    res.status(200).json({
      success: true,
      token,
      doctor: {
        id: doctor._id,
        _id: doctor._id,
        email: doctor.email,
        phone: doctor.phone,
        hospitalName: doctor.hospitalName,
        location: doctor.location,
        city: doctor.city,
        pincode: doctor.pincode,
        licenseNumber: doctor.licenseNumber,
        profilePicture: doctor.profilePicture || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.registerDoctor = async (req, res) => {
  try {
    const { email, password, phone, hospitalName, location, city, pincode, licenseNumber } = req.body;

    if (!email || !password || !phone || !hospitalName || !location || !city || !pincode || !licenseNumber) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        error: 'Doctor with this email already exists'
      });
    }

    const doctor = await Doctor.create({
      email,
      password,
      phone,
      hospitalName,
      location,
      city,
      pincode,
      licenseNumber,
      profilePicture: ''
    });

    console.log('Doctor registered, ID:', doctor._id.toString());

    const token = generateToken(doctor._id.toString(), 'doctor');

    res.status(201).json({
      success: true,
      token,
      doctor: {
        id: doctor._id,
        _id: doctor._id,
        email: doctor.email,
        phone: doctor.phone,
        hospitalName: doctor.hospitalName,
        location: doctor.location,
        city: doctor.city,
        pincode: doctor.pincode,
        licenseNumber: doctor.licenseNumber,
        profilePicture: doctor.profilePicture || ''
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}, '-password');
    res.status(200).json({
      success: true,
      doctors,
      count: doctors.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.userId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.status(200).json({
      success: true,
      doctor: {
        id: doctor._id,
        email: doctor.email,
        phone: doctor.phone,
        hospitalName: doctor.hospitalName,
        location: doctor.location,
        city: doctor.city,
        pincode: doctor.pincode,
        licenseNumber: doctor.licenseNumber,
        profilePicture: doctor.profilePicture || ''
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    const { hospitalName, phone, location, city, pincode, licenseNumber } = req.body;
    
    // Get current doctor to preserve profile picture
    const currentDoctor = await Doctor.findById(req.user.userId);
    
    const doctor = await Doctor.findByIdAndUpdate(
      req.user.userId,
      { 
        hospitalName, 
        phone, 
        location, 
        city, 
        pincode, 
        licenseNumber, 
        updatedAt: new Date(),
        profilePicture: currentDoctor.profilePicture // Preserve existing profile picture
      },
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    res.status(200).json({
      success: true,
      doctor: {
        id: doctor._id,
        email: doctor.email,
        phone: doctor.phone,
        hospitalName: doctor.hospitalName,
        location: doctor.location,
        city: doctor.city,
        pincode: doctor.pincode,
        licenseNumber: doctor.licenseNumber,
        profilePicture: doctor.profilePicture || ''
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== NEW PROFILE PICTURE FUNCTIONS ==========

exports.uploadProfilePicture = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const hospitalId = req.user.userId;
    console.log('Hospital ID:', hospitalId);
    
    const profilePictureUrl = `/uploads/${req.file.filename}`;
    console.log('Profile picture URL:', profilePictureUrl);

    // If hospital already has a profile picture, delete the old one
    const doctor = await Doctor.findById(hospitalId);
    if (doctor && doctor.profilePicture) {
      const oldImagePath = path.join(__dirname, '..', doctor.profilePicture);
      console.log('Old image path:', oldImagePath);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log('Deleted old image');
      }
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      hospitalId,
      { profilePicture: profilePictureUrl },
      { new: true }
    );

    console.log('Doctor updated successfully');

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: profilePictureUrl,
      doctor: {
        id: updatedDoctor._id,
        email: updatedDoctor.email,
        phone: updatedDoctor.phone,
        hospitalName: updatedDoctor.hospitalName,
        location: updatedDoctor.location,
        city: updatedDoctor.city,
        pincode: updatedDoctor.pincode,
        licenseNumber: updatedDoctor.licenseNumber,
        profilePicture: updatedDoctor.profilePicture
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.removeProfilePicture = async (req, res) => {
  try {
    const hospitalId = req.user.userId;
    const doctor = await Doctor.findById(hospitalId);

    if (doctor && doctor.profilePicture) {
      const imagePath = path.join(__dirname, '..', doctor.profilePicture);
      console.log('Image path to remove:', imagePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Deleted image');
      }
    }

    await Doctor.findByIdAndUpdate(hospitalId, { profilePicture: '' });

    res.status(200).json({
      success: true,
      message: 'Profile picture removed successfully'
    });
  } catch (error) {
    console.error('Remove profile picture error:', error);
    res.status(500).json({ error: error.message });
  }
};