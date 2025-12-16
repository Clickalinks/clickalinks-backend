/**
 * Promo Code Service
 * Clean implementation for promo code management
 */

import admin from '../config/firebaseAdmin.js';

// Get Firestore instance lazily to ensure Firebase Admin is initialized
const getDb = () => {
  try {
    return admin.firestore();
  } catch (error) {
    console.error('❌ Error getting Firestore instance:', error);
    throw new Error('Firebase Admin not initialized. Check Firebase configuration.');
  }
};

const COLLECTION_NAME = 'promoCodes';

/**
 * Validate a promo code
 * 
 * @param {string} code - Promo code to validate
 * @param {number} originalAmount - Original amount before discount
 * @param {string} userEmail - User's email address (for tracking)
 * @param {string} businessName - Business name (for tracking, optional)
 * @returns {Promise<Object>} - Validation result
 */
export async function validatePromoCode(code, originalAmount, userEmail = null, businessName = null) {
  try {
    if (!code || typeof code !== 'string') {
      return {
        success: false,
        valid: false,
        error: 'Invalid promo code format'
      };
    }
    
    const codeUpper = code.trim().toUpperCase();
    const db = getDb();
    
    console.log(`🔍 Searching for promo code: "${codeUpper}"`);
    
    // CRITICAL: Find ALL codes with matching name, then find one that's available
    // This handles cases where multiple codes share the same name (like "FREEADS")
    let allMatchingPromos = await db.collection(COLLECTION_NAME)
      .where('code', '==', codeUpper)
      .where('status', '==', 'active')
      .get();
    
    console.log(`📊 Found ${allMatchingPromos.size} codes with name "${codeUpper}"`);
    
    // If no exact match, try prefix matching (e.g., "PROMO10" matches "PROMO10-XXXXX")
    if (allMatchingPromos.empty) {
      console.log('🔍 Trying prefix matching...');
      const allPromosSnapshot = await db.collection(COLLECTION_NAME)
        .where('status', '==', 'active')
        .get();
      
      console.log(`📊 Found ${allPromosSnapshot.size} active promo codes in database`);
      
      const matchingPromos = allPromosSnapshot.docs.filter(doc => {
        const promoCode = doc.data().code || '';
        return promoCode.startsWith(codeUpper) || codeUpper.startsWith(promoCode.split('-')[0]);
      });
      
      if (matchingPromos.length > 0) {
        allMatchingPromos = {
          docs: matchingPromos,
          empty: false,
          size: matchingPromos.length
        };
        console.log(`✅ Prefix match found: ${matchingPromos.length} codes match "${codeUpper}"`);
      } else {
        // Log first few codes for debugging
        const sampleCodes = allPromosSnapshot.docs.slice(0, 5).map(doc => doc.data().code);
        console.log(`❌ No prefix match found. Sample codes in DB:`, sampleCodes);
      }
    }
    
    if (allMatchingPromos.empty) {
      console.log(`❌ Promo code "${codeUpper}" not found in database`);
      return {
        success: false,
        valid: false,
        error: `Promo code "${codeUpper}" not found. Please check the code and try again.`
      };
    }
    
    // CRITICAL: Find an available code (one that hasn't reached its usage limit)
    // Also check if user/company has already used ANY promo code (one code per user across all codes)
    let availablePromo = null;
    const userIdentifier = userEmail ? userEmail.toLowerCase().trim() : (businessName ? businessName.toLowerCase().trim() : null);
    
    // CRITICAL: Check if user has already used ANY promo code (one code per user)
    if (userIdentifier) {
      const allPromosSnapshot = await db.collection(COLLECTION_NAME)
        .where('status', '==', 'active')
        .get();
      
      const userHasUsedAnyCode = allPromosSnapshot.docs.some(doc => {
        const promoData = doc.data();
        const usedBy = promoData.usedBy || [];
        return usedBy.includes(userIdentifier);
      });
      
      if (userHasUsedAnyCode) {
        console.log(`⏭️ User/company "${userIdentifier}" has already used a promo code (one code per user)`);
        return {
          success: false,
          valid: false,
          error: 'You have already used a promo code. Only one promo code can be used per user/company.'
        };
      }
    }
    
    for (const doc of allMatchingPromos.docs) {
      const promoData = doc.data();
      const currentUses = promoData.currentUses || 0;
      const maxUses = promoData.maxUses || Infinity;
      
      // Check if this specific code has reached its limit
      if (currentUses >= maxUses) {
        console.log(`⏭️ Code ${doc.id} has reached usage limit (${currentUses}/${maxUses})`);
        continue;
      }
      
      // This code is available!
      availablePromo = { doc, data: promoData, id: doc.id };
      console.log(`✅ Found available code: ${doc.id} (${currentUses}/${maxUses} uses)`);
      break;
    }
    
    if (!availablePromo) {
      console.log(`❌ No available promo codes found for "${codeUpper}"`);
      return {
        success: false,
        valid: false,
        error: 'This promo code has reached its usage limit (220 uses).'
      };
    }
    
    const promoData = availablePromo.data;
    const promoId = availablePromo.id;
    
    // Check expiration
    if (promoData.expiresAt) {
      const expiresAt = promoData.expiresAt.toDate ? promoData.expiresAt.toDate() : new Date(promoData.expiresAt);
      if (expiresAt < new Date()) {
        return {
          success: false,
          valid: false,
          error: 'Promo code has expired'
        };
      }
    }
    
    // Check usage limits (total uses across all users)
    const currentUses = promoData.currentUses || 0;
    const maxUses = promoData.maxUses || Infinity;
    
    if (currentUses >= maxUses) {
      return {
        success: false,
        valid: false,
        error: 'Promo code has reached its usage limit'
      };
    }
    
    // Note: User/company check is already done above when finding available code
    // This ensures we only validate codes that the user hasn't used yet
    
    // CRITICAL: Ensure discount is always exactly £10 fixed
    // Override any other discount type to ensure consistency
    const FIXED_DISCOUNT_AMOUNT = 10;
    let discountAmount = Math.min(FIXED_DISCOUNT_AMOUNT, originalAmount);
    let finalAmount = Math.max(0, originalAmount - discountAmount);
    let freeDays = 0;
    
    // Calculate discount - always use fixed £10 discount
    // Note: We're enforcing £10 discount regardless of promoData.discountType
    // This ensures all promo codes give exactly £10 off
    
    console.log('✅ Promo code validated successfully:', {
      code: promoData.code,
      promoId: promoId,
      originalAmount: originalAmount,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      currentUses: currentUses,
      maxUses: maxUses
    });
    
    return {
      success: true,
      valid: true,
      code: promoData.code,
      promoId: promoId,
      discountType: 'fixed',
      discountValue: FIXED_DISCOUNT_AMOUNT,
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100,
      freeDays: freeDays,
      description: promoData.description || '£10 discount applied'
    };
    
  } catch (error) {
    console.error('❌ Error validating promo code:', error);
    return {
      success: false,
      valid: false,
      error: 'Error validating promo code'
    };
  }
}

