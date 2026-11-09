import { jsPDF } from 'jspdf';
import { EventCharge, Quotation, Invoice } from '../types';
import { StorageService } from './storage';
import { formatDisplayDate } from '../utils/dateUtils';

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
   * Generates and downloads a branded Client Quotation PDF with guaranteed text boundaries
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
    const contentWidth = pageWidth - margin * 2; // 174mm
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
    const maxBrandWidth = pageWidth - margin - 55 - headerTextX;

    // Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(hasLogo ? 15 : 17);
    const brandLines = doc.splitTextToSize(company.companyName.toUpperCase(), maxBrandWidth);
    doc.text(brandLines, headerTextX, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(215, 210, 200);
    const taglineLines = doc.splitTextToSize(company.tagline.toUpperCase(), maxBrandWidth);
    doc.text(taglineLines.slice(0, 1), headerTextX, 22.5);

    const contactLine = [
      company.phone,
      company.email,
      company.city ? `${company.city}, ${company.state}` : ''
    ].filter(Boolean).join('  ·  ');
    doc.setFontSize(6.8);
    doc.setTextColor(190, 185, 175);
    const contactLines = doc.splitTextToSize(contactLine, maxBrandWidth);
    doc.text(contactLines.slice(0, 1), headerTextX, 28);

    if (company.gstin) {
      doc.text(`GSTIN: ${company.gstin}`, headerTextX, 33.5);
    }

    // Quote details top right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(245, 180, 80);
    doc.text(quote.quoteNumber, pageWidth - margin, 16, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(220, 220, 220);
    doc.text(`Date: ${formatDisplayDate(quote.createdAt)}`, pageWidth - margin, 22, { align: 'right' });
    doc.text(`Valid Until: ${formatDisplayDate(quote.validUntil)}`, pageWidth - margin, 27, { align: 'right' });
    doc.text(`Status: ${quote.status.toUpperCase()}`, pageWidth - margin, 32, { align: 'right' });

    yPos = 47;

    // ==========================================
    // CLIENT & EVENT DETAILS BOX (Dynamic Height)
    // ==========================================
    const colWidth = (contentWidth / 2) - 8;
    const leftX = margin + 5;
    const rightColX = margin + (contentWidth / 2) + 4;

    // Measure left column text
    doc.setFont('times', 'bold');
    doc.setFontSize(10.5);
    const clientNameLines = doc.splitTextToSize(quote.clientName || 'Valued Client', colWidth);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    const clientPhoneLines = quote.clientPhone ? doc.splitTextToSize(`Phone: ${quote.clientPhone}`, colWidth) : [];
    const clientEmailLines = quote.clientEmail ? doc.splitTextToSize(`Email: ${quote.clientEmail}`, colWidth) : [];
    const clientInstaLines = quote.clientInstagram ? doc.splitTextToSize(`Instagram: ${quote.clientInstagram}`, colWidth) : [];
    const clientAddrLines = quote.clientAddress ? doc.splitTextToSize(`Address: ${quote.clientAddress}`, colWidth) : [];

    const leftTotalHeight = 9 + (clientNameLines.length * 4.2) + 
      ((clientPhoneLines.length + clientEmailLines.length + clientInstaLines.length + clientAddrLines.length) * 3.6);

    // Measure right column text
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    const eventNameLines = doc.splitTextToSize(quote.eventName || 'Production Event', colWidth);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    const eventTypeLines = doc.splitTextToSize(`Type: ${quote.eventType || 'Wedding'}`, colWidth);
    const eventDateLines = doc.splitTextToSize(`Date: ${formatDisplayDate(quote.eventDate)}`, colWidth);
    const venueLines = doc.splitTextToSize(`Venue: ${quote.venue || 'Venue TBD'}`, colWidth);

    const rightTotalHeight = 9 + (eventNameLines.length * 4.2) + 
      ((eventTypeLines.length + eventDateLines.length + venueLines.length) * 3.6);

    const boxHeight = Math.max(34, Math.max(leftTotalHeight, rightTotalHeight) + 4);

    // Render Box
    doc.setFillColor(252, 250, 246);
    doc.setDrawColor(229, 223, 211);
    doc.roundedRect(margin, yPos, contentWidth, boxHeight, 2, 2, 'FD');

    // Render Left Column (Client info)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(140, 100, 40);
    doc.text('PREPARED FOR:', leftX, yPos + 6);

    let curLeftY = yPos + 11;
    doc.setFont('times', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text(clientNameLines, leftX, curLeftY);
    curLeftY += clientNameLines.length * 4.2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(80, 80, 80);
    if (clientPhoneLines.length) {
      doc.text(clientPhoneLines, leftX, curLeftY);
      curLeftY += clientPhoneLines.length * 3.6;
    }
    if (clientEmailLines.length) {
      doc.text(clientEmailLines, leftX, curLeftY);
      curLeftY += clientEmailLines.length * 3.6;
    }
    if (clientInstaLines.length) {
      doc.setTextColor(180, 120, 40);
      doc.text(clientInstaLines, leftX, curLeftY);
      curLeftY += clientInstaLines.length * 3.6;
      doc.setTextColor(80, 80, 80);
    }
    if (clientAddrLines.length) {
      doc.text(clientAddrLines, leftX, curLeftY);
    }

    // Render Right Column (Event info)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(140, 100, 40);
    doc.text('EVENT DETAILS:', rightColX, yPos + 6);

    let curRightY = yPos + 11;
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(eventNameLines, rightColX, curRightY);
    curRightY += eventNameLines.length * 4.2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(80, 80, 80);
    doc.text(eventTypeLines, rightColX, curRightY);
    curRightY += eventTypeLines.length * 3.6;

    doc.text(eventDateLines, rightColX, curRightY);
    curRightY += eventDateLines.length * 3.6;

    doc.text(venueLines, rightColX, curRightY);

    yPos += boxHeight + 6;

    // ==========================================
    // SERVICES & DELIVERABLES TABLE
    // ==========================================
    const drawTableHeader = (y: number) => {
      doc.setFillColor(18, 18, 18);
      doc.rect(margin, y, contentWidth, 7, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(255, 255, 255);
      doc.text('SERVICE / ITEM DELIVERABLE', margin + 4, y + 4.8);
      doc.text('QTY', margin + 110, y + 4.8, { align: 'center' });
      doc.text('RATE (INR)', margin + 140, y + 4.8, { align: 'right' });
      doc.text('TOTAL (INR)', pageWidth - margin - 4, y + 4.8, { align: 'right' });
    };

    drawTableHeader(yPos);
    yPos += 7;

    const col1MaxWidth = 95; // strict width bound for service details column

    quote.items.forEach((item, index) => {
      const hasDiscount = Boolean(item.discount && item.discount > 0);

      // Calculate wrapped text lines
      doc.setFont('times', 'bold');
      doc.setFontSize(9);
      const nameLines = doc.splitTextToSize(item.name || 'Custom Service Item', col1MaxWidth);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      const subInfo = [item.duration, item.crewRequirement].filter(Boolean).join(' · ');
      const subInfoLines = subInfo ? doc.splitTextToSize(subInfo, col1MaxWidth) : [];

      doc.setFontSize(6.2);
      const descLines = item.description ? doc.splitTextToSize(item.description, col1MaxWidth) : [];

      const incString = item.includedServices && item.includedServices.length > 0 
        ? `Includes: ${item.includedServices.join(', ')}`
        : '';
      const incLines = incString ? doc.splitTextToSize(incString, col1MaxWidth) : [];

      // Calculate exact dynamic row height
      let textContentHeight = (nameLines.length * 4.2);
      if (subInfoLines.length) textContentHeight += (subInfoLines.length * 3.4);
      if (descLines.length) textContentHeight += (descLines.length * 3.2);
      if (incLines.length) textContentHeight += (incLines.length * 3.2);

      const baseHeight = Math.max(12, textContentHeight + 5);
      const itemRowHeight = hasDiscount ? Math.max(15, baseHeight) : baseHeight;

      // Check for page break
      if (yPos + itemRowHeight > pageHeight - 65) {
        doc.addPage();
        yPos = margin + 5;
        drawTableHeader(yPos);
        yPos += 7;
      }

      // Zebra background
      if (index % 2 === 1) {
        doc.setFillColor(250, 248, 245);
        doc.rect(margin, yPos, contentWidth, itemRowHeight, 'F');
      }

      doc.setDrawColor(235, 230, 222);
      doc.line(margin, yPos + itemRowHeight, pageWidth - margin, yPos + itemRowHeight);

      // Render Title lines
      let rowCursorY = yPos + 4.5;
      doc.setFont('times', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(nameLines, margin + 4, rowCursorY);
      rowCursorY += nameLines.length * 4.2;

      // Render Sub meta
      if (subInfoLines.length) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(110, 110, 110);
        doc.text(subInfoLines, margin + 4, rowCursorY);
        rowCursorY += subInfoLines.length * 3.4;
      }

      // Render Description
      if (descLines.length) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.2);
        doc.setTextColor(100, 100, 100);
        doc.text(descLines, margin + 4, rowCursorY);
        rowCursorY += descLines.length * 3.2;
      }

      // Render Included deliverables
      if (incLines.length) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.2);
        doc.setTextColor(150, 110, 50);
        doc.text(incLines, margin + 4, rowCursorY);
      }

      // Render Quantity (aligned with top of row)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(40, 40, 40);
      doc.text(String(item.quantity), margin + 110, yPos + 5.5, { align: 'center' });

      // Render Unit Rate
      doc.text(item.rate.toLocaleString('en-IN'), margin + 140, yPos + 5.5, { align: 'right' });

      // Render Line Total
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(40, 40, 40);
      doc.text(item.amount.toLocaleString('en-IN'), pageWidth - margin - 4, yPos + 5.5, { align: 'right' });

      if (hasDiscount) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.2);
        doc.setTextColor(180, 40, 40);
        doc.text(`Less: -${(item.discount || 0).toLocaleString('en-IN')}`, pageWidth - margin - 4, yPos + 9.5, { align: 'right' });
      }

      yPos += itemRowHeight;
    });

    yPos += 5;

    // ==========================================
    // FINANCIAL SUMMARY & BANKING BOX
    // ==========================================
    const grossSubtotal = (quote.items || []).reduce((acc, curr) => acc + (curr.rate * (curr.quantity || 1)), 0);
    const discountedItems = (quote.items || []).filter(it => (it.discount || 0) > 0);
    const extraRows = discountedItems.length + (quote.discountAmount > 0 ? 1 : 0) + (quote.taxPercentage > 0 ? 1 : 0);
    const totalsBoxHeight = 44 + (extraRows * 6);

    // Check page space for breakdown
    if (yPos + totalsBoxHeight > pageHeight - 35) {
      doc.addPage();
      yPos = margin + 5;
    }

    const totalsBoxWidth = 82;
    const totalsBoxX = pageWidth - margin - totalsBoxWidth; // 192 - 82 = 110mm
    const leftWidth = totalsBoxX - margin - 6; // 110 - 18 - 6 = 86mm
    const initialBreakdownY = yPos;

    // Totals Box (Right Side)
    let curTotalY = initialBreakdownY;
    doc.setFillColor(252, 250, 246);
    doc.setDrawColor(229, 223, 211);
    doc.roundedRect(totalsBoxX, curTotalY, totalsBoxWidth, totalsBoxHeight, 1.5, 1.5, 'FD');

    const addFinancialRow = (label: string, value: string, isBold: boolean = false, isHighlight: boolean = false, isDiscount: boolean = false) => {
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(isHighlight ? 9.5 : 7.5);
      if (isDiscount) {
        doc.setTextColor(180, 40, 40);
      } else {
        doc.setTextColor(isHighlight ? 20 : (isBold ? 30 : 80), isHighlight ? 20 : 30, isHighlight ? 20 : 30);
      }
      doc.text(label, totalsBoxX + 4, curTotalY + 5.5);

      doc.setFont('helvetica', 'bold');
      if (isHighlight) doc.setTextColor(197, 139, 57);
      else if (isDiscount) doc.setTextColor(180, 40, 40);
      doc.text(value, pageWidth - margin - 4, curTotalY + 5.5, { align: 'right' });
      curTotalY += 6;
    };

    addFinancialRow('Subtotal:', `INR ${grossSubtotal.toLocaleString('en-IN')}`);

    discountedItems.forEach(it => {
      const cleanName = it.name.length > 18 ? it.name.substring(0, 16) + '...' : it.name;
      addFinancialRow(`Less: Disc (${cleanName}):`, `- INR ${(it.discount || 0).toLocaleString('en-IN')}`, false, false, true);
    });

    if (quote.discountAmount > 0) {
      const discountLabel = quote.discountType === 'percentage' 
        ? `Less: Disc (${quote.discountValue}%):` 
        : 'Less: Special Disc:';
      addFinancialRow(discountLabel, `- INR ${quote.discountAmount.toLocaleString('en-IN')}`, false, false, true);
    }

    if (quote.taxPercentage > 0) {
      addFinancialRow(`GST (${quote.taxPercentage}%):`, `+ INR ${quote.taxAmount.toLocaleString('en-IN')}`);
    }

    doc.setDrawColor(220, 215, 205);
    doc.line(totalsBoxX + 4, curTotalY + 1.5, pageWidth - margin - 4, curTotalY + 1.5);
    curTotalY += 3.5;

    addFinancialRow('Grand Total:', `INR ${quote.grandTotal.toLocaleString('en-IN')}`, true, true);
    addFinancialRow(`Advance Due (${quote.advancePercentage || company.defaultAdvancePercentage}%):`, `INR ${quote.advanceAmount.toLocaleString('en-IN')}`);
    addFinancialRow('Balance Due on Shoot Day:', `INR ${quote.balanceAmount.toLocaleString('en-IN')}`, true);

    // Left of breakdown: Commercial Notes (strictly bounded by leftWidth)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(140, 100, 40);
    doc.text('COMMERCIAL NOTES:', margin, initialBreakdownY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(70, 70, 70);
    const rawNotes = quote.notes || company.defaultCommercialNotes || 'Capture formatted exclusively for 9:16 social storytelling with high-bitrate audio.';
    const notesText = doc.splitTextToSize(rawNotes, leftWidth);
    doc.text(notesText, margin, initialBreakdownY + 9);

    const notesHeight = Math.max(8, notesText.length * 3.5 + 4);
    const bankBoxY = initialBreakdownY + notesHeight + 2;

    // Banking Box
    const bankLine1 = `Bank: ${company.bankName}  ·  A/C: ${company.accountName}`;
    const bankLine2 = `A/C #: ${company.accountNumber}  ·  IFSC: ${company.ifscCode}${company.branch ? ` (${company.branch})` : ''}`;
    const bankLine3 = `UPI ID: ${company.upiId}`;

    const bLines1 = doc.splitTextToSize(bankLine1, leftWidth - 8);
    const bLines2 = doc.splitTextToSize(bankLine2, leftWidth - 8);
    const bLines3 = doc.splitTextToSize(bankLine3, leftWidth - 8);

    const bankContentHeight = (bLines1.length + bLines2.length + bLines3.length) * 3.6 + 7;
    const bankBoxHeight = Math.max(22, bankContentHeight);

    doc.setFillColor(250, 247, 240);
    doc.setDrawColor(226, 213, 190);
    doc.roundedRect(margin, bankBoxY, leftWidth, bankBoxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(140, 100, 40);
    doc.text('DIRECT BANKING & UPI SETTLEMENT:', margin + 3.5, bankBoxY + 4.8);

    let curBankY = bankBoxY + 8.8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.4);
    doc.setTextColor(50, 50, 50);
    doc.text(bLines1, margin + 3.5, curBankY);
    curBankY += bLines1.length * 3.6;

    doc.text(bLines2, margin + 3.5, curBankY);
    curBankY += bLines2.length * 3.6;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(140, 100, 40);
    doc.text(bLines3, margin + 3.5, curBankY);

    yPos = Math.max(curTotalY + 4, bankBoxY + bankBoxHeight + 6);

    // ==========================================
    // TERMS & CONDITIONS
    // ==========================================
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin + 5;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(18, 18, 18);
    doc.text('TERMS & CONDITIONS:', margin, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(80, 80, 80);
    const rawTerms = quote.terms || company.defaultTerms;
    const terms = doc.splitTextToSize(rawTerms, contentWidth);
    doc.text(terms, margin, yPos + 4.5);

    yPos += terms.length * 3.4 + 7;

    // ==========================================
    // SIGNATURE BLOCKS
    // ==========================================
    if (yPos > pageHeight - 38) {
      doc.addPage();
      yPos = margin + 8;
    }

    const sigColWidth = (contentWidth / 2) - 10;

    // Agency Signature
    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(18, 18, 18);
    const agencySigTitle = doc.splitTextToSize(`For ${company.companyName}`, sigColWidth);
    doc.text(agencySigTitle, margin, yPos);

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
    const sigNameLines = doc.splitTextToSize(company.signatoryName || 'Authorized Signatory', sigColWidth);
    doc.text(sigNameLines, margin, yPos + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(110, 110, 110);
    const sigTitleLines = doc.splitTextToSize(company.signatoryTitle || 'Creative Producer & Founder', sigColWidth);
    doc.text(sigTitleLines, margin, yPos + 24);

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
    const clientSigName = doc.splitTextToSize(quote.clientName || 'Client Signatory', sigColWidth);
    doc.text(clientSigName, clientSigX, yPos + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(110, 110, 110);
    doc.text('Date of Acceptance & Booking Authorization', clientSigX, yPos + 24);

    // Page Numbering Footer on all pages
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `${company.companyName} · ${company.tagline} · ${company.website || company.email || ''}  (Page ${i} of ${totalPages})`,
        pageWidth / 2,
        pageHeight - 6,
        { align: 'center' }
      );
    }

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
    doc.text(`Issue Date: ${formatDisplayDate(invoice.issueDate)}`, pageWidth - margin, 23, { align: 'right' });
    doc.text(`Due Date: ${formatDisplayDate(invoice.dueDate)}`, pageWidth - margin, 28, { align: 'right' });
    doc.text(`Status: ${invoice.paymentStatus.toUpperCase()}`, pageWidth - margin, 33, { align: 'right' });

    yPos = 48;

    // Client & Event Details Box with dynamic height
    const billedToColWidth = (contentWidth / 2) - 10;
    const clientNameLines = doc.splitTextToSize(invoice.clientName, billedToColWidth);
    const clientPhoneLines = invoice.clientPhone ? doc.splitTextToSize(`Phone: ${invoice.clientPhone}`, billedToColWidth) : [];
    const clientEmailLines = invoice.clientEmail ? doc.splitTextToSize(`Email: ${invoice.clientEmail}`, billedToColWidth) : [];
    const clientAddressLines = invoice.clientAddress ? doc.splitTextToSize(`Address: ${invoice.clientAddress}`, billedToColWidth) : [];

    const eventNameLines = doc.splitTextToSize(invoice.eventName, billedToColWidth);
    const eventCategoryLines = doc.splitTextToSize(`Category: ${invoice.eventType}`, billedToColWidth);
    const eventDateLines = invoice.eventDate ? doc.splitTextToSize(`Shoot Date: ${formatDisplayDate(invoice.eventDate)}`, billedToColWidth) : [];

    const leftHeightCalc = 6 + (clientNameLines.length * 4.5) + (clientPhoneLines.length * 4) + (clientEmailLines.length * 4) + (clientAddressLines.length * 4) + 6;
    const rightHeightCalc = 6 + (eventNameLines.length * 4.5) + (eventCategoryLines.length * 4) + (eventDateLines.length * 4) + 6;
    const clientBoxHeight = Math.max(34, Math.max(leftHeightCalc, rightHeightCalc));

    doc.setFillColor(252, 250, 246);
    doc.setDrawColor(229, 223, 211);
    doc.roundedRect(margin, yPos, contentWidth, clientBoxHeight, 2, 2, 'FD');

    // Left Column: Billed To
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 100, 40);
    doc.text('BILLED TO (CLIENT):', margin + 6, yPos + 6);

    doc.setFont('times', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text(clientNameLines, margin + 6, yPos + 11.5);

    let leftInfoY = yPos + 11.5 + (clientNameLines.length * 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(80, 80, 80);
    if (clientPhoneLines.length > 0) {
      doc.text(clientPhoneLines, margin + 6, leftInfoY);
      leftInfoY += clientPhoneLines.length * 3.8;
    }
    if (clientEmailLines.length > 0) {
      doc.text(clientEmailLines, margin + 6, leftInfoY);
      leftInfoY += clientEmailLines.length * 3.8;
    }
    if (clientAddressLines.length > 0) {
      doc.text(clientAddressLines, margin + 6, leftInfoY);
    }

    // Right Column: Shoot Details
    const rightColX = margin + (contentWidth / 2) + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 100, 40);
    doc.text('PRODUCTION EVENT:', rightColX, yPos + 6);

    doc.setFont('times', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text(eventNameLines, rightColX, yPos + 11.5);

    let rightInfoY = yPos + 11.5 + (eventNameLines.length * 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(80, 80, 80);
    doc.text(eventCategoryLines, rightColX, rightInfoY);
    rightInfoY += eventCategoryLines.length * 3.8;

    if (eventDateLines.length > 0) {
      doc.text(eventDateLines, rightColX, rightInfoY);
    }

    yPos += clientBoxHeight + 6;

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

    // Column widths for line items
    const invoiceDescWidth = contentWidth - 12 - 75;

    // Table Rows
    invoice.items.forEach((item, index) => {
      const nameLines = doc.splitTextToSize(item.name, invoiceDescWidth);
      const descLines = item.description ? doc.splitTextToSize(item.description, invoiceDescWidth) : [];
      
      const contentHeight = (nameLines.length * 4.2) + (descLines.length > 0 ? (descLines.length * 3.4) + 2 : 0) + 4;
      const rowHeight = Math.max(10, contentHeight);

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
      doc.setFontSize(9.2);
      doc.setTextColor(20, 20, 20);
      doc.text(nameLines, margin + 12, yPos + 5.2);

      // Description
      if (descLines.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(90, 90, 90);
        doc.text(descLines, margin + 12, yPos + 5.2 + (nameLines.length * 4.2));
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

    // Footer across all pages
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `${company.companyName} · ${company.tagline} · ${company.website || company.email || ''}  (Page ${i} of ${totalPages})`,
        pageWidth / 2,
        pageHeight - 6,
        { align: 'center' }
      );
    }

    doc.save(`${invoice.invoiceNumber}_${invoice.clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  }
}
