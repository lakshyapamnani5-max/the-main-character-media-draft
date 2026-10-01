import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SubEvent, EventShoot } from '../../types';
import { StorageService } from '../../services/storage';

interface SubEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventShoot;
  onSaveSubEvent: (subEvent: Omit<SubEvent, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: SubEvent | null;
}

export const SubEventModal: React.FC<SubEventModalProps> = ({
  isOpen,
  onClose,
  event,
  onSaveSubEvent,
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
  const [notes, setNotes] = useState('');

  const crewRoster = StorageService.getCrewRoster();

  const commonSubEvents = [
    'Haldi Ceremony',
    'Mehendi Soirée',
    'Sangeet Gala',
    'Bride Preparation',
    'Groom Preparation',
    'Couple Portraits Editorial',
    'Royal Wedding & Phere',
    'Reception Evening',
    'Afterparty & DJ Night',
    'Welcome Dinner / Cocktail'
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
      setNotes(initialData.notes || '');
    } else {
      setName('Haldi Ceremony');
      setDate(event.startDate || (event as any).shootDate || new Date().toISOString().split('T')[0]);
      setStartTime('10:00 AM');
      setEndTime('02:00 PM');
      setVenue(event.venue || '');
      setDescription('');
      setStatus('Scheduled');
      setAssignedCrewIds([]);
      setNotes('');
    }
  }, [initialData, isOpen, event]);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E3D9] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">
              Multi-Day Production
            </div>
            <h2 className="font-serif text-lg font-bold text-[#181818]">
              {initialData ? 'Edit Sub-Event' : 'Add Sub-Event / Ceremony'}
            </h2>
            <div className="text-xs text-neutral-500 mt-0.5">
              Event: {event.eventName}
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
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-3.5 text-xs">
          
          <div>
            <label className="block font-medium text-neutral-700 mb-1">Sub-Event Name *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sangeet Gala or Bride Preparation"
                className="flex-1 px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 focus:border-[#C58B39]"
              />
              <select
                onChange={(e) => {
                  if (e.target.value) setName(e.target.value);
                }}
                className="px-2 py-1.5 border border-[#DCD6C8] rounded text-neutral-700 bg-white"
              >
                <option value="">Presets...</option>
                {commonSubEvents.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full px-2.5 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="02:00 PM"
                className="w-full px-2.5 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Venue / Lawn / Hall</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Turf Club Lawn 1 or Suite #2201"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubEvent['status'])}
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 bg-white"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Description & Scope</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of ceremony, key people involved, flow..."
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
            />
          </div>

          {/* Assigned Crew */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">Assign Crew to Ceremony</label>
            <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {crewRoster.map(cr => (
                <label key={cr.id} className="flex items-center gap-1.5 cursor-pointer text-neutral-800">
                  <input
                    type="checkbox"
                    checked={assignedCrewIds.includes(cr.id)}
                    onChange={() => toggleCrew(cr.id)}
                    className="rounded text-[#C58B39]"
                  />
                  <span className="truncate font-medium">{cr.name}</span>
                  <span className="text-[10px] text-neutral-400">({cr.role.split(' ')[0]})</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Special Logistics Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Waterproof gear required; lighting dim at 8 PM."
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#E8E3D9] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-neutral-600 hover:text-neutral-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#181818] hover:bg-[#282828] text-white font-medium rounded transition-colors shadow-xs"
            >
              {initialData ? 'Update Sub-Event' : 'Save Sub-Event'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
