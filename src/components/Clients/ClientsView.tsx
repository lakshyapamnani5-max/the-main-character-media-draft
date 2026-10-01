import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Instagram, 
  UserCheck, 
  Eye, 
  Edit3, 
  CreditCard,
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Client, EventShoot, Quotation, PaymentRecord } from '../../types';
import { ClientModal } from './ClientModal';
import { ClientDetailModal } from './ClientDetailModal';
import { AddPaymentModal } from './AddPaymentModal';

interface ClientsViewProps {
  clients: Client[];
  events: EventShoot[];
  quotations: Quotation[];
  payments: PaymentRecord[];
  onSaveClient: (clientData: Partial<Client> & { name: string }) => void;
  onRecordPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
  onCreateQuoteForClient: (client: Client) => void;
  onSelectQuoteForPreview: (quote: Quotation) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  events,
  quotations,
  payments,
  onSaveClient,
  onRecordPayment,
  onCreateQuoteForClient,
  onSelectQuoteForPreview
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [selectedClientForDetail, setSelectedClientForDetail] = useState<Client | null>(null);
  const [selectedClientForPayment, setSelectedClientForPayment] = useState<Client | null>(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalClientsCount = clients.length;
  const totalBilled = events.reduce((acc, curr) => acc + (curr.packageTotal || 0), 0);
  const totalReceived = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalOutstanding = Math.max(0, totalBilled - totalReceived);

  const handleAddNew = () => {
    setEditingClient(null);
    setIsClientModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#C58B39]">Client Relationship Ledger</div>
          <h1 className="font-serif text-2xl font-bold text-[#181818] tracking-tight">
            Client Accounts & Financials
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Profiles, linked wedding events, quotations history, and payment collection ledgers.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#181818] hover:bg-[#282828] rounded transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
          <span>+ Add Client</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8E3D9] p-4 rounded-lg shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500 font-medium">Active Client Accounts</div>
            <div className="text-xl font-serif font-bold text-[#181818] mt-1 font-mono tabular-nums">
              {totalClientsCount}
            </div>
          </div>
          <span className="text-xs text-neutral-400 font-serif">Couples & Planners</span>
        </div>

        <div className="bg-white border border-[#E8E3D9] p-4 rounded-lg shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500 font-medium">Total Billed Revenue</div>
            <div className="text-xl font-serif font-bold text-[#181818] mt-1 font-mono tabular-nums">
              ₹{totalBilled.toLocaleString('en-IN')}
            </div>
          </div>
          <span className="text-xs text-neutral-400 font-mono">Gross</span>
        </div>

        <div className="bg-white border border-[#E8E3D9] p-4 rounded-lg shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500 font-medium">Total Outstanding Balance</div>
            <div className="text-xl font-serif font-bold text-[#D97706] mt-1 font-mono tabular-nums">
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </div>
          </div>
          <AlertCircle className="w-4 h-4 text-[#D97706]" />
        </div>
      </div>

      {/* Search Input */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client name, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E8E3D9] rounded text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#C58B39]"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => {
          const clientEvents = events.filter(e => e.clientId === client.id);
          const clientQuotes = quotations.filter(q => q.clientId === client.id || q.clientName.toLowerCase() === client.name.toLowerCase());
          const clientPayments = payments.filter(p => p.clientId === client.id);

          const clientRevenue = clientEvents.reduce((acc, curr) => acc + (curr.packageTotal || 0), 0);
          const clientPaid = clientPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
          const clientOutstanding = Math.max(0, clientRevenue - clientPaid);

          return (
            <div
              key={client.id}
              className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-[#D5CEBF] transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#F0ECE1]">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#181818]">
                      {client.name}
                    </h3>
                    {client.address && (
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        📍 {client.address}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] font-mono bg-[#FAF8F5] border border-[#E8E3D9] px-2 py-0.5 rounded text-neutral-600 font-semibold">
                    {clientEvents.length} {clientEvents.length === 1 ? 'Event' : 'Events'}
                  </span>
                </div>

                {/* Coordinates */}
                <div className="py-3 space-y-1 text-xs text-neutral-600">
                  {client.phone && (
                    <div className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.instagram && (
                    <div className="flex items-center gap-1.5 text-[#C58B39]">
                      <Instagram className="w-3.5 h-3.5 text-[#C58B39]" />
                      <span>{client.instagram}</span>
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-medium text-neutral-500 block">Total Revenue</span>
                    <span className="font-mono font-bold text-neutral-900 tabular-nums">
                      ₹{clientRevenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-medium text-neutral-500 block">Outstanding</span>
                    <span className={`font-mono font-bold tabular-nums ${clientOutstanding > 0 ? 'text-[#D97706]' : 'text-emerald-700'}`}>
                      ₹{clientOutstanding.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {client.notes && (
                  <p className="text-[11px] text-neutral-500 mt-2.5 line-clamp-2 italic">
                    "{client.notes}"
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3.5 border-t border-[#F0ECE1] flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedClientForDetail(client)}
                    className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded text-xs flex items-center gap-1"
                    title="View Profile Dossier"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#C58B39]" />
                    <span>Dossier</span>
                  </button>

                  <button
                    onClick={() => handleEdit(client)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded text-xs"
                    title="Edit Contact"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedClientForPayment(client)}
                    className="px-2.5 py-1 bg-white hover:bg-neutral-50 border border-[#DCD6C8] text-neutral-800 text-[11px] font-medium rounded flex items-center gap-1"
                  >
                    <CreditCard className="w-3 h-3 text-[#C58B39]" />
                    <span>Payment</span>
                  </button>

                  <button
                    onClick={() => onCreateQuoteForClient(client)}
                    className="px-2.5 py-1 bg-[#181818] hover:bg-[#282828] text-white text-[11px] font-medium rounded"
                  >
                    + Quote
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="bg-white border border-[#E8E3D9] rounded-lg p-12 text-center text-neutral-400">
          No clients found matching "{searchQuery}".
        </div>
      )}

      {/* Add / Edit Client Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={onSaveClient}
        initialData={editingClient}
      />

      {/* Client Detail Dossier Modal */}
      {selectedClientForDetail && (
        <ClientDetailModal
          isOpen={true}
          onClose={() => setSelectedClientForDetail(null)}
          client={selectedClientForDetail}
          events={events.filter(e => e.clientId === selectedClientForDetail.id)}
          quotes={quotations.filter(q => q.clientId === selectedClientForDetail.id || q.clientName.toLowerCase() === selectedClientForDetail.name.toLowerCase())}
          payments={payments.filter(p => p.clientId === selectedClientForDetail.id)}
          onRecordPayment={onRecordPayment}
          onCreateQuoteForClient={onCreateQuoteForClient}
          onSelectQuoteForPreview={onSelectQuoteForPreview}
        />
      )}

      {/* Record Payment Modal */}
      {selectedClientForPayment && (
        <AddPaymentModal
          isOpen={true}
          onClose={() => setSelectedClientForPayment(null)}
          client={selectedClientForPayment}
          events={events.filter(e => e.clientId === selectedClientForPayment.id)}
          onRecordPayment={onRecordPayment}
        />
      )}
    </div>
  );
};
