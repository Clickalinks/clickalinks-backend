/**
 * Generate MFA Secret for Admin
 * Run with: node generate-mfa-secret.js
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

console.log('\n========================================');
console.log('🔐 Generating MFA Secret for Admin');
console.log('========================================\n');

// Generate new MFA secret
// Use 32 bytes which gives us a proper base32 secret
const secret = speakeasy.generateSecret({
  name: 'ClickALinks Admin',
  length: 32,
  issuer: 'ClickALinks'
});

console.log('✅ MFA Secret Generated!\n');
console.log('Secret:', secret.base32);
console.log('\n⚠️ IMPORTANT: Use the QR code image below (recommended)');
console.log('   OR if manual entry, ensure no spaces/extra characters\n');
console.log('========================================');
console.log('📋 Next Steps:');
console.log('========================================\n');
console.log('OPTION 1 (RECOMMENDED): Use QR Code');
console.log('   1. Open the mfa-qr-code.png file that was created');
console.log('   2. Scan it with your authenticator app');
console.log('   3. That\'s it!\n');
console.log('OPTION 2: Manual Entry');
console.log('   1. App: Google Authenticator, Authy, or similar');
console.log('   2. Choose "Manual Entry" or "Enter Setup Key"');
console.log('   3. Account Name: ClickALinks Admin');
console.log('   4. Secret: ' + secret.base32);
console.log('   5. Type: Time-based (TOTP)');
console.log('   6. ⚠️ Make sure there are NO spaces in the secret\n');
console.log('\n3. In Render Dashboard → Environment, add:');
console.log('   - ADMIN_MFA_SECRET = (paste secret)');
console.log('   - ADMIN_MFA_ENABLED = true');
console.log('\n4. Wait for deployment and test login');
console.log('========================================\n');

// Generate QR code
try {
  // Make sure we're using the base32 property
  if (!secret.base32) {
    throw new Error('Secret does not have base32 property. Secret object: ' + JSON.stringify(secret, null, 2));
  }
  
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    encoding: 'base32',
    label: 'ClickALinks Admin',
    issuer: 'ClickALinks'
  });
  
  console.log('OTP Auth URL:', otpauthUrl);
  
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
  
  console.log('📱 QR Code generated!');
  console.log('\nTo view the QR code:');
  console.log('1. Save this base64 data to a file, OR');
  console.log('2. Copy it and use an online base64 image viewer');
  console.log('\nQR Code data (first 100 chars):');
  console.log(qrCodeDataUrl.substring(0, 100) + '...\n');
  
  // Save QR code to file
  const fs = await import('fs');
  const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('mfa-qr-code.png', base64Data, 'base64');
  console.log('✅ QR code saved as: mfa-qr-code.png');
  console.log('   Open this file to scan with your authenticator app\n');
  
} catch (error) {
  console.error('⚠️ Could not generate QR code:', error.message);
  console.log('You can still use manual entry with the secret above.\n');
}

console.log('========================================\n');

