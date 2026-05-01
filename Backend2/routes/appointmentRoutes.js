const express = require('express');
const authMiddleware = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

// Make sure all controller functions exist
router.post('/', authMiddleware, appointmentController.createAppointment);
router.get('/hospital', authMiddleware, appointmentController.getHospitalAppointments);
router.get('/my-appointments', authMiddleware, appointmentController.getPatientAppointments);
router.get('/availability', appointmentController.getAppointmentsByHospitalAndDate);
router.get('/:id', authMiddleware, appointmentController.getAppointment);
router.put('/:id/reschedule', authMiddleware, appointmentController.rescheduleAppointment);
router.delete('/:id/cancel', authMiddleware, appointmentController.cancelAppointment);
router.put('/:id/complete', authMiddleware, appointmentController.completeAppointment);

module.exports = router;