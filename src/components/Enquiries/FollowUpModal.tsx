import React, { useState } from 'react';
import { X, Calendar, MessageSquare, Clock } from 'lucide-react';
import { Enquiry } from '../../types';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiry: Enquiry | null;
  onAddFollowUp: (enquiryId: string, notes: string, nextDate?: string, createdBy?: string) => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  enquiry,
  onAddFollowUp
}) => {
  const [notes, setNotes] = useState('');
  const [nextDate, setNextDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [createdBy, setCreatedBy] = useState('Aarav Malhotra');

  if (!isOpen || !enquiry) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    onAddFollowUp(enquiry.id, notes.trim(), nextDate, createdBy);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E3D9] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">CRM Activity</div>
            <h2 className="font-serif text-lg font-bold text-[#181818]">
              Add Follow-up Record
            </h2>
            <div className="text-xs text-neutral-500 mt-0.5">
              Client: {enquiry.clientName} · {enquiry.eventName}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* History of previous follow-ups */}
          {enquiry.followUps && enquiry.followUps.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                Previous Interaction History:
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto p-2.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded">
                {enquiry.followUps.map((fu) => (
                  <div key={fu.id} className="text-[11px] border-b border-[#E8E3D9]/60 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex justify-between text-neutral-500 font-mono text-[10px]">
                      <span>{fu.date} · {fu.createdBy}</span>
                      {fu.nextFollowUpDate && <span>Next: {fu.nextFollowUpDate}</span>}
                    </div>
                    <div className="text-neutral-800 mt-1">{fu.notes}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Call / Interaction Notes *
              </label>
              <textarea
                required
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Discussed shoot timeline, couple requested drone add-on quote..."
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Next Follow-up Date
                </label>
                <input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Logged By
                </label>
                <select
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 bg-white"
                >
                  <option value="Aarav Malhotra">Aarav Malhotra</option>
                  <option value="Sara Khan">Sara Khan</option>
                  <option value="Devansh Saxena">Devansh Saxena</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E3D9] flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-neutral-600 hover:text-neutral-900 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#181818] hover:bg-[#282828] text-white rounded text-xs font-medium transition-colors shadow-xs"
              >
                Save Follow-up
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
