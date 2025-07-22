const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate JWT token for user
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {string} JWT token
 */
const generateToken = (userId, email) => {
  return jwt.sign(
    { 
      id: userId, 
      email: email 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '7d',
      issuer: 'research-hub',
      audience: 'research-hub-users'
    }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'research-hub',
      audience: 'research-hub-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate random token for password reset/email verification
 * @returns {string} Random token
 */
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash token for storage (for password reset tokens)
 * @param {string} token - Plain token
 * @returns {string} Hashed token
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result
 */
const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  
  // Calculate strength score
  let score = 0;
  if (password.length >= 8) score += 1;
  if (hasUpperCase) score += 1;
  if (hasLowerCase) score += 1;
  if (hasNumbers) score += 1;
  if (hasSpecialChar) score += 1;
  
  let strength = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score
  };
};

/**
 * Validate email format and domain
 * @param {string} email - Email to validate
 * @returns {object} Validation result
 */
const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  const isValid = emailRegex.test(email);
  
  // Check for academic domains (optional enhancement)
  const academicDomains = ['.edu', '.ac.', '.university', '.college'];
  const isAcademic = academicDomains.some(domain => email.toLowerCase().includes(domain));
  
  return {
    isValid,
    isAcademic,
    domain: email.split('@')[1]?.toLowerCase() || ''
  };
};

/**
 * Generate user-friendly error messages
 * @param {Error} error - Error object
 * @returns {string} User-friendly message
 */
const getAuthErrorMessage = (error) => {
  if (error.code === 11000) {
    // Duplicate key error (email already exists)
    return 'An account with this email already exists';
  }
  
  if (error.name === 'ValidationError') {
    // Mongoose validation error
    const messages = Object.values(error.errors).map(err => err.message);
    return messages.join('. ');
  }
  
  if (error.name === 'JsonWebTokenError') {
    return 'Invalid authentication token';
  }
  
  if (error.name === 'TokenExpiredError') {
    return 'Authentication token has expired';
  }
  
  // Default message
  return error.message || 'Authentication failed';
};

/**
 * Create response object for authentication
 * @param {object} user - User object
 * @param {string} token - JWT token
 * @returns {object} Response object
 */
const createAuthResponse = (user, token) => {
  return {
    success: true,
    message: 'Authentication successful',
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      avatar: user.avatar,
      institution: user.institution,
      fieldOfStudy: user.fieldOfStudy,
      academicLevel: user.academicLevel,
      isEmailVerified: user.isEmailVerified,
      profileCompletion: user.profileCompletion,
      role: user.role,
      preferences: user.preferences,
      createdAt: user.createdAt
    },
    token,
    expiresIn: process.env.JWT_EXPIRE || '7d'
  };
};

module.exports = {
  generateToken,
  verifyToken,
  generateRandomToken,
  hashToken,
  validatePassword,
  validateEmail,
  getAuthErrorMessage,
  createAuthResponse
};
