/**
 * Fix Logo Data Script
 * Updates Firestore documents with missing logoData URLs
 * Constructs Firebase Storage URL from storagePath if logoData is missing
 */

import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const db = admin.firestore();

async function fixLogoData() {
  try {
    console.log('🔍 Fetching all purchases from Firestore...');
    
    const purchasesSnapshot = await db.collection('purchasedSquares').get();
    
    if (purchasesSnapshot.empty) {
      console.log('ℹ️ No purchases found in Firestore');
      return;
    }
    
    console.log(`📊 Found ${purchasesSnapshot.size} purchase(s)`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 500; // Firestore batch limit
    
    purchasesSnapshot.forEach(doc => {
      const data = doc.data();
      const docId = doc.id;
      
      // Check if logoData is missing or invalid but storagePath exists
      const hasValidLogoData = data.logoData && 
                               typeof data.logoData === 'string' && 
                               data.logoData.trim() !== '' &&
                               (data.logoData.startsWith('http://') || 
                                data.logoData.startsWith('https://') || 
                                data.logoData.startsWith('data:'));
      
      const hasStoragePath = data.storagePath && 
                            typeof data.storagePath === 'string' && 
                            data.storagePath.trim() !== '';
      
      if (!hasValidLogoData && hasStoragePath) {
        // Construct Firebase Storage URL from storagePath
        let logoUrl;
        const storagePath = data.storagePath.trim();
        
        if (storagePath.startsWith('logos/')) {
          // Construct full Firebase Storage URL
          logoUrl = `https://firebasestorage.googleapis.com/v0/b/clickalinks-frontend.firebasestorage.app/o/${encodeURIComponent(storagePath)}?alt=media`;
        } else if (storagePath.includes('firebasestorage.googleapis.com')) {
          // Already a full URL
          logoUrl = storagePath;
        } else {
          // Assume it's a logos/ path without prefix
          const path = storagePath.startsWith('logos/') ? storagePath : `logos/${storagePath}`;
          logoUrl = `https://firebasestorage.googleapis.com/v0/b/clickalinks-frontend.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;
        }
        
        console.log(`✅ Updating document ${docId}:`);
        console.log(`   Square: ${data.squareNumber || 'N/A'}`);
        console.log(`   Business: ${data.businessName || 'N/A'}`);
        console.log(`   Storage Path: ${storagePath}`);
        console.log(`   Logo URL: ${logoUrl.substring(0, 80)}...`);
        
        const docRef = db.collection('purchasedSquares').doc(docId);
        batch.update(docRef, {
          logoData: logoUrl,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        batchCount++;
        updatedCount++;
        
        // Commit batch if it reaches the limit
        if (batchCount >= BATCH_SIZE) {
          batch.commit();
          batchCount = 0;
        }
      } else if (hasValidLogoData) {
        console.log(`⏭️ Skipping ${docId} (already has valid logoData)`);
        skippedCount++;
      } else if (!hasStoragePath) {
        console.log(`⚠️ Skipping ${docId} (no storagePath to construct URL)`);
        skippedCount++;
      }
    });
    
    // Commit remaining updates
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✅ Committed final batch of ${batchCount} updates`);
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️ Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    if (updatedCount > 0) {
      console.log('\n🎉 Logo data fixed! Documents should now display logos correctly.');
    } else {
      console.log('\nℹ️ No updates needed. All documents already have valid logoData.');
    }
    
  } catch (error) {
    console.error('❌ Error fixing logo data:', error);
    throw error;
  }
}

// Run the script
fixLogoData()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
