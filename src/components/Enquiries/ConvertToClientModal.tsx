import React, { useState } from 'react';
import { X, UserCheck, Calendar, ArrowRight, Check } from 'lucide-react';
import { Enquiry } from '../../types';

interface ConvertToClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiry: Enquiry | null;
  onConfirmConvert: (enquiryId: string, createEventAlso: boolean) => void;
}

export const ConvertToClientModal: React.FC<ConvertToClientModalProps> = ({
  isOpen,
  onClose,
  enquiry,
  onConfirmConvert
}) => {
  const [createEventAlso, setCreateEventAlso] = useState(true);

  if (!isOpen || !enquiry) return null;

  const handleConvert = () => {
    onConfirmConvert(enquiry.id, createEventAlso);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-lg w-full p-6 space-y-5 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E8E3D9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                Conversion Pipeline
              </div>
              <h2 className="font-serif text-xl font-bold text-[#181818]">
                Convert Enquiry to Client
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transfer overview */}
        <div className="space-y-3 text-xs">
          <p className="text-neutral-600">
            Converting <strong className="text-neutral-900">{enquiry.clientName}</strong> will add them to your Master Client CRM, preserve the enquiry record, and update their pipeline stage to <strong className="text-emerald-700">Confirmed</strong>.
          </p>

          <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded space-y-2">
            <div className="font-medium text-neutral-800 text-[11px] uppercase tracking-wide">
              Transferred Client Profile:
            </div>
            <div className="grid grid-cols-2 gap-2 text-neutral-700">
              <div><strong>Name:</strong> {enquiry.clientName}</div>
              <div><strong>Phone:</strong> {enquiry.phone || 'N/A'}</div>
              <div><strong>Email:</strong> {enquiry.email || 'N/A'}</div>
              <div><strong>Event:</strong> {enquiry.eventName}</div>
              <div><strong>Target Date:</strong> {enquiry.date || 'TBD'}</div>
              <div><strong>Budget:</strong> ₹{enquiry.budget.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Option to create shoot event */}
          <div className="p-3.5 bg-white border border-[#E8E3D9] rounded flex items-start gap-3">
            <input
              type="checkbox"
              id="createEventCheck"
              checked={createEventAlso}
              onChange={(e) => setCreateEventAlso(e.target.checked)}
              className="mt-0.5 rounded text-[#C58B39] focus:ring-[#C58B39]"
            />
            <label htmlFor="createEventCheck" className="text-neutral-700 cursor-pointer">
              <span className="font-semibold block text-neutral-900">
                Create Event Shoot on Calendar
              </span>
              <span className="text-[11px] text-neutral-500 block mt-0.5">
                Automatically books a shoot slot on the Events schedule with date ({enquiry.date || 'TBD'}) and venue ({enquiry.venue || 'TBD'}).
              </span>
            </label>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-[#E8E3D9] flex justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-neutral-600 hover:text-neutral-900 font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConvert}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirm & Convert</span>
          </button>
        </div>

      </div>
    </div>
  );
};
