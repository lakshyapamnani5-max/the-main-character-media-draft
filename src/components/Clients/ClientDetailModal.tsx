import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Plus, 
  Calendar, 
  FileText, 
  CreditCard, 
  Eye, 
  Clock, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { Client, EventShoot, Quotation, PaymentRecord } from '../../types';
import { AddPaymentModal } from './AddPaymentModal';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  events: EventShoot[];
  quotes: Quotation[];
  payments: PaymentRecord[];
  onRecordPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
  onCreateQuoteForClient: (client: Client) => void;
  onSelectQuoteForPreview: (quote: Quotation) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen,
  onClose,
  client,
  events,
  quotes,
  payments,
  onRecordPayment,
  onCreateQuoteForClient,
  onSelectQuoteForPreview
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'quotes' | 'payments' | 'notes'>('events');
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

  if (!isOpen || !client) return null;

  const totalRevenue = events.reduce((acc, curr) => acc + (curr.packageTotal || 0), 0);
  const totalPaid = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const outstanding = Math.max(0, totalRevenue - totalPaid);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E8E3D9] bg-[#181818] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">
                Client Dossier
              </span>
              <span className="text-neutral-500">·</span>
              <span className="font-mono text-xs text-neutral-400">ID: {client.id}</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#FAF8F5] mt-0.5">
              {client.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddPaymentOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#181818] bg-[#FAF8F5] hover:bg-white rounded transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>Record Payment</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onCreateQuoteForClient(client);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#C58B39] hover:bg-[#B37B2E] rounded transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Quote</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Financial & Contact Strip */}
        <div className="p-5 bg-[#FAF8F5] border-b border-[#E8E3D9] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Contact Details */}
          <div className="space-y-1 text-neutral-600">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C6428]">
              Contact Coordinates
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
              {client.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="font-mono">{client.phone}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{client.address}</span>
                </div>
              )}
              {client.instagram && (
                <div className="flex items-center gap-1.5 text-[#C58B39]">
                  <Instagram className="w-3.5 h-3.5 text-[#C58B39]" />
                  <span>{client.instagram}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-2 text-right">
            <div className="bg-white p-2.5 rounded border border-[#E8E3D9]">
              <span className="text-[10px] text-neutral-500 block uppercase font-medium">Total Booked</span>
              <span className="font-mono font-bold text-sm text-neutral-900 tabular-nums">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded border border-[#E8E3D9]">
              <span className="text-[10px] text-neutral-500 block uppercase font-medium">Total Paid</span>
              <span className="font-mono font-bold text-sm text-emerald-700 tabular-nums">
                ₹{totalPaid.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded border border-[#E8E3D9]">
              <span className="text-[10px] text-neutral-500 block uppercase font-medium">Outstanding</span>
              <span className="font-mono font-bold text-sm text-[#D97706] tabular-nums">
                ₹{outstanding.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-[#E8E3D9] flex gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('events')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'events' ? 'border-[#C58B39] text-[#181818] font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Events ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'quotes' ? 'border-[#C58B39] text-[#181818] font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Quotations ({quotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'payments' ? 'border-[#C58B39] text-[#181818] font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payments & Invoices ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'notes' ? 'border-[#C58B39] text-[#181818] font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Production Notes</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="overflow-y-auto p-5 text-xs flex-1">
          
          {/* TAB 1: EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="py-10 text-center text-neutral-400 italic">
                  No events booked yet for this client.
                </div>
              ) : (
                events.map((evt) => (
                  <div key={evt.id} className="p-4 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-[#181818]">{evt.eventName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#E8E3D9] text-neutral-700">
                          {evt.status}
                        </span>
                      </div>
                      <div className="text-neutral-600 mt-1">
                        📍 {evt.venue}, {evt.locationCity || evt.city || 'India'} · 📅 {evt.startDate || evt.shootDate} {evt.shootTime && `(${evt.shootTime})`}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-1">
                        Lead: {evt.leadCreator} · Crew: {evt.crewMembers.join(', ')}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-neutral-900 tabular-nums">
                        Total: ₹{evt.packageTotal.toLocaleString('en-IN')}
                      </div>
                      <div className="text-emerald-700 font-mono text-[11px] tabular-nums mt-0.5">
                        Paid: ₹{evt.advancePaid.toLocaleString('en-IN')}
                      </div>
                      <div className={`text-[11px] font-mono tabular-nums font-semibold mt-0.5 ${evt.balanceDue > 0 ? 'text-[#D97706]' : 'text-neutral-500'}`}>
                        Due: ₹{evt.balanceDue.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: QUOTES */}
          {activeTab === 'quotes' && (
            <div className="space-y-3">
              {quotes.length === 0 ? (
                <div className="py-10 text-center text-neutral-400 italic">
                  No quotations created for this client.
                </div>
              ) : (
                quotes.map((q) => (
                  <div key={q.id} className="p-4 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-neutral-900">{q.quoteNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#E8E3D9] font-medium">
                          {q.status}
                        </span>
                      </div>
                      <div className="text-neutral-600 mt-1">{q.eventName} · {q.items.length} services</div>
                      <div className="text-[11px] text-neutral-400">Created: {new Date(q.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-[#181818] tabular-nums">
                          ₹{q.grandTotal.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono tabular-nums">
                          Adv: ₹{q.advanceAmount.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectQuoteForPreview(q)}
                        className="px-2.5 py-1.5 bg-white border border-[#DCD6C8] hover:bg-[#F2ECE1] rounded text-[11px] font-medium text-neutral-800 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C58B39]" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-3">
              {payments.length === 0 ? (
                <div className="py-10 text-center text-neutral-400 italic">
                  No payment transactions recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#E8E3D9] rounded">
                  <table className="w-full text-left">
                    <thead className="bg-[#FAF8F5] text-neutral-500 uppercase text-[10px] font-medium border-b border-[#E8E3D9]">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Mode</th>
                        <th className="py-2.5 px-3">Ref #</th>
                        <th className="py-2.5 px-3">Notes</th>
                        <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0ECE1]">
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2.5 px-3 font-mono text-neutral-700">{p.date}</td>
                          <td className="py-2.5 px-3 font-medium text-neutral-900">{p.paymentMode}</td>
                          <td className="py-2.5 px-3 font-mono text-neutral-500">{p.referenceNumber || '—'}</td>
                          <td className="py-2.5 px-3 text-neutral-600">{p.notes || '—'}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                            + ₹{p.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTES */}
          {activeTab === 'notes' && (
            <div className="p-4 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8C6428] mb-2">
                Production Notes & Special Requests:
              </div>
              <div className="text-neutral-700 whitespace-pre-line leading-relaxed">
                {client.notes || 'No specific notes recorded for this client.'}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E3D9] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#E8E3D9] rounded text-neutral-700 hover:bg-neutral-50 text-xs font-medium"
          >
            Close Dossier
          </button>
        </div>

      </div>

      {/* Embedded Add Payment Modal */}
      <AddPaymentModal
        isOpen={isAddPaymentOpen}
        onClose={() => setIsAddPaymentOpen(false)}
        client={client}
        events={events}
        onRecordPayment={onRecordPayment}
      />
    </div>
  );
};