/**
 * Apply a promo code (increment usage and track user/company)
 * CRITICAL: Uses Firestore transaction to prevent double-counting
 * 
 * @param {string} promoId - Promo code document ID
 * @param {string} userEmail - User's email address (for tracking)
 * @param {string} businessName - Business name (for tracking, optional)
 * @param {Object} purchaseInfo - Optional purchase information for admin notification
 * @param {string} transactionId - Optional transaction ID for idempotency (prevents double counting)
 * @returns {Promise<Object>} - Application result
 */
export async function applyPromoCode(promoId, userEmail = null, businessName = null, purchaseInfo = {}, transactionId = null) {
  try {
    const db = getDb();
    const promoRef = db.collection(COLLECTION_NAME).doc(promoId);
    
    // Use Firestore transaction to atomically check and update (prevents race conditions)
    let alreadyApplied = false;
    let promoData = null;
    
    try {
      await db.runTransaction(async (transaction) => {
        const promoDoc = await transaction.get(promoRef);
        
        if (!promoDoc.exists) {
          throw new Error('Promo code not found');
        }
        
        promoData = promoDoc.data();
        const currentUses = promoData.currentUses || 0;
        const maxUses = promoData.maxUses || Infinity;
        
        if (currentUses >= maxUses) {
          throw new Error('Promo code has reached its usage limit');
        }
        
        // Get identifier for user/company tracking
        const identifier = (userEmail || businessName) 
          ? (userEmail ? userEmail.toLowerCase().trim() : businessName.toLowerCase().trim())
          : null;
        
        // CRITICAL: Check for idempotency using transactionId if provided
        // This prevents the same purchase from incrementing the counter twice
        if (transactionId) {
          const appliedTransactions = promoData.appliedTransactions || [];
          if (appliedTransactions.includes(transactionId)) {
            // This transaction ID has already been processed - mark as already applied
            alreadyApplied = true;
            return; // Exit transaction without updating
          }
        }
        
        // Check if this user/company has already used this code
        if (identifier) {
          const usedBy = promoData.usedBy || [];
          if (usedBy.includes(identifier)) {
            throw new Error('You have already used this promo code. Each code can only be used once per company/person.');
          }
        }
        
        // Prepare update data
        const updateData = {
          currentUses: admin.firestore.FieldValue.increment(1),
          lastUsedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Add user/company to usedBy array
        if (identifier) {
          updateData.usedBy = admin.firestore.FieldValue.arrayUnion(identifier);
        }
        
        // Add transaction ID to appliedTransactions for idempotency
        if (transactionId) {
          updateData.appliedTransactions = admin.firestore.FieldValue.arrayUnion(transactionId);
        }
        
        // Atomically update in transaction
        transaction.update(promoRef, updateData);
      });
    } catch (transactionError) {
      // Re-throw to be handled by outer catch
      throw transactionError;
    }
    
    // If transaction was already applied (idempotency check passed), return success without incrementing
    if (alreadyApplied) {
      return {
        success: true,
        message: 'Promo code already applied for this transaction',
        alreadyApplied: true
      };
    }
    
    if (!promoData) {
      return {
        success: false,
        error: 'Failed to apply promo code'
      };
    }
    
    // Send admin notification email (non-blocking)
    try {
      const { sendAdminNotificationEmail } = await import('../services/emailService.js');
      sendAdminNotificationEmail('promo_code', {
        code: promoData.code,
        businessName: businessName,
        userEmail: userEmail,
        discountAmount: purchaseInfo.discountAmount || promoData.discountValue || 0,
        originalAmount: purchaseInfo.originalAmount || 0,
        finalAmount: purchaseInfo.finalAmount || 0
      }).catch(err => {
        console.warn('⚠️ Admin notification email failed (non-blocking):', err.message);
      });
    } catch (error) {
      console.warn('⚠️ Could not send admin notification email:', error.message);
    }
    
    return {
      success: true,
      message: 'Promo code applied successfully'
    };
    
  } catch (error) {
    console.error('❌ Error applying promo code:', error);
    return {
      success: false,
      error: 'Error applying promo code'
    };
  }
}

/**
 * Create a single reusable promo code
 * Creates one code that can be used a specified number of times, with one use per user
 * 
 * @param {Object} promoData - Promo code data
 * @returns {Promise<Object>} - Creation result
 */
export async function createPromoCode(promoData) {
  try {
    const {
      code,
      discountType,
      discountValue,
      maxUses = 220, // Default to 220 uses if not specified
      expiresAt = null,
      description = '',
      status = 'active'
    } = promoData;
    
    if (!code || !discountType || discountValue === undefined) {
      return {
        success: false,
        error: 'Missing required fields: code, discountType, discountValue'
      };
    }
    
    // Validate maxUses
    const maxUsesNum = parseInt(maxUses, 10);
    if (isNaN(maxUsesNum) || maxUsesNum < 1) {
      return {
        success: false,
        error: 'maxUses must be a positive number (minimum 1)'
      };
    }
    
    const codeUpper = code.trim().toUpperCase();
    const db = getDb();
    
    // Check if code already exists
    const existingSnapshot = await db.collection(COLLECTION_NAME)
      .where('code', '==', codeUpper)
      .limit(1)
      .get();
    
    if (!existingSnapshot.empty) {
      return {
        success: false,
        error: 'Promo code already exists'
      };
    }
    
    const newPromo = {
      code: codeUpper,
      discountType,
      discountValue,
      maxUses: maxUsesNum, // Can be used up to the specified number of times
      currentUses: 0, // Track total usage count
      usedBy: [], // Track which users/companies have used this code (one use per user)
      status,
      description,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: expiresAt ? admin.firestore.Timestamp.fromDate(new Date(expiresAt)) : null
    };
    
    const docRef = await db.collection(COLLECTION_NAME).add(newPromo);
    
    console.log(`✅ Created reusable promo code: ${codeUpper} (max ${maxUsesNum} uses, one per user)`);
    
    return {
      success: true,
      promoId: docRef.id,
      code: codeUpper,
      maxUses: maxUsesNum,
      message: `Promo code created successfully. Can be used ${maxUsesNum} times total, one use per user.`
    };
    
  } catch (error) {
    console.error('❌ Error creating promo code:', error);
    return {
      success: false,
      error: 'Error creating promo code'
    };
  }
}

/**
 * Bulk create promo codes
 * 
 * @param {Object} options - Bulk create options
 * @returns {Promise<Object>} - Creation result
 */
export async function bulkCreatePromoCodes(options) {
  try {
    const {
      code,
      count = 1,
      discountType,
      discountValue,
      maxUses = 1,
      useSameCodeName = false,
      expiresAt = null,
      description = ''
    } = options;
    
    if (!code || !discountType || discountValue === undefined) {
      return {
        success: false,
        error: 'Missing required fields: code, discountType, discountValue'
      };
    }
    
    const created = [];
    const errors = [];
    
    const db = getDb();
    
    for (let i = 0; i < count; i++) {
      try {
        let finalCode;
        if (useSameCodeName) {
          // Use same code name for all (e.g., "PROMO10")
          finalCode = code.trim().toUpperCase();
        } else {
          // Generate unique code (e.g., "PROMO10-1234567890-ABC123")
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 8).toUpperCase();
          finalCode = `${code.trim().toUpperCase()}-${timestamp}-${random}`;
        }
        
        const newPromo = {
          code: finalCode,
          discountType,
          discountValue,
          maxUses,
          currentUses: 0,
          status: 'active',
          description,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          expiresAt: expiresAt ? admin.firestore.Timestamp.fromDate(new Date(expiresAt)) : null
        };
        
        const docRef = await db.collection(COLLECTION_NAME).add(newPromo);
        created.push({
          id: docRef.id,
          code: finalCode
        });
        
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      created: created.length,
      errors: errors.length,
      codes: created,
      errorDetails: errors
    };
    
  } catch (error) {
    console.error('❌ Error bulk creating promo codes:', error);
    return {
      success: false,
      error: 'Error bulk creating promo codes'
    };
  }
}

/**
 * Get all promo codes
 * 
 * @returns {Promise<Object>} - List of promo codes
 */
export async function getAllPromoCodes() {
  try {
    const db = getDb();
    
    // Try to fetch with orderBy, fallback to simple query if index missing
    let snapshot;
    try {
      snapshot = await db.collection(COLLECTION_NAME)
        .orderBy('createdAt', 'desc')
        .get();
    } catch (error) {
      // If index missing, fetch without orderBy and sort client-side
      console.warn('⚠️ Firestore index missing, fetching without orderBy');
      snapshot = await db.collection(COLLECTION_NAME).get();
    }
    
    const promoCodes = snapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now());
      const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : (data.expiresAt ? new Date(data.expiresAt) : null);
      const lastUsedAt = data.lastUsedAt?.toDate ? data.lastUsedAt.toDate() : (data.lastUsedAt ? new Date(data.lastUsedAt) : null);
      
      return {
        id: doc.id,
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUses: data.maxUses || 0,
        currentUses: data.currentUses || 0,
        status: data.status || 'active',
        description: data.description || '',
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        lastUsedAt: lastUsedAt ? lastUsedAt.toISOString() : null
      };
    });
    
    // Sort by createdAt if not already sorted
    promoCodes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return {
      success: true,
      promoCodes,
      count: promoCodes.length
    };
    
  } catch (error) {
    console.error('❌ Error getting promo codes:', error);
    return {
      success: false,
      error: 'Error getting promo codes',
      promoCodes: [],
      count: 0
    };
  }
}

