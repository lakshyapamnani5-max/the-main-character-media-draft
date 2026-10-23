import React from 'react';
import { X, Download, Printer, Check, ShieldCheck } from 'lucide-react';
import { EventCharge } from '../../types';
import { PDFGeneratorService } from '../../services/pdfGenerator';
import { StorageService } from '../../services/storage';

interface RateCardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  charges: EventCharge[];
}

export const RateCardPreviewModal: React.FC<RateCardPreviewModalProps> = ({
  isOpen,
  onClose,
  charges
}) => {
  if (!isOpen) return null;

  const settings = StorageService.getCompanySettings();
  const activeCharges = charges.filter(c => c.status === 'Active');
  const categories = Array.from(new Set(activeCharges.map(c => c.category)));

  const handleDownload = () => {
    PDFGeneratorService.downloadRateCardPDF(charges);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 no-print-bg">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Action Bar */}
        <div className="p-4 border-b border-[#E8E3D9] flex items-center justify-between bg-[#181818] text-white no-print">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm tracking-widest uppercase text-[#FAF8F5]">
              Master Rate Card Document
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-xs text-[#C58B39]">Catalogue Preview</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-[#282828] hover:bg-[#333] rounded transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#C58B39] hover:bg-[#B37B2E] rounded transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="overflow-y-auto p-6 sm:p-10 bg-[#FAF8F5] print-container">
          <div className="bg-white border border-[#E8E3D9] p-6 sm:p-10 rounded shadow-xs max-w-3xl mx-auto space-y-8">
            
            {/* Header Lockup */}
            <div className="border-b border-[#E8E3D9] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded border border-[#C58B39] bg-[#181818] text-[#C58B39] font-serif font-bold flex items-center justify-center text-sm">
                    M
                  </div>
                  <span className="text-[11px] font-semibold tracking-widest uppercase text-[#C58B39]">
                    The Main Character Media
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181818] tracking-tight">
                  Master Event Charges & Rate Card
                </h1>
                <p className="text-xs text-neutral-600 mt-1">
                  Official Standard Pricing Catalogue · Season 2026-2027
                </p>
              </div>

              <div className="text-left sm:text-right text-[11px] text-neutral-500 font-light space-y-0.5">
                <div className="font-medium text-neutral-800">The Main Character Media Studio</div>
                <div>Bandra West, Mumbai · Golf Links, New Delhi</div>
                <div>hello@themaincharactermedia.com · +91 98201 44552</div>
                <div className="text-[#C58B39] font-normal">Instagram: @themaincharactermedia</div>
              </div>
            </div>

            {/* Editorial Introduction */}
            <div className="p-4 bg-[#FAF8F5] border border-[#EBE5DA] rounded text-xs text-neutral-700 italic font-serif">
              "We tell modern love stories through the lens of unfiltered emotion, high-fashion sensibilities, and viral vertical video architecture. Captured on iPhone 16 Pro Max ProRes with pro audio and mobile stabilization."
            </div>

            {/* Categories & Charges */}
            <div className="space-y-6">
              {categories.map((category) => {
                const categoryCharges = activeCharges.filter(c => c.category === category);
                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-[#E8E3D9]">
                      <h2 className="font-serif font-bold text-sm tracking-wider uppercase text-[#181818]">
                        {category}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {categoryCharges.map((item) => (
                        <div 
                          key={item.id} 
                          className="bg-[#FAF8F5] border border-[#E8E3D9] p-4 rounded hover:border-[#D0C7B7] transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-baseline justify-between gap-2">
                              <h3 className="font-serif font-bold text-sm text-[#181818]">
                                {item.name}
                              </h3>
                              <span className="font-mono font-bold text-sm text-[#C58B39] tabular-nums shrink-0">
                                ₹{item.price.toLocaleString('en-IN')}
                              </span>
                            </div>

                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              {item.duration} · {item.crewRequirement}
                            </div>

                            {item.description && (
                              <p className="text-xs text-neutral-600 mt-2 line-clamp-2">
                                {item.description}
                              </p>
                            )}

                            {item.includedServices && item.includedServices.length > 0 && (
                              <div className="mt-3 pt-2.5 border-t border-[#E8E3D9]/60">
                                <div className="text-[10px] uppercase font-semibold text-[#8C6428] tracking-wider mb-1.5">
                                  Includes:
                                </div>
                                <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-neutral-700">
                                  {item.includedServices.map((srv, idx) => (
                                    <li key={idx} className="flex items-center gap-1.5 truncate">
                                      <Check className="w-3 h-3 text-[#C58B39] shrink-0" />
                                      <span className="truncate">{srv}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {item.optionalAddOns && item.optionalAddOns.length > 0 && (
                            <div className="mt-2 text-[10px] text-neutral-500">
                              <span className="font-medium">Add-ons:</span> {item.optionalAddOns.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Commercial Terms & Booking Policy */}
            <div className="pt-4 border-t border-[#E8E3D9] space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-wider text-[#181818]">
                <ShieldCheck className="w-4 h-4 text-[#C58B39]" />
                <span>Commercial Booking Terms & Payment Policy</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-neutral-600">
                <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded space-y-1.5">
                  <div className="font-medium text-neutral-800">Booking & Confirmation</div>
                  <div>1. 50% advance booking deposit secures dates on our creative roster.</div>
                  <div>2. Remaining 50% balance payable on or before event shoot day.</div>
                  <div>3. Date locking is strictly subject to realization of deposit.</div>
                </div>

                <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded space-y-1.5">
                  <div className="font-medium text-neutral-800">Deliverables & Turnaround</div>
                  <div>1. Raw uncut 4K ProRes footage transferred on-site via AirDrop/SSD.</div>
                  <div>2. Edited 9:16 high-impact reels delivered within 5-7 working days.</div>
                  <div>3. Same-day edits (if chosen) delivered before midnight for live posting.</div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="p-3.5 bg-[#FAF6EE] border border-[#E2D5BE] rounded text-xs text-neutral-800">
                <span className="font-semibold text-[#8C6428] uppercase tracking-wider text-[10px] block mb-1">
                  Official Banking Details:
                </span>
                <div className="font-mono text-[11px] space-y-0.5">
                  <div>Account Name: <span className="font-semibold">{settings.accountName || settings.companyName}</span></div>
                  <div>Bank: <span className="font-semibold">{settings.bankName || 'HDFC Bank Ltd.'}</span> · Current A/C: <span className="font-semibold">{settings.accountNumber || '50200088912344'}</span></div>
                  <div>IFSC Code: <span className="font-semibold">{settings.ifscCode || 'HDFC0000045'}</span> · Branch: {settings.branch || 'Bandra West, Mumbai'}</div>
                  {settings.upiId && <div>UPI VPA: <span className="font-semibold text-[#8C6428]">{settings.upiId}</span></div>}
                </div>
              </div>
            </div>

            {/* Document Signature Sign-off */}
            <div className="pt-6 border-t border-[#E8E3D9] flex justify-between items-end text-xs text-neutral-500">
              <div>
                <div className="font-serif font-bold text-neutral-800 text-sm">
                  {settings.signatoryName || 'Authorized Signatory'}
                </div>
                <div>{settings.signatoryTitle || 'Founder & Creative Producer'}</div>
                <div className="text-[11px]">{settings.companyName || 'The Main Character Media'}</div>
              </div>
              <div className="text-right text-[10px]">
                Valid for all 2026-2027 Celebrations
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
