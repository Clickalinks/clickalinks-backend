/**
 * Script to check if a purchase has a logo and help fix it
 * Usage: node scripts/check-purchase-logo.js <purchaseId>
 * Example: node scripts/check-purchase-logo.js purchase-1767456639241-extyxfv6tbp
 */

import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const db = admin.firestore();
const storage = admin.storage();

async function checkPurchaseLogo(purchaseId) {
  try {
    console.log(`🔍 Checking purchase: ${purchaseId}`);
    
    const purchaseRef = db.collection('purchasedSquares').doc(purchaseId);
    const purchaseDoc = await purchaseRef.get();
    
    if (!purchaseDoc.exists) {
      console.error(`❌ Purchase not found: ${purchaseId}`);
      process.exit(1);
    }
    
    const purchaseData = purchaseDoc.data();
    console.log(`\n📋 Purchase Details:`);
    console.log(`   Business: ${purchaseData.businessName}`);
    console.log(`   Square: ${purchaseData.squareNumber}`);
    console.log(`   Transaction ID: ${purchaseData.transactionId}`);
    console.log(`   Logo Data: ${purchaseData.logoData ? 'PRESENT' : 'MISSING'}`);
    console.log(`   Storage Path: ${purchaseData.storagePath || 'MISSING'}`);
    
    if (purchaseData.logoData) {
      console.log(`\n✅ Logo URL exists:`);
      console.log(`   ${purchaseData.logoData.substring(0, 100)}...`);
      
      // Check if logo URL is accessible
      try {
        const response = await fetch(purchaseData.logoData, { method: 'HEAD' });
        if (response.ok) {
          console.log(`✅ Logo URL is accessible (${response.status})`);
        } else {
          console.log(`⚠️ Logo URL returned ${response.status} - may be broken`);
        }
      } catch (error) {
        console.log(`⚠️ Could not verify logo URL: ${error.message}`);
      }
    } else if (purchaseData.storagePath) {
      console.log(`\n📁 Storage path found: ${purchaseData.storagePath}`);
      console.log(`   Attempting to get download URL...`);
      
      try {
        const bucket = storage.bucket();
        const file = bucket.file(purchaseData.storagePath);
        const exists = await file.exists();
        
        if (exists[0]) {
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491' // Far future date
          });
          
          console.log(`✅ File exists in Storage!`);
          console.log(`   Download URL: ${url.substring(0, 100)}...`);
          console.log(`\n💡 To fix, update the purchase with this URL:`);
          console.log(`   logoData: "${url}"`);
          
          // Offer to update
          console.log(`\n🔄 Would you like to update the purchase with this logo URL? (yes/no)`);
          // For script automation, you can add readline here
        } else {
          console.log(`❌ File does not exist in Storage at path: ${purchaseData.storagePath}`);
        }
      } catch (error) {
        console.error(`❌ Error checking Storage: ${error.message}`);
      }
    } else {
      console.log(`\n❌ No logo data or storage path found!`);
      console.log(`\n💡 Options to fix:`);
      console.log(`   1. Check Firebase Storage for logos with transaction ID: ${purchaseData.transactionId}`);
      console.log(`   2. Check if logo was uploaded to: logos/purchase-*-${purchaseData.squareNumber}*`);
      console.log(`   3. Re-upload logo through admin panel if available`);
      
      // Try to find matching files in Storage
      if (purchaseData.transactionId) {
        console.log(`\n🔍 Searching Storage for files matching transaction...`);
        try {
          const bucket = storage.bucket();
          const [files] = await bucket.getFiles({ prefix: 'logos/' });
          
          const matchingFiles = files.filter(file => {
            const fileName = file.name;
            return fileName.includes(purchaseData.transactionId) || 
                   fileName.includes(`square-${purchaseData.squareNumber}`) ||
                   fileName.includes(purchaseData.businessName.toLowerCase().replace(/\s+/g, '-'));
          });
          
          if (matchingFiles.length > 0) {
            console.log(`\n✅ Found ${matchingFiles.length} matching file(s):`);
            matchingFiles.forEach((file, index) => {
              console.log(`   ${index + 1}. ${file.name}`);
            });
            
            if (matchingFiles.length === 1) {
              console.log(`\n💡 To use this file, update the purchase:`);
              console.log(`   storagePath: "${matchingFiles[0].name}"`);
            }
          } else {
            console.log(`   No matching files found in Storage`);
          }
        } catch (error) {
          console.error(`   Error searching Storage: ${error.message}`);
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking purchase logo:', error);
    process.exit(1);
  }
}

// Get purchase ID from command line
const purchaseId = process.argv[2];

if (!purchaseId) {
  console.log('Usage: node scripts/check-purchase-logo.js <purchaseId>');
  console.log('Example: node scripts/check-purchase-logo.js purchase-1767456639241-extyxfv6tbp');
  process.exit(1);
}

// Add fetch import for Node.js
import fetch from 'node-fetch';
global.fetch = fetch;

checkPurchaseLogo(purchaseId);

