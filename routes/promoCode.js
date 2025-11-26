/**
 * Promo Code Routes
 * API endpoints for promo code validation and management
 */

import express from 'express';
import cors from 'cors';
import {
  validatePromoCode,
  applyPromoCode,
  createPromoCode,
  bulkCreatePromoCodes,
  getAllPromoCodes
} from '../services/promoCodeService.js';

console.log('🔄 Promo code routes module loaded');
console.log('✅ Promo code service functions imported:', {
  validatePromoCode: typeof validatePromoCode,
  applyPromoCode: typeof applyPromoCode,
  createPromoCode: typeof createPromoCode,
  bulkCreatePromoCodes: typeof bulkCreatePromoCodes,
  getAllPromoCodes: typeof getAllPromoCodes
});

const router = express.Router();

// CORS configuration for promo code routes
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://clickalinks-frontend.web.app',
    'https://clickalinks-frontend.firebaseapp.com',
    'https://clickalinks-frontend-1.onrender.com',
    'https://www.clickalinks.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'X-API-Key'],
  exposedHeaders: ['x-api-key', 'X-API-Key'],
  optionsSuccessStatus: 204
};

// Apply CORS to all promo code routes
router.use(cors(corsOptions));

// Handle OPTIONS requests explicitly
router.options('*', cors(corsOptions));

console.log('✅ Promo code router created');

/**
 * POST /api/promo-code/validate
 * Validate a promo code
 * Body: { code: string, originalAmount?: number }
 */
router.post('/validate', async (req, res) => {
  try {
    const { code, originalAmount = 0 } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Promo code is required'
      });
    }

    const result = await validatePromoCode(code, originalAmount);

    if (result.valid) {
      res.json({
        success: true,
        valid: true,
        ...result
      });
    } else {
      res.status(400).json({
        success: false,
        valid: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error validating promo code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/promo-code/apply
 * Apply/use a promo code (increment usage)
 * Body: { code: string, purchaseId: string }
 */
router.post('/apply', async (req, res) => {
  try {
    const { code, purchaseId } = req.body;

    if (!code || !purchaseId) {
      return res.status(400).json({
        success: false,
        error: 'Code and purchaseId are required'
      });
    }

    const result = await applyPromoCode(code, purchaseId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('❌ Error applying promo code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/promo-code/create
 * Create a new promo code (admin only)
 * Requires ADMIN_API_KEY in header
 */
router.post('/create', async (req, res) => {
  try {
    // Basic admin authentication
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid API Key'
      });
    }

    const result = await createPromoCode(req.body);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('❌ Error creating promo code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/promo-code/bulk-create
 * Bulk create promo codes (for campaigns)
 * Requires ADMIN_API_KEY in header
 * Body: { count: number, prefix: string, discountType: string, discountValue: number, ... }
 */
router.post('/bulk-create', async (req, res) => {
  try {
    // Basic admin authentication
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid API Key'
      });
    }

    const result = await bulkCreatePromoCodes(req.body);

    res.json(result);

  } catch (error) {
    console.error('❌ Error bulk creating promo codes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/promo-code/list
 * Get all promo codes (admin only)
 * Requires ADMIN_API_KEY in header
 */
router.get('/list', async (req, res) => {
  try {
    // Basic admin authentication
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid API Key'
      });
    }

    const filters = {
      active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined
    };

    const result = await getAllPromoCodes(filters);

    res.json(result);

  } catch (error) {
    console.error('❌ Error getting promo codes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

console.log('✅ All promo code routes defined, exporting router...');
export default router;

