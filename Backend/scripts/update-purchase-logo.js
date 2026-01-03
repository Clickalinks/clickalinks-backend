/**
 * Script to update a purchase with logo from Firebase Storage
 * Usage: node scripts/update-purchase-logo.js <purchaseId>
 * Example: node scripts/update-purchase-logo.js purchase-1767456639241-extyxfv6tbp
 */

import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const db = admin.firestore();
const storage = admin.storage();

async function updatePurchaseLogo(purchaseId) {
  try {
    console.log(`🔍 Updating purchase logo: ${purchaseId}`);
    
    const purchaseRef = db.collection('purchasedSquares').doc(purchaseId);
    const purchaseDoc = await purchaseRef.get();
    
    if (!purchaseDoc.exists) {
      console.error(`❌ Purchase not found: ${purchaseId}`);
      process.exit(1);
    }
    
    const purchaseData = purchaseDoc.data();
    console.log(`📋 Purchase Details:`);
    console.log(`   Business: ${purchaseData.businessName}`);
    console.log(`   Square: ${purchaseData.squareNumber}`);
    console.log(`   Transaction ID: ${purchaseData.transactionId}`);
    console.log(`   Current Logo: ${purchaseData.logoData ? 'EXISTS' : 'MISSING'}`);
    console.log(`   Current Storage Path: ${purchaseData.storagePath || 'MISSING'}`);
    
    // If logo already exists, check if it's valid
    if (purchaseData.logoData) {
      console.log(`\n✅ Logo already exists: ${purchaseData.logoData.substring(0, 80)}...`);
      console.log(`   Purchase already has a logo. Exiting.`);
      process.exit(0);
    }
    
    // Search for logo in Firebase Storage
    console.log(`\n🔍 Searching Firebase Storage for logo...`);
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: 'logos/' });
    
    console.log(`   Found ${files.length} total files in Storage`);
    
    // Search for matching files
    const searchTerms = [
      purchaseData.transactionId,
      purchaseData.transactionId?.substring(0, 20),
      `square-${purchaseData.squareNumber}`,
      purchaseData.businessName?.toLowerCase().replace(/\s+/g, '-'),
      `purchase-`
    ].filter(Boolean);
    
    console.log(`   Searching with terms: ${searchTerms.join(', ')}`);
    
    const matchingFiles = files.filter(file => {
      const fileName = file.name.toLowerCase();
      return searchTerms.some(term => fileName.includes(term.toLowerCase()));
    });
    
    if (matchingFiles.length === 0) {
      console.log(`\n❌ No matching logo files found in Storage`);
      console.log(`\n💡 You may need to:`);
      console.log(`   1. Upload the logo through the admin panel`);
      console.log(`   2. Manually add logoData URL to the purchase document`);
      console.log(`   3. Check if logo was uploaded with a different naming pattern`);
      process.exit(1);
    }
    
    console.log(`\n✅ Found ${matchingFiles.length} matching file(s):`);
    matchingFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.name}`);
    });
    
    // Use the most recent matching file
    const logoFile = matchingFiles[matchingFiles.length - 1];
    const storagePath = logoFile.name;
    
    console.log(`\n📁 Using file: ${storagePath}`);
    
    // Get download URL
    const [url] = await logoFile.getSignedUrl({
      action: 'read',
      expires: '03-09-2491' // Far future date
    });
    
    console.log(`✅ Generated download URL`);
    console.log(`   URL: ${url.substring(0, 80)}...`);
    
    // Update purchase document
    console.log(`\n💾 Updating purchase document...`);
    await purchaseRef.update({
      logoData: url,
      storagePath: storagePath,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Purchase updated successfully!`);
    console.log(`\n📋 Updated Fields:`);
    console.log(`   logoData: ${url.substring(0, 60)}...`);
    console.log(`   storagePath: ${storagePath}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating purchase logo:', error);
    process.exit(1);
  }
}

// Get purchase ID from command line
const purchaseId = process.argv[2];

if (!purchaseId) {
  console.log('Usage: node scripts/update-purchase-logo.js <purchaseId>');
  console.log('Example: node scripts/update-purchase-logo.js purchase-1767456639241-extyxfv6tbp');
  process.exit(1);
}

updatePurchaseLogo(purchaseId);

