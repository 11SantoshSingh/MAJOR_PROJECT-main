const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here_123456789';
const JWT_EXPIRATION = '24h';

const generateToken = (userId, userType) => {
  console.log('Generating token for userId:', userId);
  const token = jwt.sign(
    { 
      userId: userId,  // This must be userId
      id: userId,      // Also include id for compatibility
      userType: userType 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
  return token;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified, userId:', decoded.userId, 'id:', decoded.id);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

module.exports = { generateToken, verifyToken, JWT_SECRET };