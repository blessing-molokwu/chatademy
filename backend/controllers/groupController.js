const Group = require("../models/Group");
const Invitation = require("../models/Invitation");
const User = require("../models/User");
const { asyncHandler } = require("../middleware/errorHandler");
const { sendGroupInvitation } = require("../utils/emailService");
const crypto = require("crypto");

/**
 * @desc    Get all public groups
 * @route   GET /api/groups
 * @access  Private
 */
const getGroups = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", fieldOfStudy = "" } = req.query;

  const groups = await Group.findPublicGroups({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    fieldOfStudy,
  });

  const total = await Group.countDocuments({
    isPublic: true,
    isActive: true,
    ...(search && {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    }),
    ...(fieldOfStudy && {
      fieldOfStudy: { $regex: fieldOfStudy, $options: "i" },
    }),
  });

  res.json({
    success: true,
    groups,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get user's groups
 * @route   GET /api/groups/my-groups
 * @access  Private
 */
const getMyGroups = asyncHandler(async (req, res) => {
  const groups = await Group.findUserGroups(req.user._id);

  res.json({
    success: true,
    groups,
  });
});

/**
 * @desc    Get single group
 * @route   GET /api/groups/:id
 * @access  Private
 */
const getGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate("owner", "firstName lastName email institution fieldOfStudy")
    .populate(
      "members.user",
      "firstName lastName email institution fieldOfStudy"
    );

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  // Debug logging for access control
  console.log(`[ACCESS CHECK] Group: ${group.name} (${req.params.id})`);
  console.log(`[ACCESS CHECK] User: ${req.user.email} (${req.user._id})`);
  console.log(`[ACCESS CHECK] Group isPublic: ${group.isPublic}`);
  console.log(`[ACCESS CHECK] Group owner: ${group.owner}`);
  console.log(`[ACCESS CHECK] Is owner: ${group.isOwner(req.user._id)}`);
  console.log(`[ACCESS CHECK] Is member: ${group.isMember(req.user._id)}`);
  console.log(
    `[ACCESS CHECK] Members:`,
    group.members.map((m) => m.user.toString())
  );

  // Check if user can view this group
  if (
    !group.isPublic &&
    !group.isMember(req.user._id) &&
    !group.isOwner(req.user._id)
  ) {
    console.log(
      `[ACCESS DENIED] User ${req.user.email} denied access to group ${group.name}`
    );
    return res.status(403).json({
      success: false,
      message: "Access denied. This is a private group.",
    });
  }

  console.log(
    `[ACCESS GRANTED] User ${req.user.email} granted access to group ${group.name}`
  );

  // Add user's role in the group
  const userRole = group.isOwner(req.user._id)
    ? "owner"
    : group.isMember(req.user._id)
    ? "member"
    : "visitor";

  res.json({
    success: true,
    group: {
      ...group.toObject(),
      userRole,
    },
  });
});

/**
 * @desc    Create new group
 * @route   POST /api/groups
 * @access  Private
 */
const createGroup = asyncHandler(async (req, res) => {
  const { name, description, fieldOfStudy, isPublic = true } = req.body;

  // Check if group name already exists
  const existingGroup = await Group.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
    isActive: true,
  });

  if (existingGroup) {
    return res.status(400).json({
      success: false,
      message: "A group with this name already exists",
    });
  }

  // Create group with owner as first member
  const group = await Group.create({
    name,
    description,
    fieldOfStudy,
    isPublic,
    owner: req.user._id,
    members: [
      {
        user: req.user._id,
        joinedAt: new Date(),
      },
    ],
  });

  // Populate the created group
  await group.populate("owner", "firstName lastName email institution");
  await group.populate("members.user", "firstName lastName email");

  res.status(201).json({
    success: true,
    message: "Group created successfully",
    group,
  });
});

/**
 * @desc    Update group
 * @route   PUT /api/groups/:id
 * @access  Private (Owner only)
 */
const updateGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  // Check if user is owner
  if (!group.isOwner(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only group owner can update the group.",
    });
  }

  const { name, description, fieldOfStudy, isPublic } = req.body;

  // Check if new name conflicts with existing group
  if (name && name !== group.name) {
    const existingGroup = await Group.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      isActive: true,
      _id: { $ne: group._id },
    });

    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: "A group with this name already exists",
      });
    }
  }

  // Update group
  const updatedGroup = await Group.findByIdAndUpdate(
    req.params.id,
    { name, description, fieldOfStudy, isPublic },
    { new: true, runValidators: true }
  )
    .populate("owner", "firstName lastName email institution")
    .populate("members.user", "firstName lastName email");

  res.json({
    success: true,
    message: "Group updated successfully",
    group: updatedGroup,
  });
});

/**
 * @desc    Join group
 * @route   POST /api/groups/:id/join
 * @access  Private
 */
const joinGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  if (!group.isActive) {
    return res.status(400).json({
      success: false,
      message: "This group is no longer active",
    });
  }

  if (!group.isPublic) {
    return res.status(403).json({
      success: false,
      message: "This is a private group",
    });
  }

  if (group.isMember(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: "You are already a member of this group",
    });
  }

  // Add user to group
  group.addMember(req.user._id);
  await group.save();

  // Return updated group
  await group.populate("owner", "firstName lastName email institution");
  await group.populate("members.user", "firstName lastName email");

  res.json({
    success: true,
    message: "Successfully joined the group",
    group,
  });
});

/**
 * @desc    Leave group
 * @route   POST /api/groups/:id/leave
 * @access  Private
 */
const leaveGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  if (!group.isMember(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: "You are not a member of this group",
    });
  }

  if (group.isOwner(req.user._id)) {
    return res.status(400).json({
      success: false,
      message:
        "Group owner cannot leave the group. Transfer ownership or delete the group.",
    });
  }

  // Remove user from group
  group.removeMember(req.user._id);
  await group.save();

  res.json({
    success: true,
    message: "Successfully left the group",
  });
});

/**
 * @desc    Remove member from group
 * @route   DELETE /api/groups/:id/members/:memberId
 * @access  Private (Owner only)
 */
const removeMember = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  // Check if user is owner
  if (!group.isOwner(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only group owner can remove members.",
    });
  }

  const memberId = req.params.memberId;

  // Check if trying to remove owner
  if (group.isOwner(memberId)) {
    return res.status(400).json({
      success: false,
      message: "Cannot remove group owner",
    });
  }

  // Check if member exists
  if (!group.isMember(memberId)) {
    return res.status(400).json({
      success: false,
      message: "User is not a member of this group",
    });
  }

  // Remove member
  group.removeMember(memberId);
  await group.save();

  res.json({
    success: true,
    message: "Member removed successfully",
  });
});

/**
 * @desc    Delete group
 * @route   DELETE /api/groups/:id
 * @access  Private (Owner only)
 */
const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  // Check if user is owner
  if (!group.isOwner(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only group owner can delete the group.",
    });
  }

  // Soft delete - mark as inactive
  group.isActive = false;
  await group.save();

  res.json({
    success: true,
    message: "Group deleted successfully",
  });
});

/**
 * @desc    Debug group ownership
 * @route   GET /api/groups/:id/debug
 * @access  Private
 */
const debugGroupOwnership = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate("owner", "firstName lastName email")
    .populate("members.user", "firstName lastName email");

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  res.json({
    success: true,
    debug: {
      groupName: group.name,
      isPublic: group.isPublic,
      currentUser: {
        id: req.user._id.toString(),
        email: req.user.email,
      },
      owner: {
        id: group.owner._id.toString(),
        email: group.owner.email,
      },
      isOwner: group.isOwner(req.user._id),
      isMember: group.isMember(req.user._id),
      members: group.members.map((m) => ({
        id: m.user._id.toString(),
        email: m.user.email,
        joinedAt: m.joinedAt,
      })),
    },
  });
});

/**
 * @desc    Send group invitation
 * @route   POST /api/groups/:id/invite
 * @access  Private (Group members only)
 */
