import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  MessageCircle, 
  Share2, 
  CheckCircle2, 
  DollarSign, 
  Calendar, 
  Building2, 
  Clock,
  Send,
  AlertCircle
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../../types';
import { PDFGeneratorService } from '../../services/pdfGenerator';
import { StorageService } from '../../services/storage';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onUpdateStatus?: (invoiceId: string, status: InvoiceStatus) => void;
  onRecordPayment?: (invoiceId: string, amount: number) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onUpdateStatus,
  onRecordPayment
}) => {
  const [copied, setCopied] = useState(false);
  const [paymentInput, setPaymentInput] = useState('');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const company = StorageService.getCompanySettings();

  if (!isOpen || !invoice) return null;

  const handleDownloadPDF = () => {
    PDFGeneratorService.downloadInvoicePDF(invoice);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const rawNumber = invoice.clientPhone || '';
    const phone = rawNumber.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hello ${invoice.clientName}!\n\nHere is your official Tax Invoice from *The Main Character Media*:\n` +
      `📄 Invoice #: *${invoice.invoiceNumber}*\n` +
      `💍 Event: *${invoice.eventName}* (${invoice.eventType})\n` +
      `💰 Grand Total: *₹${invoice.grandTotal.toLocaleString('en-IN')}*\n` +
      `✅ Paid: ₹${invoice.amountPaid.toLocaleString('en-IN')}\n` +
      `⏳ Balance Due: *₹${invoice.balanceDue.toLocaleString('en-IN')}*\n` +
      `📅 Due Date: ${invoice.dueDate}\n\n` +
      `UPI / Bank Transfer details:\n` +
      `HDFC Bank Current A/C #50200088912344 · IFSC: HDFC0000045 · UPI: tmcmedia@hdfcbank\n\n` +
      `Please let us know once transferred so we can update your production clearance!`
    );
    const url = phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    const shareText = `Tax Invoice ${invoice.invoiceNumber} for ${invoice.clientName} - The Main Character Media (Balance: ₹${invoice.balanceDue.toLocaleString('en-IN')})`;
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${invoice.invoiceNumber}`,
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleMarkStatus = (status: InvoiceStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(invoice.id, status);
    } else {
      StorageService.updateInvoiceStatus(invoice.id, status);
    }
  };

  const handleQuickPay = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(paymentInput);
    if (!amt || amt <= 0) return;

    if (onRecordPayment) {
      onRecordPayment(invoice.id, amt);
    } else {
      StorageService.recordPaymentForInvoice(invoice.id, amt);
    }
    setPaymentInput('');
    setIsRecordingPayment(false);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Partially Paid':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Sent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Overdue':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Draft':
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 no-print-bg">
      <div className="bg-white rounded-xl border border-[#E8E3D9] max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header & Actions Bar */}
        <div className="p-4 sm:p-5 border-b border-[#2A2A2A] bg-[#121212] text-white flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            {company.logoUrl ? (
              <img 
                src={company.logoUrl} 
                alt="Logo" 
                className="w-8 h-8 object-contain rounded border border-[#C58B39]/40 bg-[#1F1E1C] p-0.5"
              />
            ) : (
              <div className="w-8 h-8 rounded border border-[#C58B39] bg-[#1F1E1C] flex items-center justify-center font-serif text-[#C58B39] font-bold text-sm">
                {company.companyName.charAt(0) || 'M'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-white tracking-wide uppercase">
                  Tax Invoice
                </span>
                <span className="font-mono text-xs text-[#C58B39] bg-[#222] px-2 py-0.5 rounded border border-[#333]">
                  {invoice.invoiceNumber}
                </span>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${getStatusBadge(invoice.paymentStatus)}`}>
                  {invoice.paymentStatus}
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                Issued by {company.companyName} for {invoice.clientName} · {invoice.eventName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-2xs"
              title="Share invoice on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#C58B39] hover:bg-[#B37B2E] rounded-lg transition-colors shadow-2xs"
              title="Download professional PDF invoice"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-[#262626] hover:bg-[#333] rounded-lg transition-colors"
              title="Print Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-[#262626] hover:bg-[#333] rounded-lg transition-colors"
              title="Copy share link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action strip: Mark Status & Record Payment */}
        <div className="p-3 bg-[#FAF8F5] border-b border-[#E8E3D9] flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium">Update Status:</span>
            {(['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue'] as InvoiceStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => handleMarkStatus(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  invoice.paymentStatus === st
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-white text-neutral-700 border border-[#DCD6C8] hover:bg-neutral-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isRecordingPayment ? (
              <button
                onClick={() => setIsRecordingPayment(true)}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded text-[11px] flex items-center gap-1 shadow-2xs"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Record Receipt</span>
              </button>
            ) : (
              <form onSubmit={handleQuickPay} className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max={invoice.balanceDue}
                  required
                  placeholder={`Max ₹${invoice.balanceDue}`}
                  value={paymentInput}
                  onChange={(e) => setPaymentInput(e.target.value)}
                  className="w-28 px-2 py-0.5 border border-[#C58B39] rounded font-mono text-xs bg-white"
                />
                <button
                  type="submit"
                  className="px-2.5 py-0.5 bg-emerald-700 text-white rounded font-semibold text-[11px]"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setIsRecordingPayment(false)}
                  className="px-1.5 py-0.5 text-neutral-500 hover:text-black text-[11px]"
                >
                  ✕
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 text-xs bg-white text-neutral-900 printable-area">
          
          {/* Header Brand Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E3D9]">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {company.logoUrl ? (
                  <img 
                    src={company.logoUrl} 
                    alt="Company Logo" 
                    className="w-10 h-10 object-contain rounded border border-[#C58B39]/30 p-0.5 bg-white shadow-2xs"
                  />
                ) : (
                  <div className="w-9 h-9 rounded border border-[#C58B39] bg-[#181818] text-[#C58B39] font-serif font-bold flex items-center justify-center text-sm shadow-2xs">
                    {company.companyName.charAt(0) || 'M'}
                  </div>
                )}
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 leading-tight">
                    {company.companyName}
                  </h2>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#C58B39] font-bold">
                    {company.tagline}
                  </div>
                </div>
              </div>
              <p className="text-neutral-500 text-[11px] mt-0.5 max-w-sm">
                {[company.phone, company.email, company.address ? `${company.address}, ${company.city}` : ''].filter(Boolean).join(' · ')}
              </p>
              {company.gstin && (
                <div className="text-[10px] font-mono text-neutral-500 mt-1">
                  GSTIN: {company.gstin}
                </div>
              )}
            </div>

            <div className="text-right sm:text-right space-y-1 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8E3D9] min-w-[220px]">
              <div className="text-[10px] font-mono uppercase text-neutral-500 font-bold">Tax Invoice</div>
              <div className="font-mono text-base font-bold text-neutral-900">{invoice.invoiceNumber}</div>
              <div className="text-[11px] text-neutral-600">
                Issue Date: <strong className="font-mono text-neutral-900">{invoice.issueDate}</strong>
              </div>
              <div className="text-[11px] text-neutral-600">
                Payment Due: <strong className="font-mono text-rose-700">{invoice.dueDate}</strong>
              </div>
            </div>
          </div>

          {/* Client & Event Vitals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E3D9]">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#C58B39] font-bold mb-1">
                Billed To (Client):
              </div>
              <h3 className="font-serif font-bold text-base text-neutral-900">{invoice.clientName}</h3>
              {invoice.clientPhone && (
                <div className="font-mono text-neutral-600 mt-0.5">📞 {invoice.clientPhone}</div>
              )}
              {invoice.clientEmail && (
                <div className="text-neutral-600 mt-0.5">✉️ {invoice.clientEmail}</div>
              )}
              {invoice.clientAddress && (
                <div className="text-neutral-500 mt-0.5">📍 {invoice.clientAddress}</div>
              )}
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#C58B39] font-bold mb-1">
                Event & Production Details:
              </div>
              <div className="font-serif font-bold text-base text-neutral-900">{invoice.eventName}</div>
              <div className="text-neutral-600 mt-0.5">Shoot Type: <strong>{invoice.eventType}</strong></div>
              <div className="text-neutral-600 mt-0.5 font-mono">Date: <strong>{invoice.eventDate}</strong></div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-[#E8E3D9] rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left">
              <thead className="bg-[#FAF8F5] text-neutral-700 border-b border-[#E8E3D9] font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Event Coverage / Service</th>
                  <th className="py-3 px-3 text-center w-16">Qty</th>
                  <th className="py-3 px-3 text-right w-28">Rate (₹)</th>
                  <th className="py-3 px-4 text-right w-32">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1]">
                {invoice.items.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-[#FAF8F5]/60">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{item.name}</div>
                      {item.description && (
                        <div className="text-[11px] text-neutral-500 mt-0.5">{item.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono">₹{item.rate.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations & Settlement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
            
            {/* Payment Terms & Bank Info */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#E8E3D9] bg-[#FAF8F5] space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#C58B39] font-bold">
                  Banking & Electronic Remittance
                </div>
                <div className="space-y-1 text-[11px] text-neutral-700">
                  <div>Bank Name: <strong>{company.bankName}</strong></div>
                  <div>Account Name: <strong>{company.accountName}</strong></div>
                  <div>Account Number: <strong className="font-mono">{company.accountNumber}</strong></div>
                  <div>IFSC Code: <strong className="font-mono">{company.ifscCode}</strong>{company.branch ? ` (${company.branch})` : ''}</div>
                  <div>UPI ID: <strong className="font-mono text-[#C58B39]">{company.upiId}</strong></div>
                </div>
              </div>

              {invoice.notes && (
                <div className="text-[11px] text-neutral-600 p-3 rounded-lg border border-[#F0ECE1] bg-white">
                  <span className="font-semibold text-neutral-800">Production Brief / Note:</span> {invoice.notes}
                </div>
              )}
            </div>

            {/* Calculations Box */}
            <div className="p-5 rounded-xl border border-[#E8E3D9] bg-white shadow-xs space-y-2.5">
              <div className="flex justify-between items-center text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-neutral-900">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between items-center text-rose-700">
                  <span>Discount:</span>
                  <span className="font-mono">- ₹{invoice.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-neutral-600">
                <span>GST ({invoice.taxPercentage}%):</span>
                <span className="font-mono">+ ₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2 border-t border-[#121212] flex justify-between items-center text-base font-bold text-neutral-900 font-serif">
                <span>Grand Total:</span>
                <span className="font-mono text-lg text-[#C58B39]">₹{invoice.grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2 border-t border-[#F0ECE1] flex justify-between items-center text-emerald-700 font-semibold">
                <span>Amount Paid:</span>
                <span className="font-mono">₹{invoice.amountPaid.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-base font-bold text-amber-800 pt-1">
                <span>Balance Due:</span>
                <span className="font-mono font-bold text-lg">₹{invoice.balanceDue.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

          {/* Signature Block */}
          <div className="pt-6 border-t border-[#E8E3D9] flex justify-end">
            <div className="text-right">
              <div className="h-16 flex items-end justify-end pb-1">
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
              <div className="w-48 border-b border-neutral-300 ml-auto mb-1"></div>
              <div className="font-semibold text-neutral-900 text-xs">
                {company.signatoryName || 'Authorized Signatory'}
              </div>
              <div className="text-[10px] text-neutral-500">
                {company.signatoryTitle || 'Creative Producer & Founder'} · {company.companyName}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-neutral-400 pt-4 border-t border-[#E8E3D9]">
            This is a computer-generated tax invoice issued by {company.companyName}. Thank you for your partnership.
          </div>

        </div>

      </div>
    </div>
  );
};
