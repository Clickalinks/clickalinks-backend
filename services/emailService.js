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

// Debug logging
console.log('📧 Email Service Initializing...');
console.log('📧 Checking environment variables...');
console.log('📧 SMTP_HOST:', process.env.SMTP_HOST ? 'SET' : 'NOT SET');
console.log('📧 SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET');
console.log('📧 SMTP_PASS:', process.env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET');
console.log('📧 SMTP_PORT:', process.env.SMTP_PORT || '465 (default)');
console.log('📧 SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET');
console.log('📧 EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set (will use SMTP_USER)');

/**
 * Create email transporter based on environment variables
 */
function createTransporter() {
  // Option 1: SendGrid (recommended for production)
  if (process.env.SENDGRID_API_KEY) {
    console.log('📧 Using SendGrid transport');
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 465,
      secure: true,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // Option 2: SMTP (Gmail, Outlook, custom - including IONOS)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = parseInt(process.env.SMTP_PORT || '465');
    const isSecure = process.env.SMTP_SECURE !== 'false';
    
    console.log(`📧 Creating SMTP transporter: ${process.env.SMTP_HOST}:${port} (secure: ${isSecure})`);
    console.log(`📧 SMTP User: ${process.env.SMTP_USER}`);
    
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development'
    });
  }

  // Fallback: No email configured - return null
  console.error('⚠️ ⚠️ ⚠️ EMAIL SERVICE NOT CONFIGURED ⚠️ ⚠️ ⚠️');
  console.error('⚠️ No email service configured. Emails will not be sent.');
  return null;
}

/**
 * Send welcome email (first email - no invoice)
 */
