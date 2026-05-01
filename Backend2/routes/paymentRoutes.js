const express = require('express');
const authMiddleware = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Patient routes
router.post('/create-order', authMiddleware, paymentController.createRazorpayOrder);
router.post('/verify-payment', authMiddleware, paymentController.verifyRazorpayPayment);
router.post('/cash-payment', authMiddleware, paymentController.cashPayment);
router.get('/status/:appointmentId', authMiddleware, paymentController.getPaymentStatus);

// Hospital routes
router.put('/cash-payment/:paymentId/complete', authMiddleware, paymentController.markCashPaymentCompleted);

module.exports = router;