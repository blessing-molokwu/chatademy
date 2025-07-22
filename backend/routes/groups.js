const express = require("express");
const {
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
} = require("../controllers/groupController");

const {
  getDiscussions,
  createDiscussion,
} = require("../controllers/discussionController");

const { getPapers, uploadPaper } = require("../controllers/paperController");

// Middleware imports
const { protect } = require("../middleware/auth");
const {
  validateGroupData,
  validateObjectId,
  validatePagination,
  validateSearch,
} = require("../middleware/validation");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Public group routes
router.get("/", validatePagination, validateSearch, getGroups);

router.get("/my-groups", getMyGroups);

router.get("/:id", validateObjectId("id"), getGroup);

router.get("/:id/debug", validateObjectId("id"), debugGroupOwnership);

// Group management routes
router.post("/", validateGroupData, createGroup);

router.put("/:id", validateObjectId("id"), validateGroupData, updateGroup);

router.delete("/:id", validateObjectId("id"), deleteGroup);

// Group membership routes
router.post("/:id/join", validateObjectId("id"), joinGroup);

router.post("/:id/leave", validateObjectId("id"), leaveGroup);

// Member management routes
router.delete(
  "/:id/members/:memberId",
  validateObjectId("id"),
  validateObjectId("memberId"),
  removeMember
);

// Invitation routes
router.post("/:id/invite", validateObjectId("id"), sendInvitation);

router.get("/:id/invitations", validateObjectId("id"), getGroupInvitations);

// Public route for accepting invitations (no auth required)
router.post("/accept-invitation/:token", acceptInvitation);

// Discussion routes
router.get("/:id/discussions", validateObjectId("id"), getDiscussions);
router.post("/:id/discussions", validateObjectId("id"), createDiscussion);

// Paper routes
router.get("/:groupId/papers", validateObjectId("groupId"), getPapers);
router.post("/:groupId/papers", validateObjectId("groupId"), uploadPaper);

module.exports = router;