async function sendWelcomeEmail(purchaseData) {
  const transporter = createTransporter();
  
  if (!transporter) {
    return { success: false, message: 'Email service not configured' };
  }

  const {
    contactEmail,
    businessName,
    squareNumber,
    pageNumber = 1,
    selectedDuration = 30,
    transactionId
  } = purchaseData;

  if (!contactEmail) {
    return { success: false, message: 'No email address provided' };
  }

  // Calculate dates
  const startDate = new Date();
  const endDate = new Date(Date.now() + selectedDuration * 24 * 60 * 60 * 1000);

  // FIXED: Use correct logo path
  const frontendUrl = (process.env.FRONTEND_URL || 'https://clickalinks-frontend.web.app').replace('www.clickalinks-frontend.web.app', 'clickalinks-frontend.web.app');
  const logoUrl = `${frontendUrl}/logo.PNG`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #1a202c; 
          margin: 0; 
          padding: 0; 
          background: #f7fafc;
        }
        .email-wrapper { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          padding: 40px 20px; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #ffffff; 
          border-radius: 16px; 
          overflow: hidden; 
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .logo-img {
          max-width: 200px;
          height: auto;
          margin-bottom: 15px;
        }
        .header h1 { 
          margin: 0 0 10px 0; 
          font-size: 32px; 
          font-weight: 800; 
          letter-spacing: -0.5px;
        }
        .header p { 
          margin: 0; 
          font-size: 16px; 
          opacity: 0.95; 
          font-weight: 500;
        }
        .content { 
          padding: 40px 30px; 
          background: #ffffff; 
        }
        .greeting { 
          font-size: 24px; 
          font-weight: 700; 
          color: #1a202c;
          margin-bottom: 20px;
        }
        .intro-text { 
          font-size: 16px; 
          color: #4a5568; 
          line-height: 1.8; 
          margin-bottom: 30px;
        }
        .intro-text strong {
          color: #667eea;
          font-weight: 700;
        }
        .info-box { 
          background: #f8fafc; 
          border: 2px solid #e2e8f0; 
          border-left: 5px solid #667eea;
          border-radius: 12px; 
          padding: 25px; 
          margin: 25px 0;
        }
        .info-box h3 { 
          margin: 0 0 20px 0; 
          font-size: 18px; 
          font-weight: 700; 
          color: #2d3748;
        }
        .info-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 12px 0; 
          border-bottom: 1px solid #e2e8f0; 
        }
        .info-row:last-child { 
          border-bottom: none; 
        }
        .label { 
          font-weight: 600; 
          color: #4a5568; 
          font-size: 14px;
        }
        .value { 
          color: #1a202c; 
          font-size: 14px; 
          font-weight: 600; 
          text-align: right;
        }
        .whats-next { 
          margin-top: 30px; 
          padding: 25px; 
          background: #fff5f5; 
          border-radius: 12px; 
          border-left: 5px solid #f56565;
        }
        .whats-next h3 { 
          font-size: 20px; 
          font-weight: 700; 
          color: #c53030; 
          margin-bottom: 15px;
        }
        .whats-next ul { 
          list-style: none; 
          padding: 0; 
          margin: 0; 
        }
        .whats-next li { 
          padding: 10px 0; 
          color: #4a5568; 
          font-size: 15px; 
          line-height: 1.7;
          padding-left: 25px;
          position: relative;
        }
        .whats-next li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #f56565;
          font-weight: bold;
        }
        .button-container { 
          text-align: center; 
          margin: 35px 0 25px 0; 
        }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 15px 35px; 
          text-decoration: none; 
          border-radius: 50px; 
          font-weight: 700; 
          font-size: 16px; 
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }
        .button:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }
        .footer { 
          background: #2d3748; 
          padding: 30px; 
          text-align: center; 
        }
        .footer p { 
          margin: 8px 0; 
          color: #a0aec0; 
          font-size: 13px; 
        }
        .footer a { 
          color: #90cdf4; 
          text-decoration: none; 
        }
        @media only screen and (max-width: 600px) {
          .content { padding: 25px 20px; }
          .header { padding: 30px 20px; }
          .header h1 { font-size: 24px; }
          .greeting { font-size: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="ClickaLinks Logo" class="logo-img" />
            <h1>Welcome to ClickaLinks!</h1>
            <p>Your advertising campaign is now LIVE! 🚀</p>
          </div>
          <div class="content">
            <div class="greeting">Hello ${businessName || 'Valued Customer'}! 👋</div>
            <p class="intro-text">🎉 <strong>Congratulations!</strong> Thank you for choosing ClickaLinks! We're absolutely <strong>thrilled</strong> to have you on board! Your advertising campaign has been successfully activated and is now <strong>live on our platform</strong>, ready to attract customers and drive traffic to your business. This is going to be amazing! 🌟</p>
            
            <div class="info-box">
              <h3>📋 Your Campaign Details</h3>
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
              ${transactionId ? `
              <div class="info-row">
                <span class="label">Transaction ID:</span>
                <span class="value" style="font-family: monospace; font-size: 12px; word-break: break-all;">${transactionId}</span>
              </div>
              ` : ''}
            </div>

            <div class="whats-next">
              <h3>✨ What Happens Next?</h3>
              <ul>
                <li><strong>Your ad is live:</strong> Your logo is now visible on square #${squareNumber} and ready to attract customers!</li>
                <li><strong>Clickable link:</strong> Visitors can click your logo to visit your website directly.</li>
                <li><strong>Fair placement:</strong> Your position may change during regular shuffles, ensuring fair visibility for all businesses.</li>
                <li><strong>Active duration:</strong> Your ad will remain active for ${selectedDuration} days from today.</li>
              </ul>
            </div>

            <div class="button-container">
              <a href="${frontendUrl}/page${pageNumber}" class="button">🚀 View Your Live Ad</a>
            </div>
          </div>

          <div class="footer">
            <p><strong>Clicado Media UK Ltd</strong> trading as <strong>clickalinks.com</strong></p>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Registered in England & Wales, Registration Number: 16904433</p>
            <p style="font-size: 12px; color: #94a3b8;">Clicado Media UK Ltd is an advertisement company registered in England and Wales</p>
            <p style="margin-top: 20px;">Need help? Contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}">${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}</a></p>
            <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} ClickaLinks. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Welcome to ClickaLinks!

Hello ${businessName || 'Valued Customer'}!

Thank you for choosing ClickaLinks. We're thrilled to have you on board! Your advertising campaign has been successfully activated and is now live on our platform.

