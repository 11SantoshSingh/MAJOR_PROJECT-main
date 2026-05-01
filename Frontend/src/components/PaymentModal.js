import React, { useState } from 'react';
import axios from 'axios';

function PaymentModal({ appointment, amount, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      // Create Razorpay order
      const orderResponse = await axios.post(
        'http://localhost:5001/api/payments/create-order',
        {
          appointmentId: appointment._id,
          amount: amount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, keyId } = orderResponse.data;

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway');
        setLoading(false);
        return;
      }

      const options = {
        key: keyId,
        amount: amount * 100,
        currency: 'INR',
        name: 'MediCare Hospital',
        description: `Appointment Payment - ${appointment.doctorSpecialty}`,
        order_id: orderId,
        handler: async (response) => {
          // Verify payment
          try {
            const verifyResponse = await axios.post(
              'http://localhost:5001/api/payments/verify-payment',
              {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                appointmentId: appointment._id
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyResponse.data.success) {
              onSuccess('Payment successful! Appointment confirmed.');
            }
          } catch (err) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: appointment.patientId?.name || '',
          email: appointment.patientId?.email || ''
        },
        theme: {
          color: '#3b82f6'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5001/api/payments/cash-payment',
        {
          appointmentId: appointment._id,
          amount: amount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onSuccess('Appointment booked! Please pay cash at the hospital.');
      }
    } catch (err) {
      console.error('Cash payment error:', err);
      setError(err.response?.data?.error || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else {
      handleCashPayment();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">💰 Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Appointment Details</p>
          <p className="font-semibold text-gray-800">
            {appointment.hospitalId?.hospitalName || 'Hospital'}
          </p>
          <p className="text-sm text-gray-600">
            {appointment.date} at {appointment.time}
          </p>
          <p className="text-lg font-bold text-green-600 mt-2">
            Amount: ₹{amount}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Payment Method
          </label>
          <div className="space-y-3">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={paymentMethod === 'razorpay'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <div>
                <span className="font-semibold">💳 Online Payment (Razorpay)</span>
                <p className="text-xs text-gray-500">Pay securely using UPI, Card, NetBanking</p>
              </div>
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <div>
                <span className="font-semibold">💵 Pay at Hospital (Cash)</span>
                <p className="text-xs text-gray-500">Pay cash at the hospital counter</p>
              </div>
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay ₹${amount}`}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your payment information is secure and encrypted
        </p>
      </div>
    </div>
  );
}

export default PaymentModal;