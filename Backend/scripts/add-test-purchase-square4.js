/**
 * Add Test Purchase for Square 4
 * Creates the purchase document with ABCD business and AQ Accountants logo
 */

import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const db = admin.firestore();

async function addTestPurchase() {
  try {
    console.log('📝 Creating test purchase document for square 4...\n');
    
    // Storage file details from the screenshot
    const purchaseId = 'purchase-1767419394347-f17viyi7mdl';
    const storagePath = `logos/purchase-1767419394347-f17viyi7mdl-1767419394348`;
    const logoUrl = `https://firebasestorage.googleapis.com/v0/b/clickalinks-frontend.firebasestorage.app/o/${encodeURIComponent(storagePath)}?alt=media`;
    
    // Test purchase details
    // Get email from command line argument or use placeholder
    const contactEmail = process.argv[2] || 'test@example.com';
    
    const now = new Date();
    const purchaseData = {
      purchaseId: purchaseId,
      squareNumber: 4,
      pageNumber: 1,
      businessName: 'ABCD',
      contactEmail: contactEmail,
      logoData: logoUrl,
      storagePath: storagePath,
      dealLink: '',
      website: '',
      amount: 10,
      duration: 30,
      status: 'active',
      paymentStatus: 'paid',
      transactionId: `test-${Date.now()}`,
      startDate: admin.firestore.Timestamp.fromDate(now),
      endDate: admin.firestore.Timestamp.fromDate(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)),
      purchaseDate: admin.firestore.Timestamp.fromDate(now),
      clickCount: 0,
      lastClickAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    console.log('📋 Creating purchase with:');
    console.log(`   Business: ${purchaseData.businessName}`);
    console.log(`   Email: ${purchaseData.contactEmail}`);
    console.log(`   Square: ${purchaseData.squareNumber}`);
    console.log(`   Logo URL: ${logoUrl.substring(0, 80)}...`);
    console.log('');
    
    // Check if document already exists
    const existingDoc = await db.collection('purchasedSquares').doc(purchaseId).get();
    if (existingDoc.exists) {
      console.log('⚠️  Document already exists! Updating instead...');
      await existingDoc.ref.update(purchaseData);
      console.log('✅ Purchase document updated successfully!');
    } else {
      const docRef = db.collection('purchasedSquares').doc(purchaseId);
      await docRef.set(purchaseData);
      console.log('✅ Purchase document created successfully!');
    }
    
    console.log(`   Document ID: ${purchaseId}`);
    console.log(`   Square: 4`);
    console.log('\n🎉 Square 4 should now display the ABCD logo correctly!');
    console.log('💡 Refresh your frontend page to see the changes.');
    console.log(`\n⚠️  Note: Email is set to: ${contactEmail}`);
    console.log('   If this is wrong, update it in Firestore Console or rerun with correct email.');
    
  } catch (error) {
    console.error('❌ Error creating purchase:', error);
    throw error;
  }
}

// Run the script
addTestPurchase()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
