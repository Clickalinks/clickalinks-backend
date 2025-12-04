/**
 * Check Page 10 Purchases
 * Diagnoses why page 10 logos might not be shuffling
 * 
 * Usage: node scripts/checkPage10Purchases.js
 */

import admin from '../config/firebaseAdmin.js';

// Get Firestore instance
const db = admin.firestore();

async function checkPage10Purchases() {
  console.log('🔍 Checking Page 10 purchases...\n');
  
  try {
    // Get all purchases
    const allPurchasesSnapshot = await db.collection('purchasedSquares')
      .where('status', '==', 'active')
      .get();
    
    console.log(`📊 Total active purchases: ${allPurchasesSnapshot.size}\n`);
    
    // Filter and analyze
    const now = new Date();
    const page10Purchases = [];
    const page10Issues = [];
    const allPages = {};
    
    allPurchasesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const purchaseId = data.purchaseId || doc.id;
      const squareNumber = data.squareNumber || 0;
      const pageNumber = data.pageNumber || Math.ceil(squareNumber / 200);
      
      // Track all pages
      allPages[pageNumber] = (allPages[pageNumber] || 0) + 1;
      
      // Check if it's page 10
      if (pageNumber === 10 || (squareNumber >= 1801 && squareNumber <= 2000)) {
        const issues = [];
        
        // Check expiration
        if (data.endDate) {
          const endDate = data.endDate.toDate ? data.endDate.toDate() : new Date(data.endDate);
          if (endDate <= now) {
            issues.push(`EXPIRED (expired: ${endDate.toISOString()})`);
          }
        }
        
        // Check payment status
        if (data.paymentStatus && data.paymentStatus !== 'paid') {
          issues.push(`UNPAID (status: ${data.paymentStatus})`);
        }
        
        // Check logo
        const logoData = data.logoData;
        let hasValidLogo = false;
        if (logoData && typeof logoData === 'string' && logoData.trim() !== '') {
          if (logoData.startsWith('http://') || logoData.startsWith('https://') || logoData.startsWith('data:')) {
            hasValidLogo = true;
          }
        }
        if (!hasValidLogo) {
          issues.push('NO VALID LOGO');
        }
        
        const purchaseInfo = {
          purchaseId,
          docId: doc.id,
          squareNumber,
          pageNumber,
          businessName: data.businessName || 'Unknown',
          paymentStatus: data.paymentStatus || 'unknown',
          hasLogo: hasValidLogo,
          endDate: data.endDate ? (data.endDate.toDate ? data.endDate.toDate().toISOString() : data.endDate) : 'none',
          issues: issues.length > 0 ? issues : ['OK']
        };
        
        if (issues.length > 0) {
          page10Issues.push(purchaseInfo);
        } else {
          page10Purchases.push(purchaseInfo);
        }
      }
    });
    
    console.log(`📄 Page distribution (all pages):`);
    Object.entries(allPages)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .forEach(([page, count]) => {
        console.log(`   Page ${page}: ${count} purchases`);
      });
    
    console.log(`\n📄 Page 10 Analysis:`);
    console.log(`   ✅ Valid purchases (will shuffle): ${page10Purchases.length}`);
    console.log(`   ❌ Purchases with issues (won't shuffle): ${page10Issues.length}`);
    
    if (page10Purchases.length > 0) {
      console.log(`\n✅ Valid Page 10 purchases:`);
      page10Purchases.forEach(p => {
        console.log(`   - Square #${p.squareNumber}: ${p.businessName} (${p.purchaseId.substring(0, 20)}...)`);
      });
    }
    
    if (page10Issues.length > 0) {
      console.log(`\n❌ Page 10 purchases with issues:`);
      page10Issues.forEach(p => {
        console.log(`   - Square #${p.squareNumber}: ${p.businessName}`);
        console.log(`     Issues: ${p.issues.join(', ')}`);
        console.log(`     Payment: ${p.paymentStatus}, Logo: ${p.hasLogo ? 'Yes' : 'No'}, EndDate: ${p.endDate}`);
      });
    }
    
    // Check squares 1801-2000 specifically
    console.log(`\n🔍 Checking squares 1801-2000 (Page 10 range):`);
    const page10Squares = [];
    for (let sq = 1801; sq <= 2000; sq++) {
      const purchasesForSquare = allPurchasesSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.squareNumber === sq;
      });
      if (purchasesForSquare.length > 0) {
        purchasesForSquare.forEach(doc => {
          const data = doc.data();
          page10Squares.push({
            square: sq,
            purchaseId: data.purchaseId || doc.id,
            businessName: data.businessName || 'Unknown',
            pageNumber: data.pageNumber || Math.ceil(sq / 200)
          });
        });
      }
    }
    
    console.log(`   Found ${page10Squares.length} purchases in squares 1801-2000`);
    if (page10Squares.length > 0) {
      page10Squares.forEach(p => {
        console.log(`   - Square #${p.square}: ${p.businessName} (Page ${p.pageNumber})`);
      });
    }
    
    console.log(`\n💡 Recommendations:`);
    if (page10Issues.length > 0) {
      console.log(`   - Fix ${page10Issues.length} purchases with issues to include them in shuffle`);
    }
    if (page10Purchases.length === 0 && page10Squares.length === 0) {
      console.log(`   - No purchases found on page 10 - this is normal if you haven't uploaded logos there`);
    }
    if (page10Purchases.length > 0) {
      console.log(`   - ${page10Purchases.length} valid purchases should shuffle correctly`);
    }
    
  } catch (error) {
    console.error('❌ Error checking page 10 purchases:', error);
    throw error;
  }
}

// Run the script
checkPage10Purchases()
  .then(() => {
    console.log('\n✅ Diagnostic completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

