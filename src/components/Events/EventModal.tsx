import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { EventShoot, EventStatus, EventDeliverable, Client } from '../../types';
import { StorageService } from '../../services/storage';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<EventShoot> & { eventName: string; clientName: string }) => void;
  initialData?: EventShoot | null;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [category, setCategory] = useState<'Wedding' | 'Event Planner' | 'Other Shoot'>('Wedding');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shootTime, setShootTime] = useState('14:00 - 22:00');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [leadCreator, setLeadCreator] = useState('Devansh Saxena');
  const [crewMembers, setCrewMembers] = useState<string[]>(['Devansh Saxena', 'Tara Sen']);
  const [crewMemberInput, setCrewMemberInput] = useState('');
  const [crewPayout, setCrewPayout] = useState<number | ''>(25000);
  const [packageTotal, setPackageTotal] = useState<number | ''>(75000);
  const [advancePaid, setAdvancePaid] = useState<number | ''>(35000);
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [status, setStatus] = useState<EventStatus>('Confirmed');
  const [clientRequirements, setClientRequirements] = useState('');
  const [deliverables, setDeliverables] = useState<EventDeliverable[]>([]);
  const [newDeliverableTitle, setNewDeliverableTitle] = useState('');
  const [notes, setNotes] = useState('');

  const clients = StorageService.getClients();
  const crewRoster = StorageService.getCrewRoster();

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || 'Wedding');
      setClientId(initialData.clientId);
      setClientName(initialData.clientName);
      setClientPhone(initialData.clientContact?.phone || '');
      setClientEmail(initialData.clientContact?.email || '');
      setEventName(initialData.eventName);
      setEventType(initialData.eventType);
      setStartDate(initialData.startDate || initialData.shootDate || '');
      setEndDate(initialData.endDate || initialData.startDate || initialData.shootDate || '');
      setShootTime(initialData.shootTime || '14:00 - 22:00');
      setVenue(initialData.venue);
      setCity(initialData.locationCity || initialData.city || 'Mumbai');
      setLeadCreator(initialData.leadCreator || 'Devansh Saxena');
      setCrewMembers(initialData.crewMembers || []);
      setCrewPayout(initialData.crewPayout);
      setPackageTotal(initialData.packageTotal);
      setAdvancePaid(initialData.advancePaid);
      setPaymentDueDate(initialData.paymentDueDate || '');
      setStatus(initialData.status || 'Confirmed');
      setClientRequirements(initialData.clientRequirements || '');
      setDeliverables(initialData.deliverables || []);
      setNotes(initialData.notes || '');
    } else {
      const defaultStart = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const defaultEnd = new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setCategory('Wedding');
      setClientId('');
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setEventName('');
      setEventType('Wedding');
      setStartDate(defaultStart);
      setEndDate(defaultEnd);
      setShootTime('14:00 - 22:00');
      setVenue('');
      setCity('Mumbai');
      setLeadCreator('Devansh Saxena');
      setCrewMembers(['Devansh Saxena', 'Tara Sen']);
      setCrewPayout(25000);
      setPackageTotal(75000);
      setAdvancePaid(35000);
      setPaymentDueDate(defaultEnd);
      setStatus('Confirmed');
      setClientRequirements('');
      setDeliverables([
        { id: `del-1`, title: 'Full 4K ProRes Raw Footage Transfer on SSD', completed: false },
        { id: `del-2`, title: 'Bride & Groom POV Highlights (x3 Reels)', completed: false },
        { id: `del-3`, title: 'Ceremonial Master Cut Reel (9:16)', completed: false }
      ]);
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSelectClient = (id: string) => {
    setClientId(id);
    const cli = clients.find(c => c.id === id);
    if (cli) {
      setClientName(cli.name);
      setClientPhone(cli.phone || '');
      setClientEmail(cli.email || '');
      if (!eventName) {
        setEventName(`${cli.name.split('&')[0].trim()} Wedding Shoot`);
      }
    }
  };

  const handleAddCrew = () => {
    if (crewMemberInput.trim() && !crewMembers.includes(crewMemberInput.trim())) {
      setCrewMembers([...crewMembers, crewMemberInput.trim()]);
      setCrewMemberInput('');
    }
  };

  const handleRemoveCrew = (index: number) => {
    setCrewMembers(crewMembers.filter((_, i) => i !== index));
  };

  const handleAddDeliverable = () => {
    if (newDeliverableTitle.trim()) {
      setDeliverables([
        ...deliverables,
        { id: `del-${Date.now()}`, title: newDeliverableTitle.trim(), completed: false }
      ]);
      setNewDeliverableTitle('');
    }
  };

  const handleRemoveDeliverable = (id: string) => {
    setDeliverables(deliverables.filter(d => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !clientName.trim()) return;

    const total = Number(packageTotal) || 0;
    const adv = Number(advancePaid) || 0;
    const balanceDue = Math.max(0, total - adv);

    // Initial default sub-events for wedding if creating new
    const initialSubEvents = (!initialData && category === 'Wedding') ? [
      {
        id: `sub-${Date.now()}-1`,
        eventId: '',
        name: 'Mehendi',
        date: startDate,
        startTime: '04:00 PM',
        endTime: '08:30 PM',
        venue: venue || 'Terrace / Banquet',
        status: 'Scheduled' as const,
        assignedCrewIds: [],
        eventCharge: 15000,
        contentRequirements: ['Bride Mehendi Macro POV', 'Bridesmaid Candids'],
        notes: 'Sunset natural light.'
      },
      {
        id: `sub-${Date.now()}-2`,
        eventId: '',
        name: 'Haldi',
        date: startDate,
        startTime: '10:00 AM',
        endTime: '02:00 PM',
        venue: venue || 'Lawn Area',
        status: 'Scheduled' as const,
        assignedCrewIds: [],
        eventCharge: 15000,
        contentRequirements: ['Haldi Phoolon Ki Holi', 'Water Splash Candids'],
        notes: 'Waterproof protective pouches.'
      },
      {
        id: `sub-${Date.now()}-3`,
        eventId: '',
        name: 'Sangeet',
        date: startDate,
        startTime: '06:00 PM',
        endTime: '11:45 PM',
        venue: venue || 'Grand Ballroom',
        status: 'Scheduled' as const,
        assignedCrewIds: [],
        eventCharge: 25000,
        contentRequirements: ['Stage Choreography Dance POV', 'DJ Floor Party BTS'],
        notes: 'Audio feed from DJ mixer.'
      },
      {
        id: `sub-${Date.now()}-4`,
        eventId: '',
        name: 'Wedding',
        date: endDate || startDate,
        startTime: '04:30 PM',
        endTime: '09:30 PM',
        venue: venue || 'Mandap Lawn',
        status: 'Scheduled' as const,
        assignedCrewIds: [],
        eventCharge: 30000,
        contentRequirements: ['Bride POV Walk Down Aisle', 'Groom Baraat Entry', 'Sacred Vows & Phere'],
        notes: 'Drone coverage for baraat.'
      },
      {
        id: `sub-${Date.now()}-5`,
        eventId: '',
        name: 'Reception',
        date: endDate || startDate,
        startTime: '08:30 PM',
        endTime: '01:00 AM',
        venue: venue || 'Royal Hall',
        status: 'Scheduled' as const,
        assignedCrewIds: [],
        eventCharge: 15000,
        contentRequirements: ['Cake Cutting & Toast POV', 'Couple Formal Portraits'],
        notes: 'Guest greetings.'
      }
    ] : undefined;

    onSave({
      id: initialData?.id,
      category,
      clientId: clientId || `cli-${Date.now()}`,
      clientName: clientName.trim(),
      clientContact: {
        phone: clientPhone.trim(),
        email: clientEmail.trim()
      },
      eventName: eventName.trim(),
      eventType,
      startDate: startDate,
      endDate: endDate || startDate,
      shootDate: startDate,
      shootTime,
      venue: venue.trim() || 'TBD Venue',
      locationCity: city.trim(),
      city: city.trim(),
      leadCreator,
      crewMembers,
      crewPayout: Number(crewPayout) || 0,
      packageTotal: total,
      advancePaid: adv,
      balanceDue,
      paymentDueDate: paymentDueDate || undefined,
      clientRequirements: clientRequirements.trim(),
      status,
      deliverables,
      subEvents: initialData?.subEvents || initialSubEvents,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-[#E8E3D9] max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E3D9] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">
              Hierarchical Production Setup · Job & Ceremonies
            </div>
            <h2 className="font-serif text-xl font-bold text-[#181818]">
              {initialData ? 'Edit Production Job' : 'Create New Job / Wedding'}
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
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          
          {/* Level 1: Job Category */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1.5">
              Job Category Hierarchy *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Wedding', 'Event Planner', 'Other Shoot'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    category === cat
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                      : 'bg-[#FAF8F5] text-neutral-700 border-[#E8E3D9] hover:border-neutral-400'
                  }`}
                >
                  {cat === 'Wedding' ? '💍 Wedding' : cat === 'Event Planner' ? '✨ Event Planner' : '🎬 Other Shoot'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Link to Existing Client (Optional)
              </label>
              <select
                value={clientId}
                onChange={(e) => handleSelectClient(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 bg-white"
              >
                <option value="">-- Choose Client or Type Below --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Client / Couple Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Rahul Mehta & Priya Saxena"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Client Contact Phone</label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+919811033910"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Client Contact Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Main Event / Job Title *</label>
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Rahul & Priya Royal Wedding"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 bg-white"
              >
                <option value="Wedding">Wedding</option>
                <option value="Destination Wedding">Destination Wedding</option>
                <option value="Haldi Ceremony">Haldi Ceremony</option>
                <option value="Mehendi Soirée">Mehendi Soirée</option>
                <option value="Sangeet Gala">Sangeet Gala</option>
                <option value="Reception Evening">Reception Evening</option>
                <option value="Pre-Wedding Cinematic">Pre-Wedding Cinematic</option>
                <option value="Corporate / Brand Shoot">Corporate / Brand Shoot</option>
                <option value="Fashion Editorial">Fashion Editorial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 bg-white font-medium"
              >
                <option value="Inquiry">Inquiry</option>
                <option value="Quoted">Quoted</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Main Venue / Property</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. The St. Regis & Turf Club"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">City / Base</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai / Udaipur"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900"
              />
            </div>
          </div>

          {/* Commercials: Package Total, Advance, Due Date */}
          <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl space-y-3">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C58B39]">
              Commercials & Billing
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Package Total (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={packageTotal}
                  onChange={(e) => setPackageTotal(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="75000"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded-lg text-neutral-900 font-mono font-bold bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Advance Received (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="35000"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded-lg text-emerald-800 font-mono font-bold bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded-lg font-mono bg-white"
                />
              </div>
            </div>
          </div>

          {/* Client Requirements */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">Client Requirements & Deliverables Brief</label>
            <textarea
              rows={2}
              value={clientRequirements}
              onChange={(e) => setClientRequirements(e.target.value)}
              placeholder="e.g. Fast turnaround reels (within 12h), 4K ProRes SSD handover, vertical orientation."
              className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900"
            />
          </div>

          {/* Production Notes */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">Internal Production Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal coordination notes, crew instructions..."
              className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900"
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
              className="px-5 py-2 bg-[#181818] hover:bg-black text-white font-semibold rounded-lg transition-colors shadow-xs"
            >
              {initialData ? 'Update Job' : 'Create Confirmed Job'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
