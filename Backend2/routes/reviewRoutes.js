const express = require('express');
const authMiddleware = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.post('/', authMiddleware, reviewController.createReview);
router.get('/my-reviews', authMiddleware, reviewController.getMyReviews);
router.put('/:id', authMiddleware, reviewController.updateReview);
router.delete('/:id', authMiddleware, reviewController.deleteReview);
router.get('/appointment/:appointmentId', authMiddleware, reviewController.checkAppointmentReview);
router.get('/hospital/:hospitalId', reviewController.getHospitalReviews);
router.get('/hospital/:hospitalId/average', reviewController.getHospitalAverageRating);

module.exports = router;