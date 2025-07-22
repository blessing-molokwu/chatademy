const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Authentication
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Academic Information
  institution: {
    type: String,
    required: [true, 'Institution is required'],
    trim: true,
    maxlength: [100, 'Institution name cannot exceed 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters'],
    default: ''
  },
  fieldOfStudy: {
    type: String,
    required: [true, 'Field of study is required'],
    trim: true,
    maxlength: [100, 'Field of study cannot exceed 100 characters']
  },
  academicLevel: {
    type: String,
    enum: ['undergraduate', 'graduate', 'phd', 'postdoc', 'faculty', 'researcher'],
    required: [true, 'Academic level is required']
  },
  graduationYear: {
    type: Number,
    min: [1900, 'Invalid graduation year'],
    max: [new Date().getFullYear() + 10, 'Invalid graduation year']
  },
  
  // Account Status & Security
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  
  // Activity Tracking
  lastLogin: {
    type: Date,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
  },
  
  // Research Interests & Skills
  researchInterests: [{
    type: String,
    trim: true,
    maxlength: [50, 'Research interest cannot exceed 50 characters']
  }],
  skills: [{
    type: String,
    trim: true,
    maxlength: [30, 'Skill cannot exceed 30 characters']
  }],
  
  // Social Links
  socialLinks: {
    linkedin: {
      type: String,
      default: ''
    },
    twitter: {
      type: String,
      default: ''
    },
    github: {
      type: String,
      default: ''
    },
    orcid: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    }
  },
  
  // Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'institution', 'private'],
      default: 'public'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  },
  
  // Password Reset
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  // Email Verification
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for profile completion percentage
userSchema.virtual('profileCompletion').get(function() {
  const fields = [
    'firstName', 'lastName', 'email', 'institution', 'fieldOfStudy', 
    'academicLevel', 'bio', 'avatar', 'department'
  ];
  const completed = fields.filter(field => this[field] && this[field].toString().trim() !== '').length;
  return Math.round((completed / fields.length) * 100);
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ institution: 1 });
userSchema.index({ fieldOfStudy: 1 });
userSchema.index({ academicLevel: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return await this.save({ validateBeforeSave: false });
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get user stats
userSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        verifiedUsers: { $sum: { $cond: ['$isEmailVerified', 1, 0] } },
        activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || { totalUsers: 0, verifiedUsers: 0, activeUsers: 0 };
};

module.exports = mongoose.model('User', userSchema);
