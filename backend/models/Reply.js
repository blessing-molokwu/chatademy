const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  // Discussion this reply belongs to
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true,
  },
  
  // User who created the reply
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Reply content
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 3000,
  },
  
  // Parent reply (for nested replies/threading)
  parentReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reply',
    default: null,
  },
  
  // Whether this reply is edited
  isEdited: {
    type: Boolean,
    default: false,
  },
  
  // When it was last edited
  editedAt: {
    type: Date,
  },
  
  // Reactions/likes (simple implementation)
  reactions: {
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    helpful: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Indexes for efficient queries
replySchema.index({ discussion: 1, createdAt: 1 });
replySchema.index({ author: 1, createdAt: -1 });
replySchema.index({ parentReply: 1, createdAt: 1 });

// Virtual for getting like count
replySchema.virtual('likeCount').get(function() {
  return this.reactions.likes.length;
});

// Virtual for getting helpful count
replySchema.virtual('helpfulCount').get(function() {
  return this.reactions.helpful.length;
});

// Method to add like
replySchema.methods.addLike = function(userId) {
  const existingLike = this.reactions.likes.find(
    like => like.user.toString() === userId.toString()
  );
  
  if (!existingLike) {
    this.reactions.likes.push({ user: userId });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to remove like
replySchema.methods.removeLike = function(userId) {
  this.reactions.likes = this.reactions.likes.filter(
    like => like.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to add helpful reaction
replySchema.methods.addHelpful = function(userId) {
  const existingHelpful = this.reactions.helpful.find(
    helpful => helpful.user.toString() === userId.toString()
  );
  
  if (!existingHelpful) {
    this.reactions.helpful.push({ user: userId });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to remove helpful reaction
replySchema.methods.removeHelpful = function(userId) {
  this.reactions.helpful = this.reactions.helpful.filter(
    helpful => helpful.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to mark as edited
replySchema.methods.markAsEdited = function() {
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Static method to find replies by discussion
replySchema.statics.findByDiscussion = function(discussionId, options = {}) {
  const {
    page = 1,
    limit = 20,
    parentOnly = false,
  } = options;

  const query = { 
    discussion: discussionId,
    ...(parentOnly && { parentReply: null }),
  };

  return this.find(query)
    .populate('author', 'firstName lastName')
    .populate('parentReply')
    .sort({ createdAt: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to count replies for a discussion
replySchema.statics.countByDiscussion = function(discussionId) {
  return this.countDocuments({ discussion: discussionId });
};

module.exports = mongoose.model('Reply', replySchema);
