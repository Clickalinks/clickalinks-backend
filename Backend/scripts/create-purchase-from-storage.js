/**
 * Create Purchase from Storage File
 * Creates a Firestore purchase document based on a Storage file
 */

import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const db = admin.firestore();

// Storage file from screenshot: purchase-1767448525436-8jmhp7yx8i5-1767448525437
const storageFileName = process.argv[2] || 'purchase-1767448525436-8jmhp7yx8i5-1767448525437';
const squareNumber = parseInt(process.argv[3]) || 4; // Update this
const businessName = process.argv[4] || 'AO Accountants'; // Update this
const contactEmail = process.argv[5] || 'your-email@example.com'; // UPDATE THIS

async function createPurchase() {
  try {
    console.log('📝 Creating purchase document from Storage file...\n');
    console.log(`   Storage File: ${storageFileName}`);
    console.log(`   Square Number: ${squareNumber}`);
    console.log(`   Business Name: ${businessName}`);
    console.log(`   Email: ${contactEmail}\n`);
    
    const storagePath = `logos/${storageFileName}`;
    const logoUrl = `https://firebasestorage.googleapis.com/v0/b/clickalinks-frontend.firebasestorage.app/o/${encodeURIComponent(storagePath)}?alt=media`;
    const purchaseId = storageFileName.split('-').slice(0, 3).join('-'); // Extract purchase ID
    
    const now = new Date();
    const purchaseData = {
      purchaseId: purchaseId,
      squareNumber: squareNumber,
      pageNumber: 1,
      businessName: businessName,
      contactEmail: contactEmail,
      logoData: logoUrl,
      storagePath: storagePath,
      dealLink: '',
      website: '',
      amount: 10,
      duration: 30,
      status: 'active',
      paymentStatus: 'paid',
      transactionId: `manual-${Date.now()}`,
      startDate: admin.firestore.Timestamp.fromDate(now),
      endDate: admin.firestore.Timestamp.fromDate(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)),
      purchaseDate: admin.firestore.Timestamp.fromDate(now),
      clickCount: 0,
      lastClickAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    console.log('📋 Creating purchase with:');
    console.log(JSON.stringify(purchaseData, null, 2));
    console.log('');
    
    const docRef = db.collection('purchasedSquares').doc(purchaseId);
    await docRef.set(purchaseData);
    
    console.log('✅ Purchase document created successfully!');
    console.log(`   Document ID: ${purchaseId}`);
    console.log(`   Square: ${squareNumber}`);
    console.log(`   Logo URL: ${logoUrl.substring(0, 80)}...`);
    console.log('\n🎉 The logo should now display on the grid!');
    console.log('💡 Refresh your frontend page to see it.');
    
  } catch (error) {
    console.error('❌ Error creating purchase:', error);
    throw error;
  }
}

// Run the script
createPurchase()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
