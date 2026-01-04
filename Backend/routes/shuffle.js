/**
 * Shuffle Routes
 * Admin endpoints for shuffle management
 * 
 * SECURITY: All endpoints are protected by:
 * 1. Admin authentication (verifyAdminToken)
 * 2. Rate limiting (shuffleRateLimit)
 * 3. Input validation (reject any parameters)
 * 4. Operation logging (audit trail)
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { performGlobalShuffle, getShuffleStats } from '../services/shuffleService.js';
import { verifyAdminToken } from './admin.js';
import { shuffleRateLimit } from '../middleware/security.js';

const router = express.Router();

// In-memory cooldown tracker (prevents rapid successive shuffles)
// In production, consider using Redis or database for distributed systems
const shuffleCooldown = new Map(); // IP -> last shuffle timestamp
const SHUFFLE_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes minimum between manual shuffles

/**
 * Check if shuffle is in cooldown period
 * @param {string} ip - Client IP address
 * @returns {{inCooldown: boolean, timeRemaining?: number}}
 */
function checkShuffleCooldown(ip) {
  const lastShuffle = shuffleCooldown.get(ip);
  if (!lastShuffle) {
    return { inCooldown: false };
  }
  
  const timeSinceLastShuffle = Date.now() - lastShuffle;
  if (timeSinceLastShuffle < SHUFFLE_COOLDOWN_MS) {
    const timeRemaining = Math.ceil((SHUFFLE_COOLDOWN_MS - timeSinceLastShuffle) / 1000);
    return { inCooldown: true, timeRemaining };
  }
  
  return { inCooldown: false };
}

/**
 * Record shuffle operation for cooldown tracking
 * @param {string} ip - Client IP address
 */
function recordShuffle(ip) {
  shuffleCooldown.set(ip, Date.now());
  
  // Clean up old entries (older than cooldown period)
  // Keep map size manageable
  if (shuffleCooldown.size > 1000) {
    const now = Date.now();
    for (const [key, value] of shuffleCooldown.entries()) {
      if (now - value > SHUFFLE_COOLDOWN_MS) {
        shuffleCooldown.delete(key);
      }
    }
  }
}

/**
 * Get client IP for cooldown tracking
 * @param {Request} req - Express request object
 * @returns {string} - Client IP
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         'unknown';
}

// Get shuffle statistics
router.get('/admin/shuffle/stats', 
  shuffleRateLimit, // Rate limiting
  verifyAdminToken, // Admin authentication
  async (req, res) => {
    try {
      // SECURITY: Reject any query parameters (prevent manipulation)
      if (Object.keys(req.query).length > 0) {
        console.warn(`⚠️ Suspicious query parameters in shuffle stats request from ${getClientIP(req)}:`, req.query);
        return res.status(400).json({
          success: false,
          error: 'Invalid request: Query parameters are not allowed'
        });
      }
      
      // SECURITY: Log access to shuffle stats (audit trail)
      console.log(`📊 Shuffle stats requested by admin (IP: ${getClientIP(req)}, Time: ${new Date().toISOString()})`);
      
      const stats = await getShuffleStats();
      res.json(stats);
    } catch (error) {
      console.error('❌ Error getting shuffle stats:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error getting shuffle stats',
        totalPurchases: 0,
        shuffledPurchases: 0,
        lastShuffle: null,
        shuffleInterval: '2 hours'
      });
    }
  }
);

// Trigger shuffle
router.post('/admin/shuffle',
  shuffleRateLimit, // Rate limiting (5 per hour)
  verifyAdminToken, // Admin authentication
  [
    // SECURITY: Explicitly reject any body parameters (prevent manipulation)
    // Even though we don't use them, we validate that none are sent
    body('*').custom((value, { path }) => {
      // Reject any body parameters
      throw new Error(`Invalid parameter: ${path}. Shuffle endpoint does not accept any parameters.`);
    }).optional()
  ],
  async (req, res) => {
    try {
      // SECURITY: Validate no body parameters were sent
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const ip = getClientIP(req);
        console.warn(`⚠️ Suspicious parameters in shuffle request from ${ip}:`, req.body);
        return res.status(400).json({
          success: false,
          error: 'Invalid request: Shuffle endpoint does not accept any parameters. Attempted manipulation detected.',
          details: errors.array()
        });
      }
      
      // SECURITY: Check cooldown period (prevent rapid successive shuffles)
      const ip = getClientIP(req);
      const cooldownCheck = checkShuffleCooldown(ip);
      if (cooldownCheck.inCooldown) {
        console.warn(`⏱️ Shuffle cooldown active for IP ${ip}. Time remaining: ${cooldownCheck.timeRemaining}s`);
        return res.status(429).json({
          success: false,
          error: 'Shuffle is in cooldown period',
          message: `Please wait ${cooldownCheck.timeRemaining} seconds before triggering another shuffle. This prevents manipulation and abuse.`,
          cooldownRemaining: cooldownCheck.timeRemaining,
          cooldownPeriod: SHUFFLE_COOLDOWN_MS / 1000
        });
      }
      
      // SECURITY: Log shuffle operation (audit trail)
      const adminEmail = req.user?.email || 'unknown';
      console.log(`🔄 Shuffle request received from admin (Email: ${adminEmail}, IP: ${ip}, Time: ${new Date().toISOString()})`);
      console.log(`🔄 Request body keys: ${Object.keys(req.body).length} (should be 0)`);
      
      // SECURITY: Perform shuffle (seed is generated server-side, cannot be manipulated)
      const result = await performGlobalShuffle();
      
      // SECURITY: Record shuffle for cooldown tracking
      recordShuffle(ip);
      
      // SECURITY: Log successful shuffle completion
      console.log(`✅ Shuffle completed successfully (Admin: ${adminEmail}, IP: ${ip}, Shuffled: ${result.shuffledCount || 0}, Seed: ${result.seed || 'N/A'})`);
      
      res.json(result);
    } catch (error) {
      const ip = getClientIP(req);
      console.error(`❌ Shuffle error (IP: ${ip}):`, error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error performing shuffle'
      });
    }
  }
);

export default router;

