const express = require('express');
const authMiddleware = require('../middleware/auth');
const patientController = require('../controllers/patientController');

const router = express.Router();

router.post('/register', patientController.registerPatient);
router.post('/login', patientController.loginPatient);
router.get('/profile', authMiddleware, patientController.getPatientProfile);
router.put('/profile', authMiddleware, patientController.updatePatientProfile);
router.post('/change-password', authMiddleware, patientController.changePassword);
router.post('/logout', authMiddleware, patientController.logoutPatient);

module.exports = router;