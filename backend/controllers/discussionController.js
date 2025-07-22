const Discussion = require("../models/Discussion");
const Reply = require("../models/Reply");
const Group = require("../models/Group");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * @desc    Get discussions for a group
 * @route   GET /api/groups/:groupId/discussions
 * @access  Private (Group members only)
 */
const getDiscussions = asyncHandler(async (req, res) => {
  console.log("getDiscussions called with params:", req.params);
  console.log("getDiscussions called with query:", req.query);

  const groupId = req.params.id;
  const { page = 1, limit = 10, category = "all", search = "" } = req.query;
  const userId = req.user._id;

  // Check if user is a member of the group
  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  const isMember = group.members.some(
    (member) => member.user.toString() === userId.toString()
  );
  const isOwner = group.owner.toString() === userId.toString();

  if (!isMember && !isOwner) {
    return res.status(403).json({
      success: false,
      message: "Only group members can view discussions",
    });
  }

  // Get discussions
  const discussions = await Discussion.findByGroup(groupId, {
    page: parseInt(page),
    limit: parseInt(limit),
    category: category !== "all" ? category : null,
    search: search || null,
  });

  // Get total count for pagination
  const totalQuery = { group: groupId };
  if (category && category !== "all") {
    totalQuery.category = category;
  }
  if (search) {
    totalQuery.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }
  const total = await Discussion.countDocuments(totalQuery);

  res.status(200).json({
    success: true,
    data: {
      discussions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * @desc    Get single discussion with replies
 * @route   GET /api/discussions/:id
 * @access  Private (Group members only)
 */
const getDiscussion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const userId = req.user._id;

  // Get discussion
  const discussion = await Discussion.findById(id)
    .populate("author", "firstName lastName")
    .populate("group", "name")
    .populate("lastReply.author", "firstName lastName");

  if (!discussion) {
    return res.status(404).json({
      success: false,
      message: "Discussion not found",
    });
  }

  // Check if user is a member of the group
  const group = await Group.findById(discussion.group._id);
  const isMember = group.members.some(
    (member) => member.user.toString() === userId.toString()
  );
  const isOwner = group.owner.toString() === userId.toString();

  if (!isMember && !isOwner) {
    return res.status(403).json({
      success: false,
      message: "Only group members can view this discussion",
    });
  }

  // Get replies
  const replies = await Reply.findByDiscussion(id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  const totalReplies = await Reply.countByDiscussion(id);

  res.status(200).json({
    success: true,
    data: {
      discussion,
      replies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalReplies,
        pages: Math.ceil(totalReplies / limit),
      },
    },
  });
});

/**
 * @desc    Create new discussion
 * @route   POST /api/groups/:groupId/discussions
 * @access  Private (Group members only)
 */
const createDiscussion = asyncHandler(async (req, res) => {
  const groupId = req.params.id;
  const { title, content, category = "general", tags = [] } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: "Title and content are required",
    });
  }

  // Check if user is a member of the group
  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  const isMember = group.members.some(
    (member) => member.user.toString() === userId.toString()
  );
  const isOwner = group.owner.toString() === userId.toString();

  if (!isMember && !isOwner) {
    return res.status(403).json({
      success: false,
      message: "Only group members can create discussions",
    });
  }

  // Create discussion
  const discussion = new Discussion({
    group: groupId,
    author: userId,
    title: title.trim(),
    content: content.trim(),
    category,
    tags: Array.isArray(tags) ? tags.filter((tag) => tag.trim()) : [],
  });

  await discussion.save();

  // Populate author info
  await discussion.populate("author", "firstName lastName");

  res.status(201).json({
    success: true,
    message: "Discussion created successfully",
    data: discussion,
  });
});

/**
 * @desc    Create reply to discussion
 * @route   POST /api/discussions/:id/replies
 * @access  Private (Group members only)
 */
const createReply = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, parentReply = null } = req.body;
  const userId = req.user._id;

  // Validate content
  if (!content || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: "Reply content is required",
    });
  }

  // Get discussion and check permissions
  const discussion = await Discussion.findById(id).populate("group");
  if (!discussion) {
    return res.status(404).json({
      success: false,
      message: "Discussion not found",
    });
  }

  if (discussion.isLocked) {
    return res.status(403).json({
      success: false,
      message: "This discussion is locked",
    });
  }

  // Check if user is a member of the group
  const group = discussion.group;
  const isMember = group.members.some(
    (member) => member.user.toString() === userId.toString()
  );
  const isOwner = group.owner.toString() === userId.toString();

  if (!isMember && !isOwner) {
    return res.status(403).json({
      success: false,
      message: "Only group members can reply to discussions",
    });
  }

  // Create reply
  const reply = new Reply({
    discussion: id,
    author: userId,
    content: content.trim(),
    parentReply: parentReply || null,
  });

  await reply.save();

  // Update discussion reply count and last activity
  await discussion.incrementReplyCount(userId);

  // Populate author info
  await reply.populate("author", "firstName lastName");

  res.status(201).json({
    success: true,
    message: "Reply created successfully",
    data: reply,
  });
});

module.exports = {
  getDiscussions,
  getDiscussion,
  createDiscussion,
  createReply,
};
