import { jsPDF } from 'jspdf';
import { EventCharge, Quotation, Invoice } from '../types';
import { StorageService } from './storage';

export class PDFGeneratorService {
  /**
   * Generates and downloads a branded Rate Card Catalogue PDF
   */
  static downloadRateCardPDF(charges: EventCharge[]): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const company = StorageService.getCompanySettings();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Header Background Accent Bar
    doc.setFillColor(18, 18, 18); // Deep black
    doc.rect(0, 0, pageWidth, 38, 'F');

    // Subtle Gold stripe
    doc.setFillColor(217, 119, 6); // Gold / warm accent
    doc.rect(0, 38, pageWidth, 1.5, 'F');

    // Brand Logo if available
    let hasLogo = false;
    if (company.logoUrl && company.logoUrl.startsWith('data:image/')) {
      try {
        doc.addImage(company.logoUrl, 'PNG', margin, 9, 20, 20);
        hasLogo = true;
      } catch {
        hasLogo = false;
      }
    }

    const headerTextX = hasLogo ? margin + 24 : margin;

    // Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.text(company.companyName.toUpperCase(), headerTextX, 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(210, 205, 195);
    doc.text(`MASTER RATE CARD & PRICING CATALOGUE · SEASON ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, headerTextX, 23);
    doc.text(company.tagline.toUpperCase(), headerTextX, 28);

    const contactStr = [company.phone, company.email, company.website].filter(Boolean).join('  ·  ');
    doc.setFontSize(7.2);
    doc.setTextColor(190, 185, 175);
    doc.text(contactStr, headerTextX, 33);

    yPos = 46;

    // Category / Intro Banner
    doc.setFillColor(252, 250, 246);
    doc.setDrawColor(229, 223, 211);
    doc.roundedRect(margin, yPos, contentWidth, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 100, 40);
    doc.text('OFFICIAL PRODUCTION SERVICES & EVENT CHARGES', margin + 4, yPos + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 100, 100);
    doc.text('All rates are baseline commercial offerings. Specific multi-day wedding packages can be tailored upon request.', margin + 4, yPos + 10);

    yPos += 18;

    // Table Header
    doc.setFillColor(18, 18, 18);
    doc.rect(margin, yPos, contentWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('SERVICE / PACKAGE', margin + 4, yPos + 4.8);
    doc.text('CATEGORY', margin + 65, yPos + 4.8);
    doc.text('DURATION / CREW', margin + 115, yPos + 4.8);
    doc.text('INVESTMENT (INR)', pageWidth - margin - 4, yPos + 4.8, { align: 'right' });

    yPos += 7;

    // Charges Table Rows
    charges.forEach((chg, index) => {
      const hasIncludes = chg.includedServices && chg.includedServices.length > 0;
      const rowHeight = hasIncludes ? 18 : 13;

      if (yPos + rowHeight > pageHeight - 55) {
        doc.addPage();
        yPos = margin;
      }

      if (index % 2 === 1) {
        doc.setFillColor(250, 248, 245);
        doc.rect(margin, yPos, contentWidth, rowHeight, 'F');
      }

      doc.setDrawColor(235, 230, 222);
      doc.line(margin, yPos + rowHeight, pageWidth - margin, yPos + rowHeight);

      // Service Title
      doc.setFont('times', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);
      doc.text(chg.name, margin + 4, yPos + 5);

      // Short Description
      if (chg.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 100, 100);
        doc.text(chg.description.slice(0, 65), margin + 4, yPos + 9);
      }

      // Included deliverables
      if (hasIncludes) {
        doc.setFontSize(6);
        doc.setTextColor(150, 110, 50);
        doc.text(`Includes: ${chg.includedServices.slice(0, 4).join(', ')}`, margin + 4, yPos + 14);
      }

      // Category
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      doc.text(chg.category || 'General Shoot', margin + 65, yPos + 5.5);

      // Duration & Crew
      doc.setFontSize(7);
      doc.setTextColor(90, 90, 90);
      const meta = [chg.duration, chg.crewRequirement].filter(Boolean).join(' · ');
      doc.text(meta || 'As per requirement', margin + 115, yPos + 5.5);

      // Price
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(197, 139, 57);
      doc.text(`₹${chg.price.toLocaleString('en-IN')}`, pageWidth - margin - 4, yPos + 5.5, { align: 'right' });

      yPos += rowHeight;
    });

    yPos += 8;

    // Booking Terms Box
    if (yPos > pageHeight - 65) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFillColor(252, 250, 246);
    doc.setDrawColor(229, 223, 211);
    doc.roundedRect(margin, yPos, contentWidth, 42, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(18, 18, 18);
    doc.text('TERMS & BOOKING POLICY', margin + 4, yPos + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(80, 80, 80);
    const termsList = [
      `1. Date Reservation: A ${company.defaultAdvancePercentage}% non-refundable advance is required to lock dates on our crew calendar.`,
      `2. Payment Terms: Balance ${100 - company.defaultAdvancePercentage}% is due on or before the event shoot date prior to final footage handover.`,
      '3. Raw Delivery: All 4K ProRes raw footage transferred on-site via AirDrop or fast portable SSD immediately.',
      '4. Reels Delivery: Curated, color-graded 9:16 vertical edits delivered within 5 to 7 working days.',
      '5. Outstation Travel & Stay: Flight/rail tickets and hotel accommodations to be arranged by the client.'
    ];

    let tY = yPos + 11;
    termsList.forEach(t => {
      doc.text(t, margin + 4, tY);
      tY += 4.2;
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(197, 139, 57);
    const bankSummary = `BANK DETAILS: ${company.bankName} · A/C: ${company.accountName} · No: ${company.accountNumber} · IFSC: ${company.ifscCode} · UPI: ${company.upiId}`;
    doc.text(doc.splitTextToSize(bankSummary, contentWidth - 8), margin + 4, yPos + 34);

    // Footer
    doc.setFontSize(6.5);
    doc.setTextColor(140, 140, 140);
    doc.text(`${company.companyName} © ${new Date().getFullYear()}. Confidential & Proprietary Pricing Document.`, pageWidth / 2, pageHeight - 8, { align: 'center' });

    doc.save(`${company.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Rate_Card_${new Date().getFullYear()}.pdf`);
  }

  /**
   * Generates and downloads a branded Client Quotation PDF
   */
  static downloadQuotationPDF(quote: Quotation): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const company = StorageService.getCompanySettings();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Header Background
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Accent line
    doc.setFillColor(217, 119, 6);
    doc.rect(0, 40, pageWidth, 1.5, 'F');

    // Brand Logo
    let hasLogo = false;
    if (company.logoUrl && company.logoUrl.startsWith('data:image/')) {
      try {
        doc.addImage(company.logoUrl, 'PNG', margin, 8, 22, 22);
        hasLogo = true;
      } catch {
        hasLogo = false;
      }
    }

    const headerTextX = hasLogo ? margin + 26 : margin;

    // Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(hasLogo ? 16 : 18);
    doc.text(company.companyName.toUpperCase(), headerTextX, 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(215, 210, 200);
    doc.text(company.tagline.toUpperCase(), headerTextX, 23);

    const contactLine = [
      company.phone,
      company.email,
      company.city ? `${company.city}, ${company.state}` : ''
    ].filter(Boolean).join('  ·  ');
    doc.setFontSize(7);
    doc.setTextColor(190, 185, 175);
    doc.text(contactLine, headerTextX, 29);

    if (company.gstin) {
      doc.text(`GSTIN: ${company.gstin}`, headerTextX, 35);
    }

    // Quote details top right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(245, 180, 80);
    doc.text(quote.quoteNumber, pageWidth - margin, 17, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(220, 220, 220);
    doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - margin, 23, { align: 'right' });
    doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - margin, 28, { align: 'right' });
    doc.text(`Status: ${quote.status.toUpperCase()}`, pageWidth - margin, 33, { align: 'right' });

    yPos = 48;

    // Client & Event Details Box
    doc.setFillColor(252, 250, 246);
    doc.setDrawColor(229, 223, 211);
    doc.roundedRect(margin, yPos, contentWidth, 34, 2, 2, 'FD');

    // Left Column: Client info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 100, 40);
    doc.text('PREPARED FOR:', margin + 6, yPos + 6);

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(quote.clientName, margin + 6, yPos + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    if (quote.clientPhone) doc.text(`Phone: ${quote.clientPhone}`, margin + 6, yPos + 17);
    if (quote.clientEmail) doc.text(`Email: ${quote.clientEmail}`, margin + 6, yPos + 22);
    if (quote.clientInstagram) doc.text(`Instagram: ${quote.clientInstagram}`, margin + 6, yPos + 27);

    // Right Column: Event info
    const rightColX = margin + (contentWidth / 2) + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 100, 40);
    doc.text('EVENT DETAILS:', rightColX, yPos + 6);

    doc.setFont('times', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text(quote.eventName, rightColX, yPos + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`Type: ${quote.eventType}`, rightColX, yPos + 17);
    doc.text(`Date: ${quote.eventDate ? new Date(quote.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}`, rightColX, yPos + 22);
    doc.text(`Venue: ${quote.venue || 'Venue TBD'}`, rightColX, yPos + 27);

    yPos += 40;

    // Services Table Header
    doc.setFillColor(18, 18, 18);
    doc.rect(margin, yPos, contentWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('SERVICE / ITEM', margin + 4, yPos + 4.8);
    doc.text('QTY', margin + 105, yPos + 4.8, { align: 'center' });
    doc.text('RATE (INR)', margin + 130, yPos + 4.8, { align: 'right' });
    doc.text('TOTAL (INR)', pageWidth - margin - 4, yPos + 4.8, { align: 'right' });

    yPos += 7;

    // Items List
    quote.items.forEach((item, index) => {
      const itemRowHeight = item.includedServices && item.includedServices.length > 0 ? 15 : 11;

      if (yPos + itemRowHeight > pageHeight - 75) {
        doc.addPage();
        yPos = margin;
      }

      // Zebra striping
      if (index % 2 === 1) {
        doc.setFillColor(250, 248, 245);
        doc.rect(margin, yPos, contentWidth, itemRowHeight, 'F');
      }

      doc.setDrawColor(235, 230, 222);
      doc.line(margin, yPos + itemRowHeight, pageWidth - margin, yPos + itemRowHeight);

      // Title
      doc.setFont('times', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(item.name, margin + 4, yPos + 4.5);

      // Sub meta
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(110, 110, 110);
      const subInfo = [item.duration, item.crewRequirement].filter(Boolean).join(' · ');
      if (subInfo) doc.text(subInfo, margin + 4, yPos + 8.5);

      // Included services snippet
      if (item.includedServices && item.includedServices.length > 0) {
        doc.setFontSize(6.2);
        doc.setTextColor(150, 110, 50);
        doc.text(`Includes: ${item.includedServices.slice(0, 4).join(', ')}`, margin + 4, yPos + 12);
      }

      // Quantity
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(40, 40, 40);
      doc.text(String(item.quantity), margin + 105, yPos + 5.5, { align: 'center' });

      // Unit Rate
      doc.text(item.rate.toLocaleString('en-IN'), margin + 130, yPos + 5.5, { align: 'right' });

      // Line Total
      doc.setFont('helvetica', 'bold');
      doc.text(item.amount.toLocaleString('en-IN'), pageWidth - margin - 4, yPos + 5.5, { align: 'right' });

      yPos += itemRowHeight;
    });

    yPos += 5;

    // Check page space for breakdown
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = margin;
    }

    const totalsBoxWidth = 85;
    const totalsBoxX = pageWidth - margin - totalsBoxWidth;
    const leftWidth = totalsBoxX - margin - 6;
    const initialBreakdownY = yPos;

    // Totals Box (Right Side)
    let curTotalY = initialBreakdownY;
    doc.setFillColor(252, 250, 246);
    doc.setDrawColor(229, 223, 211);
    doc.roundedRect(totalsBoxX, curTotalY, totalsBoxWidth, 48, 1.5, 1.5, 'FD');

    const addFinancialRow = (label: string, value: string, isBold: boolean = false, isHighlight: boolean = false) => {
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(isHighlight ? 9.5 : 7.6);
      doc.setTextColor(isHighlight ? 20 : (isBold ? 30 : 80), isHighlight ? 20 : 30, isHighlight ? 20 : 30);
      doc.text(label, totalsBoxX + 4, curTotalY + 5.5);

      doc.setFont('helvetica', 'bold');
      if (isHighlight) doc.setTextColor(197, 139, 57);
      doc.text(value, pageWidth - margin - 4, curTotalY + 5.5, { align: 'right' });
      curTotalY += 6;
    };

    addFinancialRow('Subtotal:', `INR ${quote.subtotal.toLocaleString('en-IN')}`);

    if (quote.discountAmount > 0) {
      const discountLabel = quote.discountType === 'percentage' 
        ? `Discount (${quote.discountValue}%):` 
        : 'Special Discount:';
      addFinancialRow(discountLabel, `- INR ${quote.discountAmount.toLocaleString('en-IN')}`);
    }

    if (quote.taxPercentage > 0) {
      addFinancialRow(`GST (${quote.taxPercentage}%):`, `+ INR ${quote.taxAmount.toLocaleString('en-IN')}`);
    }

    doc.setDrawColor(220, 215, 205);
    doc.line(totalsBoxX + 4, curTotalY + 1.5, pageWidth - margin - 4, curTotalY + 1.5);
    curTotalY += 3.5;

    addFinancialRow('Grand Total:', `INR ${quote.grandTotal.toLocaleString('en-IN')}`, true, true);
    addFinancialRow(`Advance Due (${quote.advancePercentage || company.defaultAdvancePercentage}%):`, `INR ${quote.advanceAmount.toLocaleString('en-IN')}`);
    addFinancialRow('Balance Due on Event Day:', `INR ${quote.balanceAmount.toLocaleString('en-IN')}`, true);

    // Left of breakdown: Commercial Notes (Strictly bounded by leftWidth)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 100, 40);
    doc.text('COMMERCIAL NOTES:', margin, initialBreakdownY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(70, 70, 70);
    const notesText = doc.splitTextToSize(
      quote.notes || company.defaultCommercialNotes || 'Capture formatted exclusively for 9:16 social storytelling with high-bitrate audio.', 
      leftWidth
    );
    doc.text(notesText, margin, initialBreakdownY + 8.5);

    const notesHeight = Math.max(12, notesText.length * 3.5 + 4);
    const bankBoxY = initialBreakdownY + notesHeight + 2;

    // Dedicated Banking & UPI Box (Strictly bounded by leftWidth - NEVER overlaps!)
    const bankBoxHeight = 25;
    doc.setFillColor(250, 247, 240);
    doc.setDrawColor(226, 213, 190);
    doc.roundedRect(margin, bankBoxY, leftWidth, bankBoxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(140, 100, 40);
    doc.text('DIRECT BANKING & UPI SETTLEMENT:', margin + 3.5, bankBoxY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.4);
    doc.setTextColor(50, 50, 50);

    const bankLine1 = `Bank: ${company.bankName}  ·  A/C: ${company.accountName}`;
    const bankLine2 = `A/C #: ${company.accountNumber}  ·  IFSC: ${company.ifscCode}${company.branch ? ` (${company.branch})` : ''}`;
    const bankLine3 = `UPI ID: ${company.upiId}`;

    doc.text(doc.splitTextToSize(bankLine1, leftWidth - 7), margin + 3.5, bankBoxY + 9.5);
    doc.text(doc.splitTextToSize(bankLine2, leftWidth - 7), margin + 3.5, bankBoxY + 14.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(140, 100, 40);
    doc.text(bankLine3, margin + 3.5, bankBoxY + 20);

    yPos = Math.max(curTotalY + 4, bankBoxY + bankBoxHeight + 6);

    // Terms & Conditions
    if (yPos > pageHeight - 55) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(18, 18, 18);
    doc.text('TERMS & CONDITIONS:', margin, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(80, 80, 80);
    const terms = doc.splitTextToSize(quote.terms || company.defaultTerms, contentWidth);
    const displayedTerms = terms.slice(0, 5);
    doc.text(displayedTerms, margin, yPos + 4.5);

    yPos += displayedTerms.length * 3.8 + 8;

    // Check space for signature
    if (yPos > pageHeight - 35) {
      doc.addPage();
      yPos = margin + 5;
    }

    // Signature Blocks
    const sigColWidth = contentWidth / 2 - 10;

    // Agency Signature
    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(18, 18, 18);
    doc.text(`For ${company.companyName}`, margin, yPos);

    // Digital Signature Image if uploaded
    if (company.signatureUrl && company.signatureUrl.startsWith('data:image/')) {
      try {
        doc.addImage(company.signatureUrl, 'PNG', margin, yPos + 2, 36, 12);
      } catch {}
    }

    doc.setDrawColor(200, 195, 185);
    doc.line(margin, yPos + 16, margin + sigColWidth, yPos + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(40, 40, 40);
    doc.text(company.signatoryName || 'Authorized Signatory', margin, yPos + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(110, 110, 110);
    doc.text(company.signatoryTitle || 'Creative Producer & Founder', margin, yPos + 24);

    // Client Signature
    const clientSigX = pageWidth - margin - sigColWidth;
    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(18, 18, 18);
    doc.text('Client Acceptance Signature', clientSigX, yPos);

    doc.setDrawColor(200, 195, 185);
    doc.line(clientSigX, yPos + 16, clientSigX + sigColWidth, yPos + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(40, 40, 40);
    doc.text(quote.clientName, clientSigX, yPos + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(110, 110, 110);
    doc.text('Date of Acceptance & Booking Authorization', clientSigX, yPos + 24);

    // Footer
    doc.setFontSize(6.5);
    doc.setTextColor(150, 150, 150);
    doc.text(`${company.companyName} · ${company.tagline} · ${company.website || company.email || ''}`, pageWidth / 2, pageHeight - 6, { align: 'center' });

    doc.save(`${quote.quoteNumber}_${quote.clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  }

  /**
   * Generates and downloads a branded Client Tax Invoice PDF
   */
  static downloadInvoicePDF(invoice: Invoice): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const company = StorageService.getCompanySettings();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Header Background
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Accent line
    doc.setFillColor(217, 119, 6);
    doc.rect(0, 40, pageWidth, 1.5, 'F');

    // Brand Logo
    let hasLogo = false;
    if (company.logoUrl && company.logoUrl.startsWith('data:image/')) {
      try {
        doc.addImage(company.logoUrl, 'PNG', margin, 8, 22, 22);
        hasLogo = true;
      } catch {
        hasLogo = false;
      }
    }

    const headerTextX = hasLogo ? margin + 26 : margin;

    // Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(hasLogo ? 16 : 18);
    doc.text(company.companyName.toUpperCase(), headerTextX, 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(215, 210, 200);
    doc.text('OFFICIAL TAX INVOICE & COMMERCIAL SETTLEMENT', headerTextX, 23);

    const contactLine = [
      company.phone,
      company.email,
      company.city ? `${company.city}, ${company.state}` : ''
    ].filter(Boolean).join('  ·  ');
    doc.setFontSize(7);
    doc.setTextColor(190, 185, 175);
    doc.text(contactLine, headerTextX, 29);

    if (company.gstin) {
      doc.text(`GSTIN: ${company.gstin}`, headerTextX, 35);
    }

    // Invoice details top right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(245, 180, 80);
    doc.text(invoice.invoiceNumber, pageWidth - margin, 17, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(220, 220, 220);
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - margin, 23, { align: 'right' });
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - margin, 28, { align: 'right' });
    doc.text(`Status: ${invoice.paymentStatus.toUpperCase()}`, pageWidth - margin, 33, { align: 'right' });

    yPos = 48;

    // Client & Event Details Box
    doc.setFillColor(252, 250, 246);
    doc.setDrawColor(229, 223, 211);
    doc.roundedRect(margin, yPos, contentWidth, 34, 2, 2, 'FD');

    // Left Column: Billed To
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 100, 40);
    doc.text('BILLED TO (CLIENT):', margin + 6, yPos + 6);

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(invoice.clientName, margin + 6, yPos + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    let leftInfoY = yPos + 17;
    if (invoice.clientPhone) {
      doc.text(`Phone: ${invoice.clientPhone}`, margin + 6, leftInfoY);
      leftInfoY += 4.5;
    }
    if (invoice.clientEmail) {
      doc.text(`Email: ${invoice.clientEmail}`, margin + 6, leftInfoY);
      leftInfoY += 4.5;
    }
    if (invoice.clientAddress) {
      doc.text(`Address: ${invoice.clientAddress}`, margin + 6, leftInfoY);
    }

    // Right Column: Shoot Details
    const rightColX = margin + contentWidth / 2 + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 100, 40);
    doc.text('PRODUCTION EVENT:', rightColX, yPos + 6);

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(invoice.eventName, rightColX, yPos + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`Category: ${invoice.eventType}`, rightColX, yPos + 17);
    if (invoice.eventDate) {
      doc.text(`Shoot Date: ${new Date(invoice.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, rightColX, yPos + 21.5);
    }

    yPos += 40;

    // Table Header
    doc.setFillColor(18, 18, 18);
    doc.rect(margin, yPos, contentWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('SL', margin + 3, yPos + 4.8);
    doc.text('DESCRIPTION / EVENT SERVICE', margin + 12, yPos + 4.8);
    doc.text('QTY', margin + contentWidth - 62, yPos + 4.8, { align: 'center' });
    doc.text('RATE (INR)', margin + contentWidth - 34, yPos + 4.8, { align: 'right' });
    doc.text('AMOUNT (INR)', margin + contentWidth - 3, yPos + 4.8, { align: 'right' });

    yPos += 7;

    // Table Rows
    invoice.items.forEach((item, index) => {
      const rowHeight = item.description ? 13 : 9;

      if (yPos + rowHeight > pageHeight - 65) {
        doc.addPage();
        yPos = margin;
      }

      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(250, 248, 245);
      }
      doc.rect(margin, yPos, contentWidth, rowHeight, 'F');
      doc.setDrawColor(235, 230, 222);
      doc.line(margin, yPos + rowHeight, margin + contentWidth, yPos + rowHeight);

      // Sl No
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(String(index + 1).padStart(2, '0'), margin + 3, yPos + 5.5);

      // Item Name
      doc.setFont('times', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);
      doc.text(item.name, margin + 12, yPos + 5.5);

      // Description
      if (item.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(90, 90, 90);
        doc.text(item.description.slice(0, 75), margin + 12, yPos + 10);
      }

      // Quantity
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(40, 40, 40);
      doc.text(String(item.quantity), margin + contentWidth - 62, yPos + 5.5, { align: 'center' });

      // Rate
      doc.text(item.rate.toLocaleString('en-IN'), margin + contentWidth - 34, yPos + 5.5, { align: 'right' });

      // Total Amount
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(18, 18, 18);
      doc.text(item.amount.toLocaleString('en-IN'), margin + contentWidth - 3, yPos + 5.5, { align: 'right' });

      yPos += rowHeight;
    });

    yPos += 5;

    // Financial Summary
    if (yPos > pageHeight - 75) {
      doc.addPage();
      yPos = margin;
    }

    const summaryBoxWidth = 80;
    const summaryBoxX = pageWidth - margin - summaryBoxWidth;
    const leftWidth = contentWidth - summaryBoxWidth - 8;
    const sY = yPos;

    doc.setFillColor(252, 250, 246);
    doc.setDrawColor(229, 223, 211);
    doc.roundedRect(summaryBoxX, sY, summaryBoxWidth, 48, 1.5, 1.5, 'FD');

    // Subtotal
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text('Subtotal:', summaryBoxX + 4, sY + 6);
    doc.text(`INR ${invoice.subtotal.toLocaleString('en-IN')}`, pageWidth - margin - 4, sY + 6, { align: 'right' });

    // Discount
    if (invoice.discountAmount > 0) {
      doc.text('Discount:', summaryBoxX + 4, sY + 12);
      doc.setTextColor(180, 40, 40);
      doc.text(`- INR ${invoice.discountAmount.toLocaleString('en-IN')}`, pageWidth - margin - 4, sY + 12, { align: 'right' });
      doc.setTextColor(80, 80, 80);
    }

    // GST Tax
    doc.text(`GST / Taxes (${invoice.taxPercentage}%):`, summaryBoxX + 4, sY + 18);
    doc.text(`INR ${invoice.taxAmount.toLocaleString('en-IN')}`, pageWidth - margin - 4, sY + 18, { align: 'right' });

    // Grand Total
    doc.setFillColor(18, 18, 18);
    doc.rect(summaryBoxX, sY + 23, summaryBoxWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL INVOICE VALUE:', summaryBoxX + 4, sY + 28.5);
    doc.text(`INR ${invoice.grandTotal.toLocaleString('en-IN')}`, pageWidth - margin - 4, sY + 28.5, { align: 'right' });

    // Paid & Balance
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 120, 60);
    doc.text('Amount Received / Paid:', summaryBoxX + 4, sY + 36.5);
    doc.text(`INR ${invoice.amountPaid.toLocaleString('en-IN')}`, pageWidth - margin - 4, sY + 36.5, { align: 'right' });

    doc.setTextColor(invoice.balanceDue > 0 ? 197 : 60, invoice.balanceDue > 0 ? 139 : 60, invoice.balanceDue > 0 ? 57 : 60);
    doc.text('Balance Outstanding:', summaryBoxX + 4, sY + 43);
    doc.text(`INR ${invoice.balanceDue.toLocaleString('en-IN')}`, pageWidth - margin - 4, sY + 43, { align: 'right' });

    // Left info: Payment Terms & Notes (Strictly bounded by leftWidth)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 100, 40);
    doc.text('PAYMENT TERMS & NOTES:', margin, sY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(70, 70, 70);
    const notesText = doc.splitTextToSize(invoice.notes || company.defaultCommercialNotes || 'Luxury 9:16 wedding content creation and social storytelling.', leftWidth);
    doc.text(notesText, margin, sY + 9.5);

    const notesHeight = Math.max(12, notesText.length * 3.5 + 4);
    const bankBoxY = sY + notesHeight + 2;

    // Banking & UPI Box (Strictly bounded by leftWidth)
    const bankBoxHeight = 25;
    doc.setFillColor(250, 247, 240);
    doc.setDrawColor(226, 213, 190);
    doc.roundedRect(margin, bankBoxY, leftWidth, bankBoxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(140, 100, 40);
    doc.text('DIRECT BANKING & UPI SETTLEMENT:', margin + 3.5, bankBoxY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.4);
    doc.setTextColor(50, 50, 50);

    const bankLine1 = `Bank: ${company.bankName}  ·  A/C: ${company.accountName}`;
    const bankLine2 = `A/C #: ${company.accountNumber}  ·  IFSC: ${company.ifscCode}${company.branch ? ` (${company.branch})` : ''}`;
    const bankLine3 = `UPI ID: ${company.upiId}`;

    doc.text(doc.splitTextToSize(bankLine1, leftWidth - 7), margin + 3.5, bankBoxY + 9.5);
    doc.text(doc.splitTextToSize(bankLine2, leftWidth - 7), margin + 3.5, bankBoxY + 14.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(140, 100, 40);
    doc.text(bankLine3, margin + 3.5, bankBoxY + 20);

    // Signatures
    yPos = Math.max(sY + 52, bankBoxY + bankBoxHeight + 6);
    if (yPos > pageHeight - 35) {
      doc.addPage();
      yPos = margin + 5;
    }

    const sigColWidth = contentWidth / 2 - 10;
    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(18, 18, 18);
    doc.text(`For ${company.companyName}`, margin, yPos);

    if (company.signatureUrl && company.signatureUrl.startsWith('data:image/')) {
      try {
        doc.addImage(company.signatureUrl, 'PNG', margin, yPos + 2, 36, 12);
      } catch {}
    }

    doc.setDrawColor(200, 195, 185);
    doc.line(margin, yPos + 16, margin + sigColWidth, yPos + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(40, 40, 40);
    doc.text(company.signatoryName || 'Authorized Signatory', margin, yPos + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(110, 110, 110);
    doc.text(company.signatoryTitle || 'Creative Producer & Founder', margin, yPos + 24);

    // Footer
    doc.setFontSize(6.5);
    doc.setTextColor(150, 150, 150);
    doc.text(`${company.companyName} · ${company.tagline} · ${company.website || company.email || ''}`, pageWidth / 2, pageHeight - 6, { align: 'center' });

    doc.save(`${invoice.invoiceNumber}_${invoice.clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  }
}
