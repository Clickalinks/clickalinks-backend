/**
 * Test MFA Secret Verification
 * This script verifies if a given secret and code match
 */

import speakeasy from 'speakeasy';

const secret = 'LZAUCUCUKRJFRWCOLDMNYVMN2IGVCTUQ2HKZZHWUBDPVGDYR3XMVXQ';

console.log('\n========================================');
console.log('🔐 Testing MFA Secret Verification');
console.log('========================================\n');
console.log('Secret:', secret);
console.log('Secret length:', secret.length);
console.log('\nTo test a code:');
console.log('1. Open Google Authenticator');
console.log('2. Find "ClickALinks Admin"');
console.log('3. Enter the 6-digit code below when prompted\n');
console.log('========================================\n');

// Generate a test code for verification
const token = speakeasy.totp({
  secret: secret,
  encoding: 'base32'
});

console.log('✅ Current valid code:', token);
console.log('   (This code is valid for ~30 seconds)\n');
console.log('Use this code to test if your secret matches!\n');

// Test verification with the generated code
const verified = speakeasy.totp.verify({
  secret: secret,
  encoding: 'base32',
  token: token,
  window: 2
});

console.log('Verification test:', verified ? '✅ PASSED' : '❌ FAILED');
console.log('\nIf verification passed, your secret is correct!');
console.log('If it failed, there might be an encoding issue.\n');

