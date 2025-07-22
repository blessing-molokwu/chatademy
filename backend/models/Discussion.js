const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  // Group this discussion belongs to
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  
  // User who created the discussion
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Discussion title
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  
  // Discussion content
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
  },
  
  // Discussion category
  category: {
    type: String,
    enum: ['general', 'research', 'questions', 'announcements', 'ideas'],
    default: 'general',
  },
  
  // Discussion tags (optional)
  tags: [{
    type: String,
    trim: true,
    maxlength: 50,
  }],
  
  // Whether discussion is pinned (for important topics)
  isPinned: {
    type: Boolean,
    default: false,
  },
  
  // Whether discussion is locked (no new replies)
  isLocked: {
    type: Boolean,
    default: false,
  },
  
  // Reply count (for performance)
  replyCount: {
    type: Number,
    default: 0,
  },
  
  // Last activity timestamp
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  
  // Last reply info (for display)
  lastReply: {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: Date,
  },
  
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Indexes for efficient queries
discussionSchema.index({ group: 1, createdAt: -1 });
discussionSchema.index({ group: 1, category: 1, createdAt: -1 });
discussionSchema.index({ group: 1, isPinned: -1, lastActivity: -1 });

// Virtual for getting category display name
discussionSchema.virtual('categoryDisplay').get(function() {
  const categoryMap = {
    general: '💬 General',
    research: '🔬 Research',
    questions: '❓ Questions',
    announcements: '📢 Announcements',
    ideas: '💡 Ideas',
  };
  return categoryMap[this.category] || '💬 General';
});

// Method to increment reply count
discussionSchema.methods.incrementReplyCount = function(replyAuthor) {
  this.replyCount += 1;
  this.lastActivity = new Date();
  this.lastReply = {
    author: replyAuthor,
    createdAt: new Date(),
  };
  return this.save();
};

// Method to decrement reply count
discussionSchema.methods.decrementReplyCount = function() {
  this.replyCount = Math.max(0, this.replyCount - 1);
  return this.save();
};

// Static method to find discussions by group
discussionSchema.statics.findByGroup = function(groupId, options = {}) {
  const {
    page = 1,
    limit = 10,
    category = null,
    search = null,
  } = options;

  const query = { group: groupId };
  
  if (category && category !== 'all') {
    query.category = category;
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  return this.find(query)
    .populate('author', 'firstName lastName')
    .populate('lastReply.author', 'firstName lastName')
    .sort({ isPinned: -1, lastActivity: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

module.exports = mongoose.model('Discussion', discussionSchema);
