/**
 * Fix Square 4 Logo
 * Finds the purchase document for square 4 and adds missing logoData and storagePath
 */

import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const db = admin.firestore();

async function fixSquare4Logo() {
  try {
    console.log('🔍 Searching for purchase on square 4...');
    
    // Search by squareNumber
    const query = db.collection('purchasedSquares')
      .where('squareNumber', '==', 4)
      .where('status', '==', 'active')
      .limit(1);
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      console.log('❌ No active purchase found for square 4');
      console.log('🔍 Trying without status filter...');
      
      // Try without status filter
      const query2 = db.collection('purchasedSquares')
        .where('squareNumber', '==', 4)
        .limit(5);
      
      const snapshot2 = await query2.get();
      
      if (snapshot2.empty) {
        console.log('❌ No purchase found for square 4 at all');
        return;
      }
      
      console.log(`📊 Found ${snapshot2.size} document(s) for square 4:`);
      snapshot2.forEach(doc => {
        const data = doc.data();
        console.log(`   Document ID: ${doc.id}`);
        console.log(`   Purchase ID: ${data.purchaseId || 'N/A'}`);
        console.log(`   Business: ${data.businessName || 'N/A'}`);
        console.log(`   Status: ${data.status || 'N/A'}`);
        console.log(`   Has logoData: ${!!data.logoData}`);
        console.log(`   Has storagePath: ${!!data.storagePath}`);
        console.log('');
      });
      
      // Update the first one (or most recent)
      const docToUpdate = snapshot2.docs[0];
      const data = docToUpdate.data();
      
      // Try to find the storage file by purchaseId or document ID
      const purchaseId = data.purchaseId || docToUpdate.id;
      console.log(`🔍 Purchase ID: ${purchaseId}`);
      console.log(`🔍 Document ID: ${docToUpdate.id}`);
      
      // Based on the Storage file name pattern: purchase-1767419394347-f17viyi7mdl-1767419394348
      // The pattern is: purchase-{timestamp1}-{random}-{timestamp2}
      // We need to find which file matches this purchase
      
      // For now, let's update with the most recent file we saw in Storage
      // The file was: purchase-1767419394347-f17viyi7mdl-1767419394348
      const storagePath = `logos/purchase-1767419394347-f17viyi7mdl-1767419394348`;
      const logoUrl = `https://firebasestorage.googleapis.com/v0/b/clickalinks-frontend.firebasestorage.app/o/${encodeURIComponent(storagePath)}?alt=media`;
      
      console.log(`📝 Updating document ${docToUpdate.id}:`);
      console.log(`   Storage Path: ${storagePath}`);
      console.log(`   Logo URL: ${logoUrl}`);
      
      await docToUpdate.ref.update({
        logoData: logoUrl,
        storagePath: storagePath,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Document updated successfully!');
      console.log('\n🎉 Square 4 should now display the logo correctly.');
      console.log('💡 Refresh your frontend page to see the changes.');
      
      return;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    console.log(`✅ Found purchase for square 4:`);
    console.log(`   Document ID: ${doc.id}`);
    console.log(`   Purchase ID: ${data.purchaseId || 'N/A'}`);
    console.log(`   Business: ${data.businessName || 'N/A'}`);
    console.log(`   Has logoData: ${!!data.logoData}`);
    console.log(`   Has storagePath: ${!!data.storagePath}`);
    
    // Check if it already has logoData
    if (data.logoData) {
      console.log('\n✅ Document already has logoData, no update needed.');
      return;
    }
    
    // Try to find the storage file
    // Based on the Storage screenshot, the file is: purchase-1767419394347-f17viyi7mdl-1767419394348
    // Let's try to match by purchaseId or use the most recent file
    const purchaseId = data.purchaseId || doc.id;
    
    // For now, update with the file we know exists
    const storagePath = `logos/purchase-1767419394347-f17viyi7mdl-1767419394348`;
    const logoUrl = `https://firebasestorage.googleapis.com/v0/b/clickalinks-frontend.firebasestorage.app/o/${encodeURIComponent(storagePath)}?alt=media`;
    
    console.log(`\n📝 Updating document with:`);
    console.log(`   Storage Path: ${storagePath}`);
    console.log(`   Logo URL: ${logoUrl.substring(0, 80)}...`);
    
    await doc.ref.update({
      logoData: logoUrl,
      storagePath: storagePath,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('\n✅ Document updated successfully!');
    console.log('🎉 Square 4 should now display the logo correctly.');
    console.log('💡 Refresh your frontend page to see the changes.');
    
  } catch (error) {
    console.error('❌ Error fixing square 4 logo:', error);
    throw error;
  }
}

// Run the script
fixSquare4Logo()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
