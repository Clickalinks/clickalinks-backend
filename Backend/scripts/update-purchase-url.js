/**
 * Update Purchase URL
 * Updates the dealLink/website field in a purchase document
 */

import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const db = admin.firestore();

const purchaseId = process.argv[2];
const websiteUrl = process.argv[3];

async function updatePurchaseUrl() {
  try {
    if (!purchaseId || !websiteUrl) {
      console.error('❌ Error: Both purchaseId and website URL are required');
      console.log('\nUsage:');
      console.log('  node update-purchase-url.js [purchaseId] [websiteUrl]');
      console.log('\nExample:');
      console.log('  node update-purchase-url.js purchase-1767448525436-8jmhp7yx8i5 "https://aqaccountants.com"');
      process.exit(1);
    }
    
    // Validate URL format
    try {
      new URL(websiteUrl);
    } catch (e) {
      console.error('❌ Error: Invalid URL format');
      console.log('   URL must start with http:// or https://');
      process.exit(1);
    }
    
    console.log('📝 Updating purchase URL...\n');
    console.log(`   Purchase ID: ${purchaseId}`);
    console.log(`   Website URL: ${websiteUrl}\n`);
    
    const docRef = db.collection('purchasedSquares').doc(purchaseId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      console.error(`❌ Document ${purchaseId} not found!`);
      process.exit(1);
    }
    
    console.log('✅ Document found, updating...');
    
    await docRef.update({
      dealLink: websiteUrl,
      website: websiteUrl,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Purchase URL updated successfully!');
    console.log('\n🎉 Clicking the logo should now open the website.');
    console.log('💡 Refresh your frontend page and try clicking the logo.');
    
  } catch (error) {
    console.error('❌ Error updating purchase URL:', error);
    throw error;
  }
}

// Run the script
updatePurchaseUrl()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
