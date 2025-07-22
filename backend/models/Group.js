const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    // Basic Group Info
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      maxlength: [100, "Group name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Group description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // Group Owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Group Members (including owner)
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Group Settings
    isPublic: {
      type: Boolean,
      default: true, // Public groups can be discovered and joined
    },

    // Group Stats
    memberCount: {
      type: Number,
      default: 1, // Owner is always a member
    },

    // Research Focus (optional)
    fieldOfStudy: {
      type: String,
      trim: true,
      maxlength: [100, "Field of study cannot exceed 100 characters"],
    },

    // Group Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
groupSchema.index({ name: 1 });
groupSchema.index({ owner: 1 });
groupSchema.index({ "members.user": 1 });
groupSchema.index({ fieldOfStudy: 1 });
groupSchema.index({ isPublic: 1, isActive: 1 });
groupSchema.index({ createdAt: -1 });

// Virtual for formatted member count
groupSchema.virtual("memberCountText").get(function () {
  const count = this.memberCount;
  return count === 1 ? "1 member" : `${count} members`;
});

// Pre-save middleware to update member count
groupSchema.pre("save", function (next) {
  if (this.isModified("members")) {
    this.memberCount = this.members.length;
  }
  next();
});

// Instance method to check if user is owner
groupSchema.methods.isOwner = function (userId) {
  // Handle both populated and unpopulated owner field
  const ownerId = this.owner._id
    ? this.owner._id.toString()
    : this.owner.toString();
  return ownerId === userId.toString();
};

// Instance method to check if user is member
groupSchema.methods.isMember = function (userId) {
  return this.members.some((member) => {
    // Handle both populated and unpopulated member.user field
    const memberUserId = member.user._id
      ? member.user._id.toString()
      : member.user.toString();
    return memberUserId === userId.toString();
  });
};

// Instance method to add member
groupSchema.methods.addMember = function (userId) {
  if (!this.isMember(userId)) {
    this.members.push({
      user: userId,
      joinedAt: new Date(),
    });
    this.memberCount = this.members.length;
  }
  return this;
};

// Instance method to remove member
groupSchema.methods.removeMember = function (userId) {
  this.members = this.members.filter(
    (member) => member.user.toString() !== userId.toString()
  );
  this.memberCount = this.members.length;
  return this;
};

// Static method to find public groups
groupSchema.statics.findPublicGroups = function (options = {}) {
  const { page = 1, limit = 10, search = "", fieldOfStudy = "" } = options;

  const query = { isPublic: true, isActive: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (fieldOfStudy) {
    query.fieldOfStudy = { $regex: fieldOfStudy, $options: "i" };
  }

  return this.find(query)
    .populate("owner", "firstName lastName email institution")
    .populate("members.user", "firstName lastName email")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to find user's groups
groupSchema.statics.findUserGroups = function (userId) {
  return this.find({
    "members.user": userId,
    isActive: true,
  })
    .populate("owner", "firstName lastName email institution")
    .populate("members.user", "firstName lastName email")
    .sort({ createdAt: -1 });
};

// Static method to get group stats
groupSchema.statics.getGroupStats = async function () {
  const stats = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalGroups: { $sum: 1 },
        publicGroups: { $sum: { $cond: ["$isPublic", 1, 0] } },
        totalMembers: { $sum: "$memberCount" },
        avgMembersPerGroup: { $avg: "$memberCount" },
      },
    },
  ]);

  return (
    stats[0] || {
      totalGroups: 0,
      publicGroups: 0,
      totalMembers: 0,
      avgMembersPerGroup: 0,
    }
  );
};

module.exports = mongoose.model("Group", groupSchema);
