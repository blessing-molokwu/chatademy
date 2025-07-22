const { asyncHandler } = require("../middleware/errorHandler");
const Paper = require("../models/Paper");
const Group = require("../models/Group");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads/papers");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Allow only PDF, DOC, DOCX files
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, DOCX, and TXT files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

/**
 * @desc    Get papers for a group
 * @route   GET /api/groups/:groupId/papers
 * @access  Private (Group members only)
 */
const getPapers = asyncHandler(async (req, res) => {
  const groupId = req.params.groupId;
  const {
    page = 1,
    limit = 12,
    category = "all",
    search = "",
    tags = "",
  } = req.query;
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
      message: "Only group members can view papers",
    });
  }

  // Parse tags if provided
  const tagArray = tags ? tags.split(",").map((tag) => tag.trim()) : [];

  // Get papers
  const papers = await Paper.findByGroup(groupId, {
    page: parseInt(page),
    limit: parseInt(limit),
    category: category !== "all" ? category : null,
    search: search || null,
    tags: tagArray.length > 0 ? tagArray : null,
  });

  // Get total count for pagination
  const totalQuery = { group: groupId };
  if (category && category !== "all") {
    totalQuery.category = category;
  }
  if (search) {
    totalQuery.$text = { $search: search };
  }
  if (tagArray.length > 0) {
    totalQuery.tags = { $in: tagArray };
  }

  const total = await Paper.countDocuments(totalQuery);

  // Get popular tags for the group
  const popularTags = await Paper.getPopularTags(groupId);

  res.status(200).json({
    success: true,
    data: {
      papers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      popularTags,
    },
  });
});

/**
 * @desc    Upload a new paper
 * @route   POST /api/groups/:groupId/papers
 * @access  Private (Group members only)
 */
const uploadPaper = asyncHandler(async (req, res) => {
  const groupId = req.params.groupId;
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
      message: "Only group members can upload papers",
    });
  }

  // Handle file upload
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    try {
      const {
        title,
        description = "",
        authors = "[]",
        tags = "[]",
        category = "research",
        journal = "",
        publishedDate = null,
        doi = "",
        url = "",
        isPublic = false,
      } = req.body;

      // Validate required fields
      if (!title) {
        // Delete uploaded file if validation fails
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "Title is required",
        });
      }

      // Parse JSON fields
      let parsedAuthors = [];
      let parsedTags = [];

      try {
        parsedAuthors = JSON.parse(authors);
        parsedTags = JSON.parse(tags);
      } catch (parseErr) {
        // Delete uploaded file if parsing fails
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for authors or tags",
        });
      }

      // Create paper document
      const paper = new Paper({
        title,
        description,
        fileName: req.file.filename,
        originalFileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        group: groupId,
        uploadedBy: userId,
        authors: parsedAuthors,
        tags: parsedTags,
        category,
        journal,
        publishedDate: publishedDate ? new Date(publishedDate) : null,
        doi,
        url,
        isPublic: Boolean(isPublic),
      });

      await paper.save();

      // Populate user info
      await paper.populate("uploadedBy", "firstName lastName");

      res.status(201).json({
        success: true,
        message: "Paper uploaded successfully",
        data: paper,
      });
    } catch (error) {
      // Delete uploaded file if database save fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error("Error uploading paper:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload paper",
      });
    }
  });
});

/**
 * @desc    Get single paper
 * @route   GET /api/papers/:id
 * @access  Private (Group members only)
 */
const getPaper = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const paper = await Paper.findById(id)
    .populate("uploadedBy", "firstName lastName")
    .populate("group", "name")
    .populate("comments.user", "firstName lastName")
    .populate("ratings.user", "firstName lastName");

  if (!paper) {
    return res.status(404).json({
      success: false,
      message: "Paper not found",
    });
  }

  // Check if user has access to this paper
  const group = await Group.findById(paper.group._id);
  const isMember = group.members.some(
    (member) => member.user.toString() === userId.toString()
  );
  const isOwner = group.owner.toString() === userId.toString();

  if (!isMember && !isOwner && !paper.isPublic) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  // Increment view count
  await paper.incrementViewCount();

  res.status(200).json({
    success: true,
    data: paper,
  });
});

/**
 * @desc    Download paper file
 * @route   GET /api/papers/:id/download
 * @access  Private (Group members only)
 */
const downloadPaper = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const paper = await Paper.findById(id).populate("group");

  if (!paper) {
    return res.status(404).json({
      success: false,
      message: "Paper not found",
    });
  }

  // Check if user has access to this paper
  const group = paper.group;
  const isMember = group.members.some(
    (member) => member.user.toString() === userId.toString()
  );
  const isOwner = group.owner.toString() === userId.toString();

  if (!isMember && !isOwner && !paper.isPublic) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  // Check if file exists
  if (!fs.existsSync(paper.filePath)) {
    return res.status(404).json({
      success: false,
      message: "File not found on server",
    });
  }

  // Increment download count
  await paper.incrementDownloadCount();

  // Send file
  res.download(paper.filePath, paper.originalFileName);
});

/**
 * @desc    Delete paper
 * @route   DELETE /api/papers/:id
 * @access  Private (Paper uploader or group owner only)
 */
const deletePaper = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const paper = await Paper.findById(id).populate("group");

  if (!paper) {
    return res.status(404).json({
      success: false,
      message: "Paper not found",
    });
  }

  // Check if user can delete this paper
  const isUploader = paper.uploadedBy.toString() === userId.toString();
  const isGroupOwner = paper.group.owner.toString() === userId.toString();

  if (!isUploader && !isGroupOwner) {
    return res.status(403).json({
      success: false,
      message: "Only the uploader or group owner can delete this paper",
    });
  }

  // Delete file from filesystem
  if (fs.existsSync(paper.filePath)) {
    fs.unlinkSync(paper.filePath);
  }

  // Delete paper from database
  await Paper.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Paper deleted successfully",
  });
});

