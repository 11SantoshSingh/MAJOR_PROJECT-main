const express = require('express');
const authMiddleware = require('../middleware/auth');
const priceController = require('../controllers/priceController');

const router = express.Router();

router.get('/hospital/:hospitalId', priceController.getHospitalPrices);
router.get('/hospital/:hospitalId/specialty/:specialty', priceController.getPriceBySpecialty);
router.post('/', authMiddleware, priceController.setPrice);
router.put('/:id', authMiddleware, priceController.updatePrice);
router.get('/my-prices', authMiddleware, priceController.getMyPrices);

module.exports = router;