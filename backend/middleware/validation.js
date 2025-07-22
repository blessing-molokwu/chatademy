const {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateGroup,
  sanitizeObject,
} = require("../utils/validation");

/**
 * Middleware to validate registration data
 */
const validateRegisterData = (req, res, next) => {
  // Sanitize input
  req.body = sanitizeObject(req.body);

  const validation = validateRegistration(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.errors,
    });
  }

  next();
};

/**
 * Middleware to validate login data
 */
const validateLoginData = (req, res, next) => {
  // Sanitize input
  req.body = sanitizeObject(req.body);

  const validation = validateLogin(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.errors,
    });
  }

  next();
};

/**
 * Middleware to validate profile update data
 */
const validateProfileData = (req, res, next) => {
  // Sanitize input
  req.body = sanitizeObject(req.body);

  const validation = validateProfileUpdate(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.errors,
    });
  }

  next();
};

/**
 * Middleware to validate password change data
 */
const validatePasswordData = (req, res, next) => {
  // Sanitize input
  req.body = sanitizeObject(req.body);

  const validation = validatePasswordChange(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.errors,
    });
  }

  next();
};

/**
 * General sanitization middleware
 */
const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Middleware to validate MongoDB ObjectId
 */
const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const mongoose = require("mongoose");
    const id = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    next();
  };
};

/**
 * Middleware to validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

  // Validate page
  const pageNum = parseInt(page);
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: "Page must be a positive number",
    });
  }

  // Validate limit
  const limitNum = parseInt(limit);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      message: "Limit must be between 1 and 100",
    });
  }

  // Validate sort
  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "firstName",
    "lastName",
    "email",
    "institution",
  ];
  const sortField = sort.replace(/^-/, ""); // Remove - prefix

  if (!allowedSortFields.includes(sortField)) {
    return res.status(400).json({
      success: false,
      message: "Invalid sort field",
    });
  }

  // Add validated values to request
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    sort: sort,
  };

  next();
};

/**
 * Middleware to validate search parameters
 */
const validateSearch = (req, res, next) => {
  const { q, fields } = req.query;

  if (q && typeof q !== "string") {
    return res.status(400).json({
      success: false,
      message: "Search query must be a string",
    });
  }

  if (q && q.length < 2) {
    return res.status(400).json({
      success: false,
      message: "Search query must be at least 2 characters long",
    });
  }

  if (q && q.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Search query cannot exceed 100 characters",
    });
  }

  // Validate fields if provided
  if (fields) {
    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "institution",
      "fieldOfStudy",
      "bio",
    ];
    const searchFields = fields.split(",");

    const invalidFields = searchFields.filter(
      (field) => !allowedFields.includes(field.trim())
    );
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid search fields: ${invalidFields.join(", ")}`,
      });
    }
  }

  next();
};

/**
 * Middleware to validate group data
 */
const validateGroupData = (req, res, next) => {
  // Sanitize input
  req.body = sanitizeObject(req.body);

  const validation = validateGroup(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.errors,
    });
  }

  next();
};

module.exports = {
  validateRegisterData,
  validateLoginData,
  validateProfileData,
  validatePasswordData,
  validateGroupData,
  sanitizeRequest,
  validateObjectId,
  validatePagination,
  validateSearch,
};
