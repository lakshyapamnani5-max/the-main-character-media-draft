import React, { useState } from 'react';
import { X, DollarSign, CheckCircle2 } from 'lucide-react';
import { PaymentRecord, Client, EventShoot } from '../../types';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  events?: EventShoot[];
  onRecordPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  client,
  events = [],
  onRecordPayment
}) => {
  const [amount, setAmount] = useState<number | ''>(20000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<PaymentRecord['paymentMode']>('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [eventId, setEventId] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !client) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === '' || Number(amount) <= 0) return;

    onRecordPayment({
      clientId: client.id,
      eventId: eventId || undefined,
      amount: Number(amount),
      date,
      paymentMode,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-md w-full p-6 space-y-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E8E3D9] pb-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">
              Financial Settlement
            </div>
            <h2 className="font-serif text-lg font-bold text-[#181818]">
              Record Client Payment
            </h2>
            <div className="text-xs text-neutral-500 mt-0.5">
              Client: {client.name}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Payment Amount (₹ INR) *
            </label>
            <input
              type="number"
              required
              min="1"
              step="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 25000"
              className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 font-mono tabular-nums text-sm font-bold focus:outline-none focus:border-[#C58B39]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Payment Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Payment Mode *</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentRecord['paymentMode'])}
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 bg-white"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                <option value="Cash">Cash Handover</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
          </div>

          {events.length > 0 && (
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Apply to Event (Optional)</label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 bg-white"
              >
                <option value="">General Client Account</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.eventName} (Due: ₹{ev.balanceDue.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Transaction Reference / UTR Number
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. UPI-HDFC-918274921 or Cheque #49201"
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Notes / Receipt Remarks
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 50% advance booking deposit received."
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E8E3D9] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-neutral-600 hover:text-neutral-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#181818] hover:bg-[#282828] text-white font-medium rounded transition-colors shadow-xs"
            >
              Save Payment
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
