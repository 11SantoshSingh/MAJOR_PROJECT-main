const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const mongoose = require('mongoose');

exports.createReview = async (req, res) => {
  try {
    const { hospitalId, appointmentId, rating, comment } = req.body;

    if (!hospitalId || !appointmentId || !rating || !comment) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: req.user.userId,
      hospitalId: hospitalId
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({ error: 'You can only review completed appointments' });
    }

    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(409).json({ error: 'You have already reviewed this appointment' });
    }

    const review = new Review({
      patientId: req.user.userId,
      hospitalId,
      appointmentId,
      rating,
      comment
    });

    await review.save();

    await updateHospitalAverageRating(hospitalId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHospitalReviews = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ hospitalId })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ hospitalId });

    res.status(200).json({
      success: true,
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ patientId: req.user.userId })
      .populate('hospitalId', 'hospitalName location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.patientId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    await updateHospitalAverageRating(review.hospitalId);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.patientId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const hospitalId = review.hospitalId;
    await review.deleteOne();

    await updateHospitalAverageRating(hospitalId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHospitalAverageRating = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    const result = await Review.aggregate([
      { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId) } },
      { $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }}
    ]);

    const average = result.length > 0 ? result[0].averageRating : 0;
    const total = result.length > 0 ? result[0].totalReviews : 0;

    await Doctor.findByIdAndUpdate(hospitalId, {
      averageRating: average,
      totalReviews: total
    });

    res.status(200).json({
      success: true,
      averageRating: average,
      totalReviews: total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkAppointmentReview = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const review = await Review.findOne({ 
      appointmentId: appointmentId,
      patientId: req.user.userId 
    });
    
    res.status(200).json({
      success: true,
      exists: !!review
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function updateHospitalAverageRating(hospitalId) {
  const result = await Review.aggregate([
    { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId) } },
    { $group: {
      _id: null,
      averageRating: { $avg: '$rating' },
      totalReviews: { $sum: 1 }
    }}
  ]);

  const average = result.length > 0 ? result[0].averageRating : 0;
  const total = result.length > 0 ? result[0].totalReviews : 0;

  await Doctor.findByIdAndUpdate(hospitalId, {
    averageRating: average,
    totalReviews: total
  });
}