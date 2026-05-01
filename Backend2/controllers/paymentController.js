const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const { createOrder, verifyPayment } = require('../config/razorpay');

// Create Razorpay order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;
    const patientId = req.user.userId;

    if (!appointmentId || !amount) {
      return res.status(400).json({ error: 'Appointment ID and amount are required' });
    }

    // Verify appointment exists and belongs to patient
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: patientId
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Create Razorpay order
    const order = await createOrder(amount);

    // Save payment record
    const payment = new Payment({
      appointmentId: appointmentId,
      patientId: patientId,
      hospitalId: appointment.hospitalId,
      amount: amount,
      paymentMethod: 'razorpay',
      paymentStatus: 'pending',
      razorpayOrderId: order.id
    });

    await payment.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Verify Razorpay payment
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, appointmentId } = req.body;
    const patientId = req.user.userId;

    // Verify signature
    const isValid = verifyPayment(orderId, paymentId, signature);

    if (!isValid) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: orderId, patientId: patientId },
      {
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        paymentStatus: 'completed',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Update appointment status to confirmed
    await Appointment.findByIdAndUpdate(appointmentId, {
      status: 'confirmed',
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get payment status for appointment
exports.getPaymentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const patientId = req.user.userId;

    const payment = await Payment.findOne({
      appointmentId: appointmentId,
      patientId: patientId
    });

    res.status(200).json({
      success: true,
      payment: payment || null
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Cash payment (mark as pending/cash)
exports.cashPayment = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;
    const patientId = req.user.userId;

    // Verify appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: patientId
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if payment already exists
    let payment = await Payment.findOne({
      appointmentId: appointmentId,
      patientId: patientId
    });

    if (payment) {
      return res.status(400).json({ error: 'Payment already exists for this appointment' });
    }

    // Create cash payment record
    payment = new Payment({
      appointmentId: appointmentId,
      patientId: patientId,
      hospitalId: appointment.hospitalId,
      amount: amount,
      paymentMethod: 'cash',
      paymentStatus: 'pending', // Cash payment pending at hospital
      createdAt: new Date()
    });

    await payment.save();

    // Update appointment status to confirmed
    await Appointment.findByIdAndUpdate(appointmentId, {
      status: 'confirmed',
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Appointment booked with cash payment. Please pay at the hospital.',
      payment
    });
  } catch (error) {
    console.error('Cash payment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark cash payment as completed (by hospital)
exports.markCashPaymentCompleted = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const hospitalId = req.user.userId;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify hospital owns this appointment
    if (payment.hospitalId.toString() !== hospitalId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    payment.paymentStatus = 'completed';
    payment.updatedAt = new Date();
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Cash payment marked as completed'
    });
  } catch (error) {
    console.error('Mark cash payment error:', error);
    res.status(500).json({ error: error.message });
  }
};