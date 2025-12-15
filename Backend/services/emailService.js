/**
 * Email Service for ClickaLinks
 * Sends confirmation emails when ads are uploaded
 * 
 * Supports multiple email providers:
 * - SMTP (Gmail, Outlook, custom SMTP)
 * - SendGrid
 * - Resend (recommended for production)
 */

import nodemailer from 'nodemailer';
// Invoice PDF generation removed - using HTML invoice in email instead

/**
 * Create email transporter based on environment variables
 */
function createTransporter() {
  // Option 1: SendGrid (recommended for production)
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 465,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // Option 2: SMTP (Gmail, Outlook, custom - including IONOS)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = parseInt(process.env.SMTP_PORT || '465');
    const isSecure = process.env.SMTP_SECURE === 'true';
    
    console.log(`📧 Creating SMTP transporter: ${process.env.SMTP_HOST}:${port} (secure: ${isSecure})`);
    console.log(`📧 SMTP User: ${process.env.SMTP_USER}`);
    
    // IONOS requires TLS for port 465 (STARTTLS)
    // secure: false means use STARTTLS (upgrade connection to TLS)
    // secure: true means use direct SSL/TLS connection (for port 465)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: isSecure, // true for 465 (SSL), false for 465 (STARTTLS/TLS)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        // IONOS requires TLS to be activated for port 465
        // rejectUnauthorized: false allows self-signed certificates
        rejectUnauthorized: false,
        // Use modern TLS (IONOS supports TLS 1.2+)
        minVersion: 'TLSv1.2'
      },
      // IONOS-specific: Connection settings
      connectionTimeout: 15000, // 15 seconds (increased for reliability)
      greetingTimeout: 10000,
      socketTimeout: 15000,
      // Require TLS upgrade for port 465 (IONOS requirement)
      requireTLS: port === 465 ? true : false
    });
  }

  // Option 3: Gmail OAuth2 (if using Gmail)
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN
      }
    });
  }

  // Fallback: No email configured - return null (emails will be skipped)
  console.warn('⚠️ No email service configured. Emails will not be sent.');
  return null;
}

/**
 * Send admin notification email
 * Notifies admin when purchases or promo codes are used
 */
