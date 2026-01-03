/**
 * Check Recent Purchases
 * Lists the most recent purchases to find the missing one
 */

import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const db = admin.firestore();

async function checkRecentPurchases() {
  try {
    console.log('🔍 Checking recent purchases...\n');
    
    const snapshot = await db.collection('purchasedSquares')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    if (snapshot.empty) {
      console.log('❌ No purchases found');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} most recent purchase(s):\n`);
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. Document ID: ${doc.id}`);
      console.log(`   Purchase ID: ${data.purchaseId || 'N/A'}`);
      console.log(`   Square Number: ${data.squareNumber || 'N/A'}`);
      console.log(`   Business: ${data.businessName || 'N/A'}`);
      console.log(`   Email: ${data.contactEmail || 'N/A'}`);
      console.log(`   Status: ${data.status || 'N/A'}`);
      console.log(`   Payment Status: ${data.paymentStatus || 'N/A'}`);
      console.log(`   Has logoData: ${!!data.logoData}`);
      if (data.logoData) {
        console.log(`   LogoData preview: ${data.logoData.substring(0, 80)}...`);
      }
      console.log(`   Has storagePath: ${!!data.storagePath}`);
      if (data.storagePath) {
        console.log(`   StoragePath: ${data.storagePath}`);
      }
      const createdAt = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : null;
      console.log(`   Created: ${createdAt ? createdAt.toISOString() : 'N/A'}`);
      console.log('');
    });
    
    // Check for purchases without logoData
    console.log('\n🔍 Checking for purchases missing logoData...\n');
    const allSnapshot = await db.collection('purchasedSquares').get();
    let missingLogoCount = 0;
    
    allSnapshot.forEach(doc => {
      const data = doc.data();
      const hasLogo = data.logoData && typeof data.logoData === 'string' && data.logoData.trim() !== '';
      const hasStoragePath = data.storagePath && typeof data.storagePath === 'string' && data.storagePath.trim() !== '';
      
      if (!hasLogo) {
        missingLogoCount++;
        console.log(`⚠️  Missing logoData: Square ${data.squareNumber || 'N/A'} (${data.businessName || 'N/A'})`);
        console.log(`   Document ID: ${doc.id}`);
        console.log(`   Has storagePath: ${hasStoragePath}`);
        if (hasStoragePath) {
          console.log(`   StoragePath: ${data.storagePath}`);
          console.log(`   💡 Can fix by constructing logoData from storagePath`);
        }
        console.log('');
      }
    });
    
    if (missingLogoCount === 0) {
      console.log('✅ All purchases have logoData');
    } else {
      console.log(`⚠️  Found ${missingLogoCount} purchase(s) missing logoData`);
    }
    
  } catch (error) {
    console.error('❌ Error checking purchases:', error);
    throw error;
  }
}

// Run the script
checkRecentPurchases()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
