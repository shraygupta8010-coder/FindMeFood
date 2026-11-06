const jwt = require('jsonwebtoken');

// @desc    Verify JWT token
// @route   Middleware for protected routes
// @access  Private
const authMiddleware = (req, res, next) => {
  try {
    // 1. Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // 2. Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, access denied'
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Add user to request object
    req.user = decoded;
    
    // 5. Continue to next middleware/controller
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid',
      error: error.message
    });
  }
};

module.exports = authMiddleware;