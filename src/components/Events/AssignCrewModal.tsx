import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, UserCheck, ShieldAlert, Check, Plus, Trash2, ChevronDown, ChevronUp, Clock, IndianRupee, Users } from 'lucide-react';
import { EventShoot, CrewMember, EventCrewAssignment, CrewRole } from '../../types';
import { StorageService } from '../../services/storage';

interface SelectedCrewItem {
  crewId: string;
  crewName: string;
  role: CrewRole | string;
  callTime: string;
  wrapTime: string;
  payout: number;
  phone?: string;
}

interface AssignCrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventShoot;
  onAssignCrew: (assignment: Omit<EventCrewAssignment, 'id' | 'eventId' | 'createdAt'>) => void;
  onAssignMultipleCrew?: (assignments: Omit<EventCrewAssignment, 'id' | 'eventId' | 'createdAt'>[]) => void;
  initialAssignment?: EventCrewAssignment | null;
}

export const AssignCrewModal: React.FC<AssignCrewModalProps> = ({
  isOpen,
  onClose,
  event,
  onAssignCrew,
  onAssignMultipleCrew,
  initialAssignment
}) => {
  const [selectedCrew, setSelectedCrew] = useState<SelectedCrewItem[]>([]);
  const [sharedCallTime, setSharedCallTime] = useState('08:00 AM');
  const [sharedWrapTime, setSharedWrapTime] = useState('11:00 PM');
  const [assignedSubEventIds, setAssignedSubEventIds] = useState<string[]>([]);
  const [assignedPOVIds, setAssignedPOVIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const crewRoster = StorageService.getCrewRoster().filter(c => c.status === 'Active');
  const alreadyAssignedCrewIds = new Set((event.crewAssignments || []).map(a => a.crewId));

  useEffect(() => {
    const defaultStart = event.shootTime?.split('-')[0]?.trim() || '08:00 AM';
    const defaultEnd = event.shootTime?.split('-')[1]?.trim() || '11:00 PM';
    setSharedCallTime(defaultStart);
    setSharedWrapTime(defaultEnd);

    if (initialAssignment) {
      setSelectedCrew([
        {
          crewId: initialAssignment.crewId,
          crewName: initialAssignment.crewName,
          role: initialAssignment.role,
          callTime: initialAssignment.callTime || defaultStart,
          wrapTime: initialAssignment.wrapTime || defaultEnd,
          payout: initialAssignment.payout,
          phone: initialAssignment.phone
        }
      ]);
      setAssignedSubEventIds(initialAssignment.assignedSubEventIds || []);
      setAssignedPOVIds(initialAssignment.assignedPOVIds || []);
      setNotes(initialAssignment.notes || '');
      setShowAdvanced(!!(initialAssignment.notes || (initialAssignment.assignedSubEventIds && initialAssignment.assignedSubEventIds.length > 0)));
    } else {
      setSelectedCrew([]);
      setAssignedSubEventIds(event.subEvents ? event.subEvents.map(s => s.id) : []);
      setAssignedPOVIds([]);
      setNotes('');
      setShowAdvanced(false);
    }
  }, [initialAssignment, isOpen, event]);

  if (!isOpen) return null;

  const toggleCrewSelection = (member: CrewMember) => {
    const isSelected = selectedCrew.some(c => c.crewId === member.id);
    if (isSelected) {
      setSelectedCrew(selectedCrew.filter(c => c.crewId !== member.id));
    } else {
      setSelectedCrew([
        ...selectedCrew,
        {
          crewId: member.id,
          crewName: member.name,
          role: member.role || 'Content Creator',
          callTime: sharedCallTime,
          wrapTime: sharedWrapTime,
          payout: member.defaultPayout || 6000,
          phone: member.phone
        }
      ]);
    }
  };

  const updateCrewItem = (crewId: string, field: keyof SelectedCrewItem, value: any) => {
    setSelectedCrew(selectedCrew.map(c => c.crewId === crewId ? { ...c, [field]: value } : c));
  };

  const removeCrewItem = (crewId: string) => {
    setSelectedCrew(selectedCrew.filter(c => c.crewId !== crewId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCrew.length === 0) return;

    const assignmentsToSave: Omit<EventCrewAssignment, 'id' | 'eventId' | 'createdAt'>[] = selectedCrew.map(c => ({
      crewId: c.crewId,
      crewName: c.crewName,
      role: c.role,
      callTime: c.callTime || sharedCallTime,
      wrapTime: c.wrapTime || sharedWrapTime,
      payout: Number(c.payout) || 0,
      phone: c.phone,
      assignedSubEventIds,
      assignedPOVIds,
      notes: notes.trim(),
      overrideConflictConfirmed: true
    }));

    if (onAssignMultipleCrew) {
      onAssignMultipleCrew(assignmentsToSave);
    } else {
      assignmentsToSave.forEach(asg => onAssignCrew(asg));
    }

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

  const totalPayout = selectedCrew.reduce((sum, c) => sum + (Number(c.payout) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-[#E8E3D9] max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E3D9] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Fast Crew Deployment</span>
            </div>
            <h2 className="font-serif text-lg font-bold text-[#181818] mt-0.5">
              {initialAssignment ? `Edit Assignment: ${initialAssignment.crewName}` : 'Deploy Crew to Shoot'}
            </h2>
            <div className="text-xs text-neutral-500 mt-0.5">
              {event.eventName} · {event.startDate || (event as any).shootDate} · {event.venue}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          
          {/* Quick Roster Selector (hidden in single edit mode) */}
          {!initialAssignment && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-semibold text-neutral-800">
                  Select Crew Members to Deploy
                </label>
                <span className="text-[10px] text-neutral-500">
                  {selectedCrew.length} selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {crewRoster.map(cr => {
                  const isSelected = selectedCrew.some(c => c.crewId === cr.id);
                  const isAlreadyAssigned = alreadyAssignedCrewIds.has(cr.id);
                  const conflict = StorageService.checkCrewConflict(
                    cr.id,
                    event.startDate || (event as any).shootDate,
                    event.id
                  );

                  return (
                    <button
                      key={cr.id}
                      type="button"
                      onClick={() => toggleCrewSelection(cr)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-[#181818] text-white border-neutral-900 shadow-2xs ring-1 ring-[#C58B39]'
                          : isAlreadyAssigned
                          ? 'bg-neutral-50 text-neutral-700 border-[#E8E3D9] opacity-75'
                          : 'bg-white text-neutral-800 border-[#DCD6C8] hover:border-[#C58B39]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isSelected ? 'bg-neutral-800 text-[#C58B39]' : 'bg-[#FAF8F5] text-neutral-700 border border-[#E8E3D9]'
                        }`}>
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            cr.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                          )}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-xs truncate leading-tight">{cr.name}</div>
                          <div className={`text-[10px] truncate ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            {cr.role} · ₹{cr.defaultPayout.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {isAlreadyAssigned && !isSelected && (
                          <span className="text-[9px] font-mono bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded">
                            Assigned
                          </span>
                        )}
                        {conflict.hasConflict && (
                          <span className="text-[10px] ml-1" title="Overlap on this date">⚠️</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shared Call & Wrap Times */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg">
            <div>
              <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                Default Call Time
              </label>
              <input
                type="text"
                value={sharedCallTime}
                onChange={(e) => {
                  setSharedCallTime(e.target.value);
                  setSelectedCrew(selectedCrew.map(c => ({ ...c, callTime: e.target.value })));
                }}
                placeholder="08:00 AM"
                className="w-full px-2.5 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 font-mono bg-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                Default Wrap Time
              </label>
              <input
                type="text"
                value={sharedWrapTime}
                onChange={(e) => {
                  setSharedWrapTime(e.target.value);
                  setSelectedCrew(selectedCrew.map(c => ({ ...c, wrapTime: e.target.value })));
                }}
                placeholder="11:00 PM"
                className="w-full px-2.5 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 font-mono bg-white text-xs"
              />
            </div>
          </div>

          {/* Selected Crew Details List */}
          {selectedCrew.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-800 text-xs">
                  Deployed Creators ({selectedCrew.length})
                </span>
                <span className="font-mono font-bold text-neutral-900 text-xs">
                  Total Payout: <span className="text-[#C58B39]">₹{totalPayout.toLocaleString('en-IN')}</span>
                </span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {selectedCrew.map((c) => (
                  <div
                    key={c.crewId}
                    className="p-2.5 bg-white border border-[#E8E3D9] rounded-lg flex flex-wrap items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="min-w-[130px]">
                      <div className="font-bold text-neutral-900">{c.crewName}</div>
                      {c.phone && <div className="text-[10px] text-neutral-400 font-mono">{c.phone}</div>}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div>
                        <span className="text-[9px] text-neutral-400 block">Role</span>
                        <select
                          value={c.role}
                          onChange={(e) => updateCrewItem(c.crewId, 'role', e.target.value)}
                          className="px-2 py-1 border border-[#DCD6C8] rounded bg-white text-xs text-neutral-800"
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

                      <div className="w-24">
                        <span className="text-[9px] text-neutral-400 block">Payout (₹)</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={c.payout}
                          onChange={(e) => updateCrewItem(c.crewId, 'payout', e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2 py-1 border border-[#DCD6C8] rounded text-xs font-mono font-bold text-neutral-900 bg-white"
                        />
                      </div>

                      {!initialAssignment && (
                        <button
                          type="button"
                          onClick={() => removeCrewItem(c.crewId)}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded mt-3"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible Advanced Options (Sub-Events, POVs, Notes) */}
          <div className="border border-[#E8E3D9] rounded-lg overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-3 py-2 bg-[#FAF8F5] flex items-center justify-between text-neutral-700 hover:text-neutral-900 font-medium text-xs transition-colors"
            >
              <span>+ Tag Sub-Events, POVs or add Notes (Optional)</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </button>

            {showAdvanced && (
              <div className="p-3 space-y-3 border-t border-[#E8E3D9]">
                {event.subEvents && event.subEvents.length > 0 && (
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Assigned Ceremonies / Sub-Events
                    </label>
                    <div className="space-y-1 max-h-28 overflow-y-auto">
                      {event.subEvents.map(sub => (
                        <label key={sub.id} className="flex items-center gap-2 cursor-pointer text-neutral-800">
                          <input
                            type="checkbox"
                            checked={assignedSubEventIds.includes(sub.id)}
                            onChange={() => toggleSubEvent(sub.id)}
                            className="rounded text-[#C58B39] focus:ring-[#C58B39]"
                          />
                          <span className="font-medium">{sub.name}</span>
                          <span className="text-[10px] text-neutral-500">({sub.startTime})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {event.povs && event.povs.length > 0 && (
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Assigned Deliverable POVs
                    </label>
                    <div className="space-y-1 max-h-28 overflow-y-auto">
                      {event.povs.map(p => (
                        <label key={p.id} className="flex items-center gap-2 cursor-pointer text-neutral-800">
                          <input
                            type="checkbox"
                            checked={assignedPOVIds.includes(p.id)}
                            onChange={() => togglePOV(p.id)}
                            className="rounded text-[#C58B39] focus:ring-[#C58B39]"
                          />
                          <span className="font-semibold text-[10px] text-[#8C6428]">{p.type}:</span>
                          <span className="truncate">{p.description}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Special Instructions / Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Lead gimbal operator, bride entrance focus..."
                    className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E8E3D9] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-neutral-600 hover:text-neutral-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedCrew.length === 0}
              className={`px-5 py-2 text-white font-semibold rounded-lg transition-all shadow-xs flex items-center gap-1.5 ${
                selectedCrew.length === 0
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-[#181818] hover:bg-black'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>
                {initialAssignment
                  ? 'Update Assignment'
                  : selectedCrew.length === 0
                  ? 'Select Crew to Deploy'
                  : `Deploy ${selectedCrew.length} Creator${selectedCrew.length > 1 ? 's' : ''}`}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
