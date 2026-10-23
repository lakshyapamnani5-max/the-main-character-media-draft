import React, { useState, useEffect } from 'react';
import { X, Tag, Sparkles, CheckCircle2 } from 'lucide-react';
import { Enquiry, PipelineStage, EventCharge } from '../../types';
import { StorageService } from '../../services/storage';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (enquiry: Partial<Enquiry> & { clientName: string; eventName: string }) => void;
  initialData?: Enquiry | null;
  eventCharges?: EventCharge[];
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  eventCharges
}) => {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [selectedChargeId, setSelectedChargeId] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [budget, setBudget] = useState<number | ''>('');
  const [requirements, setRequirements] = useState('');
  const [servicesInput, setServicesInput] = useState('');
  const [servicesRequired, setServicesRequired] = useState<string[]>([]);
  const [leadSource, setLeadSource] = useState('Instagram');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [salesperson, setSalesperson] = useState('Admin');
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
      setBudget('');
      setRequirements('');
      setServicesRequired([]);
      setLeadSource('Instagram');
      setNotes('');
      setFollowUpDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setSalesperson('Admin');
      setPipelineStage('New');
    }
  }, [initialData, isOpen]);

  const activeRateCharges = eventCharges && eventCharges.length > 0 
    ? eventCharges.filter(c => c.status === 'Active')
    : StorageService.getActiveEventCharges();

  const handleSelectRate = (chargeId: string) => {
    setSelectedChargeId(chargeId);
    if (!chargeId) return;

    const charge = activeRateCharges.find(c => c.id === chargeId);
    if (charge) {
      setEventType(charge.name);
      setBudget(charge.price);
      if (charge.description) {
        setRequirements(prev => prev ? `${prev}\n\nPackage: ${charge.description}` : charge.description);
      }
      if (charge.includedServices && charge.includedServices.length > 0) {
        const merged = Array.from(new Set([...servicesRequired, ...charge.includedServices]));
        setServicesRequired(merged);
      }
      if (!eventName) {
        setEventName(`${clientName ? clientName.trim() + ' ' : ''}${charge.name}`);
      }
    }
  };

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg border border-[#E8E3D9] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        
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

          {/* Quick Fetch from Event Rates */}
          <div className="p-3.5 bg-[#FAF8F5] border border-[#E2DBD0] rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-800 uppercase tracking-wide flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#C58B39]" />
                <span>Fetch from Master Event Rates (Rate Card)</span>
              </span>
              <span className="text-[10px] text-neutral-500 font-medium">Select package to auto-fill rate & services</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <select
                  value={selectedChargeId}
                  onChange={(e) => handleSelectRate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 bg-white font-medium focus:outline-none focus:border-[#C58B39]"
                >
                  <option value="">-- Select Event Rate (e.g. Wedding ₹50,000, Haldi ₹8,000...) --</option>
                  {activeRateCharges.map(chg => (
                    <option key={chg.id} value={chg.id}>
                      {chg.name} — ₹{chg.price.toLocaleString('en-IN')} ({chg.duration || 'Coverage'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-neutral-800">Budget / Rate (₹)</label>
                  <span className="text-[9px] text-[#8C6428] font-semibold">Customizable</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="50000"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded font-mono font-bold text-neutral-900 bg-white focus:outline-none focus:border-[#C58B39]"
                />
              </div>
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
                placeholder="e.g. Meera & Arjun Wedding"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Event Type / Shoot Category</label>
              <input
                type="text"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder="e.g. Wedding / Haldi Ceremony"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 bg-white focus:outline-none focus:border-[#C58B39]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <option value="Admin">Admin</option>
                <option value="Sales Team">Sales Team</option>
                <option value="Founder / Producer">Founder / Producer</option>
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
