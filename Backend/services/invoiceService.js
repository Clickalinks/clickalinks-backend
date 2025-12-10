/**
 * Invoice PDF Generation Service
 * Creates professional PDF invoices for customer purchases
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a professional PDF invoice
 * 
 * @param {Object} invoiceData - Invoice data
 * @param {string} invoiceData.invoiceNumber - Invoice number
 * @param {string} invoiceData.businessName - Customer business name
 * @param {string} invoiceData.contactEmail - Customer email
 * @param {string} invoiceData.website - Customer website
 * @param {number} invoiceData.squareNumber - Advertising square number
 * @param {number} invoiceData.pageNumber - Page number
 * @param {number} invoiceData.duration - Campaign duration in days
 * @param {number} invoiceData.originalAmount - Original amount before discount
 * @param {number} invoiceData.discountAmount - Discount amount
 * @param {number} invoiceData.finalAmount - Final amount after discount
 * @param {string} invoiceData.transactionId - Payment transaction ID
 * @param {string} invoiceData.promoCode - Promo code used (if any)
 * @param {Date} invoiceData.invoiceDate - Invoice date
 * @param {Date} invoiceData.startDate - Campaign start date
 * @param {Date} invoiceData.endDate - Campaign end date
 * @returns {Promise<Buffer>} - PDF buffer
 */
