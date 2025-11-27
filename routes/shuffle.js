/**
 * Shuffle Admin Routes
 * Secure endpoints for shuffle operations
 */

import express from 'express';
import { performGlobalShuffle, getShuffleStats } from '../services/shuffleService.js';

const router = express.Router();

/**
 * Middleware to verify admin authorization
 * Uses ADMIN_API_KEY from environment variables (same as promo code routes)
 */
function verifyAdminAuth(req, res, next) {
  // Check for API key in header (x-api-key) or Authorization header
  const apiKey = req.headers['x-api-key'] || 
                 req.headers['X-API-Key'] ||
                 (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null);
  
  // Use ADMIN_API_KEY (same as promo code routes) or fallback to ADMIN_SECRET_KEY for backward compatibility
  const adminKey = process.env.ADMIN_API_KEY || process.env.ADMIN_SECRET_KEY;
  
  if (!adminKey) {
    console.error('❌ ADMIN_API_KEY or ADMIN_SECRET_KEY not configured in environment variables');
    return res.status(500).json({
      success: false,
      error: 'Admin authentication not configured'
    });
  }
  
  if (!apiKey || apiKey !== adminKey) {
    console.warn('⚠️ Unauthorized shuffle attempt:', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    });
    
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid admin API key'
    });
  }
  
  next();
}

/**
 * POST /admin/shuffle
 * Manually trigger a global shuffle
 * Requires admin authentication
 */
router.post('/admin/shuffle', verifyAdminAuth, async (req, res) => {
  try {
    console.log('🔐 Admin shuffle request received');
    
    const result = await performGlobalShuffle();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        shuffledCount: result.shuffledCount,
        batches: result.batches,
        duration: result.duration,
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        errorCode: result.errorCode
      });
    }
  } catch (error) {
    console.error('❌ Error in shuffle endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /admin/shuffle/stats
 * Get shuffle statistics
 * Requires admin authentication
 */
router.get('/admin/shuffle/stats', verifyAdminAuth, async (req, res) => {
  try {
    const stats = await getShuffleStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ Error getting shuffle stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /admin/shuffle/health
 * Health check for shuffle service
 * No authentication required (public health check)
 */
router.get('/admin/shuffle/health', async (req, res) => {
  try {
    const stats = await getShuffleStats();
    res.json({
      success: true,
      service: 'shuffle',
      status: 'operational',
      stats: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      service: 'shuffle',
      status: 'error',
      error: error.message
    });
  }
});

// Note: OPTIONS requests are handled by main server.js CORS middleware
// The main app.options('*') handler in server.js covers all routes including /admin/shuffle
// No need for route-specific OPTIONS handlers here

export default router;

