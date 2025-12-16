/**
 * Shuffle Routes
 * Admin endpoints for shuffle management
 */

import express from 'express';
import { performGlobalShuffle, getShuffleStats } from '../services/shuffleService.js';
import { verifyAdminToken } from './admin.js';

const router = express.Router();

// Get shuffle statistics
router.get('/admin/shuffle/stats', verifyAdminToken, async (req, res) => {
  try {
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
});

// Trigger shuffle
router.post('/admin/shuffle', verifyAdminToken, async (req, res) => {
  try {
    console.log('🔄 Shuffle request received');
    const result = await performGlobalShuffle();
    res.json(result);
  } catch (error) {
    console.error('❌ Shuffle error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error performing shuffle'
    });
  }
});

export default router;

