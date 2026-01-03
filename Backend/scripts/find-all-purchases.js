/**
 * Find All Purchases
 * Lists all purchases in Firestore to help identify the square 4 purchase
 */

import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const db = admin.firestore();

async function findAllPurchases() {
  try {
    console.log('🔍 Fetching all purchases from Firestore...\n');
    
    const snapshot = await db.collection('purchasedSquares').get();
    
    if (snapshot.empty) {
      console.log('❌ No purchases found in Firestore');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} purchase(s):\n`);
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. Document ID: ${doc.id}`);
      console.log(`   Purchase ID: ${data.purchaseId || 'N/A'}`);
      console.log(`   Square Number: ${data.squareNumber || 'N/A'} (type: ${typeof data.squareNumber})`);
      console.log(`   Business: ${data.businessName || 'N/A'}`);
      console.log(`   Contact Email: ${data.contactEmail || 'N/A'}`);
      console.log(`   Status: ${data.status || 'N/A'}`);
      console.log(`   Has logoData: ${!!data.logoData} ${data.logoData ? `(${data.logoData.substring(0, 50)}...)` : ''}`);
      console.log(`   Has storagePath: ${!!data.storagePath} ${data.storagePath || ''}`);
      console.log(`   Created: ${data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : 'N/A'}`);
      console.log('');
    });
    
    // Also search specifically for square 4 (as number and string)
    console.log('\n🔍 Searching specifically for square 4...\n');
    
    // Try as number
    const queryNum = db.collection('purchasedSquares').where('squareNumber', '==', 4);
    const snapshotNum = await queryNum.get();
    console.log(`   Found ${snapshotNum.size} with squareNumber === 4 (number)`);
    
    // Try as string
    const queryStr = db.collection('purchasedSquares').where('squareNumber', '==', '4');
    const snapshotStr = await queryStr.get();
    console.log(`   Found ${snapshotStr.size} with squareNumber === '4' (string)`);
    
    if (snapshotNum.empty && snapshotStr.empty) {
      console.log('\n⚠️ No purchase found with squareNumber = 4');
      console.log('💡 The purchase might not have been saved to Firestore yet.');
      console.log('💡 Or it might be saved with a different squareNumber.');
      console.log('\n📋 Check the list above to find your purchase.');
    }
    
  } catch (error) {
    console.error('❌ Error finding purchases:', error);
    throw error;
  }
}

// Run the script
findAllPurchases()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