export async function generateInvoicePDF(invoiceData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Invoice ${invoiceData.invoiceNumber}`,
          Author: 'ClickaLinks',
          Subject: 'Advertising Campaign Invoice'
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Colors
      const primaryColor = '#667eea';
      const secondaryColor = '#764ba2';
      const darkGray = '#2c3e50';
      const lightGray = '#7f8c8d';
      const borderGray = '#e0e0e0';
      const successGreen = '#27ae60';

      // Compact header - reduced height
      const headerHeight = 90;
      doc.rect(0, 0, 595, headerHeight)
        .fillColor(primaryColor)
        .fill();

      // Try to add logo, fallback to text if not found
      const logoPath = path.join(__dirname, '..', 'public', 'logo.PNG');
      let logoAdded = false;
      
      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, 40, 15, { width: 60, height: 60 });
          logoAdded = true;
        } catch (error) {
          console.warn('Could not add logo image:', error.message);
        }
      }

      // Company name and tagline (if logo not added, make it larger)
      if (!logoAdded) {
        doc.fillColor('white')
          .fontSize(32)
          .font('Helvetica-Bold')
          .text('ClickaLinks', 40, 25);
        
        doc.fontSize(11)
          .font('Helvetica')
          .text('Direct Advertising Platform', 40, 60);
      } else {
        doc.fillColor('white')
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('ClickaLinks', 115, 25);
        
        doc.fontSize(9)
          .font('Helvetica')
          .text('Direct Advertising Platform', 115, 50);
      }

      // Invoice title and number (right side)
      doc.fontSize(22)
        .font('Helvetica-Bold')
        .text('INVOICE', 400, 25, { align: 'right' });

      doc.fontSize(9)
        .font('Helvetica')
        .text(`#${invoiceData.invoiceNumber}`, 400, 50, { align: 'right' });

      // Reset color
      doc.fillColor(darkGray);

      // Compact invoice details section - reduced spacing
      let yPos = 110;

      // Left column - Bill To (compact)
      doc.fontSize(11)
        .font('Helvetica-Bold')
        .text('Bill To:', 40, yPos);

      doc.fontSize(9)
        .font('Helvetica')
        .text(invoiceData.businessName || 'N/A', 40, yPos + 15, { width: 200 });

      let billToY = yPos + 15;
      if (invoiceData.contactEmail) {
        doc.text(invoiceData.contactEmail, 40, billToY + 12, { width: 200 });
        billToY += 12;
      }
      if (invoiceData.website) {
        const websiteText = invoiceData.website.length > 35 
          ? invoiceData.website.substring(0, 32) + '...' 
          : invoiceData.website;
        doc.text(websiteText, 40, billToY + 12, { width: 200 });
      }

      // Right column - Invoice details (compact)
      const invoiceDate = invoiceData.invoiceDate || new Date();
      const invoiceDateStr = invoiceDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      doc.fontSize(9)
        .font('Helvetica')
        .text(`Date: ${invoiceDateStr}`, 400, yPos, { align: 'right' });

      if (invoiceData.transactionId) {
        const transId = invoiceData.transactionId.length > 25 
          ? invoiceData.transactionId.substring(0, 22) + '...' 
          : invoiceData.transactionId;
        doc.text(`Transaction: ${transId}`, 400, yPos + 12, { align: 'right' });
      }

      // Company contact info (compact)
      doc.fontSize(7)
        .fillColor(lightGray)
        .text('ClickaLinks Ltd. | support@clickalinks.com | www.clickalinks.com', 400, yPos + 30, { align: 'right' });

      // Reset color
      doc.fillColor(darkGray);

      // Line items section - compact table
      yPos = 200;

      // Table header - compact
      doc.rect(40, yPos, 515, 25)
        .fillColor('#f8f9fa')
        .fill()
        .strokeColor(borderGray)
        .lineWidth(0.5)
        .stroke();

      doc.fillColor(darkGray)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Description', 45, yPos + 8)
        .text('Duration', 320, yPos + 8)
        .text('Amount', 480, yPos + 8, { align: 'right' });

      yPos += 30;

      // Service line item - compact
      const serviceDescription = `Square #${invoiceData.squareNumber} (Page ${invoiceData.pageNumber})`;
      const durationText = `${invoiceData.duration} days`;

      doc.fontSize(9)
        .font('Helvetica')
        .text(serviceDescription, 45, yPos, { width: 270 })
        .text(durationText, 320, yPos, { width: 150 })
        .text(`£${(invoiceData.originalAmount || 0).toFixed(2)}`, 480, yPos, { align: 'right', width: 70 });

      yPos += 22;

      // Discount line (if applicable) - compact
      if (invoiceData.discountAmount > 0 || invoiceData.promoCode) {
        // Truncate promo code if too long
        const promoCode = invoiceData.promoCode || '';
        const displayCode = promoCode.length > 15 ? promoCode.substring(0, 12) + '...' : promoCode;
        const discountText = promoCode ? `Discount (${displayCode})` : 'Discount';
        
        doc.fontSize(8)
          .fillColor(successGreen)
          .text(discountText, 45, yPos, { width: 270 })
          .text(`-£${(invoiceData.discountAmount || 0).toFixed(2)}`, 480, yPos, { align: 'right', width: 70 });

        doc.fillColor(darkGray);
        yPos += 20;
      }

      // Total section - compact
      yPos += 10;

      // Horizontal line
      doc.moveTo(40, yPos)
        .lineTo(555, yPos)
        .strokeColor(borderGray)
        .lineWidth(0.5)
        .stroke();

      yPos += 12;

      // Subtotal
      doc.fontSize(9)
        .font('Helvetica')
        .text('Subtotal:', 400, yPos, { align: 'right' })
        .text(`£${(invoiceData.originalAmount || 0).toFixed(2)}`, 480, yPos, { align: 'right', width: 70 });

      yPos += 15;

      if (invoiceData.discountAmount > 0) {
        doc.fontSize(9)
          .fillColor(successGreen)
          .text('Discount:', 400, yPos, { align: 'right' })
          .text(`-£${invoiceData.discountAmount.toFixed(2)}`, 480, yPos, { align: 'right', width: 70 });

        doc.fillColor(darkGray);
        yPos += 15;
      }

      // Total - compact box
      yPos += 5;

      doc.rect(400, yPos - 3, 155, 32)
        .fillColor('#f8f9fa')
        .fill()
        .strokeColor(primaryColor)
        .lineWidth(1.5)
        .stroke();

      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('Total:', 410, yPos + 3, { align: 'right' });

      const totalAmount = invoiceData.finalAmount || 0;
      if (totalAmount === 0) {
        doc.fillColor(successGreen)
          .text('FREE', 480, yPos + 3, { align: 'right', width: 70 });
      } else {
        doc.fillColor(darkGray)
          .text(`£${totalAmount.toFixed(2)}`, 480, yPos + 3, { align: 'right', width: 70 });
      }

      // Campaign details section - compact, two columns
      yPos += 50;

      const startDate = invoiceData.startDate || new Date();
      const endDate = invoiceData.endDate || new Date(Date.now() + (invoiceData.duration || 30) * 24 * 60 * 60 * 1000);

      const startDateStr = startDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const endDateStr = endDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      // Left column
      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(darkGray)
        .text('Campaign Details', 40, yPos);

      doc.fontSize(8)
        .font('Helvetica')
        .fillColor(lightGray)
        .text(`Start: ${startDateStr}`, 40, yPos + 15)
        .text(`End: ${endDateStr}`, 40, yPos + 28)
        .text(`Square: #${invoiceData.squareNumber}`, 40, yPos + 41)
        .text(`Page: ${invoiceData.pageNumber}`, 40, yPos + 54);

      // Right column - Payment status
      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(totalAmount === 0 ? successGreen : primaryColor)
        .text(`Payment Status: ${totalAmount === 0 ? 'FREE' : 'PAID'}`, 300, yPos);

      if (totalAmount === 0 && invoiceData.promoCode) {
        const promoCode = invoiceData.promoCode.length > 20 
          ? invoiceData.promoCode.substring(0, 17) + '...' 
          : invoiceData.promoCode;
        doc.fontSize(8)
          .font('Helvetica')
          .fillColor(successGreen)
          .text(`Promo: ${promoCode}`, 300, yPos + 15);
      }

      // Compact footer - at bottom
      const pageHeight = doc.page.height;
      const footerY = pageHeight - 50;

      doc.fontSize(7)
        .fillColor(lightGray)
        .text('Thank you for choosing ClickaLinks!', 40, footerY, { align: 'center', width: 515 })
        .text('support@clickalinks.com | www.clickalinks.com', 40, footerY + 10, { align: 'center', width: 515 })
        .text(`Generated: ${new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 40, footerY + 20, { align: 'center', width: 515 });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate invoice number
 * Format: INV-YYYYMMDD-XXXXX
 */
export function generateInvoiceNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `INV-${dateStr}-${random}`;
}
