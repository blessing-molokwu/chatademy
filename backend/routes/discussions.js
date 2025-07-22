const express = require("express");
const {
  getDiscussions,
  getDiscussion,
  createDiscussion,
  createReply,
} = require("../controllers/discussionController");

// Middleware imports
const { protect } = require("../middleware/auth");
const { validateObjectId } = require("../middleware/validation");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Discussion routes
router.get("/:id", validateObjectId("id"), getDiscussion);
router.post("/:id/replies", validateObjectId("id"), createReply);

module.exports = router;
