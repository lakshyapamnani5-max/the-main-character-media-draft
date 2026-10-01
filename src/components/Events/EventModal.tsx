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
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [shootDate, setShootDate] = useState('');
  const [shootTime, setShootTime] = useState('14:00 - 22:00');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [leadCreator, setLeadCreator] = useState('Devansh Saxena');
  const [crewMembers, setCrewMembers] = useState<string[]>(['Devansh Saxena', 'Tara Sen']);
  const [crewMemberInput, setCrewMemberInput] = useState('');
  const [crewPayout, setCrewPayout] = useState<number | ''>(14000);
  const [packageTotal, setPackageTotal] = useState<number | ''>(35000);
  const [advancePaid, setAdvancePaid] = useState<number | ''>(17500);
  const [status, setStatus] = useState<EventStatus>('Confirmed');
  const [deliverables, setDeliverables] = useState<EventDeliverable[]>([]);
  const [newDeliverableTitle, setNewDeliverableTitle] = useState('');
  const [notes, setNotes] = useState('');

  const clients = StorageService.getClients();
  const crewRoster = StorageService.getCrewRoster();

  useEffect(() => {
    if (initialData) {
      setClientId(initialData.clientId);
      setClientName(initialData.clientName);
      setEventName(initialData.eventName);
      setEventType(initialData.eventType);
      setShootDate(initialData.startDate || initialData.shootDate || '');
      setShootTime(initialData.shootTime || '14:00 - 22:00');
      setVenue(initialData.venue);
      setCity(initialData.locationCity || initialData.city || 'Mumbai');
      setLeadCreator(initialData.leadCreator || 'Devansh Saxena');
      setCrewMembers(initialData.crewMembers || []);
      setCrewPayout(initialData.crewPayout);
      setPackageTotal(initialData.packageTotal);
      setAdvancePaid(initialData.advancePaid);
      setStatus(initialData.status || 'Confirmed');
      setDeliverables(initialData.deliverables || []);
      setNotes(initialData.notes || '');
    } else {
      setClientId('');
      setClientName('');
      setEventName('');
      setEventType('Wedding');
      setShootDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setShootTime('14:00 - 22:00');
      setVenue('');
      setCity('Mumbai');
      setLeadCreator('Devansh Saxena');
      setCrewMembers(['Devansh Saxena', 'Tara Sen']);
      setCrewPayout(14000);
      setPackageTotal(35000);
      setAdvancePaid(17500);
      setStatus('Confirmed');
      setDeliverables([
        { id: `del-1`, title: 'Full 4K ProRes Raw Footage Transfer', completed: false },
        { id: `del-2`, title: 'Bride & Groom POV Highlights (x3 Reels)', completed: false },
        { id: `del-3`, title: 'Ceremonial Master Cut Reel', completed: false }
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

    onSave({
      id: initialData?.id,
      clientId: clientId || `cli-${Date.now()}`,
      clientName: clientName.trim(),
      eventName: eventName.trim(),
      eventType,
      startDate: shootDate,
      endDate: shootDate,
      shootDate,
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
      status,
      deliverables,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E8E3D9] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">
              Production Schedule
            </div>
            <h2 className="font-serif text-xl font-bold text-[#181818]">
              {initialData ? 'Edit Event Shoot' : 'Schedule New Event Shoot'}
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Link to Client *
              </label>
              <select
                value={clientId}
                onChange={(e) => handleSelectClient(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 bg-white"
              >
                <option value="">-- Choose Existing Client or Enter Below --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Client Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Rhea Kapoor & Siddharth Oberoi"
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
                placeholder="e.g. Rhea & Siddharth Luxury Wedding Weekend"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 bg-white"
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
              <label className="block font-medium text-neutral-700 mb-1">Shoot Date *</label>
              <input
                type="date"
                required
                value={shootDate}
                onChange={(e) => setShootDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Call Time / Schedule</label>
              <input
                type="text"
                value={shootTime}
                onChange={(e) => setShootTime(e.target.value)}
                placeholder="14:00 - 22:00"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Production Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 bg-white"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="In Progress">In Progress (Shooting)</option>
                <option value="In Post-Production">In Post-Production</option>
                <option value="Delivered">Delivered</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Venue / Property</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. ITC Grand Bharat"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">City / Location</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Manesar / Delhi NCR"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900"
              />
            </div>
          </div>

          {/* Crew Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Lead Creator</label>
              <select
                value={leadCreator}
                onChange={(e) => setLeadCreator(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 bg-white"
              >
                {crewRoster.map((cr: import('../../types').CrewMember) => (
                  <option key={cr.id} value={cr.name}>{cr.name} ({cr.role.split(' ')[0]})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Crew Remuneration / Payout (₹)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={crewPayout}
                onChange={(e) => setCrewPayout(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="14000"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 font-mono tabular-nums"
              />
            </div>
          </div>

          {/* Financials: Package Total & Advance Paid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Contracted Package Value (₹) *</label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={packageTotal}
                onChange={(e) => setPackageTotal(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="35000"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 font-mono tabular-nums font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Advance Already Received (₹)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="17500"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 font-mono tabular-nums text-emerald-700 font-bold"
              />
            </div>
          </div>

          {/* Deliverables Checklist */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Deliverables Checklist
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newDeliverableTitle}
                onChange={(e) => setNewDeliverableTitle(e.target.value)}
                placeholder="e.g. Wedding Highlight Reel (9:16)"
                className="flex-1 px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
              />
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="px-3 py-1.5 bg-[#FAF8F5] border border-[#DCD6C8] hover:bg-[#F2ECE1] rounded text-neutral-800 font-medium"
              >
                Add Deliverable
              </button>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto p-2.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded">
              {deliverables.length === 0 ? (
                <div className="text-neutral-400 italic">No deliverables added yet.</div>
              ) : (
                deliverables.map((del) => (
                  <div key={del.id} className="flex items-center justify-between text-neutral-800 py-1 border-b border-[#E8E3D9]/60 last:border-b-0">
                    <span className="truncate">{del.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(del.id)}
                      className="text-neutral-400 hover:text-red-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Production Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Important logistics, lehenga color, groom entry cue..."
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
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
              {initialData ? 'Update Shoot' : 'Confirm Event Shoot'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