const sendInvitation = asyncHandler(async (req, res) => {
  const { email, message = "" } = req.body;
  const groupId = req.params.id;
  const userId = req.user._id;

  // Validate email
  if (!email || !email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Valid email address is required",
    });
  }

  // Get the group and check if user is a member
  const group = await Group.findById(groupId).populate(
    "owner",
    "firstName lastName"
  );

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  // Check if user is a member of the group
  const isMember = group.members.some(
    (member) => member.user.toString() === userId.toString()
  );
  const isOwner = group.owner._id.toString() === userId.toString();

  if (!isMember && !isOwner) {
    return res.status(403).json({
      success: false,
      message: "Only group members can send invitations",
    });
  }

  // Check if email is already a member
  const existingMember = await User.findOne({ email: email.toLowerCase() });
  if (existingMember) {
    const isAlreadyMember = group.members.some(
      (member) => member.user.toString() === existingMember._id.toString()
    );
    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: "This user is already a member of the group",
      });
    }
  }

  // Check if there's already a pending invitation
  const existingInvitation = await Invitation.isAlreadyInvited(
    email.toLowerCase(),
    groupId
  );
  if (existingInvitation) {
    return res.status(400).json({
      success: false,
      message: "An invitation has already been sent to this email address",
    });
  }

  // Generate unique token for invitation
  const token = crypto.randomBytes(32).toString("hex");

  // Create invitation record
  const invitation = new Invitation({
    group: groupId,
    invitedBy: userId,
    email: email.toLowerCase(),
    message: message.trim(),
    token,
  });

  await invitation.save();

  // Get sender info
  const sender = await User.findById(userId).select("firstName lastName");

  // Create invitation link
  const inviteLink = `${process.env.FRONTEND_URL}/accept-invitation/${token}`;

  // Send email
  const emailResult = await sendGroupInvitation({
    recipientEmail: email,
    senderName: `${sender.firstName} ${sender.lastName}`,
    groupName: group.name,
    groupDescription: group.description,
    personalMessage: message,
    inviteLink,
  });

  if (!emailResult.success) {
    // Delete the invitation if email failed
    await Invitation.findByIdAndDelete(invitation._id);

    return res.status(500).json({
      success: false,
      message: "Failed to send invitation email",
      error: emailResult.error,
    });
  }

  res.status(200).json({
    success: true,
    message: "Invitation sent successfully",
    data: {
      invitationId: invitation._id,
      email: email,
      expiresAt: invitation.expiresAt,
    },
  });
});

/**
 * @desc    Accept group invitation
 * @route   POST /api/groups/accept-invitation/:token
 * @access  Public
 */
const acceptInvitation = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Find valid invitation
  const invitation = await Invitation.findValidByToken(token);

  if (!invitation) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired invitation",
    });
  }

  // Check if user exists, if not they need to register first
  const user = await User.findOne({ email: invitation.email });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Please create an account first with the invited email address",
      redirectTo: "/register",
      email: invitation.email,
    });
  }

  // Check if user is already a member
  const group = await Group.findById(invitation.group);
  const isAlreadyMember = group.members.some(
    (member) => member.user.toString() === user._id.toString()
  );

  if (isAlreadyMember) {
    await invitation.markAsExpired();
    return res.status(400).json({
      success: false,
      message: "You are already a member of this group",
    });
  }

  // Add user to group
  group.members.push({
    user: user._id,
    joinedAt: new Date(),
  });

  await group.save();

  // Mark invitation as accepted
  await invitation.accept(user._id);

  res.status(200).json({
    success: true,
    message: "Successfully joined the group!",
    data: {
      groupId: group._id,
      groupName: group.name,
    },
  });
});

/**
 * @desc    Get group invitations (for group owners/admins)
 * @route   GET /api/groups/:id/invitations
 * @access  Private (Group owners only)
 */
const getGroupInvitations = asyncHandler(async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user._id;

  // Get the group and check if user is owner
  const group = await Group.findById(groupId);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  if (group.owner.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Only group owners can view invitations",
    });
  }

  // Get pending invitations
  const invitations = await Invitation.find({
    group: groupId,
    status: "pending",
    expiresAt: { $gt: new Date() },
  })
    .populate("invitedBy", "firstName lastName")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: invitations,
  });
});

module.exports = {
  getGroups,
  getMyGroups,
  getGroup,
  createGroup,
  updateGroup,
  joinGroup,
  leaveGroup,
  removeMember,
  deleteGroup,
  debugGroupOwnership,
  sendInvitation,
  acceptInvitation,
  getGroupInvitations,
};
