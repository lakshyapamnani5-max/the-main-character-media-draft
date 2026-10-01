import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, UserCheck, ShieldAlert, Check } from 'lucide-react';
import { EventShoot, CrewMember, EventCrewAssignment, CrewRole } from '../../types';
import { StorageService } from '../../services/storage';

interface AssignCrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventShoot;
  onAssignCrew: (assignment: Omit<EventCrewAssignment, 'id' | 'eventId' | 'createdAt'>) => void;
  initialAssignment?: EventCrewAssignment | null;
}

export const AssignCrewModal: React.FC<AssignCrewModalProps> = ({
  isOpen,
  onClose,
  event,
  onAssignCrew,
  initialAssignment
}) => {
  const [selectedCrewId, setSelectedCrewId] = useState('');
  const [role, setRole] = useState<CrewRole | string>('Content Creator');
  const [callTime, setCallTime] = useState('08:00 AM');
  const [wrapTime, setWrapTime] = useState('11:00 PM');
  const [payout, setPayout] = useState<number | ''>(6000);
  const [assignedSubEventIds, setAssignedSubEventIds] = useState<string[]>([]);
  const [assignedPOVIds, setAssignedPOVIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [overrideConflict, setOverrideConflict] = useState(false);

  const crewRoster = StorageService.getCrewRoster().filter(c => c.status === 'Active');

  useEffect(() => {
    if (initialAssignment) {
      setSelectedCrewId(initialAssignment.crewId);
      setRole(initialAssignment.role);
      setCallTime(initialAssignment.callTime);
      setWrapTime(initialAssignment.wrapTime);
      setPayout(initialAssignment.payout);
      setAssignedSubEventIds(initialAssignment.assignedSubEventIds || []);
      setAssignedPOVIds(initialAssignment.assignedPOVIds || []);
      setNotes(initialAssignment.notes || '');
      setConflictWarning(null);
      setOverrideConflict(true);
    } else {
      setSelectedCrewId('');
      setRole('Content Creator');
      setCallTime('08:00 AM');
      setWrapTime('11:00 PM');
      setPayout(6000);
      setAssignedSubEventIds(event.subEvents ? event.subEvents.map(s => s.id) : []);
      setAssignedPOVIds([]);
      setNotes('');
      setConflictWarning(null);
      setOverrideConflict(false);
    }
  }, [initialAssignment, isOpen, event]);

  // Check conflicts whenever selected crew member changes
  useEffect(() => {
    if (selectedCrewId && !initialAssignment) {
      const crewMember = crewRoster.find(c => c.id === selectedCrewId);
      if (crewMember) {
        setRole(crewMember.role);
        setPayout(crewMember.defaultPayout);

        const conflictCheck = StorageService.checkCrewConflict(
          selectedCrewId,
          event.startDate || (event as any).shootDate,
          event.id
        );

        if (conflictCheck.hasConflict && conflictCheck.conflictingEvent) {
          setConflictWarning(
            `${crewMember.name.toUpperCase()} IS ALREADY ASSIGNED TO ANOTHER SHOOT ("${conflictCheck.conflictingEvent.eventName}") ON THIS DATE (${event.startDate || (event as any).shootDate}).`
          );
          setOverrideConflict(false);
        } else {
          setConflictWarning(null);
          setOverrideConflict(true);
        }
      }
    }
  }, [selectedCrewId, event, crewRoster, initialAssignment]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrewId || payout === '') return;

    if (conflictWarning && !overrideConflict) {
      return;
    }

    const crewMember = crewRoster.find(c => c.id === selectedCrewId);
    if (!crewMember) return;

    onAssignCrew({
      crewId: selectedCrewId,
      crewName: crewMember.name,
      role,
      callTime,
      wrapTime,
      payout: Number(payout),
      assignedSubEventIds,
      assignedPOVIds,
      notes: notes.trim(),
      overrideConflictConfirmed: !!conflictWarning && overrideConflict
    });

    onClose();
  };

  const toggleSubEvent = (subId: string) => {
    if (assignedSubEventIds.includes(subId)) {
      setAssignedSubEventIds(assignedSubEventIds.filter(id => id !== subId));
    } else {
      setAssignedSubEventIds([...assignedSubEventIds, subId]);
    }
  };

  const togglePOV = (povId: string) => {
    if (assignedPOVIds.includes(povId)) {
      setAssignedPOVIds(assignedPOVIds.filter(id => id !== povId));
    } else {
      setAssignedPOVIds([...assignedPOVIds, povId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E3D9] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">
              Crew Deployment
            </div>
            <h2 className="font-serif text-lg font-bold text-[#181818]">
              {initialAssignment ? 'Edit Crew Assignment' : 'Assign Crew Member to Shoot'}
            </h2>
            <div className="text-xs text-neutral-500 mt-0.5">
              Event: {event.eventName} · Date: {event.startDate || (event as any).shootDate}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Warning Banner if detected */}
        {conflictWarning && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <div className="font-bold tracking-wide">AVAILABILITY CONFLICT DETECTED</div>
              <p className="text-amber-800 font-medium">{conflictWarning}</p>
              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={overrideConflict}
                  onChange={(e) => setOverrideConflict(e.target.checked)}
                  className="rounded text-amber-700 focus:ring-amber-600"
                />
                <span className="font-semibold text-amber-900">
                  I understand the scheduling overlap. Override and assign anyway.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Select Crew Member *
              </label>
              <select
                required
                value={selectedCrewId}
                onChange={(e) => setSelectedCrewId(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 bg-white font-medium focus:border-[#C58B39]"
              >
                <option value="">-- Choose from Crew Roster --</option>
                {crewRoster.map(cr => (
                  <option key={cr.id} value={cr.id}>
                    {cr.name} ({cr.role}) — ₹{cr.defaultPayout.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Assigned Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 bg-white"
              >
                <option value="Content Creator">Content Creator</option>
                <option value="Cinematographer">Cinematographer</option>
                <option value="Photographer">Photographer</option>
                <option value="Videographer">Videographer</option>
                <option value="Drone Operator">Drone Operator</option>
                <option value="Editor">Editor</option>
                <option value="Assistant">Assistant</option>
                <option value="Social Media Manager">Social Media Manager</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Call Time *</label>
              <input
                type="text"
                required
                value={callTime}
                onChange={(e) => setCallTime(e.target.value)}
                placeholder="08:00 AM"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Wrap Time *</label>
              <input
                type="text"
                required
                value={wrapTime}
                onChange={(e) => setWrapTime(e.target.value)}
                placeholder="11:30 PM"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Crew Payout (₹) *</label>
              <input
                type="number"
                required
                min="0"
                step="500"
                value={payout}
                onChange={(e) => setPayout(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="6000"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 font-mono tabular-nums font-bold"
              />
            </div>
          </div>

          {/* Assigned Sub-Events */}
          {event.subEvents && event.subEvents.length > 0 && (
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Assigned Sub-Events / Ceremonies
              </label>
              <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded space-y-1.5 max-h-36 overflow-y-auto">
                {event.subEvents.map(sub => (
                  <label key={sub.id} className="flex items-center gap-2 cursor-pointer text-neutral-800">
                    <input
                      type="checkbox"
                      checked={assignedSubEventIds.includes(sub.id)}
                      onChange={() => toggleSubEvent(sub.id)}
                      className="rounded text-[#C58B39] focus:ring-[#C58B39]"
                    />
                    <span className="font-medium">{sub.name}</span>
                    <span className="text-[10px] text-neutral-500">({sub.date} · {sub.startTime})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Assigned POVs */}
          {event.povs && event.povs.length > 0 && (
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Assigned Content POVs / Deliverables
              </label>
              <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded space-y-1.5 max-h-36 overflow-y-auto">
                {event.povs.map(p => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer text-neutral-800">
                    <input
                      type="checkbox"
                      checked={assignedPOVIds.includes(p.id)}
                      onChange={() => togglePOV(p.id)}
                      className="rounded text-[#C58B39] focus:ring-[#C58B39]"
                    />
                    <span className="font-semibold text-[11px] text-[#8C6428]">{p.type}:</span>
                    <span className="truncate">{p.description}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Assignment Notes & Instructions</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. In charge of Bride vanity suite & macro jewelry detailer."
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
            />
          </div>

          {/* Footer Actions */}
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
              disabled={conflictWarning ? !overrideConflict : false}
              className={`px-4 py-1.5 text-white font-medium rounded transition-colors shadow-xs ${
                conflictWarning && !overrideConflict
                  ? 'bg-neutral-400 cursor-not-allowed'
                  : 'bg-[#181818] hover:bg-[#282828]'
              }`}
            >
              {initialAssignment ? 'Update Assignment' : 'Confirm Assignment'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
