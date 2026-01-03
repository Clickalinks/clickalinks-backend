/**
 * Create Square 4 Purchase
 * Manually creates the purchase document for square 4 with the logo from Storage
 */

import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const db = admin.firestore();

async function createSquare4Purchase() {
  try {
    console.log('📝 Creating purchase document for square 4...\n');
    
    // Based on the Storage file: purchase-1767419394347-f17viyi7mdl-1767419394348
    const purchaseId = 'purchase-1767419394347-f17viyi7mdl';
    const storagePath = `logos/purchase-1767419394347-f17viyi7mdl-1767419394348`;
    const logoUrl = `https://firebasestorage.googleapis.com/v0/b/clickalinks-frontend.firebasestorage.app/o/${encodeURIComponent(storagePath)}?alt=media`;
    
    // You'll need to provide these details - ask user for them
    console.log('❓ I need some information to create the purchase document:');
    console.log('   1. Business Name');
    console.log('   2. Contact Email');
    console.log('   3. Website/Deal Link (optional)');
    console.log('   4. Amount paid');
    console.log('   5. Duration (days)');
    console.log('   6. Transaction ID (optional)');
    console.log('   7. Page Number (default: 1)');
    console.log('');
    console.log('💡 For now, I\'ll create it with placeholder values that you can update.');
    console.log('💡 Or you can provide the details and I\'ll update this script.\n');
    
    const now = new Date();
    const purchaseData = {
      purchaseId: purchaseId,
      squareNumber: 4,
      pageNumber: 1, // Update if different
      businessName: 'AQ Accountants', // Update with actual business name
      contactEmail: 'example@email.com', // UPDATE THIS - you need to provide
      logoData: logoUrl,
      storagePath: storagePath,
      dealLink: '', // UPDATE THIS - website URL
      amount: 10, // UPDATE THIS - actual amount paid
      duration: 30, // UPDATE THIS - actual duration
      status: 'active',
      paymentStatus: 'paid',
      transactionId: null, // UPDATE THIS if you have it
      startDate: admin.firestore.Timestamp.fromDate(now),
      endDate: admin.firestore.Timestamp.fromDate(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)), // 30 days default
      purchaseDate: admin.firestore.Timestamp.fromDate(now),
      clickCount: 0,
      lastClickAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    console.log('📋 Purchase data to create:');
    console.log(JSON.stringify(purchaseData, null, 2));
    console.log('');
    console.log('⚠️  WARNING: This will create a new document.');
    console.log('⚠️  Please update the placeholder values above before running.');
    console.log('');
    console.log('🔍 To update this script, edit Backend/scripts/create-square-4-purchase.js');
    console.log('   and update the fields marked with UPDATE THIS comments.\n');
    
    // Uncomment to actually create (comment out for safety)
    /*
    const docRef = db.collection('purchasedSquares').doc(purchaseId);
    await docRef.set(purchaseData);
    
    console.log('✅ Purchase document created successfully!');
    console.log(`   Document ID: ${purchaseId}`);
    console.log(`   Square: 4`);
    console.log(`   Logo URL: ${logoUrl.substring(0, 80)}...`);
    console.log('\n🎉 Square 4 should now display the logo correctly.');
    console.log('💡 Refresh your frontend page to see the changes.');
    */
    
    console.log('💡 Script is ready but not executed yet (commented out for safety).');
    console.log('💡 Uncomment the code at the bottom to create the document.');
    
  } catch (error) {
    console.error('❌ Error creating purchase:', error);
    throw error;
  }
}

// Run the script
createSquare4Purchase()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
