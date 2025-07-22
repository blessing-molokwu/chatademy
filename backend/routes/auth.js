const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  getUserStats
} = require('../controllers/authController');

// Middleware imports
const { protect, authorize } = require('../middleware/auth');
const { 
  validateRegisterData, 
  validateLoginData, 
  validateProfileData,
  validatePasswordData 
} = require('../middleware/validation');
const { authRateLimit, logAuthEvent } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', 
  logAuthEvent('REGISTER_ATTEMPT'),
  authRateLimit,
  validateRegisterData, 
  register
);

router.post('/login', 
  logAuthEvent('LOGIN_ATTEMPT'),
  authRateLimit,
  validateLoginData, 
  login
);

// Protected routes
router.get('/me', protect, getMe);

router.put('/profile', 
  protect, 
  validateProfileData, 
  updateProfile
);

router.put('/password', 
  protect, 
  validatePasswordData, 
  changePassword
);

router.post('/logout', protect, logout);

// Admin only routes
router.get('/stats', 
  protect, 
  authorize('admin'), 
  getUserStats
);

module.exports = router;
