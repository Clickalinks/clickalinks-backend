/**
 * Fisher-Yates Shuffle Service
 * Backend service for shuffling advertising squares
 * Uses Fisher-Yates algorithm for efficient O(n) shuffling
 */

import admin from '../config/firebaseAdmin.js';

// Use admin.firestore() directly for better compatibility
// This ensures Firebase Admin is properly initialized before accessing Firestore
const db = admin.firestore();

const COLLECTION_NAME = 'purchasedSquares'; // Consistent camelCase
// If you have multiple databases, specify the database ID
const db = admin.firestore();
// For default database, use: admin.firestore()
// For named database, use: admin.firestore(app, 'database-id')
const COLLECTION_NAME = 'purchasedSquares'; // Standard camelCase convention
>>>>>>> backend/main

/**
 * Fisher-Yates Shuffle Algorithm
 * Shuffles an array in-place using the Fisher-Yates algorithm
<<<<<<< HEAD
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 * 
 * @param {Array} array - Array to shuffle
 * @param {number} seed - Optional seed for deterministic shuffling
 * @returns {Array} - Shuffled array
 */
function fisherYatesShuffle(array, seed = null) {
  const shuffled = [...array];
  const length = shuffled.length;
  
  // Use seed for deterministic shuffling (same seed = same shuffle order)
  let random = seed !== null 
    ? () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      }
    : () => Math.random();
  
  for (let i = length - 1; i > 0; i--) {
    const randomIndex = Math.floor(random() * (i + 1));
=======
 * Time Complexity: O(n) - optimal for shuffling
 * 
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array (same reference, shuffled in place)
 */
function fisherYatesShuffle(array) {
  const shuffled = [...array]; // Create copy to avoid mutation
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i (inclusive)
    const randomIndex = Math.floor(Math.random() * (i + 1));
    
    // Swap current element with randomly selected element
>>>>>>> backend/main
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }
  
  return shuffled;
}

/**
<<<<<<< HEAD
 * Get time-based seed for deterministic shuffling
 * Same time period = same seed = same shuffle order for all users
 * 
 * @returns {number} - Seed based on current 2-hour period
 */
function getTimeBasedSeed() {
  const SHUFFLE_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  const now = Date.now();
  const currentPeriod = Math.floor(now / SHUFFLE_INTERVAL);
  return currentPeriod;
}

/**
 * Perform global shuffle of all active purchases
 * Assigns new squareNumber to each purchase using Fisher-Yates algorithm
 * 
 * @returns {Promise<Object>} - Shuffle result with statistics
 */
