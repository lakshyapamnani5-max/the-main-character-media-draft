import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Send, 
  Check, 
  ExternalLink, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Edit3, 
  RotateCcw, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { EventShoot, CrewMember, CrewReminderRecord } from '../../types';
import { StorageService, formatWhatsAppNumber } from '../../services/storage';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventShoot | null;
  onReminderLogged?: () => void;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  isOpen,
  onClose,
  event,
  onReminderLogged
}) => {
  const [roster, setRoster] = useState<CrewMember[]>([]);
  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>([]);
  const [activeCrewIndex, setActiveCrewIndex] = useState<number>(0);
  const [customMessages, setCustomMessages] = useState<Record<string, string>>({});
  const [remindedStatus, setRemindedStatus] = useState<Record<string, 'Prepared' | 'WhatsApp Opened' | 'Cancelled'>>({});
  const [adminName, setAdminName] = useState(() => StorageService.getCompanySettings().signatoryName || 'Production Lead');
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      const allCrew = StorageService.getCrewRoster();
      setRoster(allCrew);

      // Find assigned crew members for this event
      const assignedIds = (event.crewAssignments && event.crewAssignments.length > 0)
        ? event.crewAssignments.map(a => a.crewId)
        : (event.crewMembers || []).map(name => {
            const found = allCrew.find(c => c.name.toLowerCase() === name.toLowerCase());
            return found ? found.id : '';
          }).filter(Boolean);

      // Unique crew IDs
      const uniqueIds = Array.from(new Set(assignedIds));
      setSelectedCrewIds(uniqueIds);
      setActiveCrewIndex(0);

      // Pre-fill existing reminder status
      const existingStatus: Record<string, 'Prepared' | 'WhatsApp Opened' | 'Cancelled'> = {};
      (event.crewReminders || []).forEach(r => {
        existingStatus[r.crewId] = r.status;
      });
      setRemindedStatus(existingStatus);

      // Pre-generate custom messages using settings template
      const settings = StorageService.getReminderSettings();
      const initialMessages: Record<string, string> = {};

      uniqueIds.forEach(id => {
        const crew = allCrew.find(c => c.id === id);
        if (crew) {
          const assignment = (event.crewAssignments || []).find(a => a.crewId === id);
          const role = assignment?.role || crew.role;
          const callTime = assignment?.callTime || event.shootTime?.split('-')[0]?.trim() || '08:00 AM';
          const eventDate = event.startDate || event.shootDate || 'Upcoming Date';
          const mapLink = `https://maps.google.com/?q=${encodeURIComponent(event.venue + ' ' + (event.locationCity || event.city || ''))}`;

          let msg = settings.defaultTemplate
            .replace(/{CREW_NAME}/g, crew.name.split(' ')[0])
            .replace(/{EVENT_NAME}/g, event.eventName)
            .replace(/{EVENT_TYPE}/g, event.eventType)
            .replace(/{EVENT_DATE}/g, new Date(eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }))
            .replace(/{CALL_TIME}/g, callTime)
            .replace(/{VENUE}/g, `${event.venue}, ${event.locationCity || event.city || 'Mumbai'}`)
            .replace(/{ROLE}/g, role)
            .replace(/{MAP_LINK}/g, mapLink);

          initialMessages[id] = msg;
        }
      });

      setCustomMessages(initialMessages);
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const assignedCrewObjects = selectedCrewIds.map(id => {
    const crew = roster.find(c => c.id === id);
    const assignment = (event.crewAssignments || []).find(a => a.crewId === id);
    return {
      id,
      name: crew ? crew.name : 'Unknown Crew',
      phone: crew ? crew.phone : '',
      role: assignment?.role || crew?.role || 'Production Crew',
      callTime: assignment?.callTime || event.shootTime?.split('-')[0]?.trim() || '08:00 AM',
      payout: assignment?.payout || crew?.defaultPayout || 0
    };
  });

  const currentCrew = assignedCrewObjects[activeCrewIndex] || assignedCrewObjects[0];

  const handleToggleCrewSelection = (crewId: string) => {
    setSelectedCrewIds(prev => 
      prev.includes(crewId) ? prev.filter(id => id !== crewId) : [...prev, crewId]
    );
  };

  const handleOpenWhatsApp = (crewId: string) => {
    const crew = roster.find(c => c.id === crewId);
    if (!crew || !crew.phone) return;

    const message = customMessages[crewId] || '';
    const formattedPhone = formatWhatsAppNumber(crew.phone);
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    // Log the reminder in system
    const reminderRecord: CrewReminderRecord = {
      id: `rem-${Date.now()}-${crewId}`,
      eventId: event.id,
      crewId,
      crewName: crew.name,
      phone: crew.phone,
      role: (event.crewAssignments || []).find(a => a.crewId === crewId)?.role || crew.role,
      message,
      timestamp: new Date().toISOString(),
      adminName,
      status: 'WhatsApp Opened'
    };

    StorageService.saveCrewReminder(reminderRecord);
    setRemindedStatus(prev => ({ ...prev, [crewId]: 'WhatsApp Opened' }));

    // Send push notification into crew's in-app inbox too
    StorageService.addCrewNotification({
      crewId,
      title: `Shoot Reminder: ${event.eventName}`,
      message: `Call time: ${(event.crewAssignments || []).find(a => a.crewId === crewId)?.callTime || '08:00 AM'} at ${event.venue}. Review your assigned POVs.`,
      type: 'call_time_changed',
      eventId: event.id
    });

    if (onReminderLogged) onReminderLogged();

    // Open WhatsApp (app on mobile or Web on desktop)
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleRemindAllStepByStep = () => {
    if (assignedCrewObjects.length === 0) return;
    handleOpenWhatsApp(currentCrew.id);
    if (activeCrewIndex < assignedCrewObjects.length - 1) {
      setActiveCrewIndex(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-[#E8E3D9] max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E3D9] bg-[#121212] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#C58B39] uppercase font-semibold">
                Semi-Automated WhatsApp Dispatch
              </div>
              <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Crew Shoot Reminder</span>
                <span className="text-xs font-normal text-neutral-400 font-sans">· {event.eventName}</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FAF8F5]">
          
          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Semi-Automated Dispatch:</span> Clicking "Open WhatsApp" opens WhatsApp with the pre-filled message. Per WhatsApp privacy rules, admin must press <strong>Send</strong> inside WhatsApp.
            </div>
          </div>

          {/* Event Quick Snapshot */}
          <div className="bg-white border border-[#E8E3D9] rounded-lg p-3.5 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-neutral-500 font-medium">Event & Type</div>
              <div className="font-serif font-bold text-neutral-900 text-sm mt-0.5">{event.eventName}</div>
              <div className="text-[11px] text-neutral-500">{event.eventType}</div>
            </div>
            <div>
              <div className="text-neutral-500 font-medium">Shoot Date</div>
              <div className="font-medium text-neutral-900 mt-0.5">
                {new Date(event.startDate || event.shootDate || '').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div className="text-[11px] text-[#C58B39] font-medium">Call: {event.shootTime?.split('-')[0]?.trim() || '08:00 AM'}</div>
            </div>
            <div>
              <div className="text-neutral-500 font-medium">Venue Location</div>
              <div className="font-medium text-neutral-900 truncate mt-0.5">{event.venue}</div>
              <div className="text-[11px] text-neutral-500">{event.locationCity || event.city || 'Mumbai'}</div>
            </div>
            <div>
              <div className="text-neutral-500 font-medium">Assigned Crew</div>
              <div className="font-bold text-neutral-900 text-sm mt-0.5">{assignedCrewObjects.length} Members</div>
              <div className="text-[11px] text-emerald-700 font-medium">
                {Object.values(remindedStatus).filter(s => s === 'WhatsApp Opened').length} Dispatched
              </div>
            </div>
          </div>

          {/* Assigned Crew Selection Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-800 uppercase tracking-wider text-[11px]">
                1. Select Assigned Crew to Remind
              </span>
              <span className="text-neutral-500 text-[11px]">
                {selectedCrewIds.length} of {assignedCrewObjects.length} selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {assignedCrewObjects.map((c, index) => {
                const isSelected = selectedCrewIds.includes(c.id);
                const isActive = activeCrewIndex === index;
                const status = remindedStatus[c.id];

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveCrewIndex(index);
                      if (!isSelected) handleToggleCrewSelection(c.id);
                    }}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isActive 
                        ? 'border-[#C58B39] bg-white ring-2 ring-[#C58B39]/20 shadow-xs'
                        : isSelected
                        ? 'border-[#E8E3D9] bg-white hover:border-[#D5CEBF]'
                        : 'border-[#E8E3D9]/60 bg-neutral-100/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleCrewSelection(c.id);
                          }}
                          className="w-4 h-4 rounded text-[#C58B39] focus:ring-[#C58B39] cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-xs text-neutral-900">{c.name}</div>
                          <div className="text-[11px] text-neutral-500">{c.role}</div>
                        </div>
                      </div>

                      {status === 'WhatsApp Opened' ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          ✓ Opened
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                      <span>Call: {c.callTime}</span>
                      <span>{c.phone || 'No phone'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message Preview & Variable Replacement Editor */}
          {currentCrew && (
            <div className="bg-white border border-[#E8E3D9] rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-xs text-neutral-800">
                    2. WhatsApp Message Preview for <span className="text-[#C58B39] font-bold">{currentCrew.name}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
                  <span>To: {formatWhatsAppNumber(currentCrew.phone) ? `+${formatWhatsAppNumber(currentCrew.phone)}` : 'Phone Missing'}</span>
                </div>
              </div>

              {/* Message Box */}
              <div className="relative">
                <textarea
                  value={customMessages[currentCrew.id] || ''}
                  onChange={(e) => {
                    const newMsg = e.target.value;
                    setCustomMessages(prev => ({ ...prev, [currentCrew.id]: newMsg }));
                  }}
                  rows={9}
                  className="w-full text-xs font-mono bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg p-3 text-neutral-800 leading-relaxed focus:bg-white focus:border-[#C58B39] focus:outline-none focus:ring-1 focus:ring-[#C58B39]"
                  placeholder="Type or customize reminder message..."
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C58B39]" />
                  <span>Variables Supported: &#123;CREW_NAME&#125;, &#123;EVENT_NAME&#125;, &#123;CALL_TIME&#125;, &#123;VENUE&#125;, &#123;ROLE&#125;, &#123;MAP_LINK&#125;</span>
                </div>

                <div className="text-[11px] text-neutral-400 font-mono">
                  Sender: {adminName} (Admin)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-[#E8E3D9] bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <span>Status:</span>
            <span className="font-mono font-medium text-neutral-900">
              {Object.values(remindedStatus).filter(s => s === 'WhatsApp Opened').length} / {assignedCrewObjects.length} dispatched
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Cancel
            </button>

            {currentCrew && (
              <button
                onClick={() => handleOpenWhatsApp(currentCrew.id)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Open WhatsApp ({currentCrew.name.split(' ')[0]})</span>
              </button>
            )}

            {assignedCrewObjects.length > 1 && (
              <button
                onClick={handleRemindAllStepByStep}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-900 bg-[#C58B39]/20 hover:bg-[#C58B39]/30 border border-[#C58B39]/40 rounded-lg transition-colors"
                title="Cycles through each crew member and opens WhatsApp sequentially"
              >
                <span>Remind Next Crew</span>
                <span className="text-[10px] font-mono">({activeCrewIndex + 1}/{assignedCrewObjects.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
