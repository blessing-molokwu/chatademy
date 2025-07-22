/**
 * Validation utilities for Research Hub
 */

/**
 * Validate registration data
 * @param {object} data - Registration data
 * @returns {object} Validation result
 */
const validateRegistration = (data) => {
  const errors = [];
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    institution,
    fieldOfStudy,
    academicLevel,
  } = data;

  // Required fields
  if (!firstName?.trim()) errors.push("First name is required");
  if (!lastName?.trim()) errors.push("Last name is required");
  if (!email?.trim()) errors.push("Email is required");
  if (!password) errors.push("Password is required");
  if (!confirmPassword) errors.push("Password confirmation is required");
  if (!institution?.trim()) errors.push("Institution is required");
  if (!fieldOfStudy?.trim()) errors.push("Field of study is required");
  if (!academicLevel) errors.push("Academic level is required");

  // Email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (email && !emailRegex.test(email)) {
    errors.push("Please enter a valid email address");
  }

  // Password confirmation
  if (password && confirmPassword && password !== confirmPassword) {
    errors.push("Passwords do not match");
  }

  // Name length
  if (firstName && firstName.trim().length > 50) {
    errors.push("First name cannot exceed 50 characters");
  }
  if (lastName && lastName.trim().length > 50) {
    errors.push("Last name cannot exceed 50 characters");
  }

  // Institution length
  if (institution && institution.trim().length > 100) {
    errors.push("Institution name cannot exceed 100 characters");
  }

  // Field of study length
  if (fieldOfStudy && fieldOfStudy.trim().length > 100) {
    errors.push("Field of study cannot exceed 100 characters");
  }

  // Academic level validation
  const validLevels = [
    "undergraduate",
    "graduate",
    "phd",
    "postdoc",
    "faculty",
    "researcher",
  ];
  if (academicLevel && !validLevels.includes(academicLevel)) {
    errors.push("Invalid academic level");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate login data
 * @param {object} data - Login data
 * @returns {object} Validation result
 */
const validateLogin = (data) => {
  const errors = [];
  const { email, password } = data;

  if (!email?.trim()) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  // Email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (email && !emailRegex.test(email)) {
    errors.push("Please enter a valid email address");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate profile update data
 * @param {object} data - Profile data
 * @returns {object} Validation result
 */
const validateProfileUpdate = (data) => {
  const errors = [];
  const {
    firstName,
    lastName,
    bio,
    phone,
    department,
    graduationYear,
    researchInterests,
    skills,
    socialLinks,
  } = data;

  // Optional field validations
  if (firstName && firstName.trim().length > 50) {
    errors.push("First name cannot exceed 50 characters");
  }
  if (lastName && lastName.trim().length > 50) {
    errors.push("Last name cannot exceed 50 characters");
  }
  if (bio && bio.length > 500) {
    errors.push("Bio cannot exceed 500 characters");
  }
  if (department && department.trim().length > 100) {
    errors.push("Department name cannot exceed 100 characters");
  }

  // Graduation year validation
  const currentYear = new Date().getFullYear();
  if (
    graduationYear &&
    (graduationYear < 1900 || graduationYear > currentYear + 10)
  ) {
    errors.push("Invalid graduation year");
  }

  // Research interests validation
  if (researchInterests && Array.isArray(researchInterests)) {
    researchInterests.forEach((interest, index) => {
      if (typeof interest !== "string" || interest.trim().length > 50) {
        errors.push(
          `Research interest ${index + 1} cannot exceed 50 characters`
        );
      }
    });
    if (researchInterests.length > 10) {
      errors.push("Cannot have more than 10 research interests");
    }
  }

  // Skills validation
  if (skills && Array.isArray(skills)) {
    skills.forEach((skill, index) => {
      if (typeof skill !== "string" || skill.trim().length > 30) {
        errors.push(`Skill ${index + 1} cannot exceed 30 characters`);
      }
    });
    if (skills.length > 15) {
      errors.push("Cannot have more than 15 skills");
    }
  }

  // Social links validation
  if (socialLinks && typeof socialLinks === "object") {
    const urlRegex = /^https?:\/\/.+/;
    Object.entries(socialLinks).forEach(([platform, url]) => {
      if (
        url &&
        typeof url === "string" &&
        url.trim() !== "" &&
        !urlRegex.test(url)
      ) {
        errors.push(
          `${platform} must be a valid URL starting with http:// or https://`
        );
      }
    });
  }

  // Phone validation (basic)
  if (phone && phone.trim() !== "") {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""))) {
      errors.push("Please enter a valid phone number");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate password change data
 * @param {object} data - Password change data
 * @returns {object} Validation result
 */
const validatePasswordChange = (data) => {
  const errors = [];
  const { currentPassword, newPassword, confirmPassword } = data;

  if (!currentPassword) errors.push("Current password is required");
  if (!newPassword) errors.push("New password is required");
  if (!confirmPassword) errors.push("Password confirmation is required");

  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    errors.push("New passwords do not match");
  }

  if (newPassword && newPassword.length < 6) {
    errors.push("New password must be at least 6 characters long");
  }

  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push("New password must be different from current password");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize user input
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
};

/**
 * Sanitize object with string values
 * @param {object} obj - Object to sanitize
 * @returns {object} Sanitized object
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  const sanitized = {};
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "string") {
      sanitized[key] = sanitizeInput(obj[key]);
    } else if (Array.isArray(obj[key])) {
      sanitized[key] = obj[key].map((item) =>
        typeof item === "string" ? sanitizeInput(item) : item
      );
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  });

  return sanitized;
};

/**
 * Validate group creation/update data
 * @param {object} data - Group data
 * @returns {object} Validation result
 */
const validateGroup = (data) => {
  const errors = [];
  const { name, description, fieldOfStudy } = data;

  // Required fields
  if (!name?.trim()) errors.push("Group name is required");
  if (!description?.trim()) errors.push("Group description is required");

  // Length validations
  if (name && name.trim().length > 100) {
    errors.push("Group name cannot exceed 100 characters");
  }
  if (description && description.length > 500) {
    errors.push("Description cannot exceed 500 characters");
  }
  if (fieldOfStudy && fieldOfStudy.trim().length > 100) {
    errors.push("Field of study cannot exceed 100 characters");
  }

  // Name format validation
  if (name && name.trim().length < 3) {
    errors.push("Group name must be at least 3 characters long");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateGroup,
  sanitizeInput,
  sanitizeObject,
};
