const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema(
  {
    // Basic paper information
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // File information
    fileName: {
      type: String,
      required: true,
    },

    originalFileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    // Group this paper belongs to
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    // User who uploaded the paper
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Authors of the paper (can be different from uploader)
    authors: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        affiliation: {
          type: String,
          trim: true,
        },
      },
    ],

    // Paper metadata
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    category: {
      type: String,
      enum: [
        "research",
        "review",
        "thesis",
        "conference",
        "journal",
        "preprint",
        "other",
      ],
      default: "research",
    },

    // Publication information
    journal: {
      type: String,
      trim: true,
    },

    publishedDate: {
      type: Date,
    },

    doi: {
      type: String,
      trim: true,
    },

    url: {
      type: String,
      trim: true,
    },

    // Paper status
    isPublic: {
      type: Boolean,
      default: false, // Only group members can see by default
    },

    // Download and view tracking
    downloadCount: {
      type: Number,
      default: 0,
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    // Comments and discussions
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
          maxlength: 1000,
        },
        // Threading support
        parentComment: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
        // Comment status
        isEdited: {
          type: Boolean,
          default: false,
        },
        editedAt: {
          type: Date,
        },
        // Reactions/likes
        likes: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Ratings/reviews
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        review: {
          type: String,
          trim: true,
          maxlength: 300,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for efficient queries
paperSchema.index({ group: 1, createdAt: -1 });
paperSchema.index({ uploadedBy: 1, createdAt: -1 });
paperSchema.index({ tags: 1 });
paperSchema.index({ category: 1 });
paperSchema.index({ title: "text", description: "text" });

// Virtual for average rating
paperSchema.virtual("averageRating").get(function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10;
});

// Virtual for file size in human readable format
paperSchema.virtual("fileSizeFormatted").get(function () {
  const bytes = this.fileSize;
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
});

// Method to increment download count
paperSchema.methods.incrementDownloadCount = function () {
  this.downloadCount += 1;
  return this.save();
};

// Method to increment view count
paperSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

// Method to add comment
paperSchema.methods.addComment = function (
  userId,
  content,
  parentCommentId = null
) {
  const comment = {
    user: userId,
    content: content,
    parentComment: parentCommentId,
  };
  this.comments.push(comment);
  return this.save();
};

// Method to update comment
paperSchema.methods.updateComment = function (commentId, content) {
  const comment = this.comments.id(commentId);
  if (comment) {
    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    comment.updatedAt = new Date();
  }
  return this.save();
};

// Method to delete comment
paperSchema.methods.deleteComment = function (commentId) {
  this.comments.pull(commentId);
  return this.save();
};

// Method to like/unlike comment
paperSchema.methods.toggleCommentLike = function (commentId, userId) {
  const comment = this.comments.id(commentId);
  if (comment) {
    const existingLike = comment.likes.find(
      (like) => like.user.toString() === userId.toString()
    );

    if (existingLike) {
      // Unlike
      comment.likes.pull(existingLike._id);
    } else {
      // Like
      comment.likes.push({ user: userId });
    }
  }
  return this.save();
};

// Method to get organized comments (threaded)
paperSchema.methods.getOrganizedComments = function () {
  const commentMap = new Map();
  const topLevelComments = [];

  // First pass: create a map of all comments
  this.comments.forEach((comment) => {
    commentMap.set(comment._id.toString(), {
      ...comment.toObject(),
      replies: [],
    });
  });

  // Second pass: organize into hierarchy
  this.comments.forEach((comment) => {
    const commentObj = commentMap.get(comment._id.toString());

    if (comment.parentComment) {
      const parent = commentMap.get(comment.parentComment.toString());
      if (parent) {
        parent.replies.push(commentObj);
      } else {
        // If parent not found, treat as top-level
        topLevelComments.push(commentObj);
      }
    } else {
      topLevelComments.push(commentObj);
    }
  });

  return topLevelComments;
};

// Method to add rating
paperSchema.methods.addRating = function (userId, rating, review = "") {
  // Remove existing rating from this user
  this.ratings = this.ratings.filter(
    (r) => r.user.toString() !== userId.toString()
  );

  // Add new rating
  this.ratings.push({
    user: userId,
    rating: rating,
    review: review,
  });

  return this.save();
};

// Static method to find papers by group
paperSchema.statics.findByGroup = function (groupId, options = {}) {
  const {
    page = 1,
    limit = 12,
    category = null,
    search = null,
    tags = null,
  } = options;

  const query = { group: groupId };

  if (category && category !== "all") {
    query.category = category;
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  return this.find(query)
    .populate("uploadedBy", "firstName lastName")
    .populate("group", "name")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get popular tags for a group
paperSchema.statics.getPopularTags = function (groupId, limit = 10) {
  return this.aggregate([
    { $match: { group: new mongoose.Types.ObjectId(groupId) } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { tag: "$_id", count: 1, _id: 0 } },
  ]);
};

module.exports = mongoose.model("Paper", paperSchema);
