import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Printer, 
  MessageCircle, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText,
  DollarSign
} from 'lucide-react';
import { Invoice, InvoiceStatus, EventShoot } from '../../types';
import { PDFGeneratorService } from '../../services/pdfGenerator';
import { StorageService } from '../../services/storage';
import { InvoiceModal } from './InvoiceModal';

interface InvoicesViewProps {
  invoices: Invoice[];
  events: EventShoot[];
  onRefreshData?: () => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  events,
  onRefreshData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Quick generate invoice from event selector
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');

  const statuses: (InvoiceStatus | 'All')[] = ['All', 'Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue'];

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = selectedStatus === 'All' || inv.paymentStatus === selectedStatus;
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.eventName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateFromEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;

    const created = StorageService.createInvoiceFromEvent(selectedEventId);
    if (created) {
      setPreviewInvoice(created);
      setIsGenerateModalOpen(false);
      setSelectedEventId('');
      if (onRefreshData) onRefreshData();
    }
  };

  const handleStatusChange = (invoiceId: string, status: InvoiceStatus) => {
    StorageService.updateInvoiceStatus(invoiceId, status);
    if (previewInvoice && previewInvoice.id === invoiceId) {
      setPreviewInvoice({ ...previewInvoice, paymentStatus: status });
    }
    if (onRefreshData) onRefreshData();
  };

  const handleRecordPayment = (invoiceId: string, amount: number) => {
    StorageService.recordPaymentForInvoice(invoiceId, amount);
    const updated = StorageService.getInvoices().find(i => i.id === invoiceId);
    if (updated) {
      setPreviewInvoice(updated);
    }
    if (onRefreshData) onRefreshData();
  };

  const handleDelete = (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      StorageService.deleteInvoice(invoiceId);
      if (onRefreshData) onRefreshData();
    }
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

  const totalInvoicedValue = invoices.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const totalPaidValue = invoices.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const totalOutstandingValue = invoices.reduce((acc, curr) => acc + curr.balanceDue, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#C58B39] font-semibold">
            Invoicing & Billing Engine
          </div>
          <h2 className="font-serif text-2xl font-bold text-neutral-900 mt-0.5 tracking-tight">
            Commercial Invoices
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Auto-generate tax invoices from confirmed jobs, track payment status, and dispatch PDF receipts.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#C58B39]" />
          <span>+ Generate Invoice from Confirmed Job</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 font-medium">Total Invoiced Billing</span>
          <div className="font-serif text-2xl font-bold text-neutral-900 font-mono mt-1">
            ₹{totalInvoicedValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">{invoices.length} invoices issued</div>
        </div>

        <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 font-medium">Collected via Invoices</span>
          <div className="font-serif text-2xl font-bold text-emerald-700 font-mono mt-1">
            ₹{totalPaidValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Cleared in company bank account</div>
        </div>

        <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 font-medium">Outstanding Balances</span>
          <div className="font-serif text-2xl font-bold text-amber-700 font-mono mt-1">
            ₹{totalOutstandingValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Due before wrap / delivery</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white text-neutral-600 hover:text-black border border-[#E8E3D9]'
              }`}
            >
              {st} {st !== 'All' ? `(${invoices.filter(i => i.paymentStatus === st).length})` : `(${invoices.length})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice #, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E8E3D9] rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-[#C58B39]"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-[#E8E3D9] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-neutral-600 border-b border-[#E8E3D9] uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client & Event</th>
                <th className="py-3 px-3">Date / Due</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
                <th className="py-3 px-3 text-right">Paid</th>
                <th className="py-3 px-3 text-right">Balance Due</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE1]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400 italic">
                    No invoices match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 whitespace-nowrap">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-serif font-bold text-neutral-900">{inv.clientName}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">{inv.eventName} ({inv.eventType})</div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px] whitespace-nowrap">
                      <div className="text-neutral-700">{inv.issueDate}</div>
                      <div className="text-rose-700 text-[10px]">Due: {inv.dueDate}</div>
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-neutral-900 whitespace-nowrap">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono text-emerald-700 font-semibold whitespace-nowrap">
                      ₹{inv.amountPaid.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                      <span className={inv.balanceDue > 0 ? 'text-amber-700' : 'text-neutral-400'}>
                        ₹{inv.balanceDue.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <select
                        value={inv.paymentStatus}
                        onChange={(e) => handleStatusChange(inv.id, e.target.value as InvoiceStatus)}
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${getStatusBadge(inv.paymentStatus)} cursor-pointer`}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#C58B39]" />
                        </button>

                        <button
                          onClick={() => PDFGeneratorService.downloadInvoicePDF(inv)}
                          className="p-1.5 text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            const raw = inv.clientPhone || '';
                            const phone = raw.replace(/\D/g, '');
                            const msg = encodeURIComponent(
                              `Invoice ${inv.invoiceNumber} for ${inv.eventName} - Total: ₹${inv.grandTotal.toLocaleString('en-IN')}, Balance Due: ₹${inv.balanceDue.toLocaleString('en-IN')}`
                            );
                            window.open(phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank');
                          }}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="WhatsApp Invoice"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Generate From Confirmed Job Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E8E3D9] max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-neutral-900">
              Generate Invoice from Confirmed Job
            </h3>
            <p className="text-xs text-neutral-500">
              Select any confirmed production job to auto-extract line items, function allocations, client details, and payment terms.
            </p>

            <form onSubmit={handleCreateFromEvent} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Select Confirmed Event / Job *
                </label>
                <select
                  required
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] text-xs font-medium"
                >
                  <option value="">-- Choose Job --</option>
                  {events
                    .filter(ev => ev.status !== 'Cancelled' && ev.status !== 'Archived')
                    .map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.eventName} ({ev.clientName}) — ₹{ev.packageTotal.toLocaleString('en-IN')}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E3D9]">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-600 hover:text-black font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedEventId}
                  className="px-5 py-2 bg-[#121212] hover:bg-black text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Preview & Actions Modal */}
      {previewInvoice && (
        <InvoiceModal
          isOpen={true}
          onClose={() => setPreviewInvoice(null)}
          invoice={previewInvoice}
          onUpdateStatus={handleStatusChange}
          onRecordPayment={handleRecordPayment}
        />
      )}

    </div>
  );
};
