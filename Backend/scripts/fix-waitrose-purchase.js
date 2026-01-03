/**
 * Script to fix Waitrose UK purchase: correct amount and ensure emails are sent
 * Usage: node scripts/fix-waitrose-purchase.js
 */

import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';
import { sendAdminNotificationEmail, sendAdConfirmationEmail } from '../services/emailService.js';

dotenv.config();

const db = admin.firestore();
const TRANSACTION_ID = 'cs_live_a1CShNhjQpxifbaZLPSPu5p8rTaMLq71YQdpe3K1ZCMGFASmxB8SKmW0u4';

async function fixWaitrosePurchase() {
  try {
    console.log(`🔍 Finding purchase with transaction ID: ${TRANSACTION_ID}`);
    
    // Find purchase by transactionId
    const purchaseQuery = await db.collection('purchasedSquares')
      .where('transactionId', '==', TRANSACTION_ID)
      .get();
    
    if (purchaseQuery.empty) {
      console.error('❌ Purchase not found with transaction ID:', TRANSACTION_ID);
      process.exit(1);
    }
    
    const purchaseDoc = purchaseQuery.docs[0];
    const purchaseData = purchaseDoc.data();
    
    console.log(`\n📋 Current Purchase Data:`);
    console.log(`   Purchase ID: ${purchaseDoc.id}`);
    console.log(`   Business: ${purchaseData.businessName}`);
    console.log(`   Square: ${purchaseData.squareNumber}`);
    console.log(`   Current Amount: ${purchaseData.amount}`);
    console.log(`   Current Final Amount: ${purchaseData.finalAmount}`);
    console.log(`   Emails Sent: ${purchaseData.emailsSent || false}`);
    
    // The correct amount from Stripe is £10.00
    const correctAmount = 10.0;
    
    // Update purchase with correct amount
    console.log(`\n💾 Updating purchase with correct amount: £${correctAmount.toFixed(2)}`);
    await purchaseDoc.ref.update({
      amount: correctAmount,
      finalAmount: correctAmount,
      originalAmount: correctAmount,
      discountAmount: 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Purchase updated with correct amount!`);
    
    // Reset emailsSent flag to allow retry (even if already sent, we'll retry)
    console.log(`\n🔄 Resetting emailsSent flag to allow retry...`);
    await purchaseDoc.ref.update({ 
      emailsSent: false,
      emailRetryAttempt: admin.firestore.FieldValue.increment(1) || 1
    });
    console.log(`✅ Flag reset!`);
    
    // Now send emails
    console.log(`\n📧 Sending emails...`);
      
      // Send admin notification
      let adminSuccess = false;
      try {
        const adminResult = await sendAdminNotificationEmail('purchase', {
        businessName: purchaseData.businessName,
        contactEmail: purchaseData.contactEmail,
        squareNumber: purchaseData.squareNumber,
        pageNumber: purchaseData.pageNumber || 1,
        duration: purchaseData.duration || 10,
        amount: correctAmount,
        transactionId: TRANSACTION_ID,
        finalAmount: correctAmount,
        originalAmount: correctAmount,
        discountAmount: 0,
        selectedDuration: purchaseData.duration || 10,
        purchaseId: purchaseDoc.id
      });
        adminSuccess = adminResult && adminResult.success;
        if (adminSuccess) {
          console.log('✅ Admin notification email sent successfully');
        } else {
          console.error('❌ Admin notification email failed:', adminResult?.message || 'Unknown error');
        }
      } catch (err) {
        console.error('❌ Admin notification email error:', err.message);
        console.error('   Full error:', err);
      }
      
      // Send customer emails
      let customerSuccess = false;
      if (purchaseData.contactEmail) {
        try {
          const customerResult = await sendAdConfirmationEmail({
          businessName: purchaseData.businessName,
          contactEmail: purchaseData.contactEmail,
          squareNumber: purchaseData.squareNumber,
          pageNumber: purchaseData.pageNumber || 1,
          duration: purchaseData.duration || 10,
          selectedDuration: purchaseData.duration || 10,
          finalAmount: correctAmount,
          originalAmount: correctAmount,
          discountAmount: 0,
          transactionId: TRANSACTION_ID,
          website: purchaseData.website || purchaseData.dealLink || ''
        });
          customerSuccess = customerResult && customerResult.success;
          if (customerSuccess) {
            console.log('✅ Customer confirmation emails sent successfully');
          } else {
            console.error('❌ Customer confirmation emails failed:', customerResult?.message || 'Unknown error');
          }
        } catch (err) {
          console.error('❌ Customer confirmation email error:', err.message);
          console.error('   Full error:', err);
        }
      } else {
        console.warn('⚠️ No contact email provided, skipping customer emails');
      }
      
      // Update flag based on results
      if (adminSuccess || customerSuccess) {
        await purchaseDoc.ref.update({ 
          emailsSent: true,
          emailStatus: {
            adminSent: adminSuccess,
            customerSent: customerSuccess,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          }
        });
        console.log(`\n✅ Email status saved:`, { adminSent: adminSuccess, customerSent: customerSuccess });
      } else {
        console.error(`\n❌ All emails failed - keeping emailsSent as false for retry`);
      }
    
    console.log(`\n✅ All done! Purchase fixed and emails sent.`);
    console.log(`\n📋 Summary:`);
    console.log(`   Purchase ID: ${purchaseDoc.id}`);
    console.log(`   Square: ${purchaseData.squareNumber}`);
    console.log(`   Business: ${purchaseData.businessName}`);
    console.log(`   Amount: £${correctAmount.toFixed(2)}`);
    console.log(`   Email: ${purchaseData.contactEmail}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing purchase:', error);
    process.exit(1);
  }
}

fixWaitrosePurchase();