/**
 * Delete a promo code
 * 
 * @param {string} promoId - Promo code document ID
 * @returns {Promise<Object>} - Deletion result
 */
export async function deletePromoCode(promoId) {
  try {
    const db = getDb();
    await db.collection(COLLECTION_NAME).doc(promoId).delete();
    
    return {
      success: true,
      message: 'Promo code deleted successfully'
    };
    
  } catch (error) {
    console.error('❌ Error deleting promo code:', error);
    return {
      success: false,
      error: 'Error deleting promo code'
    };
  }
}

/**
 * Bulk delete promo codes
 * 
 * @param {Array<string>} promoIds - Array of promo code document IDs
 * @returns {Promise<Object>} - Deletion result
 */
export async function bulkDeletePromoCodes(promoIds) {
  try {
    if (!Array.isArray(promoIds) || promoIds.length === 0) {
      return {
        success: false,
        error: 'Invalid promo IDs array'
      };
    }
    
    const db = getDb();
    const MAX_BATCH = 500; // Firestore batch limit
    const batches = [];
    let currentBatch = db.batch();
    let count = 0;
    let deleted = 0;
    
    for (const promoId of promoIds) {
      const docRef = db.collection(COLLECTION_NAME).doc(promoId);
      currentBatch.delete(docRef);
      count++;
      deleted++;
      
      if (count >= MAX_BATCH) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        count = 0;
      }
    }
    
    if (count > 0) {
      batches.push(currentBatch);
    }
    
    // Commit all batches
    for (const batch of batches) {
      await batch.commit();
    }
    
    return {
      success: true,
      deleted,
      message: `Successfully deleted ${deleted} promo code(s)`
    };
    
  } catch (error) {
    console.error('❌ Error bulk deleting promo codes:', error);
    return {
      success: false,
      error: 'Error bulk deleting promo codes'
    };
  }
}

