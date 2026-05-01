const express = require('express');
const authMiddleware = require('../middleware/auth');
const doctorController = require('../controllers/doctorController');

const router = express.Router();

// Public routes
router.post('/register', doctorController.registerDoctor);
router.post('/login', doctorController.loginDoctor);
router.get('/', doctorController.getAllDoctors);

// Protected routes
router.get('/profile', authMiddleware, doctorController.getDoctorProfile);
router.put('/profile', authMiddleware, doctorController.updateDoctorProfile);

// Profile picture routes (optional - will work only if multer is installed)
let upload;
try {
  upload = require('../middleware/upload');
  router.post('/upload-profile-pic', authMiddleware, upload.single('profilePicture'), doctorController.uploadProfilePicture);
  router.delete('/remove-profile-pic', authMiddleware, doctorController.removeProfilePicture);
  console.log('Profile picture routes enabled');
} catch (err) {
  console.log('Profile picture upload disabled - multer not configured');
}

module.exports = router;