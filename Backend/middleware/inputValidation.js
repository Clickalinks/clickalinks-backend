/**
 * Input Validation Middleware
 * Validates and sanitizes user inputs to prevent injection attacks
 */

import { body, param, query, validationResult } from 'express-validator';

// Sanitize string inputs
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, ''); // Remove potential HTML/script tags
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate URL format
export const validateURL = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Validate square number (1-2000)
export const validateSquareNumber = (num) => {
  const squareNum = parseInt(num, 10);
  return !isNaN(squareNum) && squareNum >= 1 && squareNum <= 2000;
};

// Validate page number (1-10)
export const validatePageNumber = (num) => {
  const pageNum = parseInt(num, 10);
  return !isNaN(pageNum) && pageNum >= 1 && pageNum <= 10;
};

// Validate duration (1-365 days)
export const validateDuration = (num) => {
  const duration = parseInt(num, 10);
  return !isNaN(duration) && duration >= 1 && duration <= 365;
};

// Validate amount (positive number)
export const validateAmount = (num) => {
  const amount = parseFloat(num);
  return !isNaN(amount) && amount >= 0 && amount <= 10000; // Max £10,000
};

// Validation middleware for checkout session
export const validateCheckoutSession = [
  body('amount')
    .isFloat({ min: 0.01, max: 10000 })
    .withMessage('Amount must be between £0.01 and £10,000'),
  body('squareNumber')
    .isInt({ min: 1, max: 2000 })
    .withMessage('Square number must be between 1 and 2000'),
  body('duration')
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration must be between 1 and 365 days'),
  body('contactEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address is required'),
  body('pageNumber')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Page number must be between 1 and 10'),
  body('website')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Website must be a valid HTTP/HTTPS URL'),
  body('businessName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Business name must be 1-200 characters')
];

// Validation middleware for promo code
export const validatePromoCodeInput = [
  body('code')
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[A-Z0-9-_]+$/)
    .withMessage('Promo code must be 1-50 characters and contain only letters, numbers, hyphens, and underscores'),
  body('originalAmount')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Original amount must be between 0 and 10,000')
];

// Validation middleware for file upload
export const validateFileUpload = [
  body('fileData')
    .notEmpty()
    .withMessage('File data is required'),
  body('fileName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('File name must be 1-255 characters')
];

// Middleware to check validation results
export const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

