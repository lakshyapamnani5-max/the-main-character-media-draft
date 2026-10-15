import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Sparkles } from 'lucide-react';
import { SubEvent, EventShoot } from '../../types';
import { StorageService } from '../../services/storage';

interface SubEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventShoot;
  onSaveSubEvent: (subEvent: Omit<SubEvent, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteSubEvent?: (subEventId: string) => void;
  initialData?: SubEvent | null;
}

export const SubEventModal: React.FC<SubEventModalProps> = ({
  isOpen,
  onClose,
  event,
  onSaveSubEvent,
  onDeleteSubEvent,
  initialData
}) => {
  const [name, setName] = useState('Haldi Ceremony');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('02:00 PM');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<SubEvent['status']>('Scheduled');
  const [assignedCrewIds, setAssignedCrewIds] = useState<string[]>([]);
  const [eventCharge, setEventCharge] = useState<number | ''>(15000);
  const [contentReqInput, setContentReqInput] = useState('');
  const [contentRequirements, setContentRequirements] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const crewRoster = StorageService.getCrewRoster();
  const activeRateCharges = StorageService.getActiveEventCharges();

  const handleSelectEventRate = (chargeId: string) => {
    if (!chargeId) return;
    const charge = activeRateCharges.find(c => c.id === chargeId);
    if (charge) {
      setName(charge.name);
      setEventCharge(charge.price);
      if (charge.description) {
        setDescription(charge.description);
      }
      if (charge.includedServices && charge.includedServices.length > 0) {
        const merged = Array.from(new Set([...contentRequirements, ...charge.includedServices]));
        setContentRequirements(merged);
      }
    }
  };

  const commonSubEvents = [
    'Mehendi',
    'Haldi',
    'Sangeet',
    'Wedding',
    'Reception',
    'Cocktail / Welcome Dinner',
    'Bride Preparation',
    'Groom Preparation',
    'Afterparty & DJ Night',
    'Pre-Wedding Shoot'
  ];

  const commonContentTags = [
    'Bride POV',
    'Groom POV',
    'Couple POV',
    'Family POV',
    'Rituals',
    'Catering',
    'Decor',
    'Venue',
    'Guest reactions',
    'Entry',
    'Dance',
    'Behind the scenes',
    'Drone',
    'Cinematic shots',
    'Photographer coverage'
  ];

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDate(initialData.date);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      setVenue(initialData.venue);
      setDescription(initialData.description || '');
      setStatus(initialData.status);
      setAssignedCrewIds(initialData.assignedCrewIds || []);
      setEventCharge(initialData.eventCharge !== undefined ? initialData.eventCharge : 15000);
      setContentRequirements(initialData.contentRequirements || []);
      setNotes(initialData.notes || '');
    } else {
      setName('Mehendi');
      setDate(event.startDate || (event as any).shootDate || new Date().toISOString().split('T')[0]);
      setStartTime('10:00 AM');
      setEndTime('02:00 PM');
      setVenue(event.venue || '');
      setDescription('');
      setStatus('Scheduled');
      setAssignedCrewIds([]);
      setEventCharge(15000);
      setContentRequirements(['Bride POV', 'Family POV', 'Decor']);
      setNotes('');
    }
  }, [initialData, isOpen, event]);

  if (!isOpen) return null;

  const handleAddContentReq = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !contentRequirements.includes(trimmed)) {
      setContentRequirements([...contentRequirements, trimmed]);
    }
  };

  const handleRemoveContentReq = (tag: string) => {
    setContentRequirements(contentRequirements.filter(t => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;

    onSaveSubEvent({
      name: name.trim(),
      date,
      startTime,
      endTime,
      venue: venue.trim() || event.venue,
      description: description.trim(),
      status,
      assignedCrewIds,
      eventCharge: typeof eventCharge === 'number' ? eventCharge : 0,
      contentRequirements,
      notes: notes.trim()
    });

    onClose();
  };

  const toggleCrew = (crewId: string) => {
    if (assignedCrewIds.includes(crewId)) {
      setAssignedCrewIds(assignedCrewIds.filter(id => id !== crewId));
    } else {
      setAssignedCrewIds([...assignedCrewIds, crewId]);
    }
  };

  const handleDelete = () => {
    if (!initialData || !onDeleteSubEvent) return;
    if (confirm(`Are you sure you want to delete "${initialData.name}"?`)) {
      onDeleteSubEvent(initialData.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-[#E8E3D9] max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E3D9] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">
              Multi-Day Hierarchy · Sub-Event / Function
            </div>
            <h2 className="font-serif text-lg font-bold text-[#181818]">
              {initialData ? `Edit: ${initialData.name}` : 'Add Sub-Event / Function'}
            </h2>
            <div className="text-xs text-neutral-500 mt-0.5">
              Parent Job: <span className="font-semibold text-neutral-800">{event.eventName}</span>
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
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* Quick Fetch from Master Event Rates */}
          <div className="p-3 bg-[#FAF8F5] border border-[#E2DBD0] rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-800 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C58B39]" />
                <span>Fetch from Master Event Rates</span>
              </span>
              <span className="text-[10px] text-neutral-500">Auto-sets name & rate</span>
            </div>
            <select
              onChange={(e) => handleSelectEventRate(e.target.value)}
              className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 bg-white font-medium focus:outline-none focus:border-[#C58B39]"
            >
              <option value="">-- Select Rate (e.g. Wedding ₹50,000, Haldi ₹8,000...) --</option>
              {activeRateCharges.map(chg => (
                <option key={chg.id} value={chg.id}>
                  {chg.name} — ₹{chg.price.toLocaleString('en-IN')} ({chg.duration || 'Coverage'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Function / Ceremony Name *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mehendi, Haldi, Sangeet, Wedding, Reception"
                className="flex-1 px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 focus:border-[#C58B39] focus:outline-none"
              />
              <select
                onChange={(e) => {
                  if (e.target.value) setName(e.target.value);
                }}
                className="px-2.5 py-2 border border-[#DCD6C8] rounded-lg text-neutral-700 bg-white"
              >
                <option value="">Quick Select...</option>
                {commonSubEvents.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#DCD6C8] rounded-lg text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full px-2.5 py-1.5 border border-[#DCD6C8] rounded-lg text-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="02:00 PM"
                className="w-full px-2.5 py-1.5 border border-[#DCD6C8] rounded-lg text-neutral-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Venue / Specific Lawn</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Turf Club Lawn 1 or Ballroom"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded-lg text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Ceremony Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubEvent['status'])}
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded-lg text-neutral-900 bg-white"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Event Charges */}
          <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg">
            <label className="block font-medium text-neutral-800 mb-1">
              Event / Function Charges (₹)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-mono font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="500"
                value={eventCharge}
                onChange={(e) => setEventCharge(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="15000"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded-lg text-neutral-900 font-mono font-bold bg-white"
              />
            </div>
            <p className="text-[10px] text-neutral-500 mt-1">
              Allocated package billing for this specific sub-event/ceremony.
            </p>
          </div>

          {/* Content Requirements */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-medium text-neutral-700">
                Content Requirements & Shot Directives
              </label>
              <span className="text-[10px] text-neutral-400">({contentRequirements.length} added)</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={contentReqInput}
                onChange={(e) => setContentReqInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (contentReqInput.trim()) {
                      handleAddContentReq(contentReqInput);
                      setContentReqInput('');
                    }
                  }
                }}
                placeholder="Type requirement and press add (e.g. Drone Mandap Flyover)..."
                className="flex-1 px-3 py-1.5 border border-[#DCD6C8] rounded-lg text-neutral-900"
              />
              <button
                type="button"
                onClick={() => {
                  if (contentReqInput.trim()) {
                    handleAddContentReq(contentReqInput);
                    setContentReqInput('');
                  }
                }}
                className="px-3 py-1.5 bg-[#181818] hover:bg-black text-white rounded-lg font-medium text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick suggested chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {commonContentTags.slice(0, 8).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddContentReq(tag)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    contentRequirements.includes(tag)
                      ? 'bg-[#C58B39]/20 text-[#8C6428] border-[#C58B39]/40 font-semibold'
                      : 'bg-white text-neutral-600 border-[#E8E3D9] hover:border-neutral-400'
                  }`}
                >
                  + {tag}
                </button>
              ))}
            </div>

            {/* Active requirements tags */}
            {contentRequirements.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg">
                {contentRequirements.map(req => (
                  <span
                    key={req}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#DCD6C8] rounded-md text-xs font-medium text-neutral-800 shadow-2xs"
                  >
                    <span>{req}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveContentReq(req)}
                      className="text-neutral-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Crew */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Assigned Crew ({assignedCrewIds.length} deployed)
            </label>
            <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {crewRoster.map(cr => (
                <label key={cr.id} className="flex items-center gap-1.5 cursor-pointer text-neutral-800 text-[11px]">
                  <input
                    type="checkbox"
                    checked={assignedCrewIds.includes(cr.id)}
                    onChange={() => toggleCrew(cr.id)}
                    className="rounded text-[#C58B39] focus:ring-[#C58B39]"
                  />
                  <span className="truncate font-medium">{cr.name}</span>
                  <span className="text-[10px] text-neutral-400">({cr.role.split(' ')[0]})</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Notes & Scope</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Waterproof gear required; low lighting after 8 PM."
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded-lg text-neutral-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E8E3D9] flex items-center justify-between gap-2">
            <div>
              {initialData && onDeleteSubEvent && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-neutral-600 hover:text-neutral-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#181818] hover:bg-black text-white font-semibold rounded-lg transition-colors shadow-xs"
              >
                {initialData ? 'Update Function' : 'Save Function'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

