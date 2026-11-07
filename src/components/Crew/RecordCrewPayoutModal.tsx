import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MapPin, 
  IndianRupee, 
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { EventShoot, CrewMember, EventCrewAssignment } from '../../types';

interface RecordCrewPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventShoot;
  crewMember: CrewMember;
  assignment?: EventCrewAssignment;
  onSavePayout: (
    eventId: string,
    crewId: string,
    paymentStatus: 'Paid' | 'Unpaid' | 'Partially Paid',
    customPaidAmount: number,
    customTotalPayout: number,
    paymentMode?: string,
    notes?: string
  ) => void;
}

export const RecordCrewPayoutModal: React.FC<RecordCrewPayoutModalProps> = ({
  isOpen,
  onClose,
  event,
  crewMember,
  assignment,
  onSavePayout
}) => {
  const initialTotal = assignment?.payout || crewMember.defaultPayout || 6000;
  const initialPaid = assignment?.paidAmount !== undefined 
    ? assignment.paidAmount 
    : (assignment?.paymentStatus === 'Paid' ? initialTotal : 0);

  const [totalPayout, setTotalPayout] = useState<number>(initialTotal);
  const [paidAmount, setPaidAmount] = useState<number>(initialPaid);
  const [paymentMode, setPaymentMode] = useState<string>(assignment?.paymentMode || 'UPI');
  const [notes, setNotes] = useState<string>(assignment?.notes || '');
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const tot = assignment?.payout || crewMember.defaultPayout || 6000;
      const pd = assignment?.paidAmount !== undefined 
        ? assignment.paidAmount 
        : (assignment?.paymentStatus === 'Paid' ? tot : 0);
      setTotalPayout(tot);
      setPaidAmount(pd);
      setPaymentMode(assignment?.paymentMode || 'UPI');
      setNotes(assignment?.notes || '');
      setSuccessToast(false);
    }
  }, [isOpen, assignment, crewMember]);

  if (!isOpen) return null;

  const remainingDue = Math.max(0, totalPayout - paidAmount);
  const computedStatus: 'Paid' | 'Unpaid' | 'Partially Paid' = 
    paidAmount >= totalPayout && totalPayout > 0 
      ? 'Paid' 
      : paidAmount > 0 
        ? 'Partially Paid' 
        : 'Unpaid';

  const handleQuickPreset = (type: 'full' | 'half' | 'zero') => {
    if (type === 'full') {
      setPaidAmount(totalPayout);
    } else if (type === 'half') {
      setPaidAmount(Math.round(totalPayout / 2));
    } else {
      setPaidAmount(0);
    }
  };

  const handleAddIncremental = (addAmt: number) => {
    setPaidAmount(prev => Math.min(totalPayout, prev + addAmt));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePayout(
      event.id,
      crewMember.id,
      computedStatus,
      paidAmount,
      totalPayout,
      paymentMode,
      notes.trim() || undefined
    );
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#E8E3D9] max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#141414] text-white flex items-center justify-between border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C58B39]/20 border border-[#C58B39]/40 flex items-center justify-center text-[#C58B39]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-white">Record Creator Payout</h2>
              <p className="text-xs text-neutral-400">
                {crewMember.name} · <span className="text-[#C58B39] font-mono">{assignment?.role || crewMember.role}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shoot Info Strip */}
        <div className="px-5 py-2.5 bg-[#FAF8F5] border-b border-[#E8E3D9] flex items-center justify-between text-xs">
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-neutral-800 truncate block">
              {event.eventName}
            </span>
            <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-neutral-400" />
              <span>{event.startDate || (event as any).shootDate || 'Upcoming'}</span>
              <span className="text-neutral-300">·</span>
              <MapPin className="w-3 h-3 text-neutral-400" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E8E3D9] text-neutral-600 font-semibold uppercase">
            {event.eventType || 'Wedding'}
          </span>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* 3 Overview Cards */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-[10px] uppercase font-mono text-neutral-500 font-semibold block">Total Payout</span>
              <span className="font-mono font-bold text-sm text-neutral-900 block mt-0.5">
                ₹{totalPayout.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] uppercase font-mono text-emerald-700 font-semibold block">Paid So Far</span>
              <span className="font-mono font-bold text-sm text-emerald-800 block mt-0.5">
                ₹{paidAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className={`p-2.5 rounded-xl border ${
              remainingDue === 0 
                ? 'bg-neutral-50 border-neutral-200 text-neutral-400' 
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <span className="text-[10px] uppercase font-mono text-amber-700 font-semibold block">Remaining Due</span>
              <span className="font-mono font-bold text-sm block mt-0.5">
                ₹{remainingDue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Edit Total Payout (Optional Custom Agreed Compensation) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1">
                <span>Agreed Shoot Compensation (₹)</span>
              </label>
              <span className="text-[10px] text-neutral-500 font-mono">
                Roster default: ₹{crewMember.defaultPayout.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-sm">₹</span>
              <input
                type="number"
                min="0"
                step="500"
                value={totalPayout || ''}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value) || 0);
                  setTotalPayout(val);
                }}
                className="w-full pl-8 pr-3 py-2 bg-white border border-[#D5CEBF] rounded-xl text-sm font-mono font-bold text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                placeholder="6000"
              />
            </div>
            <p className="text-[10px] text-neutral-500 mt-1">
              Adjust if this creator has a special rate or bonus for this specific shoot.
            </p>
          </div>

          {/* Custom Paid Amount */}
          <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-[#C58B39]" />
                <span>Amount Paid to Creator (₹)</span>
              </label>
              
              {/* Computed Status Chip */}
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                computedStatus === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : computedStatus === 'Partially Paid'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {computedStatus === 'Paid' ? '✓ Fully Settled' : computedStatus === 'Partially Paid' ? '⏳ Partial' : '⏳ Unpaid'}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-base font-bold">₹</span>
              <input
                type="number"
                min="0"
                max={totalPayout * 2}
                step="100"
                value={paidAmount === 0 ? '' : paidAmount}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                  setPaidAmount(Math.max(0, val));
                }}
                className="w-full pl-8 pr-3 py-2.5 bg-white border border-[#C58B39] rounded-xl text-base font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C58B39]/20"
                placeholder="0 (Enter custom amount paid)"
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleQuickPreset('full')}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-emerald-300 hover:border-emerald-400 text-emerald-800 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Full Settlement (₹{totalPayout.toLocaleString('en-IN')})</span>
              </button>

              {totalPayout > 0 && (
                <button
                  type="button"
                  onClick={() => handleQuickPreset('half')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-blue-300 hover:border-blue-400 text-blue-800 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  50% Advance (₹{Math.round(totalPayout / 2).toLocaleString('en-IN')})
                </button>
              )}

              {remainingDue > 0 && paidAmount > 0 && (
                <button
                  type="button"
                  onClick={() => handleAddIncremental(remainingDue)}
                  className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  + Pay Remaining (₹{remainingDue.toLocaleString('en-IN')})
                </button>
              )}

              <button
                type="button"
                onClick={() => handleQuickPreset('zero')}
                className="px-2 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-600 rounded-lg text-[11px] font-medium transition-colors ml-auto"
              >
                Reset to ₹0 (Unpaid)
              </button>
            </div>
          </div>

          {/* Payment Method & Note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D5CEBF] rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-[#C58B39]"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                <option value="Cash">Cash on Location</option>
                <option value="Cheque">Company Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Reference / Note (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Advance paid on set"
                className="w-full px-3 py-2 bg-white border border-[#D5CEBF] rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-[#C58B39]"
              />
            </div>
          </div>

          {/* Bottom Confirmation Footer */}
          <div className="pt-3 border-t border-[#E8E3D9] flex items-center justify-between gap-3">
            <div className="text-xs text-neutral-600 font-mono">
              Status after save: <strong className={
                computedStatus === 'Paid' ? 'text-emerald-700' : computedStatus === 'Partially Paid' ? 'text-blue-700' : 'text-amber-700'
              }>{computedStatus}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#D5CEBF] hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#C58B39] hover:bg-[#B37B2E] text-[#121212] font-bold rounded-xl text-xs transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Payout (₹{paidAmount.toLocaleString('en-IN')})</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

