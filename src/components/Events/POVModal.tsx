import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { POVItem, POVType, EventShoot } from '../../types';
import { StorageService } from '../../services/storage';

interface POVModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventShoot;
  onSavePOV: (pov: Omit<POVItem, 'id' | 'eventId'>) => void;
}

export const POVModal: React.FC<POVModalProps> = ({
  isOpen,
  onClose,
  event,
  onSavePOV
}) => {
  const [type, setType] = useState<POVType>('Bride POV');
  const [customTypeName, setCustomTypeName] = useState('');
  const [description, setDescription] = useState('');
  const [assignedCrewId, setAssignedCrewId] = useState('');
  const [priority, setPriority] = useState<POVItem['priority']>('High');
  const [shotNotes, setShotNotes] = useState('');
  const [subEventId, setSubEventId] = useState('');

  const crewRoster = StorageService.getCrewRoster();

  const povTypes: POVType[] = [
    'Bride POV',
    'Groom POV',
    'Couple POV',
    'Rituals',
    'Family',
    'Guests',
    'Catering',
    'Decor',
    'Venue',
    'Dance',
    'BTS',
    'Interviews',
    'Drone',
    'Cinematic',
    'Photography',
    'Videography',
    'Reels',
    'Custom'
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onSavePOV({
      type,
      customTypeName: type === 'Custom' ? customTypeName.trim() : undefined,
      description: description.trim(),
      assignedCrewId: assignedCrewId || undefined,
      subEventId: subEventId || undefined,
      priority,
      shotNotes: shotNotes.trim(),
      status: 'Pending'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-lg w-full p-6 space-y-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E8E3D9] pb-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">Content Architecture</div>
            <h2 className="font-serif text-lg font-bold text-[#181818]">Add Content POV / Shot Requirement</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">POV Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as POVType)}
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white text-neutral-900 font-medium"
              >
                {povTypes.map(pt => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as POVItem['priority'])}
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white"
              >
                <option value="Urgent">Urgent (Must-Have)</option>
                <option value="High">High Priority</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
          </div>

          {type === 'Custom' && (
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Custom POV Name *</label>
              <input
                type="text"
                required
                value={customTypeName}
                onChange={(e) => setCustomTypeName(e.target.value)}
                placeholder="e.g. Vintage Super 8 Camcorder Reel"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded"
              />
            </div>
          )}

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Shot Description *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Close-up of bridal veil being draped over bride's head, looking at mirror and smiling."
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Assign Creator</label>
              <select
                value={assignedCrewId}
                onChange={(e) => setAssignedCrewId(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white"
              >
                <option value="">-- Unassigned (Team Pool) --</option>
                {crewRoster.map(cr => (
                  <option key={cr.id} value={cr.id}>{cr.name} ({cr.role})</option>
                ))}
              </select>
            </div>

            {event.subEvents && event.subEvents.length > 0 && (
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Link to Ceremony</label>
                <select
                  value={subEventId}
                  onChange={(e) => setSubEventId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white"
                >
                  <option value="">General Event</option>
                  {event.subEvents.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Camera & Technical Shot Notes</label>
            <input
              type="text"
              value={shotNotes}
              onChange={(e) => setShotNotes(e.target.value)}
              placeholder="e.g. 4K 60fps ProRes, gimbal orbit, high bitrate audio mic."
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
              Save POV Requirement
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
