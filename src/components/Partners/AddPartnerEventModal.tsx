import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  X, 
  Users, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Partner, EventShoot, EventStatus, EventDeliverable } from '../../types';
import { StorageService } from '../../services/storage';

interface AddPartnerEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner | null;
  initialDate?: string;
  onSave: (eventData: Partial<EventShoot> & { eventName: string; clientName: string }) => void;
}

export const AddPartnerEventModal: React.FC<AddPartnerEventModalProps> = ({
  isOpen,
  onClose,
  partner,
  initialDate,
  onSave
}) => {
  const [eventName, setEventName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [startDate, setStartDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [shootTime, setShootTime] = useState('14:00 - 22:00');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState(partner?.city || 'Mumbai');
  const [packageTotal, setPackageTotal] = useState<number | ''>(50000);
  const [advancePaid, setAdvancePaid] = useState<number | ''>(25000);
  const [leadCreator, setLeadCreator] = useState('Devansh Saxena');
  const [clientRequirements, setClientRequirements] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !partner) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !clientName.trim()) return;

    const total = Number(packageTotal) || 0;
    const adv = Number(advancePaid) || 0;
    const balanceDue = Math.max(0, total - adv);

    // Initial sub-events for calendar breakdown
    const defaultSubEvents = [
      {
        id: `sub-${Date.now()}-1`,
        eventId: '',
        name: `${eventType} Main Function`,
        date: startDate,
        startTime: shootTime.split('-')[0]?.trim() || '14:00',
        endTime: shootTime.split('-')[1]?.trim() || '22:00',
        venue: venue || partner.city,
        status: 'Scheduled' as const,
        assignedCrewIds: [],
        eventCharge: total,
        contentRequirements: ['Outsourced High-Priority Coverage', 'Reels Package']
      }
    ];

    onSave({
      category: 'Event Planner',
      partnerId: partner.id,
      partnerName: partner.companyName,
      eventName: eventName.trim(),
      clientName: clientName.trim(),
      clientContact: {
        phone: clientPhone.trim() || partner.phone,
        email: partner.email || ''
      },
      eventType,
      startDate,
      endDate: endDate || startDate,
      shootDate: startDate,
      shootTime,
      venue: venue.trim() || `${partner.city} Venue`,
      locationCity: city.trim(),
      city: city.trim(),
      leadCreator,
      crewMembers: [leadCreator],
      crewAssignments: [],
      crewPayout: Math.round(total * 0.35),
      packageTotal: total,
      advancePaid: adv,
      balanceDue,
      status: 'Confirmed',
      clientRequirements: clientRequirements.trim() || `Outsourced shoot via partner ${partner.companyName}`,
      notes: notes.trim() ? `[Partner: ${partner.companyName}] ${notes.trim()}` : `Outsourced via ${partner.companyName} (${partner.phone})`,
      subEvents: defaultSubEvents,
      deliverables: [
        { id: `del-p1`, title: 'Raw Footage Handover to Partner Drive', completed: false },
        { id: `del-p2`, title: 'Edited Highlight Reel for Client Approval', completed: false }
      ]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-[#E8E3D9] max-w-xl w-full p-6 space-y-4 shadow-2xl">
        
        <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#C58B39] font-bold">
              Outsourced Shoot Setup
            </span>
            <h3 className="font-serif text-xl font-bold text-neutral-900 mt-0.5">
              Add Event for {partner.companyName}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E8E3D9] flex items-center justify-between">
            <span className="text-neutral-600">Partner Organization:</span>
            <span className="font-bold text-neutral-900 font-serif">{partner.companyName} ({partner.phone})</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Event / Shoot Title *</label>
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Sangeet & Reception Coverage"
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">End Client / Couple *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Ananya & Dev"
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Shoot Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
              >
                <option value="Wedding">Wedding</option>
                <option value="Sangeet">Sangeet</option>
                <option value="Haldi">Haldi</option>
                <option value="Corporate / Event">Corporate / Event</option>
                <option value="Pre-Wedding">Pre-Wedding</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate || endDate < e.target.value) setEndDate(e.target.value);
                }}
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Venue / Hotel</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Taj Lands End, Bandra"
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Contract Total (₹) *</label>
              <input
                type="number"
                min="0"
                step="1000"
                required
                value={packageTotal}
                onChange={(e) => setPackageTotal(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="50000"
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Advance Received (₹)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="25000"
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Partner Shoot Brief / Scope</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need 2 creators on site by 3:00 PM. Hand over uncompressed files to partner hard drive after wrap."
              className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E3D9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 hover:text-black font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#121212] hover:bg-black text-white font-semibold rounded-lg shadow-xs"
            >
              Schedule Shoot & Sync to Jobs
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
