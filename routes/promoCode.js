/**
 * Promo Code Routes
 * Endpoints for promo code management
 */

import express from 'express';
import {
  validatePromoCode,
  applyPromoCode,
  createPromoCode,
  bulkCreatePromoCodes,
  getAllPromoCodes,
  deletePromoCode,
  bulkDeletePromoCodes
} from '../services/promoCodeService.js';
import { promoCodeRateLimit } from '../middleware/security.js';
import { body, validationResult } from 'express-validator';
import { verifyAdminToken } from './admin.js';

const router = express.Router();

// Validate promo code (public endpoint)
// SECURITY: Apply rate limiting and input validation
router.post('/validate', 
  promoCodeRateLimit,
  [
    body('code')
      .trim()
      .notEmpty()
      .withMessage('Promo code is required')
      .isLength({ min: 1, max: 50 })
      .withMessage('Promo code must be 1-50 characters')
      .matches(/^[A-Z0-9-_]+$/i) // Case insensitive match - allows letters, numbers, hyphens, underscores
      .withMessage('Promo code must contain only letters, numbers, hyphens, and underscores'),
    body('originalAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Original amount must be a positive number'),
    body('userEmail')
      .optional()
      .custom((value) => {
        // If provided, must be a valid email; if empty/null/undefined, skip validation
        if (!value || value.trim().length === 0) {
          return true; // Skip validation for empty values
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      })
      .withMessage('Invalid email format'),
    body('businessName')
      .optional()
      .custom((value) => {
        // If provided, must be valid length; if empty/null/undefined, skip validation
        if (!value || value.trim().length === 0) {
          return true; // Skip validation for empty values
        }
        return value.trim().length <= 200;
      })
      .withMessage('Business name must be less than 200 characters')
  ],
  async (req, res) => {
    try {
      console.log('📝 Promo code validation request:', {
        body: req.body,
        code: req.body?.code,
        codeType: typeof req.body?.code
      });
      
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          valid: false,
          error: errors.array()[0].msg,
          details: errors.array()
        });
      }
      
      const { code, originalAmount, userEmail, businessName } = req.body;
      
      // Sanitize input - handle empty/null codes
      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return res.status(400).json({
          success: false,
          valid: false,
          error: 'Promo code is required'
        });
      }
      
      const sanitizedCode = code.trim().toUpperCase();
      const sanitizedAmount = Math.max(0, parseFloat(originalAmount) || 0);
      // Handle email - only sanitize if it's a non-empty string
      const sanitizedEmail = (userEmail && typeof userEmail === 'string' && userEmail.trim().length > 0) 
        ? userEmail.trim().toLowerCase() 
        : null;
      // Handle business name - only sanitize if it's a non-empty string
      const sanitizedBusinessName = (businessName && typeof businessName === 'string' && businessName.trim().length > 0)
        ? businessName.trim()
        : null;
      
      console.log('🔍 Validating promo code:', {
        sanitizedCode,
        sanitizedAmount,
        sanitizedEmail,
        sanitizedBusinessName
      });
      
      const result = await validatePromoCode(sanitizedCode, sanitizedAmount, sanitizedEmail, sanitizedBusinessName);
      
      console.log('✅ Validation result:', {
        success: result.success,
        valid: result.valid,
        error: result.error
      });
      
      // Return appropriate HTTP status code based on validation result
      if (!result.valid || !result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ Error validating promo code:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        valid: false,
        error: 'Error validating promo code',
        message: error.message
      });
    }
  }
);

// Apply promo code (increment usage)
router.post('/apply', 
  [
    body('promoId')
      .trim()
      .notEmpty()
      .withMessage('Promo ID is required'),
    body('userEmail')
      .optional()
      .isEmail()
      .withMessage('Invalid email format'),
    body('businessName')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Business name must be less than 200 characters')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }
      
      const { promoId, userEmail, businessName, originalAmount, finalAmount, discountAmount, transactionId } = req.body;
      
      // Sanitize input
      const sanitizedEmail = userEmail ? userEmail.trim().toLowerCase() : null;
      const sanitizedBusinessName = businessName ? businessName.trim() : null;
      
      // Use transactionId for idempotency (prevents double counting)
      // If not provided, generate one from promoId + user identifier + timestamp
      const idempotencyKey = transactionId || 
        (promoId + '_' + (sanitizedEmail || sanitizedBusinessName || 'anonymous') + '_' + Date.now());
      
      const result = await applyPromoCode(promoId, sanitizedEmail, sanitizedBusinessName, {
        originalAmount,
        finalAmount,
        discountAmount
      }, idempotencyKey);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ Error applying promo code:', error);
      res.status(500).json({
        success: false,
        error: 'Error applying promo code'
      });
    }
  }
);

// Create single reusable promo code (admin only)
// Creates one code that can be used a specified number of times, with one use per user
// Example: POST /api/promo-code/create
// Body: { code: "PROMO10", discountType: "fixed", discountValue: 10, maxUses: 220 }
// Note: maxUses is required and can be any positive number (one code per user across all codes)
router.post('/create', verifyAdminToken, async (req, res) => {
  try {
    // Use maxUses from request body, default to 220 if not provided
    const promoData = {
      ...req.body,
      maxUses: req.body.maxUses !== undefined ? req.body.maxUses : 220
    };
    
    const result = await createPromoCode(promoData);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error creating promo code:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating promo code'
    });
  }
});

// List all promo codes (admin only)
router.get('/list', verifyAdminToken, async (req, res) => {
  try {
    const result = await getAllPromoCodes();
    res.json(result);
  } catch (error) {
    console.error('❌ Error getting promo codes:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting promo codes',
      promoCodes: [],
      count: 0
    });
  }
});

// Delete single promo code (admin only)
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deletePromoCode(id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error deleting promo code:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting promo code'
    });
  }
});

// Bulk delete promo codes (admin only)
router.post('/bulk-delete', verifyAdminToken, async (req, res) => {
  try {
    const { promoIds } = req.body;
    
    if (!Array.isArray(promoIds) || promoIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'promoIds array is required'
      });
    }
    
    const result = await bulkDeletePromoCodes(promoIds);
    res.json(result);
  } catch (error) {
    console.error('❌ Error bulk deleting promo codes:', error);
    res.status(500).json({
      success: false,
      error: 'Error bulk deleting promo codes'
    });
  }
});

export default router;

