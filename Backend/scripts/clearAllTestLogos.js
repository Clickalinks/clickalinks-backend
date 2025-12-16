/**
 * Clear All Test Logos Script
 * Deletes all test purchases from Firestore
 * 
 * Usage: node scripts/clearAllTestLogos.js
 */

import admin from '../config/firebaseAdmin.js';

// Get Firestore instance
const db = admin.firestore();

async function clearAllTestLogos() {
  console.log('🗑️ Starting to clear all test logos from Firestore...\n');
  
  try {
    // Get all active purchases
    const purchasesSnapshot = await db.collection('purchasedSquares')
      .where('status', '==', 'active')
      .get();
    
    if (purchasesSnapshot.empty) {
      console.log('✅ No purchases found to delete.');
      return;
    }
    
    console.log(`📊 Found ${purchasesSnapshot.size} purchases to delete...`);
    
    const BATCH_SIZE = 500; // Firestore batch limit
    let batch = db.batch();
    let batchCount = 0;
    let totalDeleted = 0;
    
    purchasesSnapshot.docs.forEach((docSnapshot, index) => {
      const docRef = db.collection('purchasedSquares').doc(docSnapshot.id);
      batch.delete(docRef);
      batchCount++;
      totalDeleted++;
      
      // Commit batch if it reaches the limit
      if (batchCount >= BATCH_SIZE) {
        console.log(`📤 Committing batch of ${batchCount} deletions...`);
        batch.commit().then(() => {
          console.log(`✅ Deleted ${totalDeleted}/${purchasesSnapshot.size} purchases...`);
        });
        batchCount = 0;
        batch = db.batch();
      }
      
      // Progress indicator
      if ((index + 1) % 100 === 0) {
        console.log(`⏳ Processed ${index + 1}/${purchasesSnapshot.size} purchases...`);
      }
    });
    
    // Commit remaining deletions
    if (batchCount > 0) {
      console.log(`📤 Committing final batch of ${batchCount} deletions...`);
      await batch.commit();
    }
    
    console.log(`\n✅ Successfully deleted ${totalDeleted} test purchases from Firestore!`);
    console.log(`🎯 Firestore is now clean and ready for real logo uploads.`);
    
  } catch (error) {
    console.error('❌ Error clearing test logos:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Run the script
clearAllTestLogos()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Your Firestore is now clean');
    console.log('   2. You can upload real logos through your website');
    console.log('   3. Test the shuffle with real data');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

