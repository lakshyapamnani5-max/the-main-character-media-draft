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
  AlertCircle,
  Check,
  Trash2,
  TrendingUp,
  Percent
} from 'lucide-react';
import { Partner, EventShoot, EventStatus, EventDeliverable, CrewMember, CrewRole, EventCrewAssignment } from '../../types';
import { StorageService } from '../../services/storage';

interface PartnerCrewItem {
  crewId: string;
  crewName: string;
  role: CrewRole | string;
  callTime: string;
  wrapTime: string;
  payout: number;
  phone?: string;
}

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
  
  // Pricing: Our Rate (charge) & Crew Rate (payout)
  const [ourRate, setOurRate] = useState<number | ''>(1500);
  const [crewRate, setCrewRate] = useState<number | ''>(1200);
  const [advancePaid, setAdvancePaid] = useState<number | ''>(1500);
  
  // Crew deployment
  const [selectedCrew, setSelectedCrew] = useState<PartnerCrewItem[]>([]);
  const [notes, setNotes] = useState('');

  const crewRoster = StorageService.getCrewRoster().filter(c => c.status === 'Active');

  if (!isOpen || !partner) return null;

  const ourRateNum = Number(ourRate) || 0;
  const crewRateNum = Number(crewRate) || 0;
  const advNum = Number(advancePaid) || 0;
  const agencyCommission = Math.max(0, ourRateNum - crewRateNum);
  const marginPercent = ourRateNum > 0 ? ((agencyCommission / ourRateNum) * 100).toFixed(1) : '0';
  const balanceDue = Math.max(0, ourRateNum - advNum);

  const toggleCrewMember = (member: CrewMember) => {
    const exists = selectedCrew.some(c => c.crewId === member.id);
    if (exists) {
      const updated = selectedCrew.filter(c => c.crewId !== member.id);
      setSelectedCrew(updated);
      if (updated.length > 0) {
        const sumPayouts = updated.reduce((s, c) => s + c.payout, 0);
        setCrewRate(sumPayouts);
      }
    } else {
      const defaultCrewPayout = member.defaultPayout || (crewRateNum > 0 && selectedCrew.length === 0 ? crewRateNum : 1200);
      const newCrewItem: PartnerCrewItem = {
        crewId: member.id,
        crewName: member.name,
        role: member.role || 'Content Creator',
        callTime: shootTime.split('-')[0]?.trim() || '14:00',
        wrapTime: shootTime.split('-')[1]?.trim() || '22:00',
        payout: defaultCrewPayout,
        phone: member.phone
      };
      const updated = [...selectedCrew, newCrewItem];
      setSelectedCrew(updated);
      const sumPayouts = updated.reduce((s, c) => s + c.payout, 0);
      setCrewRate(sumPayouts);
    }
  };

  const updateCrewField = (crewId: string, field: keyof PartnerCrewItem, value: any) => {
    const updated = selectedCrew.map(c => c.crewId === crewId ? { ...c, [field]: value } : c);
    setSelectedCrew(updated);
    if (field === 'payout') {
      const sumPayouts = updated.reduce((s, c) => s + (Number(c.payout) || 0), 0);
      setCrewRate(sumPayouts);
    }
  };

  const removeCrew = (crewId: string) => {
    const updated = selectedCrew.filter(c => c.crewId !== crewId);
    setSelectedCrew(updated);
    if (updated.length > 0) {
      const sumPayouts = updated.reduce((s, c) => s + c.payout, 0);
      setCrewRate(sumPayouts);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !clientName.trim()) return;

    const finalCrewAssignments: EventCrewAssignment[] = selectedCrew.map((c, idx) => ({
      id: `asg-${Date.now()}-${idx}-${c.crewId}`,
      eventId: '',
      crewId: c.crewId,
      crewName: c.crewName,
      role: c.role,
      callTime: c.callTime,
      wrapTime: c.wrapTime,
      payout: Number(c.payout) || 0,
      phone: c.phone || '',
      assignedSubEventIds: [],
      assignedPOVIds: [],
      paymentStatus: 'Unpaid',
      createdAt: new Date().toISOString()
    }));

    const finalCrewMembers = selectedCrew.map(c => c.crewName);
    const assignedCrewIds = selectedCrew.map(c => c.crewId);

    // Initial sub-events for calendar breakdown
    const defaultSubEvents = [
      {
        id: `sub-${Date.now()}-1`,
        eventId: '',
        name: `${eventType} Function`,
        date: startDate,
        startTime: shootTime.split('-')[0]?.trim() || '14:00',
        endTime: shootTime.split('-')[1]?.trim() || '22:00',
        venue: venue || partner.city,
        status: 'Scheduled' as const,
        assignedCrewIds,
        eventCharge: ourRateNum,
        contentRequirements: ['Outsourced Partner Coverage', 'Social Media Reels Handover']
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
      leadCreator: selectedCrew[0]?.crewName || 'Creator',
      crewMembers: finalCrewMembers,
      crewAssignments: finalCrewAssignments,
      crewPayout: crewRateNum,
      packageTotal: ourRateNum,
      advancePaid: advNum,
      balanceDue,
      status: 'Confirmed',
      clientRequirements: `Outsourced shoot via partner ${partner.companyName}. Our Charge: ₹${ourRateNum}, Crew Rate: ₹${crewRateNum}, Agency Commission: ₹${agencyCommission}.`,
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
      <div className="bg-white rounded-xl border border-[#E8E3D9] max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E3D9] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#C58B39] font-bold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Partner Shoot Setup</span>
            </span>
            <h3 className="font-serif text-xl font-bold text-neutral-900 mt-0.5">
              Add Event for {partner.companyName}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-black rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          
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
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-white text-neutral-900 focus:outline-none focus:border-[#C58B39]"
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
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-white text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Shoot Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-white text-neutral-900"
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
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-white text-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-white text-neutral-900 font-mono"
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
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-white text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-white text-neutral-900"
              />
            </div>
          </div>

          {/* Pricing: Our Rate vs Crew Rate + Commission Card */}
          <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#C58B39] flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Commercial Rates & Commission Split</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                Auto-calculated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Our Rate / Charge (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={ourRate}
                  onChange={(e) => setOurRate(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1500"
                  className="w-full p-2 border border-[#DCD6C8] rounded-lg bg-white font-mono font-bold text-neutral-900 text-xs"
                />
                <span className="text-[10px] text-neutral-500 mt-0.5 block">What partner pays us</span>
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Crew Rate / Payout (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={crewRate}
                  onChange={(e) => setCrewRate(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1200"
                  className="w-full p-2 border border-[#DCD6C8] rounded-lg bg-white font-mono font-bold text-neutral-900 text-xs"
                />
                <span className="text-[10px] text-neutral-500 mt-0.5 block">What crew receives</span>
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Advance Paid (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1500"
                  className="w-full p-2 border border-[#DCD6C8] rounded-lg bg-white font-mono font-bold text-emerald-800 text-xs"
                />
                <span className="text-[10px] text-neutral-500 mt-0.5 block">Received from partner</span>
              </div>
            </div>

            {/* Live Commission Breakdown Pill */}
            <div className="p-2.5 bg-white border border-[#E8E3D9] rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-neutral-800">Agency Commission Retained:</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-emerald-700">
                  ₹{agencyCommission.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono ml-1.5">
                  ({marginPercent}% margin)
                </span>
              </div>
            </div>
          </div>

          {/* Crew Deployment Section */}
          <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C58B39]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C58B39]">
                  Deploy Crew ({selectedCrew.length} Assigned)
                </span>
              </div>
              <span className="text-[10px] text-neutral-500">
                Syncs instantly to Crew App
              </span>
            </div>

            {/* 1-Tap Crew Roster Chips */}
            <div>
              <div className="text-[10px] text-neutral-500 mb-1.5">Tap creators to assign:</div>
              <div className="flex flex-wrap gap-1.5">
                {crewRoster.map(cr => {
                  const isSelected = selectedCrew.some(c => c.crewId === cr.id);
                  const conflict = StorageService.checkCrewConflict(cr.id, startDate);

                  return (
                    <button
                      key={cr.id}
                      type="button"
                      onClick={() => toggleCrewMember(cr)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#181818] text-white border-neutral-900 shadow-2xs'
                          : 'bg-white text-neutral-700 border-[#DCD6C8] hover:border-[#C58B39]'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      )}
                      <span>{cr.name}</span>
                      <span className={`text-[10px] px-1 py-0.2 rounded ${isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-500'}`}>
                        {cr.role}
                      </span>
                      {conflict.hasConflict && (
                        <span className="text-amber-500 text-[10px]" title="Busy on another shoot on this date">⚠️</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Crew Details */}
            {selectedCrew.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E8E3D9]">
                {selectedCrew.map(c => (
                  <div
                    key={c.crewId}
                    className="p-2 bg-white border border-[#E8E3D9] rounded-lg flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="min-w-[120px]">
                      <div className="font-semibold text-neutral-900">{c.crewName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{c.phone || c.role}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={c.role}
                        onChange={(e) => updateCrewField(c.crewId, 'role', e.target.value)}
                        className="px-2 py-1 border border-[#DCD6C8] rounded text-xs bg-white"
                      >
                        <option value="Content Creator">Content Creator</option>
                        <option value="Cinematographer">Cinematographer</option>
                        <option value="Photographer">Photographer</option>
                        <option value="Videographer">Videographer</option>
                        <option value="Drone Operator">Drone Operator</option>
                        <option value="Editor">Editor</option>
                        <option value="Assistant">Assistant</option>
                      </select>

                      <div className="w-24">
                        <input
                          type="number"
                          value={c.payout}
                          onChange={(e) => updateCrewField(c.crewId, 'payout', e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="1200"
                          className="w-full px-2 py-1 border border-[#DCD6C8] rounded font-mono font-bold text-xs"
                          title="Crew payout for this shoot"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeCrew(c.crewId)}
                        className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Partner Shoot Brief / Scope</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need creators on site by 3:00 PM. Hand over uncompressed files to partner hard drive after wrap."
              className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-white text-neutral-900"
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
              className="px-5 py-2 bg-[#121212] hover:bg-black text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C58B39]" />
              <span>Schedule Shoot & Deploy Crew</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