Campaign Details:
- Business Name: ${businessName || 'N/A'}
- Advertising Square: #${squareNumber} (Page ${pageNumber})
- Campaign Duration: ${selectedDuration} days
- Start Date: ${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
- End Date: ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
${transactionId ? `- Transaction ID: ${transactionId}\n` : ''}

What Happens Next?
- Your ad is live: Your logo is now visible on square #${squareNumber}
- Clickable link: Visitors can click your logo to visit your website
- Fair placement: Your position may change during shuffles
- Active duration: Your ad will remain active for ${selectedDuration} days

View your live ad: ${frontendUrl}/page${pageNumber}

Need help? Contact us at ${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}

© ${new Date().getFullYear()} ClickaLinks. All rights reserved.
  `;

  try {
    const fromEmail = process.env.EMAIL_FROM || `"ClickaLinks" <${process.env.SMTP_USER || 'noreply@clickalinks.com'}>`;
    
    const mailOptions = {
      from: fromEmail,
      to: contactEmail,
      subject: `🎉 Welcome to ClickaLinks! Your Ad is Live - Square #${squareNumber}`,
      text: textContent,
      html: htmlContent
    };

    console.log('📧 Sending welcome email...');
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully!');
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ ERROR SENDING WELCOME EMAIL:', error.message);
    return { success: false, error: error.message, code: error.code };
  }
}

/**
 * Send invoice email (second email - professional invoice)
 */
