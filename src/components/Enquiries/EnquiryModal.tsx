import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Enquiry, PipelineStage } from '../../types';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (enquiry: Partial<Enquiry> & { clientName: string; eventName: string }) => void;
  initialData?: Enquiry | null;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [budget, setBudget] = useState<number | ''>(50000);
  const [requirements, setRequirements] = useState('');
  const [servicesInput, setServicesInput] = useState('');
  const [servicesRequired, setServicesRequired] = useState<string[]>([]);
  const [leadSource, setLeadSource] = useState('Instagram');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [salesperson, setSalesperson] = useState('Aarav Malhotra');
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('New');

  useEffect(() => {
    if (initialData) {
      setClientName(initialData.clientName);
      setPhone(initialData.phone);
      setWhatsapp(initialData.whatsapp || initialData.phone);
      setEmail(initialData.email);
      setEventName(initialData.eventName);
      setEventType(initialData.shootType || initialData.eventType || 'Wedding');
      setDate(initialData.date);
      setVenue(initialData.venue);
      setBudget(initialData.expectedBudget || initialData.budget);
      setRequirements(initialData.requirements || '');
      setServicesRequired(initialData.servicesRequired || []);
      setLeadSource(initialData.leadSource);
      setNotes(initialData.notes);
      setFollowUpDate(initialData.followUpDate);
      setSalesperson(initialData.salesperson);
      setPipelineStage(initialData.pipelineStage);
    } else {
      setClientName('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setEventName('');
      setEventType('Wedding');
      setDate('');
      setVenue('');
      setBudget(50000);
      setRequirements('');
      setServicesRequired(['Wedding Day', 'Reels Coverage']);
      setLeadSource('Instagram');
      setNotes('');
      setFollowUpDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setSalesperson('Aarav Malhotra');
      setPipelineStage('New');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddService = () => {
    if (servicesInput.trim() && !servicesRequired.includes(servicesInput.trim())) {
      setServicesRequired([...servicesRequired, servicesInput.trim()]);
      setServicesInput('');
    }
  };

  const handleRemoveService = (index: number) => {
    setServicesRequired(servicesRequired.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !eventName.trim()) return;

    onSave({
      id: initialData?.id,
      clientName: clientName.trim(),
      phone: phone.trim(),
      whatsapp: (whatsapp.trim() || phone.trim()),
      email: email.trim(),
      eventName: eventName.trim(),
      eventType,
      shootType: eventType,
      date,
      venue: venue.trim(),
      budget: Number(budget) || 0,
      expectedBudget: Number(budget) || 0,
      requirements: requirements.trim(),
      servicesRequired,
      leadSource,
      notes,
      followUpDate,
      salesperson,
      pipelineStage
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E8E3D9] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#C58B39]">Lead Ingestion</div>
            <h2 className="font-serif text-xl font-semibold text-[#181818]">
              {initialData ? 'Edit Enquiry Details' : 'New Client Enquiry'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Lead Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Meera & Arjun"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 00000"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91 98200 00000"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@gmail.com"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Event Name *</label>
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Meera & Arjun Udaipur Wedding"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 bg-white focus:outline-none focus:border-[#C58B39]"
              >
                <option value="Wedding">Wedding</option>
                <option value="Haldi Ceremony">Haldi Ceremony</option>
                <option value="Mehendi Soirée">Mehendi Soirée</option>
                <option value="Sangeet Gala">Sangeet Gala</option>
                <option value="Reception Evening">Reception Evening</option>
                <option value="Engagement">Engagement</option>
                <option value="Pre-Wedding Cinematic">Pre-Wedding Cinematic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Target Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Venue / City</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Umaid Bhawan, Jodhpur"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Budget (₹ INR)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={budget}
                onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="60000"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 font-mono tabular-nums focus:outline-none focus:border-[#C58B39]"
              />
            </div>
          </div>

          {/* Services Required */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">Services Required</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={servicesInput}
                onChange={(e) => setServicesInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddService();
                  }
                }}
                placeholder="e.g. Wedding Day, Drone, Same Day Edit"
                className="flex-1 px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
              <button
                type="button"
                onClick={handleAddService}
                className="px-3 py-1.5 bg-[#FAF8F5] border border-[#DCD6C8] hover:bg-[#F2ECE1] rounded text-neutral-800 font-medium"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded min-h-[38px]">
              {servicesRequired.map((srv, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DCD6C8] rounded text-[11px] text-neutral-800"
                >
                  <span>{srv}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="text-neutral-400 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Lead Source</label>
              <select
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 bg-white focus:outline-none focus:border-[#C58B39]"
              >
                <option value="Instagram">Instagram Direct / Reel</option>
                <option value="Referral">Friend / Client Referral</option>
                <option value="Wedding Planner">Wedding Planner</option>
                <option value="Website">Official Website</option>
                <option value="Direct Call">Direct Phone Call / WhatsApp</option>
                <option value="Other">Other Media</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Next Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Sales Representative</label>
              <select
                value={salesperson}
                onChange={(e) => setSalesperson(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 bg-white focus:outline-none focus:border-[#C58B39]"
              >
                <option value="Aarav Malhotra">Aarav Malhotra</option>
                <option value="Sara Khan">Sara Khan</option>
                <option value="Devansh Saxena">Devansh Saxena</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Pipeline Stage</label>
              <select
                value={pipelineStage}
                onChange={(e) => setPipelineStage(e.target.value as PipelineStage)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 bg-white focus:outline-none focus:border-[#C58B39]"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Discussion">Discussion</option>
                <option value="Requirement Collected">Requirement Collected</option>
                <option value="Quote Sent">Quote Sent</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Requirements & Brief</label>
              <textarea
                rows={2}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Bride/groom preferences, coverage timeline, reel aesthetic..."
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Internal Notes & History</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal follow-up history, client demeanor, negotiation points..."
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E8E3D9] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 hover:text-neutral-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#181818] hover:bg-[#282828] text-white font-medium rounded transition-colors shadow-xs"
            >
              {initialData ? 'Update Enquiry' : 'Save Enquiry'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
