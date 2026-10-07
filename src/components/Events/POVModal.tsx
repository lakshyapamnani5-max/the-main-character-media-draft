import React, { useState, useEffect } from 'react';
import { X, Sparkles, Trash2 } from 'lucide-react';
import { POVItem, POVType, EventShoot } from '../../types';
import { StorageService } from '../../services/storage';

interface POVModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventShoot;
  onSavePOV: (pov: Omit<POVItem, 'id' | 'eventId'>) => void;
  onDeletePOV?: (povId: string) => void;
  initialData?: POVItem | null;
}

export const POVModal: React.FC<POVModalProps> = ({
  isOpen,
  onClose,
  event,
  onSavePOV,
  onDeletePOV,
  initialData
}) => {
  const [type, setType] = useState<POVType>('Bride POV');
  const [customTypeName, setCustomTypeName] = useState('');
  const [description, setDescription] = useState('');
  const [assignedCrewId, setAssignedCrewId] = useState('');
  const [priority, setPriority] = useState<POVItem['priority']>('High');
  const [shotNotes, setShotNotes] = useState('');
  const [subEventId, setSubEventId] = useState('');
  const [plannedTime, setPlannedTime] = useState('11:00 AM');
  const [status, setStatus] = useState<POVItem['status']>('Pending');
  const [platform, setPlatform] = useState<POVItem['platform']>('Instagram Reels');
  const [plannedPostDate, setPlannedPostDate] = useState('');
  const [completed, setCompleted] = useState(false);

  const crewRoster = StorageService.getCrewRoster();

  const povTypes: POVType[] = [
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
    'Photographer coverage',
    'Custom POV'
  ];

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setCustomTypeName(initialData.customTypeName || '');
      setDescription(initialData.description || '');
      setAssignedCrewId(initialData.assignedCrewId || '');
      setPriority(initialData.priority || 'High');
      setShotNotes(initialData.shotNotes || initialData.notes || '');
      setSubEventId(initialData.subEventId || '');
      setPlannedTime(initialData.plannedTime || '11:00 AM');
      setStatus(initialData.status || 'Pending');
      setPlatform(initialData.platform || 'Instagram Reels');
      setPlannedPostDate(initialData.plannedPostDate || '');
      setCompleted(Boolean(initialData.completed || initialData.status === 'Delivered'));
    } else {
      setType('Bride POV');
      setCustomTypeName('');
      setDescription('');
      setAssignedCrewId('');
      setPriority('High');
      setShotNotes('');
      setSubEventId(event.subEvents?.[0]?.id || '');
      setPlannedTime('11:00 AM');
      setStatus('Pending');
      setPlatform('Instagram Reels');
      setPlannedPostDate(event.startDate || '');
      setCompleted(false);
    }
  }, [initialData, isOpen, event]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const matchedSubEvent = event.subEvents?.find(s => s.id === subEventId);

    onSavePOV({
      type,
      customTypeName: type === 'Custom POV' || type === 'Custom' ? customTypeName.trim() : undefined,
      description: description.trim(),
      assignedCrewId: assignedCrewId || undefined,
      subEventId: subEventId || undefined,
      subEventName: matchedSubEvent ? matchedSubEvent.name : undefined,
      priority,
      shotNotes: shotNotes.trim(),
      notes: shotNotes.trim(),
      plannedTime,
      status: completed ? 'Delivered' : status,
      platform,
      plannedPostDate: plannedPostDate || undefined,
      completed
    });

    onClose();
  };

  const handleDelete = () => {
    if (!initialData || !onDeletePOV) return;
    if (confirm(`Delete POV "${initialData.type}"?`)) {
      onDeletePOV(initialData.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-[#E8E3D9] max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E8E3D9] pb-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">
              Content Architecture & POV
            </div>
            <h2 className="font-serif text-lg font-bold text-[#181818]">
              {initialData ? `Edit: ${initialData.type}` : 'Add Content POV Requirement'}
            </h2>
            <div className="text-xs text-neutral-500 mt-0.5">
              Event: <span className="font-semibold text-neutral-800">{event.eventName}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-3.5 text-xs pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">POV Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as POVType)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg bg-white text-neutral-900 font-medium"
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
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg bg-white font-medium"
              >
                <option value="Urgent">Urgent (Must-Have)</option>
                <option value="High">High Priority</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
          </div>

          {(type === 'Custom POV' || (type as string) === 'Custom') && (
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Custom POV Name *</label>
              <input
                type="text"
                required
                value={customTypeName}
                onChange={(e) => setCustomTypeName(e.target.value)}
                placeholder="e.g. Vintage Super 8 Camcorder Reel"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Shot Directives & Description *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Close-up of bridal veil being draped over bride's head, looking at mirror and smiling."
              className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900"
            />
          </div>

          {/* Sub-event link & Planned Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Link to Function / Ceremony</label>
              <select
                value={subEventId}
                onChange={(e) => setSubEventId(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg bg-white"
              >
                <option value="">General Event</option>
                {(event.subEvents || []).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.date})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Planned Capture Time</label>
              <input
                type="text"
                value={plannedTime}
                onChange={(e) => setPlannedTime(e.target.value)}
                placeholder="11:30 AM"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Assignee & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Assigned Creator</label>
              <select
                value={assignedCrewId}
                onChange={(e) => setAssignedCrewId(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg bg-white"
              >
                <option value="">-- Unassigned (Team Pool) --</option>
                {crewRoster.map(cr => (
                  <option key={cr.id} value={cr.id}>{cr.name} ({cr.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Shoot Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as POVItem['status'])}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg bg-white font-medium"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Captured">Captured</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Platform & Planned Post Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Target Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg bg-white"
              >
                <option value="Instagram Reels">Instagram Reels</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube Shorts">YouTube Shorts</option>
                <option value="Client Drive">Client Drive</option>
                <option value="Raw Delivery">Raw Delivery</option>
                <option value="Cinematic 4K">Cinematic 4K</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Planned Post Date</label>
              <input
                type="date"
                value={plannedPostDate}
                onChange={(e) => setPlannedPostDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded-lg"
              />
            </div>
          </div>

          {/* Camera Notes */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">Camera & Technical Shot Directives</label>
            <input
              type="text"
              value={shotNotes}
              onChange={(e) => setShotNotes(e.target.value)}
              placeholder="e.g. 4K 60fps ProRes, gimbal orbit, high bitrate audio mic."
              className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg"
            />
          </div>

          {/* Completion Checkbox */}
          <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg flex items-center justify-between">
            <div>
              <span className="font-semibold text-neutral-900 block">Mark Completion Status</span>
              <span className="text-[11px] text-neutral-500">Flag as captured & delivered for final edit</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="w-4 h-4 text-[#C58B39] rounded"
              />
              <span className="ml-2 font-medium text-neutral-700">
                {completed ? 'Completed' : 'Pending'}
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#E8E3D9] flex items-center justify-between gap-2">
            <div>
              {initialData && onDeletePOV && (
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
                className="px-3.5 py-2 text-neutral-600 hover:text-neutral-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#181818] hover:bg-black text-white font-semibold rounded-lg transition-colors shadow-xs"
              >
                {initialData ? 'Update POV Requirement' : 'Save POV Requirement'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

