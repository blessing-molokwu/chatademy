const User = require('../models/User');
const { 
  generateToken, 
  createAuthResponse, 
  validatePassword, 
  validateEmail,
  generateRandomToken,
  hashToken
} = require('../utils/auth');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    institution,
    fieldOfStudy,
    academicLevel,
    department,
    graduationYear
  } = req.body;

  // Additional password validation
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Password validation failed',
      errors: passwordValidation.errors
    });
  }

  // Additional email validation
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email already exists'
    });
  }

  // Create user
  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase().trim(),
    password,
    institution: institution.trim(),
    fieldOfStudy: fieldOfStudy.trim(),
    academicLevel,
    department: department?.trim() || '',
    graduationYear: graduationYear || undefined
  });

  // Generate JWT token
  const token = generateToken(user._id, user.email);

  // Log registration event
  console.log(`✅ New user registered: ${user.email} from ${user.institution}`);

  // Send response
  res.status(201).json(createAuthResponse(user, token));
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findByEmail(email).select('+password');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account has been deactivated. Please contact support.'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Update last login
  await user.updateLastLogin();

  // Generate JWT token
  const token = generateToken(user._id, user.email);

  // Log login event
  console.log(`✅ User logged in: ${user.email}`);

  // Send response (password will be excluded automatically)
  const userWithoutPassword = await User.findById(user._id);
  res.json(createAuthResponse(userWithoutPassword, token));
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  res.json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      institution: user.institution,
      department: user.department,
      fieldOfStudy: user.fieldOfStudy,
      academicLevel: user.academicLevel,
      graduationYear: user.graduationYear,
      researchInterests: user.researchInterests,
      skills: user.skills,
      socialLinks: user.socialLinks,
      preferences: user.preferences,
      isEmailVerified: user.isEmailVerified,
      profileCompletion: user.profileCompletion,
      role: user.role,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    'firstName', 'lastName', 'bio', 'phone', 'department', 
    'graduationYear', 'researchInterests', 'skills', 'socialLinks', 'preferences'
  ];

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      institution: user.institution,
      department: user.department,
      fieldOfStudy: user.fieldOfStudy,
      academicLevel: user.academicLevel,
      graduationYear: user.graduationYear,
      researchInterests: user.researchInterests,
      skills: user.skills,
      socialLinks: user.socialLinks,
      preferences: user.preferences,
      profileCompletion: user.profileCompletion,
      updatedAt: user.updatedAt
    }
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'New password validation failed',
      errors: passwordValidation.errors
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // In a JWT implementation, logout is typically handled client-side
  // by removing the token from storage. However, we can log the event.
  
  console.log(`✅ User logged out: ${req.user.email}`);

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Get user statistics (admin only)
 * @route   GET /api/auth/stats
 * @access  Private/Admin
 */
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.getUserStats();
  
  // Additional stats
  const recentUsers = await User.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('firstName lastName email institution createdAt');

  const academicLevelStats = await User.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$academicLevel', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    stats: {
      ...stats,
      recentUsers,
      academicLevelDistribution: academicLevelStats
    }
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  getUserStats
};
