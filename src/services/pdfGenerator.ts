import { jsPDF } from 'jspdf';
import { EventCharge, Quotation } from '../types';

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

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Header Background Accent Bar
    doc.setFillColor(18, 18, 18); // Deep black
    doc.rect(0, 0, pageWidth, 36, 'F');

    // Subtle Gold stripe
    doc.setFillColor(217, 119, 6); // Gold / warm accent
    doc.rect(0, 36, pageWidth, 1.5, 'F');

    // Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.text('THE MAIN CHARACTER MEDIA', margin, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(210, 205, 195);
    doc.text('MASTER RATE CARD & PRICING CATALOGUE · SEASON 2026-2027', margin, 25);
    doc.text('LUXURY WEDDING & EVENT CONTENT CREATION', margin, 30);

    // Contact info in top right
    doc.setFontSize(7.5);
    doc.setTextColor(220, 220, 220);
    doc.text('hello@themaincharactermedia.com', pageWidth - margin, 18, { align: 'right' });
    doc.text('+91 98201 44552 · Mumbai | New Delhi', pageWidth - margin, 24, { align: 'right' });
    doc.text('Instagram: @themaincharactermedia', pageWidth - margin, 30, { align: 'right' });

    yPos = 46;

    // Introduction note
    doc.setFont('times', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    const introText = 'Exclusively capturing unfiltered raw emotion, cinematic beauty, and viral-ready 9:16 reels for luxury celebrations. Shot on iPhone 16 Pro Max ProRes with studio stabilization.';
    const splitIntro = doc.splitTextToSize(introText, contentWidth);
    doc.text(splitIntro, margin, yPos);
    yPos += splitIntro.length * 5 + 4;

    // Group charges by Category
    const activeCharges = charges.filter(c => c.status === 'Active');
    const categories = Array.from(new Set(activeCharges.map(c => c.category)));

    categories.forEach(category => {
      // Category Section Header
      if (yPos > pageHeight - 45) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFillColor(248, 246, 240);
      doc.rect(margin, yPos, contentWidth, 7, 'F');
      doc.setDrawColor(229, 223, 211);
      doc.rect(margin, yPos, contentWidth, 7, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(18, 18, 18);
      doc.text(category.toUpperCase(), margin + 4, yPos + 4.8);
      yPos += 10;

      const categoryItems = activeCharges.filter(c => c.category === category);

      categoryItems.forEach(item => {
        const itemBoxHeight = 32;
        if (yPos + itemBoxHeight > pageHeight - 25) {
          doc.addPage();
          yPos = margin;
        }

        // Card Box
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(232, 227, 217);
        doc.roundedRect(margin, yPos, contentWidth, itemBoxHeight, 1.5, 1.5, 'FD');

        // Item Name
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(20, 20, 20);
        doc.text(item.name.toUpperCase(), margin + 5, yPos + 7);

        // Price
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(197, 139, 57);
        doc.text(`INR ${item.price.toLocaleString('en-IN')}`, pageWidth - margin - 5, yPos + 7, { align: 'right' });

        // Meta: Duration & Crew
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 100, 100);
        doc.text(`${item.duration} · ${item.crewRequirement}`, margin + 5, yPos + 12);

        // Description
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(70, 70, 70);
        const desc = doc.splitTextToSize(item.description, contentWidth - 10);
        doc.text(desc.slice(0, 1), margin + 5, yPos + 17);

        // Deliverables / Includes
        if (item.includedServices && item.includedServices.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(140, 100, 40);
          doc.text('INCLUDES: ', margin + 5, yPos + 23);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          const servicesList = item.includedServices.join('  ·  ');
          const splitServices = doc.splitTextToSize(servicesList, contentWidth - 25);
          doc.text(splitServices.slice(0, 2), margin + 20, yPos + 23);
        }

        yPos += itemBoxHeight + 4;
      });

      yPos += 3;
    });

    // Check space for Terms & Banking
    if (yPos > pageHeight - 55) {
      doc.addPage();
      yPos = margin;
    }

    // Terms Box
    doc.setFillColor(250, 248, 245);
    doc.setDrawColor(229, 223, 211);
    doc.rect(margin, yPos, contentWidth, 38, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(18, 18, 18);
    doc.text('TERMS & BOOKING POLICY', margin + 4, yPos + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    const termsList = [
      '1. Date Reservation: A 50% non-refundable advance is required to lock dates on our crew calendar.',
      '2. Payment Terms: Balance 50% is due on or before the event shoot date prior to final footage handover.',
      '3. Raw Delivery: All 4K ProRes raw footage transferred on-site via AirDrop or fast portable SSD immediately.',
      '4. Reels Delivery: Curated, color-graded 9:16 vertical edits delivered within 5 to 7 working days.',
      '5. Outstation Travel & Stay: Flight/rail tickets and hotel accommodations to be arranged by the client.'
    ];

    let tY = yPos + 11;
    termsList.forEach(t => {
      doc.text(t, margin + 4, tY);
      tY += 4.5;
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(197, 139, 57);
    doc.text('BANK DETAILS: The Main Character Media · HDFC Bank Current A/C #50200088912344 · IFSC: HDFC0000045 · UPI: tmcmedia@hdfcbank', margin + 4, yPos + 34);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text('The Main Character Media © 2026. Confidential & Proprietary Pricing Document.', pageWidth / 2, pageHeight - 8, { align: 'center' });

    doc.save('TMC_Master_Rate_Card_2026.pdf');
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

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Header Background
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, pageWidth, 38, 'F');

    // Accent line
    doc.setFillColor(217, 119, 6);
    doc.rect(0, 38, pageWidth, 1.5, 'F');

    // Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(19);
    doc.text('THE MAIN CHARACTER MEDIA', margin, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(215, 210, 200);
    doc.text('PREMIUM WEDDING & CELEBRATION CONTENT CREATION', margin, 25);
    doc.text('OFFICIAL PROPOSAL & COMMERCIAL ESTIMATE', margin, 31);

    // Quote details top right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(245, 180, 80);
    doc.text(quote.quoteNumber, pageWidth - margin, 18, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(220, 220, 220);
    doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - margin, 24, { align: 'right' });
    doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - margin, 29, { align: 'right' });
    doc.text(`Status: ${quote.status.toUpperCase()}`, pageWidth - margin, 34, { align: 'right' });

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

      if (yPos + itemRowHeight > pageHeight - 70) {
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

    yPos += 4;

    // Financial Breakdown Box
    if (yPos > pageHeight - 75) {
      doc.addPage();
      yPos = margin;
    }

    const totalsBoxWidth = 85;
    const totalsBoxX = pageWidth - margin - totalsBoxWidth;

    doc.setFillColor(252, 250, 246);
    doc.setDrawColor(229, 223, 211);
    doc.roundedRect(totalsBoxX, yPos, totalsBoxWidth, 44, 1.5, 1.5, 'FD');

    const addFinancialRow = (label: string, value: string, isBold: boolean = false, isHighlight: boolean = false) => {
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(isHighlight ? 9.5 : 7.8);
      doc.setTextColor(isHighlight ? 20 : (isBold ? 30 : 80), isHighlight ? 20 : 30, isHighlight ? 20 : 30);
      doc.text(label, totalsBoxX + 4, yPos + 5);

      doc.setFont('helvetica', 'bold');
      if (isHighlight) doc.setTextColor(197, 139, 57);
      doc.text(value, pageWidth - margin - 4, yPos + 5, { align: 'right' });
      yPos += 6;
    };

    const initialBreakdownY = yPos;
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
    doc.line(totalsBoxX + 4, yPos + 1, pageWidth - margin - 4, yPos + 1);
    yPos += 3;

    addFinancialRow('Grand Total:', `INR ${quote.grandTotal.toLocaleString('en-IN')}`, true, true);
    addFinancialRow('Advance Booking Due (50%):', `INR ${quote.advanceAmount.toLocaleString('en-IN')}`);
    addFinancialRow('Balance Due on Event Day:', `INR ${quote.balanceAmount.toLocaleString('en-IN')}`, true);

    // Left of breakdown: Notes and Banking
    const leftWidth = totalsBoxX - margin - 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 100, 40);
    doc.text('COMMERCIAL NOTES:', margin, initialBreakdownY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(70, 70, 70);
    const notesText = doc.splitTextToSize(quote.notes || 'All content created exclusively for 9:16 social storytelling with high-bitrate audio.', leftWidth);
    doc.text(notesText, margin, initialBreakdownY + 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(18, 18, 18);
    doc.text('BANKING & UPI TRANSFER:', margin, initialBreakdownY + 26);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(80, 80, 80);
    doc.text('HDFC Bank · The Main Character Media · A/C 50200088912344 · IFSC: HDFC0000045 · UPI: tmcmedia@hdfcbank', margin, initialBreakdownY + 31);

    yPos = Math.max(yPos + 4, initialBreakdownY + 46);

    // Terms & Signatures
    if (yPos > pageHeight - 48) {
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
    const terms = doc.splitTextToSize(quote.terms, contentWidth);
    doc.text(terms.slice(0, 4), margin, yPos + 4.5);

    yPos += terms.slice(0, 4).length * 4 + 8;

    // Signature Blocks
    const sigColWidth = contentWidth / 2 - 10;

    // Agency Signature
    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(18, 18, 18);
    doc.text('For The Main Character Media', margin, yPos);
    doc.setDrawColor(200, 195, 185);
    doc.line(margin, yPos + 14, margin + sigColWidth, yPos + 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    doc.text('Authorized Signatory & Creative Producer', margin, yPos + 18);

    // Client Signature
    const clientSigX = pageWidth - margin - sigColWidth;
    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(18, 18, 18);
    doc.text('Client Acceptance Signature', clientSigX, yPos);
    doc.line(clientSigX, yPos + 14, clientSigX + sigColWidth, yPos + 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    doc.text(`${quote.clientName} · Date of Approval`, clientSigX, yPos + 18);

    // Footer
    doc.setFontSize(6.5);
    doc.setTextColor(150, 150, 150);
    doc.text('The Main Character Media · Luxury Wedding & Event Content Creation · www.themaincharactermedia.com', pageWidth / 2, pageHeight - 6, { align: 'center' });

    doc.save(`${quote.quoteNumber}_${quote.clientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  }
}
