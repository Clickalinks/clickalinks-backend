/**
 * Update PROMO10 to Fixed £10 Discount
 * Changes PROMO10 from 'free' (100% discount) to 'fixed' (£10 discount)
 * 
 * Usage: node scripts/updatePromo10.js
 */

import admin from '../config/firebaseAdmin.js';

// Get Firestore instance
const db = admin.firestore();

async function updatePromo10() {
  console.log('🔄 Updating PROMO10 promo code to fixed £10 discount...\n');
  
  try {
    // Find PROMO10 code
    const promoSnapshot = await db.collection('promoCodes')
      .where('code', '==', 'PROMO10')
      .where('status', '==', 'active')
      .get();
    
    if (promoSnapshot.empty) {
      console.log('❌ PROMO10 not found in Firestore.');
      console.log('💡 Creating new PROMO10 with fixed £10 discount...');
      
      // Create new PROMO10
      const newPromo = {
        code: 'PROMO10',
        discountType: 'fixed',
        discountValue: 10,
        description: '£10 off your purchase',
        status: 'active',
        maxUses: null, // Unlimited uses
        currentUses: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('promoCodes').add(newPromo);
      console.log('✅ Created new PROMO10 with fixed £10 discount!');
      return;
    }
    
    // Update existing PROMO10 codes
    console.log(`📊 Found ${promoSnapshot.size} PROMO10 code(s) to update...`);
    
    const batch = db.batch();
    let updateCount = 0;
    
    promoSnapshot.docs.forEach(doc => {
      const docRef = db.collection('promoCodes').doc(doc.id);
      const currentData = doc.data();
      
      console.log(`📝 Updating PROMO10 (ID: ${doc.id}):`);
      console.log(`   Current: discountType=${currentData.discountType}, discountValue=${currentData.discountValue}`);
      
      batch.update(docRef, {
        discountType: 'fixed',
        discountValue: 10,
        description: '£10 off your purchase',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      updateCount++;
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`\n✅ Successfully updated ${updateCount} PROMO10 code(s)!`);
      console.log(`\n📋 New PROMO10 settings:`);
      console.log(`   discountType: fixed`);
      console.log(`   discountValue: £10`);
      console.log(`   description: £10 off your purchase`);
      console.log(`\n💰 How it works now:`);
      console.log(`   £10 campaign → £0 (deducts £10)`);
      console.log(`   £20 campaign → £10 (deducts £10)`);
      console.log(`   £30 campaign → £20 (deducts £10)`);
      console.log(`   £60 campaign → £50 (deducts £10)`);
    } else {
      console.log('⚠️ No codes to update.');
    }
    
  } catch (error) {
    console.error('❌ Error updating PROMO10:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Run the script
updatePromo10()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test PROMO10 with different campaign amounts');
    console.log('   2. Verify it deducts £10 from any amount');
    console.log('   3. Confirm it does NOT make everything free');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

