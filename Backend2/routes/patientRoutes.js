const express = require('express');
const authMiddleware = require('../middleware/auth');
const patientController = require('../controllers/patientController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post('/register', patientController.registerPatient);
router.post('/login', patientController.loginPatient);
router.post('/predict-result', authMiddleware, patientController.savePrediction);
router.post('/upload-predict', authMiddleware, upload.single('file'), patientController.uploadAndPredict);
router.get('/profile', authMiddleware, patientController.getPatientProfile);
router.put('/profile', authMiddleware, patientController.updatePatientProfile);
router.post('/change-password', authMiddleware, patientController.changePassword);
router.post('/logout', authMiddleware, patientController.logoutPatient);

module.exports = router;