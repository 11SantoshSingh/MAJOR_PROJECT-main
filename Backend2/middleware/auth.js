const { verifyToken } = require('../config/jwt');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    console.log('Decoded token in auth middleware:', decoded);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Get userId from either userId or id field
    const userId = decoded.userId || decoded.id;
    
    if (!userId) {
      console.error('No userId found in token:', decoded);
      return res.status(401).json({ error: 'Invalid token structure' });
    }
    
    // Set user info
    req.user = {
      userId: userId,
      id: userId,
      userType: decoded.userType
    };
    
    console.log('Setting req.user.userId to:', req.user.userId);
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;