async function sendInvoiceEmail(purchaseData, invoiceNumber) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.error('❌ Email service not configured - cannot send invoice email');
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
    website
  } = purchaseData;

  if (!contactEmail) {
    console.error('❌ No email address provided for invoice email');
    return { success: false, message: 'No email address provided' };
  }

  // Calculate amounts correctly
  const originalAmt = originalAmount !== undefined ? originalAmount : (finalAmount || 10);
  const discountAmt = discountAmount || 0;
  const totalAmount = Math.max(0, originalAmt - discountAmt);

  // FIXED: Use correct logo path
  const frontendUrl = (process.env.FRONTEND_URL || 'https://clickalinks-frontend.web.app').replace('www.clickalinks-frontend.web.app', 'clickalinks-frontend.web.app');
  const logoUrl = `${frontendUrl}/logo.PNG`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #1a202c; 
          margin: 0; 
          padding: 0; 
          background: #f7fafc;
        }
        .email-wrapper { 
          background: #f7fafc; 
          padding: 30px 15px; 
        }
        .container { 
          max-width: 700px; 
          margin: 0 auto; 
          background: #ffffff; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header { 
          background: #2563eb; 
          color: white; 
          padding: 25px 30px; 
          text-align: center; 
        }
        .logo-container {
          margin-bottom: 15px;
        }
        .logo-img {
          max-width: 200px;
          height: auto;
          display: block;
          margin: 0 auto;
        }
        .header h1 { 
          margin: 0; 
          font-size: 24px; 
          font-weight: 700; 
        }
        .header p { 
          margin: 5px 0 0 0; 
          font-size: 15px; 
          opacity: 0.95; 
        }
        .content { 
          padding: 35px 30px; 
        }
        .intro-text { 
          font-size: 15px; 
          color: #4a5568; 
          line-height: 1.7; 
          margin-bottom: 25px; 
        }
        .invoice-box { 
          background: #f8fafc; 
          border: 2px solid #e2e8f0; 
          border-radius: 12px; 
          padding: 25px; 
          margin: 25px 0; 
        }
        .invoice-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          margin-bottom: 25px; 
          padding-bottom: 20px; 
          border-bottom: 2px solid #e2e8f0; 
        }
        .invoice-info { flex: 1; }
        .invoice-info h3 { 
          margin: 0 0 12px 0; 
          font-size: 12px; 
          font-weight: 700; 
          color: #718096; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
        }
        .invoice-info p { 
          margin: 5px 0; 
          color: #2d3748; 
          font-size: 14px; 
          line-height: 1.5;
        }
        .invoice-info.right { text-align: right; }
        .invoice-number { 
          font-size: 20px; 
          font-weight: 700; 
          color: #2563eb; 
          margin: 5px 0;
        }
        .invoice-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 25px 0; 
        }
        .invoice-table thead { 
          background: #f1f5f9; 
        }
        .invoice-table th { 
          padding: 14px; 
          text-align: left; 
          font-weight: 700; 
          color: #475569; 
          font-size: 11px; 
          text-transform: uppercase; 
          letter-spacing: 1px;
          border-bottom: 2px solid #e2e8f0;
        }
        .invoice-table td { 
          padding: 16px 14px; 
          border-bottom: 1px solid #e2e8f0; 
          color: #475569; 
          font-size: 14px; 
        }
        .invoice-table tbody tr:last-child td {
          border-bottom: none;
        }
        .invoice-table .text-right { 
          text-align: right; 
        }
        .discount-row { 
          background: #f0fdf4; 
        }
        .discount-row td { 
          color: #10b981; 
          font-weight: 600; 
        }
        .totals-section { 
          margin-top: 25px; 
          padding-top: 20px; 
          border-top: 2px solid #e2e8f0; 
        }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          padding: 10px 0; 
        }
        .total-label { 
          font-weight: 600; 
          color: #475569; 
          font-size: 14px; 
        }
        .total-amount { 
          font-weight: 600; 
          color: #1e293b; 
          font-size: 14px; 
        }
        .grand-total { 
          margin-top: 15px; 
          padding: 20px; 
          background: #f8fafc; 
          border: 2px solid #2563eb; 
          border-radius: 8px; 
        }
        .grand-total .total-label { 
          font-size: 16px; 
          color: #1e293b; 
        }
        .grand-total .total-amount { 
          font-size: 22px; 
          color: #2563eb; 
          font-weight: 700; 
        }
        .free-total { 
          background: #f0fdf4; 
          border-color: #10b981; 
        }
        .free-total .total-amount { 
          color: #10b981; 
          font-size: 26px; 
        }
        .download-section { 
          margin: 30px 0; 
          padding: 25px; 
          background: #fffbeb; 
          border-left: 5px solid #f59e0b; 
          border-radius: 8px; 
        }
        .download-section h3 { 
          margin: 0 0 10px 0; 
          font-size: 16px; 
          font-weight: 700; 
          color: #92400e; 
        }
        .download-section p { 
          margin: 8px 0; 
          color: #78350f; 
          font-size: 13px; 
          line-height: 1.6; 
        }
        .download-btn { 
          display: inline-block; 
          background: #10b981; 
          color: white; 
          padding: 14px 28px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 700; 
          font-size: 15px; 
          margin-top: 12px; 
          transition: all 0.3s;
        }
        .download-btn:hover { 
          background: #059669; 
        }
        .footer { 
          background: #2d3748; 
          padding: 30px; 
          text-align: center; 
        }
        .footer p { 
          margin: 8px 0; 
          color: #a0aec0; 
          font-size: 12px; 
          line-height: 1.5;
        }
        .footer a { 
          color: #90cdf4; 
          text-decoration: none; 
        }
        @media only screen and (max-width: 600px) {
          .content { padding: 25px 20px; }
          .header { padding: 20px; }
          .logo-img { max-width: 160px; }
          .invoice-header { flex-direction: column; gap: 15px; }
          .invoice-info.right { text-align: left; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <div class="header">
            <div class="logo-container">
              <img src="${logoUrl}" alt="ClickaLinks Logo" class="logo-img" />
            </div>
            <h1>Your Invoice</h1>
            <p>Invoice #${invoiceNumber}</p>
          </div>
          <div class="content">
            <p class="intro-text">Dear ${businessName || 'Valued Customer'},</p>
            <p class="intro-text">Please find your invoice details below. You can download a printable version using the button at the bottom of this email.</p>
            
            <div class="invoice-box">
              <div class="invoice-header">
                <div class="invoice-info">
                  <h3>Invoice To</h3>
                  <p><strong>${businessName || 'N/A'}</strong></p>
                  <p>${contactEmail || ''}</p>
                  ${website ? `<p>${website}</p>` : ''}
                </div>
                <div class="invoice-info right">
                  <h3>Invoice Details</h3>
                  <p class="invoice-number">#${invoiceNumber}</p>
                  <p>Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  ${transactionId ? `<p style="font-size: 12px; color: #64748b; margin-top: 5px;">Transaction ID:<br>${transactionId}</p>` : ''}
                </div>
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
                    <td><strong>Advertising Campaign</strong><br><span style="color: #64748b; font-size: 12px;">Square #${squareNumber} (Page ${pageNumber})</span></td>
                    <td>${selectedDuration} days</td>
                    <td class="text-right"><strong>£${originalAmt.toFixed(2)}</strong></td>
                  </tr>
                  ${discountAmt > 0 ? `
                  <tr class="discount-row">
                    <td><strong>Discount${promoCode ? ` (${promoCode})` : ''}</strong></td>
                    <td></td>
                    <td class="text-right"><strong>-£${discountAmt.toFixed(2)}</strong></td>
                  </tr>
                  ` : ''}
                </tbody>
              </table>

              <div class="totals-section">
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
                <div class="grand-total ${totalAmount === 0 ? 'free-total' : ''}">
                  <div class="total-row">
                    <span class="total-label">${totalAmount === 0 ? 'Total Amount:' : 'Total:'}</span>
                    <span class="total-amount">${totalAmount === 0 ? 'FREE' : `£${totalAmount.toFixed(2)}`}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="download-section">
              <h3>📥 Download Your Invoice</h3>
              <p>Click the button below to download your invoice as an HTML file. You can save it, print it, or forward it to your accounting department.</p>
              <a href="${process.env.BACKEND_URL || 'https://clickalinks-backend-2.onrender.com'}/api/invoice/download?tx=${encodeURIComponent(transactionId || '')}&inv=${encodeURIComponent(invoiceNumber)}&businessName=${encodeURIComponent(businessName || '')}&contactEmail=${encodeURIComponent(contactEmail || '')}&squareNumber=${squareNumber}&pageNumber=${pageNumber}&duration=${selectedDuration}&originalAmount=${originalAmt}&discountAmount=${discountAmt}&finalAmount=${totalAmount}${promoCode ? `&promoCode=${encodeURIComponent(promoCode)}` : ''}${website ? `&website=${encodeURIComponent(website)}` : ''}" class="download-btn" target="_blank">📥 Download Invoice</a>
            </div>
          </div>

          <div class="footer">
            <p><strong>Clicado Media UK Ltd</strong> trading as <strong>clickalinks.com</strong></p>
            <p style="font-size: 11px; color: #94a3b8; margin-top: 5px;">Registered in England & Wales, Registration Number: 16904433</p>
            <p style="font-size: 11px; color: #94a3b8;">Clicado Media UK Ltd is an advertisement company registered in England and Wales</p>
            <p style="margin-top: 15px;">Thank you for your business with ClickaLinks!</p>
            <p>Questions about your invoice? Contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}">${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}</a></p>
            <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} ClickaLinks. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Your Invoice - ${invoiceNumber}

