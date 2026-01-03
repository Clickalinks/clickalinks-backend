/**
 * Update Purchase Details
 * Updates the purchase document with actual business name and email
 */

import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const db = admin.firestore();

// Get values from command line or use defaults
const purchaseId = process.argv[2] || 'purchase-1767448525436-8jmhp7yx8i5';
const businessName = process.argv[3] || 'AO Accountants'; // Update this
const contactEmail = process.argv[4] || ''; // YOU MUST PROVIDE THIS

async function updatePurchase() {
  try {
    if (!contactEmail || contactEmail === '') {
      console.error('❌ Error: contactEmail is required');
      console.log('\nUsage:');
      console.log('  node update-purchase-details.js [purchaseId] [businessName] [contactEmail]');
      console.log('\nExample:');
      console.log('  node update-purchase-details.js purchase-1767448525436-8jmhp7yx8i5 "AO Accountants" "your@email.com"');
      process.exit(1);
    }
    
    console.log('📝 Updating purchase document...\n');
    console.log(`   Purchase ID: ${purchaseId}`);
    console.log(`   Business Name: ${businessName}`);
    console.log(`   Contact Email: ${contactEmail}\n`);
    
    const docRef = db.collection('purchasedSquares').doc(purchaseId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      console.error(`❌ Document ${purchaseId} not found!`);
      process.exit(1);
    }
    
    console.log('✅ Document found, updating...');
    
    await docRef.update({
      businessName: businessName,
      contactEmail: contactEmail,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Purchase document updated successfully!');
    console.log('\n🎉 The popup should now show the correct details.');
    console.log('💡 Refresh your frontend page and click the logo again.');
    
  } catch (error) {
    console.error('❌ Error updating purchase:', error);
    throw error;
  }
}

// Run the script
updatePurchase()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
