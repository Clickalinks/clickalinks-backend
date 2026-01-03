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
const secret = speakeasy.generateSecret({
  name: 'ClickALinks Admin',
  length: 32
});

console.log('✅ MFA Secret Generated!\n');
console.log('Secret:', secret.base32);
console.log('\n========================================');
console.log('📋 Next Steps:');
console.log('========================================\n');
console.log('1. Copy the secret above');
console.log('2. Set up your authenticator app:');
console.log('   - App: Google Authenticator, Authy, or similar');
console.log('   - Account Name: ClickALinks Admin');
console.log('   - Secret: (paste the secret above)');
console.log('   - Type: Time-based (TOTP)');
console.log('\n3. In Render Dashboard → Environment, add:');
console.log('   - ADMIN_MFA_SECRET = (paste secret)');
console.log('   - ADMIN_MFA_ENABLED = true');
console.log('\n4. Wait for deployment and test login');
console.log('========================================\n');

// Generate QR code
try {
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    encoding: 'base32',
    label: 'ClickALinks Admin',
    issuer: 'ClickALinks'
  });
  
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

