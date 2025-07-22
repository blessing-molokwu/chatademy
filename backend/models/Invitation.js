const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  // Group being invited to
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  
  // Who sent the invitation
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Email address of the invitee
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  
  // Personal message from the inviter
  message: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  
  // Unique token for the invitation link
  token: {
    type: String,
    required: true,
    unique: true,
  },
  
  // Invitation status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending',
  },
  
  // When the invitation expires
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  },
  
  // When the invitation was accepted (if applicable)
  acceptedAt: {
    type: Date,
  },
  
  // User who accepted the invitation (if applicable)
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Index for efficient queries
invitationSchema.index({ token: 1 });
invitationSchema.index({ email: 1, group: 1 });
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired invitations

// Virtual for checking if invitation is expired
invitationSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date() || this.status === 'expired';
});

// Method to mark invitation as expired
invitationSchema.methods.markAsExpired = function() {
  this.status = 'expired';
  return this.save();
};

// Method to accept invitation
invitationSchema.methods.accept = function(userId) {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  this.acceptedBy = userId;
  return this.save();
};

// Static method to find valid invitation by token
invitationSchema.statics.findValidByToken = function(token) {
  return this.findOne({
    token,
    status: 'pending',
    expiresAt: { $gt: new Date() },
  }).populate('group invitedBy');
};

// Static method to check if email is already invited to group
invitationSchema.statics.isAlreadyInvited = function(email, groupId) {
  return this.findOne({
    email,
    group: groupId,
    status: 'pending',
    expiresAt: { $gt: new Date() },
  });
};

module.exports = mongoose.model('Invitation', invitationSchema);