/**
 * @desc    Add comment to paper
 * @route   POST /api/papers/:id/comments
 * @access  Private (Group members only)
 */
const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, parentCommentId = null } = req.body;
  const userId = req.user._id;

  if (!content || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: "Comment content is required",
    });
  }

  const paper = await Paper.findById(id).populate("group");

  if (!paper) {
    return res.status(404).json({
      success: false,
      message: "Paper not found",
    });
  }

  // Check if user has access to this paper
  const group = paper.group;
  const isMember = group.members.some(
    (member) => member.user.toString() === userId.toString()
  );
  const isOwner = group.owner.toString() === userId.toString();

  if (!isMember && !isOwner) {
    return res.status(403).json({
      success: false,
      message: "Only group members can comment on papers",
    });
  }

  // Validate parent comment if provided
  if (parentCommentId) {
    const parentComment = paper.comments.id(parentCommentId);
    if (!parentComment) {
      return res.status(400).json({
        success: false,
        message: "Parent comment not found",
      });
    }
  }

  // Add comment
  await paper.addComment(userId, content.trim(), parentCommentId);

  // Populate the new comment
  await paper.populate("comments.user", "firstName lastName");
  await paper.populate("comments.likes.user", "firstName lastName");

  // Get the newly added comment
  const newComment = paper.comments[paper.comments.length - 1];

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: newComment,
  });
});

/**
 * @desc    Get paper comments (organized/threaded)
 * @route   GET /api/papers/:id/comments
 * @access  Private (Group members only)
 */
const getComments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const paper = await Paper.findById(id)
    .populate("group")
    .populate("comments.user", "firstName lastName")
    .populate("comments.likes.user", "firstName lastName");

  if (!paper) {
    return res.status(404).json({
      success: false,
      message: "Paper not found",
    });
  }

  // Check if user has access to this paper
  const group = paper.group;
  const isMember = group.members.some(
    (member) => member.user.toString() === userId.toString()
  );
  const isOwner = group.owner.toString() === userId.toString();

  if (!isMember && !isOwner && !paper.isPublic) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  // Get organized comments
  const organizedComments = paper.getOrganizedComments();

  res.status(200).json({
    success: true,
    data: {
      comments: organizedComments,
      totalComments: paper.comments.length,
    },
  });
});

/**
 * @desc    Update comment
 * @route   PUT /api/papers/:id/comments/:commentId
 * @access  Private (Comment author only)
 */
const updateComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: "Comment content is required",
    });
  }

  const paper = await Paper.findById(id).populate("group");

  if (!paper) {
    return res.status(404).json({
      success: false,
      message: "Paper not found",
    });
  }

  const comment = paper.comments.id(commentId);
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  // Check if user is the comment author
  if (comment.user.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "You can only edit your own comments",
    });
  }

  // Update comment
  await paper.updateComment(commentId, content.trim());

  // Populate updated comment
  await paper.populate("comments.user", "firstName lastName");
  await paper.populate("comments.likes.user", "firstName lastName");

  const updatedComment = paper.comments.id(commentId);

  res.status(200).json({
    success: true,
    message: "Comment updated successfully",
    data: updatedComment,
  });
});

/**
 * @desc    Delete comment
 * @route   DELETE /api/papers/:id/comments/:commentId
 * @access  Private (Comment author or group owner)
 */
const deleteComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  const userId = req.user._id;

  const paper = await Paper.findById(id).populate("group");

  if (!paper) {
    return res.status(404).json({
      success: false,
      message: "Paper not found",
    });
  }

  const comment = paper.comments.id(commentId);
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  // Check if user can delete this comment
  const isCommentAuthor = comment.user.toString() === userId.toString();
  const isGroupOwner = paper.group.owner.toString() === userId.toString();

  if (!isCommentAuthor && !isGroupOwner) {
    return res.status(403).json({
      success: false,
      message:
        "You can only delete your own comments or you must be the group owner",
    });
  }

  // Delete comment
  await paper.deleteComment(commentId);

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});

/**
 * @desc    Like/Unlike comment
 * @route   POST /api/papers/:id/comments/:commentId/like
 * @access  Private (Group members only)
 */
const likeComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  const userId = req.user._id;

  const paper = await Paper.findById(id).populate("group");

  if (!paper) {
    return res.status(404).json({
      success: false,
      message: "Paper not found",
    });
  }

  const comment = paper.comments.id(commentId);
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  // Check if user has access to this paper
  const group = paper.group;
  const isMember = group.members.some(
    (member) => member.user.toString() === userId.toString()
  );
  const isOwner = group.owner.toString() === userId.toString();

  if (!isMember && !isOwner) {
    return res.status(403).json({
      success: false,
      message: "Only group members can like comments",
    });
  }

  // Toggle like
  await paper.toggleCommentLike(commentId, userId);

  // Populate likes
  await paper.populate("comments.likes.user", "firstName lastName");

  const updatedComment = paper.comments.id(commentId);

  res.status(200).json({
    success: true,
    message: "Comment like toggled successfully",
    data: {
      commentId: commentId,
      likes: updatedComment.likes,
      likeCount: updatedComment.likes.length,
    },
  });
});

module.exports = {
  getPapers,
  uploadPaper,
  getPaper,
  downloadPaper,
  deletePaper,
  addComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
};
