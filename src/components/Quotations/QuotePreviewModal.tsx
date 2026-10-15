import React, { useState } from 'react';
import { X, Download, Printer, Send, CheckCircle2, ShieldCheck, Share2, MessageCircle, UserCheck, FileText } from 'lucide-react';
import { Quotation, QuoteStatus } from '../../types';
import { PDFGeneratorService } from '../../services/pdfGenerator';
import { StorageService } from '../../services/storage';

interface QuotePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quotation | null;
  onUpdateStatus?: (quoteId: string, status: QuoteStatus) => void;
  onConvertToClient?: (quote: Quotation) => void;
  onConvertToInvoice?: (quote: Quotation) => void;
}

export const QuotePreviewModal: React.FC<QuotePreviewModalProps> = ({
  isOpen,
  onClose,
  quote,
  onUpdateStatus,
  onConvertToClient,
  onConvertToInvoice
}) => {
  const [copied, setCopied] = useState(false);
  const company = StorageService.getCompanySettings();

  if (!isOpen || !quote) return null;

  const handleDownload = () => {
    PDFGeneratorService.downloadQuotationPDF(quote);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSend = () => {
    if (onUpdateStatus) {
      onUpdateStatus(quote.id, 'Sent');
    }
  };

  const handleAccept = () => {
    if (onUpdateStatus) {
      onUpdateStatus(quote.id, 'Accepted');
    }
  };

  const handleWhatsAppShare = () => {
    const phone = quote.clientPhone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hello ${quote.clientName}! Here is your official production proposal and quotation from The Main Character Media:\n\n` +
      `📋 Quote #: ${quote.quoteNumber}\n` +
      `💍 Event: ${quote.eventName} (${quote.eventType})\n` +
      `💰 Grand Total: ₹${quote.grandTotal.toLocaleString('en-IN')}\n` +
      `🔒 Advance to Lock: ₹${quote.advanceAmount.toLocaleString('en-IN')}\n` +
      `📅 Valid Until: ${quote.validUntil}\n\n` +
      `View your full itinerary & proposal document. Please let us know if you'd like to customize any coverage!`
    );
    const url = phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
    if (onUpdateStatus && quote.status === 'Draft') {
      onUpdateStatus(quote.id, 'Sent');
    }
  };

  const handleShare = () => {
    const shareText = `Quotation ${quote.quoteNumber} for ${quote.clientName} - The Main Character Media (Total: ₹${quote.grandTotal.toLocaleString('en-IN')})`;
    if (navigator.share) {
      navigator.share({
        title: `Quotation ${quote.quoteNumber}`,
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConvertClient = () => {
    if (onConvertToClient) {
      onConvertToClient(quote);
    } else {
      // Direct convert
      StorageService.saveClient({
        name: quote.clientName,
        phone: quote.clientPhone,
        email: quote.clientEmail,
        address: quote.clientAddress,
        instagram: quote.clientInstagram,
        notes: `Converted from quotation ${quote.quoteNumber} for ${quote.eventName}`
      });
      if (onUpdateStatus) {
        onUpdateStatus(quote.id, 'Converted');
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 no-print-bg">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="p-4 border-b border-[#E8E3D9] flex items-center justify-between bg-[#181818] text-white no-print">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm tracking-widest uppercase text-[#FAF8F5]">
              Quotation Preview
            </span>
            <span className="text-neutral-500">·</span>
            <span className="font-mono text-xs text-[#C58B39] font-medium">{quote.quoteNumber}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors shadow-xs"
              title="Share quotation via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-[#282828] hover:bg-[#333] rounded transition-colors"
              title="Share quotation link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-[#282828] hover:bg-[#333] rounded transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#C58B39] hover:bg-[#B37B2E] rounded transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={() => {
                if (onConvertToInvoice) {
                  onConvertToInvoice(quote);
                } else {
                  const inv = StorageService.createInvoiceFromQuote(quote);
                  if (inv) {
                    PDFGeneratorService.downloadInvoicePDF(inv);
                  }
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors shadow-xs"
              title="Generate formal Tax Invoice from this quotation"
            >
              <FileText className="w-3.5 h-3.5 text-white" />
              <span>Make Invoice</span>
            </button>

            {quote.status !== 'Converted' && (
              <button
                onClick={handleConvertClient}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-800 hover:bg-black rounded transition-colors border border-neutral-700 shadow-xs"
                title="Convert this quote directly into an active client record"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#C58B39]" />
                <span>Convert to Client</span>
              </button>
            )}

            {quote.status === 'Draft' && onUpdateStatus && (
              <button
                onClick={handleSend}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Mark as Sent</span>
              </button>
            )}

            {quote.status === 'Sent' && onUpdateStatus && (
              <button
                onClick={handleAccept}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Accepted</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Branded Sheet Preview Container */}
        <div className="overflow-y-auto p-6 sm:p-10 bg-[#FAF8F5] print-container">
          <div className="bg-white border border-[#E8E3D9] p-6 sm:p-10 rounded shadow-xs max-w-3xl mx-auto space-y-8">
            
            {/* Header Brand */}
            <div className="border-b border-[#E8E3D9] pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {company.logoUrl ? (
                    <img 
                      src={company.logoUrl} 
                      alt="Company Logo" 
                      className="w-9 h-9 object-contain rounded border border-[#C58B39]/30 p-0.5 bg-white shadow-2xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded border border-[#C58B39] bg-[#181818] text-[#C58B39] font-serif font-bold flex items-center justify-center text-sm shadow-2xs">
                      {company.companyName.charAt(0) || 'M'}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-serif font-bold tracking-wider uppercase text-[#181818] block">
                      {company.companyName}
                    </span>
                    <span className="text-[10px] text-[#8C6428] font-medium block">
                      {company.tagline}
                    </span>
                  </div>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181818] tracking-tight">
                  Official Quotation
                </h1>
                <p className="text-xs text-neutral-600 mt-0.5">
                  {[company.phone, company.email, company.address ? `${company.address}, ${company.city}` : ''].filter(Boolean).join(' · ')}
                </p>
                {company.gstin && (
                  <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                    GSTIN: {company.gstin}
                  </p>
                )}
              </div>

              <div className="text-left sm:text-right space-y-1">
                <div className="font-mono font-bold text-sm text-[#181818]">
                  {quote.quoteNumber}
                </div>
                <div className="text-xs text-neutral-500">
                  Date: {new Date(quote.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div className="text-xs text-neutral-500">
                  Valid Until: {new Date(quote.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div>
                  <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                    quote.status === 'Accepted' || quote.status === 'Converted'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : quote.status === 'Sent'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                  }`}>
                    Status: {quote.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Client and Event Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#FAF8F5] border border-[#E8E3D9] rounded">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#8C6428] mb-1">
                  Client Information:
                </div>
                <div className="font-serif font-bold text-base text-[#181818]">{quote.clientName}</div>
                <div className="text-xs text-neutral-600 mt-0.5 space-y-0.5">
                  {quote.clientPhone && <div>Phone: {quote.clientPhone}</div>}
                  {quote.clientEmail && <div>Email: {quote.clientEmail}</div>}
                  {quote.clientAddress && <div>Address: {quote.clientAddress}</div>}
                  {quote.clientInstagram && <div className="text-[#C58B39]">Instagram: {quote.clientInstagram}</div>}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#8C6428] mb-1">
                  Event & Production Details:
                </div>
                <div className="font-serif font-bold text-base text-[#181818]">{quote.eventName}</div>
                <div className="text-xs text-neutral-600 mt-0.5 space-y-0.5">
                  <div>Event Type: <span className="font-medium text-neutral-800">{quote.eventType}</span></div>
                  <div>Shoot Date: <span className="font-medium text-neutral-800">{quote.eventDate ? new Date(quote.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}</span></div>
                  <div>Venue: <span className="font-medium text-neutral-800">{quote.venue || 'TBD'}</span></div>
                </div>
              </div>
            </div>

            {/* Snapshotted Items Table */}
            <div>
              <div className="text-xs font-serif font-bold uppercase tracking-wider text-[#181818] mb-2">
                Production Services & Deliverables
              </div>

              <div className="overflow-x-auto border border-[#E8E3D9] rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181818] text-white">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Service / Charge Item</th>
                      <th className="py-2.5 px-3 font-medium text-center">Qty</th>
                      <th className="py-2.5 px-3 font-medium text-right">Unit Rate (₹)</th>
                      <th className="py-2.5 px-4 font-medium text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE1]">
                    {quote.items.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-[#FAF8F5]">
                        <td className="py-3 px-4">
                          <div className="font-serif font-bold text-sm text-[#181818]">{item.name}</div>
                          {(item.duration || item.crewRequirement) && (
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              {[item.duration, item.crewRequirement].filter(Boolean).join(' · ')}
                            </div>
                          )}
                          {item.description && (
                            <div className="text-xs text-neutral-600 mt-1 line-clamp-2">
                              {item.description}
                            </div>
                          )}
                          {item.includedServices && item.includedServices.length > 0 && (
                            <div className="text-[11px] text-[#8C6428] mt-1 font-medium">
                              Includes: {item.includedServices.join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono tabular-nums font-medium text-neutral-800">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                          ₹{item.rate.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-[#181818]">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Breakdown & Commercial Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#8C6428] mb-1">
                    Commercial Notes:
                  </div>
                  <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded text-xs text-neutral-700 whitespace-pre-line">
                    {quote.notes || 'Capture formatted exclusively for 9:16 social storytelling with high-bitrate audio.'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#8C6428] mb-1">
                    Direct Banking & UPI Transfer:
                  </div>
                  <div className="p-3 bg-[#FAF6EE] border border-[#E2D5BE] rounded text-xs text-neutral-800 font-mono space-y-0.5">
                    <div>Bank: {company.bankName} · A/C: {company.accountName}</div>
                    <div>A/C No: {company.accountNumber} · IFSC: {company.ifscCode}{company.branch ? ` · ${company.branch}` : ''}</div>
                    <div>UPI ID: <span className="font-bold text-[#8C6428]">{company.upiId}</span></div>
                  </div>
                </div>
              </div>

              {/* Totals Box */}
              <div className="bg-[#FAF8F5] border border-[#E8E3D9] p-4 rounded space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium text-neutral-900 tabular-nums">
                    ₹{quote.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {quote.discountAmount > 0 && (
                  <div className="flex justify-between text-neutral-700">
                    <span>Discount {quote.discountType === 'percentage' ? `(${quote.discountValue}%)` : ''}:</span>
                    <span className="font-mono text-neutral-900 tabular-nums">
                      - ₹{quote.discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {quote.taxPercentage > 0 && (
                  <div className="flex justify-between text-neutral-700">
                    <span>GST ({quote.taxPercentage}%):</span>
                    <span className="font-mono text-neutral-900 tabular-nums">
                      + ₹{quote.taxAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-[#E8E3D9] flex justify-between text-sm font-serif font-bold text-[#181818]">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base text-[#C58B39] tabular-nums">
                    ₹{quote.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E8E3D9] flex justify-between text-xs font-medium text-neutral-800">
                  <span>Advance Due ({quote.advancePercentage || company.defaultAdvancePercentage}%):</span>
                  <span className="font-mono tabular-nums text-neutral-900">
                    ₹{quote.advanceAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-xs font-semibold text-neutral-800">
                  <span>Balance Due on Shoot Day:</span>
                  <span className="font-mono tabular-nums text-[#D97706]">
                    ₹{quote.balanceAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="pt-2 border-t border-[#E8E3D9]">
              <div className="flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-wider text-[#181818] mb-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C58B39]" />
                <span>Commercial Terms & Cancellation Policy</span>
              </div>
              <div className="text-[11px] text-neutral-600 whitespace-pre-line leading-relaxed bg-[#FAF8F5] p-3.5 rounded border border-[#E8E3D9]">
                {quote.terms || company.defaultTerms}
              </div>
            </div>

            {/* Signature Blocks */}
            <div className="pt-6 border-t border-[#E8E3D9] grid grid-cols-2 gap-8 text-xs text-neutral-600">
              <div>
                <div className="h-16 border-b border-neutral-300 flex items-end pb-1">
                  {company.signatureUrl ? (
                    <img 
                      src={company.signatureUrl} 
                      alt="Authorized Signature" 
                      className="max-h-12 object-contain"
                    />
                  ) : (
                    <span className="font-serif italic text-neutral-700">
                      {company.signatoryName || company.companyName}
                    </span>
                  )}
                </div>
                <div className="mt-1 font-medium text-neutral-900">
                  {company.signatoryName || 'Authorized Signatory'}
                </div>
                <div className="text-[11px] text-neutral-500">
                  {company.signatoryTitle || 'Creative Producer & Founder'} · {company.companyName}
                </div>
              </div>

              <div>
                <div className="h-16 border-b border-neutral-300 flex items-end pb-1 font-serif italic text-neutral-700">
                  {quote.status === 'Accepted' || quote.status === 'Converted' ? quote.clientName : ''}
                </div>
                <div className="mt-1 font-medium text-neutral-900">Client Acceptance Signature</div>
                <div className="text-[11px] text-neutral-500">{quote.clientName}</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