Dear ${businessName || 'Valued Customer'},

Please find your invoice details below.

Invoice #: ${invoiceNumber}
Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
${transactionId ? `Transaction ID: ${transactionId}\n` : ''}

Invoice To:
${businessName || 'N/A'}
${contactEmail || ''}
${website ? `${website}\n` : ''}

Description: Advertising Campaign - Square #${squareNumber} (Page ${pageNumber})
Duration: ${selectedDuration} days
Amount: £${originalAmt.toFixed(2)}
${discountAmt > 0 ? `Discount${promoCode ? ` (${promoCode})` : ''}: -£${discountAmt.toFixed(2)}\n` : ''}
Subtotal: £${originalAmt.toFixed(2)}
${discountAmt > 0 ? `Discount: -£${discountAmt.toFixed(2)}\n` : ''}
Total: ${totalAmount === 0 ? 'FREE' : `£${totalAmount.toFixed(2)}`}

Download your invoice: ${process.env.BACKEND_URL || 'https://clickalinks-backend-2.onrender.com'}/api/invoice/download?tx=${encodeURIComponent(transactionId || '')}&inv=${encodeURIComponent(invoiceNumber)}&businessName=${encodeURIComponent(businessName || '')}&contactEmail=${encodeURIComponent(contactEmail || '')}&squareNumber=${squareNumber}&pageNumber=${pageNumber}&duration=${selectedDuration}&originalAmount=${originalAmt}&discountAmount=${discountAmt}&finalAmount=${totalAmount}${promoCode ? `&promoCode=${encodeURIComponent(promoCode)}` : ''}${website ? `&website=${encodeURIComponent(website)}` : ''}

Questions about your invoice? Contact us at ${process.env.SUPPORT_EMAIL || 'support@clickalinks.com'}

© ${new Date().getFullYear()} ClickaLinks. All rights reserved.
  `;

  try {
    const fromEmail = process.env.EMAIL_FROM || `"ClickaLinks" <${process.env.SMTP_USER || 'noreply@clickalinks.com'}>`;
    
    const mailOptions = {
      from: fromEmail,
      to: contactEmail,
      subject: `📄 Your Invoice #${invoiceNumber} - ClickaLinks`,
      text: textContent,
      html: htmlContent
    };

    console.log('📧 Sending invoice email...');
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Invoice email sent successfully!');
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ ERROR SENDING INVOICE EMAIL:', error.message);
    return { success: false, error: error.message, code: error.code };
  }
}

