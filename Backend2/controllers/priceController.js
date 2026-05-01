const Price = require('../models/Price');

exports.setPrice = async (req, res) => {
  try {
    const { specialty, charges } = req.body;
    
    // Get hospitalId from req.user (which is now set correctly)
    const hospitalId = req.user.userId;
    
    console.log('Setting price - hospitalId from req.user:', hospitalId);
    console.log('Full req.user:', req.user);
    console.log('Setting price - specialty:', specialty);
    console.log('Setting price - charges:', charges);
    
    if (!hospitalId) {
      return res.status(401).json({ error: 'Hospital ID not found in token. Please login again.' });
    }
    
    if (!specialty || !charges) {
      return res.status(400).json({ error: 'Specialty and charges are required' });
    }

    // Check if price already exists
    let price = await Price.findOne({
      hospitalId: hospitalId,
      specialty: specialty
    });

    if (price) {
      price.charges = charges;
      await price.save();
      console.log('Updated existing price:', price);
    } else {
      price = new Price({
        hospitalId: hospitalId,
        specialty: specialty,
        charges: charges
      });
      await price.save();
      console.log('Created new price:', price);
    }

    res.status(200).json({
      success: true,
      message: 'Price set successfully',
      price
    });
  } catch (error) {
    console.error('Set price error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getHospitalPrices = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    console.log('Getting prices for hospital:', hospitalId);
    
    const prices = await Price.find({ hospitalId: hospitalId }).sort({ specialty: 1 });
    console.log('Found prices:', prices.length);
    
    res.status(200).json({
      success: true,
      prices: prices || []
    });
  } catch (error) {
    console.error('Get hospital prices error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPriceBySpecialty = async (req, res) => {
  try {
    const { hospitalId, specialty } = req.params;
    const price = await Price.findOne({ hospitalId, specialty });
    
    res.status(200).json({
      success: true,
      price: price || { charges: 500 },
      specialty
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyPrices = async (req, res) => {
  try {
    const hospitalId = req.user.userId;
    console.log('Getting my prices for hospital:', hospitalId);
    
    const prices = await Price.find({ hospitalId: hospitalId }).sort({ specialty: 1 });
    
    res.status(200).json({
      success: true,
      prices: prices || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePrice = async (req, res) => {
  try {
    const { charges } = req.body;
    const price = await Price.findById(req.params.id);
    
    if (!price) {
      return res.status(404).json({ error: 'Price not found' });
    }
    
    const hospitalId = req.user.userId;
    if (price.hospitalId.toString() !== hospitalId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    price.charges = charges;
    await price.save();
    
    res.status(200).json({
      success: true,
      message: 'Price updated successfully',
      price
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};