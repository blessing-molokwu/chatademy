const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, getAuthErrorMessage } = require('../utils/auth');

/**
 * Middleware to protect routes - requires valid JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: getAuthErrorMessage(error)
    });
  }
};

/**
 * Middleware to check if user has specific role
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    
    next();
  };
};

/**
 * Middleware to check if user's email is verified
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please authenticate first.'
    });
  }
  
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required. Please verify your email address.',
      requiresEmailVerification: true
    });
  }
  
  next();
};

/**
 * Optional authentication middleware - doesn't fail if no token
 * Useful for routes that work for both authenticated and non-authenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      try {
        // Verify token
        const decoded = verifyToken(token);
        
        // Get user from database
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Optional auth - invalid token:', error.message);
      }
    }
    
    next();
    
  } catch (error) {
    // Don't fail the request for optional auth
    console.error('Optional auth middleware error:', error);
    next();
  }
};

/**
 * Middleware to rate limit authentication attempts
 */
const authRateLimit = (req, res, next) => {
  // This is a simple in-memory rate limiter
  // In production, use Redis or a proper rate limiting solution
  
  const attempts = req.app.locals.authAttempts || {};
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  
  // Clean old attempts
  if (attempts[ip]) {
    attempts[ip] = attempts[ip].filter(time => now - time < windowMs);
  } else {
    attempts[ip] = [];
  }
  
  // Check if limit exceeded
  if (attempts[ip].length >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: Math.ceil((attempts[ip][0] + windowMs - now) / 1000)
    });
  }
  
  // Add current attempt
  attempts[ip].push(now);
  req.app.locals.authAttempts = attempts;
  
  next();
};

/**
 * Middleware to log authentication events
 */
const logAuthEvent = (event) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const timestamp = new Date().toISOString();
    
    console.log(`[AUTH] ${timestamp} - ${event} - IP: ${ip} - User-Agent: ${userAgent}`);
    
    // In production, you might want to log this to a file or database
    next();
  };
};

/**
 * Middleware to check if user owns the resource
 * Useful for protecting user-specific resources
 */
const checkResourceOwnership = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }
    
    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user owns the resource
    const resourceUserId = req.params.userId || req.body[resourceUserField] || req.query.userId;
    
    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }
    
    next();
  };
};

module.exports = {
  protect,
  authorize,
  requireEmailVerification,
  optionalAuth,
  authRateLimit,
  logAuthEvent,
  checkResourceOwnership
};