/**
 * Send ONE admin notification email for purchase
 */
export async function sendAdminNotificationEmail(purchaseData) {
  console.log('📧 Sending admin notification email...');
  
  const transporter = createTransporter();
  
  if (!transporter) {
    console.error('❌ Email service not configured - cannot send admin notification');
    return { success: false, message: 'Email service not configured' };
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 
                     process.env['ADMIN-NOTIFICATION-EMAIL'] || 
                     'stentar-pants@hotmail.com';
  console.log(`📧 Admin notification email will be sent to: ${adminEmail}`);

  // Extract data
  const businessName = purchaseData.businessName || 'Unknown Business';
  const contactEmail = purchaseData.contactEmail || 'No email provided';
  const squareNumber = purchaseData.squareNumber || purchaseData.square || 0;
  const pageNumber = purchaseData.pageNumber || 1;
  const selectedDuration = purchaseData.selectedDuration || purchaseData.duration || 30;
  const finalAmount = purchaseData.finalAmount || purchaseData.amount || 0;
  const originalAmount = purchaseData.originalAmount !== undefined ? purchaseData.originalAmount : (finalAmount + (purchaseData.discountAmount || 0));
  const discountAmount = purchaseData.discountAmount || 0;
  const transactionId = purchaseData.transactionId || purchaseData.sessionId || 'N/A';
  const promoCode = purchaseData.promoCode || null;
  const paymentMethod = purchaseData.paymentMethod || (finalAmount === 0 ? 'FREE (Promo Code)' : 'Stripe');
  
  const campaignDuration = selectedDuration;
  const originalAmt = originalAmount;
  const discountAmt = discountAmount;
  const finalAmt = finalAmount;

  const subject = `🛒 New Purchase - Square #${squareNumber}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 25px; border-radius: 0 0 10px 10px; }
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
              <span class="value">${businessName}</span>
            </div>
            <div class="info-row">
              <span class="label">Contact Email:</span>
              <span class="value">${contactEmail}</span>
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
              <span class="label">Payment Method:</span>
              <span class="value">${paymentMethod}</span>
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

  const textContent = `
New Purchase Notification

A new square has been purchased!

Purchase Details:
- Business Name: ${businessName}
- Contact Email: ${contactEmail}
- Square Number: #${squareNumber} (Page ${pageNumber})
- Duration: ${campaignDuration} days
- Payment Method: ${paymentMethod}
- Original Amount: £${originalAmt.toFixed(2)}
${discountAmt > 0 ? `- Discount: -£${discountAmt.toFixed(2)}\n` : ''}
- Final Amount: £${finalAmt.toFixed(2)}
${transactionId ? `- Transaction ID: ${transactionId}\n` : ''}
${promoCode ? `- Promo Code Used: ${promoCode}\n` : ''}
- Purchase Date: ${new Date().toLocaleString('en-GB')}
  `;

  try {
    const fromEmail = process.env.EMAIL_FROM || `"ClickaLinks" <${process.env.SMTP_USER || 'noreply@clickalinks.com'}>`;
    
    const mailOptions = {
      from: fromEmail,
      to: adminEmail,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification email sent successfully!');
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Admin notification email sent successfully'
    };
  } catch (error) {
    console.error('❌ Error sending admin notification email:', error.message);
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      message: 'Failed to send admin notification email'
    };
  }
}

/**
 * Generate invoice HTML from purchase data - FIXED with proper logo
 */
export function generateInvoiceHTML(purchaseData, invoiceNumber = null) {
  console.log('📧 Generating invoice HTML...');
  
  const {
    businessName,
    contactEmail,
    squareNumber,
    pageNumber = 1,
    selectedDuration = 30,
    finalAmount = 0,
    originalAmount = finalAmount,
    discountAmount = 0,
    transactionId,
    promoCode,
    website
  } = purchaseData;

  // Calculate dates
  const startDate = new Date();
  const endDate = new Date(Date.now() + selectedDuration * 24 * 60 * 60 * 1000);
  const invoiceDate = new Date();

  // Generate invoice number if not provided
  if (!invoiceNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    invoiceNumber = `INV-${dateStr}-${random}`;
  }

  // Calculate amounts correctly
  const originalAmt = originalAmount !== undefined ? originalAmount : (finalAmount || 10);
  const discountAmt = discountAmount || 0;
  const totalAmount = Math.max(0, originalAmt - discountAmt);

  // FIXED: Use correct logo path
  const frontendUrl = (process.env.FRONTEND_URL || 'https://clickalinks-frontend.web.app').replace('www.clickalinks-frontend.web.app', 'clickalinks-frontend.web.app');
  const logoUrl = `${frontendUrl}/logo.PNG`;

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
      padding: 30px 15px;
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
      background: #2563eb;
      color: white;
      padding: 25px 30px;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 15px;
    }
    .logo-container {
      flex: 1;
      min-width: 200px;
    }
    .logo-img {
      max-width: 200px;
      height: auto;
      display: block;
    }
    .company-info {
      text-align: right;
      min-width: 200px;
    }
    .company-info p {
      margin: 5px 0;
      font-size: 13px;
      line-height: 1.5;
    }
    .invoice-title {
      text-align: center;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }
    .invoice-title h1 {
      font-size: 24px;
      margin: 0 0 5px 0;
    }
    .invoice-title p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .invoice-body {
      padding: 30px;
    }
    .invoice-meta {
      margin-bottom: 30px;
      padding: 15px 0;
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
      margin: 6px 0;
      line-height: 1.5;
    }
    .bill-to {
      margin-bottom: 30px;
    }
    .bill-to h3 {
      font-size: 13px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .bill-to p {
      color: #2d3748;
      font-size: 14px;
      margin: 4px 0;
    }
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    .invoice-table thead {
      background: #f7fafc;
    }
    .invoice-table th {
      padding: 14px;
      text-align: left;
      font-weight: 600;
      color: #2d3748;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
    }
    .invoice-table td {
      padding: 16px 14px;
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
      margin-top: 25px;
      margin-left: auto;
      width: 300px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
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
      padding: 18px;
      margin-top: 15px;
    }
    .total-box.free-box {
      background: #f0fdf4;
      border: 2px solid #10b981;
    }
    .total-box .total-row {
      border-bottom: none;
    }
    .total-box .total-label {
      font-size: 16px;
      color: #2d3748;
    }
    .total-box .total-amount {
      font-size: 22px;
      color: #667eea;
      font-weight: 700;
    }
    .free-amount {
      color: #10b981 !important;
      font-size: 28px !important;
    }
    .free-label {
      color: #10b981 !important;
      font-size: 16px !important;
    }
    .campaign-details {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
    }
    .campaign-details-left h3, .campaign-details-right h3 {
      font-size: 13px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .campaign-details-left p, .campaign-details-right p {
      color: #4a5568;
      font-size: 13px;
      margin: 6px 0;
    }
    .status-paid {
      color: #667eea;
      font-weight: 600;
      font-size: 15px;
    }
    .status-free {
      color: #10b981;
      font-weight: 700;
      font-size: 18px;
    }
    .promo-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      margin-top: 8px;
    }
    .invoice-footer {
      background: #f7fafc;
      padding: 25px 30px;
      text-align: center;
      color: #718096;
      font-size: 12px;
    }
    .invoice-footer a {
      color: #667eea;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      body { padding: 15px 10px; }
      .invoice-header { padding: 20px; }
      .invoice-body { padding: 20px; }
      .header-top { flex-direction: column; text-align: center; }
      .company-info { text-align: center; }
      .invoice-meta { flex-direction: column; gap: 10px; }
      .invoice-meta-right { text-align: left; }
      .campaign-details { flex-direction: column; gap: 20px; }
      .totals { width: 100%; }
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
      <div class="header-top">
        <div class="logo-container">
          <img src="${logoUrl}" alt="ClickaLinks Logo" class="logo-img" />
        </div>
        <div class="company-info">
          <p><strong>Clicado Media UK Ltd</strong></p>
          <p><a href="mailto:support@clickalinks.com" style="color: white;">support@clickalinks.com</a></p>
          <p><a href="https://clickalinks.com" style="color: white;">https://clickalinks.com</a></p>
        </div>
      </div>
      <div class="invoice-title">
        <h1>Invoice</h1>
        <p>Invoice #${invoiceNumber}</p>
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
        ${website ? `<p>${website}</p>` : ''}
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
      <p style="margin-top: 15px;"><strong>Clicado Media UK Ltd</strong></p>
      <p style="margin-top: 5px; font-size: 11px;">Registered in England & Wales, Registration Number: 16904433</p>
      <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Clicado Media UK Ltd. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  console.log('✅ Invoice HTML generated successfully');
  return invoiceHTML;
}

/**
 * Send confirmation emails - FIXED: Only sends one admin notification
 */
export async function sendAdConfirmationEmail(purchaseData) {
  console.log('📧 ===== EMAIL SERVICE CALLED =====');
  console.log('📧 Attempting to send confirmation emails...');
  
  const transporter = createTransporter();
  
  if (!transporter) {
    console.error('❌ EMAIL SERVICE NOT CONFIGURED');
    return { success: false, message: 'Email service not configured' };
  }
  
  console.log('✅ Email transporter created successfully');

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
    promoCode
  } = purchaseData;

  if (!contactEmail) {
    console.error('❌ No email address provided');
    return { success: false, message: 'No email address provided' };
  }
  
  console.log('✅ Contact email found:', contactEmail);

  // Calculate amounts correctly
  const originalAmt = originalAmount !== undefined ? originalAmount : (finalAmount || 10);
  const discountAmt = discountAmount || 0;
  const totalAmount = Math.max(0, originalAmt - discountAmt);
  
  // Generate invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `INV-${dateStr}-${random}`;
  };
  
  const invoiceNumber = generateInvoiceNumber();
  
  console.log('📧 Invoice data:', {
    originalAmount: originalAmt,
    discountAmount: discountAmt,
    totalAmount: totalAmount,
    invoiceNumber: invoiceNumber
  });

  // Send welcome email first
  console.log('📧 Sending welcome email...');
  const welcomeResult = await sendWelcomeEmail(purchaseData);
  
  if (!welcomeResult.success) {
    console.error('❌ Failed to send welcome email:', welcomeResult.error);
  } else {
    console.log('✅ Welcome email sent successfully');
  }

  // Wait before sending invoice email
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Send invoice email second
  console.log('📧 Sending invoice email...');
  const invoiceResult = await sendInvoiceEmail({
    ...purchaseData,
    originalAmount: originalAmt,
    discountAmount: discountAmt,
    finalAmount: totalAmount
  }, invoiceNumber);

  if (!invoiceResult.success) {
    console.error('❌ Failed to send invoice email:', invoiceResult.error);
    return {
      success: welcomeResult.success,
      message: welcomeResult.success ? 'Welcome email sent, but invoice email failed' : 'Both emails failed',
      welcomeEmailSent: welcomeResult.success,
      invoiceEmailSent: false,
      welcomeMessageId: welcomeResult.messageId
    };
  }

  console.log('✅ Invoice email sent successfully');

  // DO NOT send admin notification here - it should be called separately from server.js
  // This prevents duplicate admin emails

  return {
    success: true,
    message: 'Both welcome and invoice emails sent successfully',
    welcomeEmailSent: true,
    invoiceEmailSent: true,
    welcomeMessageId: welcomeResult.messageId,
    invoiceMessageId: invoiceResult.messageId,
    invoiceNumber: invoiceNumber
  };
}

/**
 * Test email connection
 */
export async function testEmailConnection() {
  console.log('🔧 Testing email connection...');
  
  const transporter = createTransporter();
  
  if (!transporter) {
    console.error('❌ No email transporter created');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    console.log('📧 Verifying SMTP connection...');
    const verified = await transporter.verify();
    console.log('✅ SMTP connection verified:', verified);
    
    const testEmail = process.env.SMTP_USER || 'test@clickalinks.com';
    const fromEmail = process.env.EMAIL_FROM || `"ClickaLinks Test" <${process.env.SMTP_USER}>`;
    
    const testMailOptions = {
      from: fromEmail,
      to: testEmail,
      subject: '📧 ClickaLinks Email Service Test',
      text: 'This is a test email from ClickaLinks email service. If you receive this, your email configuration is working correctly!',
      html: '<h1>✅ Email Service Test</h1><p>This is a test email from ClickaLinks email service. If you receive this, your email configuration is working correctly!</p>'
    };

    console.log('📧 Sending test email...');
    
    const info = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully!');
    
    return {
      success: true,
      message: 'Email service is working correctly',
      messageId: info.messageId,
      verified: true
    };
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      message: 'Email test failed'
    };
  }
}