const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');

const protect = async (req, res, next) => {
  try {
    // Check if Authorization header exists
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Get token from header
    const authToken = req.headers.authorization.split(' ')[1];
    if (!authToken) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Check if token is blacklisted
    const blacklistedToken = await BlacklistedToken.findOne({ tokenString: authToken });
    if (blacklistedToken) {
      return res.status(401).json({ message: 'Token has been invalidated' });
    }

    try {
      // Verify token
      const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET);

      // Get user from the token
      const user = await User.findById(decodedToken.id).select('-userPassword');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT Verification Error:', jwtError);
      return res.status(401).json({ 
        message: 'Token is invalid or expired',
        error: process.env.NODE_ENV === 'development' ? jwtError.message : undefined
      });
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({ message: 'Server error in authentication' });
  }
};

module.exports = { protect };
