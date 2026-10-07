import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit3, 
  Send, 
  CheckCircle2, 
  FileText,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { Quotation, QuoteStatus } from '../../types';
import { PDFGeneratorService } from '../../services/pdfGenerator';
import { QuotePreviewModal } from './QuotePreviewModal';

interface QuotationsViewProps {
  quotations: Quotation[];
  onOpenCreateQuote: () => void;
  onEditQuote: (quote: Quotation) => void;
  onUpdateQuoteStatus: (quoteId: string, status: QuoteStatus) => void;
  onOpenPreview: (quote: Quotation) => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({
  quotations,
  onOpenCreateQuote,
  onEditQuote,
  onUpdateQuoteStatus,
  onOpenPreview
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewingQuote, setPreviewingQuote] = useState<Quotation | null>(null);

  const statuses: ('All' | QuoteStatus)[] = [
    'All',
    'Draft',
    'Sent',
    'Viewed',
    'Accepted',
    'Rejected',
    'Expired',
    'Converted'
  ];

  const filteredQuotes = quotations.filter(q => {
    const matchesStatus = selectedStatus === 'All' || q.status === selectedStatus;
    const matchesSearch = 
      q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.venue.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const totalQuotedVolume = quotations.reduce((acc, q) => acc + q.grandTotal, 0);
  const acceptedVolume = quotations
    .filter(q => q.status === 'Accepted' || q.status === 'Converted')
    .reduce((acc, q) => acc + q.grandTotal, 0);

  const getStatusBadgeClass = (status: QuoteStatus) => {
    switch (status) {
      case 'Accepted':
      case 'Converted':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Sent':
      case 'Viewed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Expired':
        return 'bg-neutral-100 text-neutral-500 border-neutral-200';
      case 'Draft':
      default:
        return 'bg-[#FAF6EE] text-[#8C6428] border-[#EADBBE]';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#C58B39]">Commercial Proposals</div>
          <h1 className="font-serif text-2xl font-bold text-[#181818] tracking-tight">
            Client Quotations
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Branded commercial proposals with immutable item snapshots and automated tax calculation.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {quotations.length > 0 && (
            <button
              onClick={() => {
                const latest = quotations[0];
                PDFGeneratorService.downloadQuotationPDF(latest);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-800 bg-[#FAF8F5] hover:bg-neutral-100 border border-[#E8E3D9] rounded transition-colors shadow-2xs"
              title="Download PDF of latest active quotation"
            >
              <Download className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>Download Full Quotation</span>
            </button>
          )}

          <button
            onClick={onOpenCreateQuote}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#181818] hover:bg-black rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
            <span>Custom Quote</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8E3D9] p-4 rounded-lg shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500 font-medium">Total Quotes Issued</div>
            <div className="text-xl font-serif font-bold text-[#181818] mt-1 font-mono tabular-nums">
              {quotations.length} Proposals
            </div>
          </div>
          <FileText className="w-5 h-5 text-neutral-400" />
        </div>

        <div className="bg-white border border-[#E8E3D9] p-4 rounded-lg shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500 font-medium">Gross Quoted Pipeline</div>
            <div className="text-xl font-serif font-bold text-[#181818] mt-1 font-mono tabular-nums">
              ₹{totalQuotedVolume.toLocaleString('en-IN')}
            </div>
          </div>
          <span className="text-xs text-neutral-400 font-serif">INR Total</span>
        </div>

        <div className="bg-white border border-[#E8E3D9] p-4 rounded-lg shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500 font-medium">Accepted / Converted Value</div>
            <div className="text-xl font-serif font-bold text-emerald-700 mt-1 font-mono tabular-nums">
              ₹{acceptedVolume.toLocaleString('en-IN')}
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? 'bg-[#181818] text-white'
                  : 'bg-white text-neutral-600 hover:text-neutral-900 border border-[#E8E3D9]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by quote # or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E8E3D9] rounded text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#C58B39]"
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white border border-[#E8E3D9] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-neutral-600 border-b border-[#E8E3D9] uppercase tracking-wider text-[11px] font-medium">
              <tr>
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-4">Client & Event</th>
                <th className="py-3 px-3">Shoot Date</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-3 text-right">Advance Due</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE1]">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-neutral-400 italic">
                    No quotations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-900 whitespace-nowrap">
                      {quote.quoteNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-serif font-bold text-sm text-[#181818]">{quote.clientName}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5 truncate max-w-xs">
                        {quote.eventName} {quote.venue && `· ${quote.venue}`}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        {quote.items.length} items ({quote.items.map(i => i.name).slice(0, 2).join(', ')}{quote.items.length > 2 ? '...' : ''})
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-neutral-600">
                      {quote.eventDate ? (
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          <span>{new Date(quote.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-400">TBD</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-neutral-900 tabular-nums whitespace-nowrap">
                      ₹{quote.grandTotal.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono text-neutral-700 tabular-nums whitespace-nowrap">
                      ₹{quote.advanceAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {/* Status Dropdown */}
                      <select
                        value={quote.status}
                        onChange={(e) => onUpdateQuoteStatus(quote.id, e.target.value as QuoteStatus)}
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border focus:outline-none cursor-pointer ${getStatusBadgeClass(quote.status)}`}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Viewed">Viewed</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Expired">Expired</option>
                        <option value="Converted">Converted</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setPreviewingQuote(quote);
                          }}
                          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded text-xs transition-colors"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#C58B39]" />
                        </button>

                        <button
                          onClick={() => PDFGeneratorService.downloadQuotationPDF(quote)}
                          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded text-xs transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onEditQuote(quote)}
                          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded text-xs transition-colors"
                          title="Edit Quote"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Document Preview Modal */}
      {previewingQuote && (
        <QuotePreviewModal
          isOpen={true}
          onClose={() => setPreviewingQuote(null)}
          quote={previewingQuote}
          onUpdateStatus={(id, st) => {
            onUpdateQuoteStatus(id, st);
            setPreviewingQuote({ ...previewingQuote, status: st });
          }}
        />
      )}
    </div>
  );
};