export async function performGlobalShuffle() {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Starting Fisher-Yates shuffle...');
    
    // Get seed for deterministic shuffling
    const seed = getTimeBasedSeed();
    console.log(`📊 Using seed: ${seed} (2-hour period)`);
    
    // STEP 1: Get all active, paid purchases
    const purchasesSnapshot = await db.collection(COLLECTION_NAME)
      .where('status', '==', 'active')
      .where('paymentStatus', '==', 'paid')
      .get();
    
    if (purchasesSnapshot.empty) {
      console.log('ℹ️ No purchases to shuffle');
      return {
        success: true,
        shuffledCount: 0,
        message: 'No active purchases to shuffle',
=======
 * Perform global shuffle of all active purchases
 * Fetches all 2000 documents, shuffles them, assigns orderingIndex (0-1999)
 * and writes back to Firestore using batch writes
 * 
 * @returns {Object} - Result object with success status and details
 */
export async function performGlobalShuffle() {
  const startTime = Date.now();
  console.log('🔄 Starting global shuffle...');
  
  try {
    // Step 1: Fetch all active purchases
    console.log('📥 Fetching all active purchases from Firestore...');
    let snapshot;
    try {
      snapshot = await db.collection(COLLECTION_NAME)
        .where('status', '==', 'active')
        .get();
    } catch (error) {
      // Handle case where collection doesn't exist yet (NOT_FOUND error)
      if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        console.log('⚠️ Collection does not exist yet. No purchases to shuffle.');
        return {
          success: true,
          message: 'Collection does not exist yet. No purchases to shuffle.',
          shuffledCount: 0,
          duration: Date.now() - startTime
        };
      }
      // Re-throw other errors
      throw error;
    }
    
    if (snapshot.empty) {
      console.log('⚠️ No active purchases found. Nothing to shuffle.');
      return {
        success: true,
        message: 'No active purchases to shuffle',
        shuffledCount: 0,
>>>>>>> backend/main
        duration: Date.now() - startTime
      };
    }
    
    const purchases = [];
<<<<<<< HEAD
    purchasesSnapshot.forEach(doc => {
      purchases.push({
        docId: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📊 Found ${purchases.length} active purchases to shuffle`);
    
    // STEP 2: Generate array of all available squares (1-2000)
    const allSquares = Array.from({ length: 2000 }, (_, i) => i + 1);
    
    // STEP 3: Shuffle squares using Fisher-Yates algorithm
    const shuffledSquares = fisherYatesShuffle(allSquares, seed);
    
    // STEP 4: Assign purchases to shuffled squares
    const batch = db.batch();
    const assignments = [];
    
    purchases.forEach((purchase, index) => {
      if (index < shuffledSquares.length) {
        const newSquareNumber = shuffledSquares[index];
        const newPageNumber = Math.ceil(newSquareNumber / 200);
        
        assignments.push({
          docId: purchase.docId,
          purchaseId: purchase.purchaseId || purchase.docId,
          oldSquareNumber: purchase.squareNumber,
          newSquareNumber: newSquareNumber,
          oldPageNumber: purchase.pageNumber,
          newPageNumber: newPageNumber
        });
        
        // Update document
        const docRef = db.collection(COLLECTION_NAME).doc(purchase.docId);
        batch.update(docRef, {
          squareNumber: newSquareNumber,
          pageNumber: newPageNumber,
          shuffledAt: admin.firestore.FieldValue.serverTimestamp(),
          shuffleSeed: seed
        });
      }
    });
    
    // STEP 5: Commit batch update
    await batch.commit();
    
    const duration = Date.now() - startTime;
    console.log(`✅ Shuffle completed: ${assignments.length} purchases shuffled in ${duration}ms`);
    
    return {
      success: true,
      shuffledCount: assignments.length,
      message: `Successfully shuffled ${assignments.length} purchases`,
      seed: seed,
      duration: duration,
      timestamp: new Date().toISOString(),
      assignments: assignments.slice(0, 10) // Return first 10 for logging
    };
    
  } catch (error) {
    console.error('❌ Error performing shuffle:', error);
    return {
      success: false,
      error: error.message,
      errorCode: 'SHUFFLE_ERROR',
=======
    snapshot.forEach(doc => {
      purchases.push({
        id: doc.id,
        data: doc.data()
      });
    });
    
    console.log(`✅ Fetched ${purchases.length} active purchases`);
    
    // Step 2: Filter out purchases without confirmed payment
    const activePurchases = purchases.filter(p => {
      const data = p.data;
      return data.paymentStatus === 'paid' && 
             data.status === 'active' &&
             data.logoData && // Must have a logo
             data.logoData.trim() !== '';
    });
    
    console.log(`✅ Filtered to ${activePurchases.length} purchases with confirmed payment and logos`);
    
    if (activePurchases.length === 0) {
      console.log('⚠️ No purchases with confirmed payment and logos found.');
      return {
        success: true,
        message: 'No purchases with confirmed payment and logos to shuffle',
        shuffledCount: 0,
        duration: Date.now() - startTime
      };
    }
    
    // Step 3: Run Fisher-Yates shuffle
    console.log('🔀 Running Fisher-Yates shuffle algorithm...');
    const shuffled = fisherYatesShuffle(activePurchases);
    console.log('✅ Shuffle completed');
    
    // Step 4: Assign orderingIndex (0 to shuffled.length - 1)
    console.log('📝 Assigning orderingIndex to each purchase...');
    const updates = shuffled.map((purchase, index) => ({
      id: purchase.id,
      orderingIndex: index,
      lastShuffled: admin.firestore.FieldValue.serverTimestamp()
    }));
    
    console.log(`✅ Assigned orderingIndex to ${updates.length} purchases`);
    
    // Step 5: Write back to Firestore using batch writes
    // Firestore batch limit is 500 operations, so we need multiple batches
    console.log('💾 Writing updates to Firestore...');
    const BATCH_SIZE = 500;
    let batchCount = 0;
    let totalUpdated = 0;
    
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchUpdates = updates.slice(i, i + BATCH_SIZE);
      
      batchUpdates.forEach(update => {
        const docRef = db.collection(COLLECTION_NAME).doc(update.id);
        batch.update(docRef, {
          orderingIndex: update.orderingIndex,
          lastShuffled: update.lastShuffled
        });
      });
      
      await batch.commit();
      batchCount++;
      totalUpdated += batchUpdates.length;
      console.log(`✅ Batch ${batchCount}: Updated ${batchUpdates.length} documents (${totalUpdated}/${updates.length})`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Global shuffle completed successfully!`);
    console.log(`   - Shuffled: ${totalUpdated} purchases`);
    console.log(`   - Batches: ${batchCount}`);
    console.log(`   - Duration: ${duration}ms`);
    
    return {
      success: true,
      message: 'Global shuffle completed successfully',
      shuffledCount: totalUpdated,
      batches: batchCount,
      duration: duration,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error during global shuffle:', error);
    console.error('Error stack:', error.stack);
    
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
>>>>>>> backend/main
      duration: Date.now() - startTime
    };
  }
}

/**
 * Get shuffle statistics
<<<<<<< HEAD
 * 
 * @returns {Promise<Object>} - Shuffle statistics
 */
export async function getShuffleStats() {
  try {
    const purchasesSnapshot = await db.collection(COLLECTION_NAME)
      .where('status', '==', 'active')
      .where('paymentStatus', '==', 'paid')
      .get();
    
    const totalPurchases = purchasesSnapshot.size;
    const shuffledPurchases = purchasesSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.shuffledAt !== undefined;
    }).length;
    
    const lastShuffle = purchasesSnapshot.docs
      .map(doc => doc.data().shuffledAt)
      .filter(date => date !== undefined)
      .sort((a, b) => b.toMillis() - a.toMillis())[0];
    
    return {
      success: true,
      totalPurchases: totalPurchases,
      shuffledPurchases: shuffledPurchases,
      lastShuffle: lastShuffle ? lastShuffle.toDate().toISOString() : null,
      nextShuffleSeed: getTimeBasedSeed() + 1,
      shuffleInterval: '2 hours'
=======
 * Returns information about the current shuffle state
 */
export async function getShuffleStats() {
  try {
    let snapshot;
    try {
      snapshot = await db.collection(COLLECTION_NAME)
        .where('status', '==', 'active')
        .get();
    } catch (error) {
      // Handle case where collection doesn't exist yet (NOT_FOUND error)
      if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        console.log('⚠️ Collection does not exist yet. Returning empty stats.');
        return {
          success: true,
          totalActive: 0,
          withOrderingIndex: 0,
          withoutOrderingIndex: 0,
          lastShuffled: null,
          needsShuffle: false,
          message: 'Collection does not exist yet'
        };
      }
      // Re-throw other errors
      throw error;
    }
    
    let totalActive = 0;
    let withOrderingIndex = 0;
    let withoutOrderingIndex = 0;
    let lastShuffled = null;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.paymentStatus === 'paid' && data.logoData) {
        totalActive++;
        if (data.orderingIndex !== undefined && data.orderingIndex !== null) {
          withOrderingIndex++;
          if (data.lastShuffled) {
            const shuffledTime = data.lastShuffled.toDate();
            if (!lastShuffled || shuffledTime > lastShuffled) {
              lastShuffled = shuffledTime;
            }
          }
        } else {
          withoutOrderingIndex++;
        }
      }
    });
    
    return {
      success: true,
      totalActive,
      withOrderingIndex,
      withoutOrderingIndex,
      lastShuffled: lastShuffled ? lastShuffled.toISOString() : null,
      needsShuffle: withoutOrderingIndex > 0
>>>>>>> backend/main
    };
  } catch (error) {
    console.error('❌ Error getting shuffle stats:', error);
    return {
      success: false,
<<<<<<< HEAD
      error: error.message
=======
      error: error.message,
      errorCode: error.code
>>>>>>> backend/main
    };
  }
}

