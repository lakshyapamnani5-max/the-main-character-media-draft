import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TimelineItem, EventShoot } from '../../types';
import { StorageService } from '../../services/storage';

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventShoot;
  onSaveTimelineItem: (item: Omit<TimelineItem, 'id' | 'eventId'>) => void;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({
  isOpen,
  onClose,
  event,
  onSaveTimelineItem
}) => {
  const [time, setTime] = useState('08:00 AM');
  const [title, setTitle] = useState('Crew Call & Gear Calibration');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState(event.venue || '');
  const [priority, setPriority] = useState<TimelineItem['priority']>('High');
  const [assignedCrewIds, setAssignedCrewIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const crewRoster = StorageService.getCrewRoster();

  const timelinePresets = [
    { time: '08:00 AM', title: 'Crew Call & Rig Setup' },
    { time: '09:00 AM', title: 'Bride Preparation & Jewelry Micro-shots' },
    { time: '10:30 AM', title: 'Haldi Ceremony & Floral Shower' },
    { time: '12:00 PM', title: 'Family & VIP Portraits' },
    { time: '04:00 PM', title: 'Couple Portraits Editorial Session' },
    { time: '05:30 PM', title: 'Baraat Procession & Drone Tracking' },
    { time: '07:00 PM', title: 'Sangeet Stage Performances' },
    { time: '08:00 PM', title: 'Varmala & Sacred Mandap Phere' },
    { time: '09:30 PM', title: 'Midnight Reel Cut Handover & Shoot Wrap' }
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time.trim()) return;

    onSaveTimelineItem({
      time: time.trim(),
      title: title.trim(),
      description: description.trim(),
      venue: venue.trim(),
      assignedCrewIds,
      priority,
      notes: notes.trim(),
      completed: false
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
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-md w-full p-6 space-y-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E8E3D9] pb-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">Call Sheet Item</div>
            <h2 className="font-serif text-lg font-bold text-[#181818]">Add Timeline Cue</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-neutral-700 mb-1">Timeline Cue Preset</label>
            <select
              onChange={(e) => {
                const preset = timelinePresets.find(p => p.title === e.target.value);
                if (preset) {
                  setTitle(preset.title);
                  setTime(preset.time);
                }
              }}
              className="w-full px-2.5 py-1.5 border border-[#DCD6C8] rounded text-neutral-800 bg-white"
            >
              <option value="">-- Choose Standard Production Cue --</option>
              {timelinePresets.map((p, idx) => (
                <option key={idx} value={p.title}>{p.time} — {p.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Time *</label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="08:00 AM"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TimelineItem['priority'])}
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white"
              >
                <option value="Critical">Critical (Mandap / Entry)</option>
                <option value="High">High (Key Moments)</option>
                <option value="Medium">Medium (Candids)</option>
                <option value="Low">Low (Buffer)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Cue Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Groom Entry on Vintage Convertible"
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Venue / Location</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Turf Club Main Entrance"
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Assign Crew to Cue</label>
            <div className="p-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded grid grid-cols-2 gap-2 max-h-28 overflow-y-auto">
              {crewRoster.map(cr => (
                <label key={cr.id} className="flex items-center gap-1.5 cursor-pointer text-neutral-800">
                  <input
                    type="checkbox"
                    checked={assignedCrewIds.includes(cr.id)}
                    onChange={() => toggleCrew(cr.id)}
                    className="rounded text-[#C58B39]"
                  />
                  <span className="truncate font-medium">{cr.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Production Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Slow motion 60fps recommended."
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded"
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
              className="px-4 py-1.5 bg-[#181818] hover:bg-[#282828] text-white font-medium rounded transition-colors"
            >
              Save Timeline Cue
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