export async function sendAdminNotificationEmail(type, data) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.error('❌ Email service not configured - cannot send admin notification');
    console.error('❌ Please configure SMTP_HOST, SMTP_USER, SMTP_PASS or SENDGRID_API_KEY');
    return { success: false, message: 'Email service not configured' };
  }

  // Support both underscore and hyphen versions of the env variable name
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 
                     process.env['ADMIN-NOTIFICATION-EMAIL'] || 
                     'stentar-pants@hotmail.com';
  console.log(`📧 Admin notification email will be sent to: ${adminEmail}`);
  
  let subject = '';
  let htmlContent = '';
  let textContent = '';

  if (type === 'purchase') {
    // Extract all possible fields with fallbacks to ensure we get the data
    const businessName = data.businessName || 'Unknown Business';
    const contactEmail = data.contactEmail || 'No email provided';
    const squareNumber = data.squareNumber || data.square || 0;
    const pageNumber = data.pageNumber || 1;
    const selectedDuration = data.selectedDuration || data.duration || 30;
    const duration = data.duration || selectedDuration || 30;
    const finalAmount = data.finalAmount || data.amount || 0;
    const originalAmount = data.originalAmount !== undefined ? data.originalAmount : (finalAmount + (data.discountAmount || 0));
    const discountAmount = data.discountAmount || 0;
    const transactionId = data.transactionId || data.sessionId || 'N/A';
    const promoCode = data.promoCode || null;
    
    // Use selectedDuration or duration, whichever is available
    const campaignDuration = selectedDuration || duration || 30;
    const originalAmt = originalAmount !== undefined ? originalAmount : (finalAmount + discountAmount);
    const discountAmt = discountAmount || 0;
    const finalAmt = finalAmount || 0;
    
    console.log('📧 Admin notification - Purchase data extracted:', {
      businessName,
      contactEmail,
      squareNumber,
      pageNumber,
      campaignDuration,
      originalAmt,
      discountAmt,
      finalAmt,
      transactionId,
      promoCode
    });

    subject = `🛒 New Purchase - Square #${squareNumber}`;
    
    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 New Purchase Notification</h1>
            <p>A new square has been purchased!</p>
          </div>
          <div class="content">
            <div class="info-box">
              <h3 style="margin-top: 0;">📋 Purchase Details</h3>
              <div class="info-row">
                <span class="label">Business Name:</span>
                <span class="value">${businessName || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">Contact Email:</span>
                <span class="value">${contactEmail || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">Square Number:</span>
                <span class="value">#${squareNumber} (Page ${pageNumber})</span>
              </div>
              <div class="info-row">
                <span class="label">Duration:</span>
                <span class="value">${campaignDuration} days</span>
              </div>
              <div class="info-row">
                <span class="label">Original Amount:</span>
                <span class="value">£${originalAmt.toFixed(2)}</span>
              </div>
              ${discountAmt > 0 ? `
              <div class="info-row">
                <span class="label">Discount:</span>
                <span class="value" style="color: #10b981;">-£${discountAmt.toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="label">Final Amount:</span>
                <span class="value" style="font-weight: bold; color: #667eea; font-size: 1.1em;">£${finalAmt.toFixed(2)}</span>
              </div>
              ${transactionId ? `
              <div class="info-row">
                <span class="label">Transaction ID:</span>
                <span class="value" style="font-family: monospace; font-size: 12px;">${transactionId}</span>
              </div>
              ` : ''}
              ${promoCode ? `
              <div class="info-row">
                <span class="label">Promo Code Used:</span>
                <span class="value" style="font-weight: bold; color: #28a745;">${promoCode}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="label">Purchase Date:</span>
                <span class="value">${new Date().toLocaleString('en-GB')}</span>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    textContent = `
New Purchase Notification

A new square has been purchased!

Purchase Details:
- Business Name: ${businessName || 'N/A'}
- Contact Email: ${contactEmail || 'N/A'}
- Square Number: #${squareNumber} (Page ${pageNumber})
- Duration: ${campaignDuration} days
- Original Amount: £${originalAmt.toFixed(2)}
${discountAmt > 0 ? `- Discount: -£${discountAmt.toFixed(2)}\n` : ''}
- Final Amount: £${finalAmt.toFixed(2)}
${transactionId ? `- Transaction ID: ${transactionId}\n` : ''}
${promoCode ? `- Promo Code Used: ${promoCode}\n` : ''}
- Purchase Date: ${new Date().toLocaleString('en-GB')}
    `;
  } else if (type === 'promo_code') {
    const {
      code,
      businessName,
      userEmail,
      discountAmount,
      originalAmount,
      finalAmount
    } = data;

    subject = `🎫 Promo Code Applied - ${code}`;
    
    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Promo Code Applied</h1>
            <p>A promo code has been used!</p>
          </div>
          <div class="content">
            <div class="info-box">
              <h3 style="margin-top: 0;">📋 Promo Code Details</h3>
              <div class="info-row">
                <span class="label">Promo Code:</span>
                <span class="value" style="font-weight: bold; color: #28a745;">${code}</span>
              </div>
              ${businessName ? `
              <div class="info-row">
                <span class="label">Business Name:</span>
                <span class="value">${businessName}</span>
              </div>
              ` : ''}
              ${userEmail ? `
              <div class="info-row">
                <span class="label">User Email:</span>
                <span class="value">${userEmail}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="label">Original Amount:</span>
                <span class="value">£${(originalAmount || 0).toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span class="label">Discount:</span>
                <span class="value" style="color: #28a745;">-£${(discountAmount || 0).toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span class="label">Final Amount:</span>
                <span class="value" style="font-weight: bold; color: #667eea;">£${(finalAmount || 0).toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span class="label">Applied Date:</span>
                <span class="value">${new Date().toLocaleString('en-GB')}</span>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    textContent = `
Promo Code Applied Notification

A promo code has been used!

Promo Code Details:
- Promo Code: ${code}
${businessName ? `- Business Name: ${businessName}\n` : ''}
${userEmail ? `- User Email: ${userEmail}\n` : ''}
- Original Amount: £${(originalAmount || 0).toFixed(2)}
- Discount: -£${(discountAmount || 0).toFixed(2)}
- Final Amount: £${(finalAmount || 0).toFixed(2)}
- Applied Date: ${new Date().toLocaleString('en-GB')}
    `;
  }

  try {
    const fromEmail = process.env.EMAIL_FROM || `"ClickaLinks" <${process.env.SMTP_USER || 'noreply@clickalinks.com'}>`;
    
    console.log(`📧 Sending admin notification email:`);
    console.log(`   From: ${fromEmail}`);
    console.log(`   To: ${adminEmail}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Type: ${type}`);
    console.log(`   SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`   SMTP User: ${process.env.SMTP_USER}`);
    console.log(`   SMTP Port: ${process.env.SMTP_PORT || 465}`);
    if (type === 'purchase') {
      console.log(`   Business: ${data.businessName || 'N/A'}`);
      console.log(`   Square: #${data.squareNumber || 'N/A'}`);
      console.log(`   Amount: £${(data.finalAmount || 0).toFixed(2)}`);
      console.log(`   Promo Code: ${data.promoCode || 'None'}`);
    }
    
    const mailOptions = {
      from: fromEmail,
      to: adminEmail,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification email sent successfully:', info.messageId);
    console.log(`   Response: ${info.response}`);
    console.log(`   Accepted: ${info.accepted}`);
    console.log(`   Rejected: ${info.rejected}`);
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Admin notification email sent successfully'
    };
  } catch (error) {
    console.error('❌ Error sending admin notification email:', error);
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Error response:', error.response);
    console.error('   Error command:', error.command);
    console.error('   Full error:', JSON.stringify(error, null, 2));
    
    // Provide helpful error messages
    let errorMessage = error.message;
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      errorMessage = 'SMTP authentication failed (Error 535). IONOS requires SMTP sending to be enabled in the control panel.';
      console.error('🔐 SMTP AUTHENTICATION ERROR (535):');
      console.error('   This is an IONOS-specific issue. Solutions:');
      console.error('   1. Enable SMTP sending in IONOS control panel for ads@clickalinks.com');
      console.error('   2. Verify SMTP_USER is correct (e.g., ads@clickalinks.com)');
      console.error('   3. Reset email password in IONOS and update SMTP_PASS in Render.com');
      console.error('   4. Check if IONOS account supports external SMTP');
      console.error('   5. Some IONOS accounts require a separate SMTP password');
      console.error('   See IONOS_SMTP_FIX.md for detailed instructions');
      console.error('   - For IONOS, ensure SMTP is enabled for the email account');
      console.error('   - Some email providers require app-specific passwords');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = 'SMTP connection failed. Check SMTP_HOST and SMTP_PORT settings.';
      console.error('🔌 SMTP CONNECTION ERROR:');
      console.error('   - Verify SMTP_HOST is correct (e.g., smtp.ionos.co.uk)');
      console.error('   - Verify SMTP_PORT is correct (465 for TLS, 465 for SSL)');
      console.error('   - Check if SMTP_SECURE is set correctly');
    }
    
    return { 
      success: false, 
      error: errorMessage,
      code: error.code,
      message: 'Failed to send admin notification email'
    };
  }
}

/**
 * Send confirmation email when ad is uploaded
 */
export async function sendAdConfirmationEmail(purchaseData) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('📧 Email service not configured - skipping email');
    return { success: false, message: 'Email service not configured' };
  }

  const {
    contactEmail,
    businessName,
    squareNumber,
    pageNumber = 1,
    selectedDuration = 30,
    finalAmount = 0,
    originalAmount = finalAmount,
    discountAmount = 0,
    transactionId,
    promoCode,
    logoData,
    paymentStatus = 'paid'
  } = purchaseData;

  if (!contactEmail) {
    console.warn('⚠️ No email address provided - skipping email');
    return { success: false, message: 'No email address provided' };
  }

  // Calculate dates
  const startDate = new Date();
  const endDate = new Date(Date.now() + selectedDuration * 24 * 60 * 60 * 1000);
  const invoiceDate = new Date();

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `INV-${dateStr}-${random}`;
  };
  
  const invoiceNumber = generateInvoiceNumber();
  
  // Calculate amounts correctly
  const originalAmt = originalAmount !== undefined ? originalAmount : (finalAmount || 10);
  const discountAmt = discountAmount || 0;
  const totalAmount = Math.max(0, originalAmt - discountAmt);
  
  console.log('📧 Invoice data calculation:', {
    originalAmount: originalAmt,
    discountAmount: discountAmt,
    totalAmount: totalAmount,
    invoiceNumber: invoiceNumber
  });

  // Generate downloadable HTML invoice
  const invoiceHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber} - ClickaLinks</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #f5f7fa;
      padding: 40px 20px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    .invoice-header {
      background: linear-gradient(135deg,rgba(37, 100, 235, 0.54) 0%,rgba(30, 64, 175, 0.67) 100%);
      color: white;
      padding: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .invoice-header-left {
      flex: 1;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }
    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
      color: white;
    }
    .invoice-header h1 {
      font-size: 32px;
      margin: 0;
      font-weight: 700;
      color: white;
      letter-spacing: -0.5px;
    }
    .invoice-header .tagline {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 5px;
    }
    .invoice-header-right {
      text-align: right;
    }
    .invoice-header-right p {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.95);
      margin: 5px 0;
    }
    .invoice-header-right a {
      color: rgba(255, 255, 255, 0.95);
      text-decoration: none;
    }
    .invoice-body {
      padding: 40px;
    }
    .invoice-meta {
      margin-bottom: 40px;
      padding: 20px 0;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .invoice-meta-left {
      flex: 1;
    }
    .invoice-meta-right {
      text-align: right;
    }
    .invoice-meta p {
      color: #4a5568;
      font-size: 14px;
      margin: 8px 0;
      line-height: 1.6;
    }
    .bill-to {
      margin-bottom: 40px;
    }
    .bill-to h3 {
      font-size: 14px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    .bill-to p {
      color: #2d3748;
      font-size: 15px;
      margin: 5px 0;
    }
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .invoice-table thead {
      background: #f7fafc;
    }
    .invoice-table th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: #2d3748;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
    }
    .invoice-table td {
      padding: 20px 15px;
      border-bottom: 1px solid #e2e8f0;
      color: #4a5568;
    }
    .invoice-table tbody tr:last-child td {
      border-bottom: none;
    }
    .text-right {
      text-align: right;
    }
    .discount-row {
      background: #f0fdf4;
    }
    .discount-row td {
      color: #10b981;
      font-weight: 600;
    }
    .totals {
      margin-top: 30px;
      margin-left: auto;
      width: 300px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .total-row:last-child {
      border-bottom: none;
    }
    .total-label {
      font-weight: 600;
      color: #4a5568;
    }
    .total-amount {
      font-weight: 600;
      color: #2d3748;
    }
    .total-box {
      background: #f7fafc;
      border: 2px solid #667eea;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    .total-box.free-box {
      background: #f0fdf4;
      border: 2px solid #10b981;
    }
    .total-box .total-row {
      border-bottom: none;
    }
    .total-box .total-label {
      font-size: 18px;
      color: #2d3748;
    }
    .total-box .total-amount {
      font-size: 24px;
      color: #667eea;
      font-weight: 700;
    }
    .free-amount {
      color: #10b981 !important;
      font-size: 32px !important;
      font-weight: 700 !important;
    }
    .free-label {
      color: #10b981 !important;
      font-size: 18px !important;
    }
    .campaign-details {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 2px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
    }
    .campaign-details-left h3, .campaign-details-right h3 {
      font-size: 14px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    .campaign-details-left p, .campaign-details-right p {
      color: #4a5568;
      font-size: 14px;
      margin: 8px 0;
    }
    .status-paid {
      color: #667eea;
      font-weight: 600;
      font-size: 16px;
    }
    .status-free {
      color: #10b981;
      font-weight: 700;
      font-size: 20px;
    }
    .promo-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 8px;
    }
    .invoice-footer {
      background: #f7fafc;
      padding: 30px 40px;
      text-align: center;
      color: #718096;
      font-size: 13px;
    }
    .invoice-footer a {
      color: #667eea;
      text-decoration: none;
    }
    @media print {
      body { background: white; padding: 0; }
      .invoice-container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <div class="invoice-header-left">
        <div class="logo-container">
          <div class="logo-icon">C</div>
          <div>
            <h1>Clickalinks</h1>
            <p class="tagline">Click Shop, Repeat</p>
          </div>
        </div>
      </div>
      <div class="invoice-header-right">
        <p><strong>Clicado Media UK Ltd</strong></p>
        <p><a href="mailto:support@clickalinks.com">support@clickalinks.com</a></p>
        <p><a href="https://clickalinks.com">https://clickalinks.com</a></p>
      </div>
    </div>
    
    <div class="invoice-body">
      <div class="invoice-meta">
        <div class="invoice-meta-left">
          <p><strong>Date:</strong> ${invoiceDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}
        </div>
        <div class="invoice-meta-right">
          <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
        </div>
      </div>

      <div class="bill-to">
        <h3>Bill To</h3>
        <p><strong>${businessName || 'N/A'}</strong></p>
        <p>${contactEmail || ''}</p>
        ${purchaseData.website ? `<p>${purchaseData.website}</p>` : ''}
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Duration</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Advertising Campaign - Square #${squareNumber} (Page ${pageNumber})</td>
            <td>${selectedDuration} days</td>
            <td class="text-right">£${originalAmt.toFixed(2)}</td>
          </tr>
          ${discountAmt > 0 ? `
          <tr class="discount-row">
            <td>Discount${promoCode ? ` (${promoCode})` : ''}</td>
            <td></td>
            <td class="text-right">-£${discountAmt.toFixed(2)}</td>
          </tr>
          ` : ''}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span class="total-label">Subtotal:</span>
          <span class="total-amount">£${originalAmt.toFixed(2)}</span>
        </div>
        ${discountAmt > 0 ? `
        <div class="total-row">
          <span class="total-label" style="color: #10b981;">Discount:</span>
          <span class="total-amount" style="color: #10b981;">-£${discountAmt.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total-box ${totalAmount === 0 ? 'free-box' : ''}">
          <div class="total-row">
            <span class="total-label ${totalAmount === 0 ? 'free-label' : ''}">${totalAmount === 0 ? 'Final Total:' : 'Total:'}</span>
            <span class="total-amount ${totalAmount === 0 ? 'free-amount' : ''}">${totalAmount === 0 ? 'FREE' : `£${totalAmount.toFixed(2)}`}</span>
          </div>
        </div>
      </div>

      <div class="campaign-details">
        <div class="campaign-details-left">
          <h3>Campaign Details</h3>
          <p><strong>Start:</strong> ${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          <p><strong>End:</strong> ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          <p><strong>Square:</strong> #${squareNumber}</p>
          <p><strong>Page:</strong> ${pageNumber}</p>
        </div>
        <div class="campaign-details-right">
          <h3>Payment Status</h3>
          <p class="${totalAmount === 0 ? 'status-free' : 'status-paid'}"><strong>${totalAmount === 0 ? 'FREE' : 'PAID'}</strong></p>
          ${totalAmount === 0 && promoCode ? `<span class="promo-badge">Promo: ${promoCode}</span>` : ''}
        </div>
      </div>
    </div>

    <div class="invoice-footer">
      <p>Thank you for choosing ClickaLinks!</p>
      <p><a href="mailto:support@clickalinks.com">support@clickalinks.com</a> | <a href="https://clickalinks.com">https://clickalinks.com</a></p>
      <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Clicado Media UK Ltd. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  // Email template with downloadable invoice
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-icon { font-size: 48px; margin-bottom: 10px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .invoice-section { background: white; padding: 30px; margin: 30px 0; border-radius: 8px; border: 2px solid #e2e8f0; }
        .invoice-section h3 { color: #667eea; margin-bottom: 20px; }
        .download-btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 600; margin-top: 15px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">🎉</div>
          <h1>Welcome to ClickaLinks!</h1>
          <p>Your advertising campaign is now live!</p>
        </div>
        <div class="content">
          <h2>Hello ${businessName || 'Valued Customer'}!</h2>
          <p>Thank you for choosing ClickaLinks. Your advertising campaign has been successfully activated and is now live on our platform.</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0;">📋 Campaign Details</h3>
            <div class="info-row">
              <span class="label">Business Name:</span>
              <span class="value">${businessName || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Advertising Square:</span>
              <span class="value">#${squareNumber} (Page ${pageNumber})</span>
            </div>
            <div class="info-row">
              <span class="label">Campaign Duration:</span>
              <span class="value">${selectedDuration} days</span>
            </div>
            <div class="info-row">
              <span class="label">Start Date:</span>
              <span class="value">${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div class="info-row">
              <span class="label">End Date:</span>
              <span class="value">${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            ${totalAmount > 0 ? `
            <div class="info-row">
              <span class="label">Total Paid:</span>
              <span class="value" style="font-weight: bold; color: #667eea;">£${totalAmount.toFixed(2)}</span>
            </div>
            ` : `
            <div class="info-row">
              <span class="label">Total:</span>
              <span class="value" style="font-weight: bold; color: #10b981;">£0.00 (FREE)</span>
            </div>
            `}
            ${transactionId ? `
            <div class="info-row">
              <span class="label">Transaction ID:</span>
              <span class="value" style="font-family: monospace; font-size: 12px;">${transactionId}</span>
            </div>
            ` : ''}
          </div>

          <div class="invoice-section">
            <h3>📄 Your Invoice</h3>
            <p>Your invoice is ready to download. Click the button below to save it as an HTML file that you can open, print, or save for your records.</p>
            <p style="margin-top: 10px; color: #666; font-size: 14px;"><strong>Invoice #:</strong> ${invoiceNumber}</p>
            <a href="data:text/html;charset=utf-8,${encodeURIComponent(invoiceHTML)}" download="Invoice-${invoiceNumber}.html" class="download-btn">📥 Download Invoice</a>
            <p style="margin-top: 15px; color: #666; font-size: 13px;">💡 <strong>Tip:</strong> Right-click the button and select "Save link as..." to save the invoice file.</p>
          </div>

          <h3>✨ What Happens Next?</h3>
          <ul>
            <li><strong>Your ad is live:</strong> Your logo is now visible on square #${squareNumber} and ready to attract customers!</li>
            <li><strong>Clickable link:</strong> Visitors can click your logo to visit your website.</li>
            <li><strong>Fair placement:</strong> Your position may change during shuffles, ensuring fair visibility for all businesses.</li>
            <li><strong>Active duration:</strong> Your ad will remain active for ${selectedDuration} days.</li>
          </ul>

          <div style="text-align: center;">
            <a href="${(process.env.FRONTEND_URL || 'https://clickalinks-frontend.web.app').replace('www.clickalinks-frontend.web.app', 'clickalinks-frontend.web.app')}/page${pageNumber}" class="button">View Your Live Ad</a>
          </div>

          <div class="footer">
            <p>Need help? Contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}">${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}</a></p>
            <p>&copy; ${new Date().getFullYear()} ClickaLinks. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Plain text version (for email clients that don't support HTML)
  const textContent = `
Welcome to ClickaLinks!

Hello ${businessName || 'Valued Customer'}!

Thank you for choosing ClickaLinks. Your advertising campaign has been successfully activated and is now live on our platform.

Campaign Details:
- Business Name: ${businessName || 'N/A'}
- Advertising Square: #${squareNumber} (Page ${pageNumber})
- Campaign Duration: ${selectedDuration} days
- Start Date: ${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
- End Date: ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
${finalAmount > 0 ? `- Total Paid: £${finalAmount.toFixed(2)}\n` : ''}
${transactionId ? `- Transaction ID: ${transactionId}\n` : ''}

What Happens Next?
- Your ad is live: Your logo is now visible on square #${squareNumber}
- Clickable link: Visitors can click your logo to visit your website
- Fair placement: Your position may change during shuffles
- Active duration: Your ad will remain active for ${selectedDuration} days

View your live ad: ${(process.env.FRONTEND_URL || 'https://clickalinks-frontend.web.app').replace('www.clickalinks-frontend.web.app', 'clickalinks-frontend.web.app')}/page${pageNumber}

Need help? Contact us at ${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}

© ${new Date().getFullYear()} ClickaLinks. All rights reserved.
  `;

  try {
    const fromEmail = process.env.EMAIL_FROM || `"ClickaLinks" <${process.env.SMTP_USER || 'noreply@clickalinks.com'}>`;
    
    console.log(`📧 Attempting to send confirmation email:`);
    console.log(`   From: ${fromEmail}`);
    console.log(`   To: ${contactEmail}`);
    console.log(`   Subject: 🎉 Your ClickaLinks Ad is Live! - Square #${squareNumber}`);
    console.log(`   Business: ${businessName}`);
    console.log(`   Amount: £${finalAmount.toFixed(2)}`);
    console.log(`   Promo Code: ${promoCode || 'None'}`);
    console.log(`   Transaction ID: ${transactionId || 'N/A'}`);
    
    const mailOptions = {
      from: fromEmail,
      to: contactEmail,
      subject: `🎉 Your ClickaLinks Ad is Live! - Square #${squareNumber}`,
      text: textContent,
      html: htmlContent,
      attachments: []
    };

    // Invoice is now embedded as downloadable HTML in the email body
    console.log(`📄 Invoice HTML generated: Invoice-${invoiceNumber}.html`);

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent successfully:', info.messageId);
    console.log(`   Response: ${info.response}`);
    console.log(`   Accepted: ${info.accepted}`);
    console.log(`   Rejected: ${info.rejected}`);
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    console.error('   Error code:', error.code);
    console.error('   Error command:', error.command);
    console.error('   Error response:', error.response);
    console.error('   Error responseCode:', error.responseCode);
    console.error('   Error message:', error.message);
    console.error('   Full error:', JSON.stringify(error, null, 2));
    
    // Provide more detailed error message
    let errorMessage = error.message || 'Failed to send email';
    if (error.code === 'EAUTH') {
      errorMessage = 'SMTP authentication failed. Check SMTP_USER and SMTP_PASS.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = `Cannot connect to SMTP server ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`;
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'SMTP connection timeout. Check SMTP_HOST and network.';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      errorCode: error.code,
      message: 'Failed to send email'
    };
  }
}

