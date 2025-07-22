const express = require("express");
const {
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
} = require("../controllers/paperController");

// Middleware imports
const { protect } = require("../middleware/auth");
const { validateObjectId } = require("../middleware/validation");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Paper routes
router.get("/:id", validateObjectId("id"), getPaper);
router.get("/:id/download", validateObjectId("id"), downloadPaper);
router.delete("/:id", validateObjectId("id"), deletePaper);

// Comment routes
router.get("/:id/comments", validateObjectId("id"), getComments);
router.post("/:id/comments", validateObjectId("id"), addComment);
router.put(
  "/:id/comments/:commentId",
  validateObjectId("id"),
  validateObjectId("commentId"),
  updateComment
);
router.delete(
  "/:id/comments/:commentId",
  validateObjectId("id"),
  validateObjectId("commentId"),
  deleteComment
);
router.post(
  "/:id/comments/:commentId/like",
  validateObjectId("id"),
  validateObjectId("commentId"),
  likeComment
);

module.exports = router;
