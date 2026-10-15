import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  User, 
  Sparkles,
  Layers,
  MessageCircle,
  PlayCircle,
  Smartphone
} from 'lucide-react';
import { EventShoot, CrewMember, POVItem, POVStatus, SubEvent, TimelineItem } from '../../types';
import { StorageService, formatWhatsAppNumber } from '../../services/storage';
import { CalendarExportModal } from '../Common/CalendarExportModal';

interface CrewShootDetailViewProps {
  event: EventShoot;
  activeCrew: CrewMember;
  onBack: () => void;
  onRefreshData: () => void;
}

export const CrewShootDetailView: React.FC<CrewShootDetailViewProps> = ({
  event,
  activeCrew,
  onBack,
  onRefreshData
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'povs' | 'timeline' | 'crew'>('all');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const crewAssignment = (event.crewAssignments || []).find(a => a.crewId === activeCrew.id);
  const myRole = crewAssignment?.role || activeCrew.role;
  const myCallTime = crewAssignment?.callTime || event.shootTime?.split('-')[0]?.trim() || '08:00 AM';
  const myWrapTime = crewAssignment?.wrapTime || event.shootTime?.split('-')[1]?.trim() || 'Wrap';

  const allCrew = StorageService.getCrewRoster();
  const assignedCrewMembers = (event.crewAssignments && event.crewAssignments.length > 0)
    ? event.crewAssignments.map(a => {
        const found = allCrew.find(c => c.id === a.crewId);
        return {
          id: a.crewId,
          name: a.crewName || found?.name || 'Crew Member',
          role: a.role || found?.role || 'Crew',
          phone: found?.phone || '',
          callTime: a.callTime
        };
      })
    : (event.crewMembers || []).map(name => {
        const found = allCrew.find(c => c.name.toLowerCase() === name.toLowerCase());
        return {
          id: found?.id || `cr-${name}`,
          name,
          role: found?.role || 'Crew Member',
          phone: found?.phone || '',
          callTime: myCallTime
        };
      });

  const handleUpdateMyPOV = (povId: string, newStatus: POVStatus) => {
    const success = StorageService.updatePOVStatus(event.id, povId, newStatus, activeCrew.id);
    if (success) {
      setStatusNotification(`POV updated to "${newStatus}"`);
      setTimeout(() => setStatusNotification(null), 3000);
      onRefreshData();
    }
  };

  const handleOpenMaps = () => {
    const query = encodeURIComponent(`${event.venue}, ${event.locationCity || event.city || ''}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleCallCrew = (phone: string) => {
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsAppColleague = (phone: string, name: string) => {
    if (!phone) return;
    const formatted = formatWhatsAppNumber(phone);
    const msg = `Hi ${name.split(' ')[0]}, on site at ${event.venue} for ${event.eventName}. What's your status?`;
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Filter POVs assigned to this crew member or all
  const myPOVs = (event.povs || []).filter(p => !p.assignedCrewId || p.assignedCrewId === activeCrew.id);
  const otherPOVs = (event.povs || []).filter(p => p.assignedCrewId && p.assignedCrewId !== activeCrew.id);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 text-neutral-900 animate-in fade-in duration-150">
      
      {/* Top Mobile Sticky Header */}
      <div className="sticky top-0 z-30 bg-[#121212] text-white px-4 py-3 border-b border-[#222222] flex items-center justify-between shadow-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#C58B39] font-medium py-1 px-2 rounded-lg bg-white/5 active:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center font-serif text-sm font-bold truncate max-w-[200px] text-neutral-200">
          {event.eventName}
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold uppercase">
          {event.status}
        </span>
      </div>

      {/* Floating Status Toast */}
      {statusNotification && (
        <div className="fixed top-16 left-4 right-4 z-40 bg-emerald-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xl flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        
        {/* Prominent Shoot Overview Card */}
        <div className="bg-white border border-[#E8E3D9] rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#C58B39] font-bold">
              {event.eventType} Shoot Dossier
            </div>
            <h1 className="font-serif text-2xl font-bold text-neutral-900 tracking-tight mt-0.5">
              {event.eventName}
            </h1>
            <div className="text-xs text-neutral-500 mt-0.5">
              Client: <strong className="text-neutral-700">{event.clientName}</strong>
            </div>
          </div>

          {/* Vitals Grid with Big Call Time */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#F0EBE1]">
            <div className="bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl p-3">
              <div className="text-[10px] uppercase font-mono text-neutral-500 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C58B39]" />
                <span>Your Call Time</span>
              </div>
              <div className="font-mono text-lg font-bold text-neutral-900 mt-1">
                {myCallTime}
              </div>
              <div className="text-[10px] text-neutral-500">Wrap: {myWrapTime}</div>
            </div>

            <div className="bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl p-3">
              <div className="text-[10px] uppercase font-mono text-neutral-500 font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#C58B39]" />
                <span>Shoot Date</span>
              </div>
              <div className="font-serif font-bold text-sm text-neutral-900 mt-1">
                {new Date(event.startDate || event.shootDate || '').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div className="text-[10px] text-neutral-500">{new Date(event.startDate || event.shootDate || '').toLocaleDateString('en-IN', { weekday: 'long' })}</div>
            </div>
          </div>

          {/* Venue & Maps Action */}
          <div className="bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#C58B39] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="font-bold text-xs text-neutral-900">{event.venue}</div>
                <div className="text-[11px] text-neutral-500">{event.locationCity || event.city || 'Mumbai, India'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleOpenMaps}
                className="py-2.5 px-3 bg-[#121212] hover:bg-[#252525] active:scale-[0.98] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-transform shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#C58B39]" />
                <span>Maps & Venue</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="py-2.5 px-3 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#C58B39] text-[#8C6222] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#C58B39]" />
                <span>Add to Calendar</span>
              </button>
            </div>
          </div>

          {/* Your Assigned Role & Payout */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Your Role:</span>
              <span className="font-bold text-neutral-900 bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E8E3D9]">
                {myRole}
              </span>
            </div>

            {crewAssignment?.payout ? (
              <div className="text-neutral-600 font-mono text-[11px]">
                Payout: <strong className="text-neutral-900">₹{crewAssignment.payout.toLocaleString('en-IN')}</strong>
              </div>
            ) : null}
          </div>
        </div>

        {/* Sub-Events List (e.g. Haldi, Mehendi, Sangeet, Wedding) */}
        {event.subEvents && event.subEvents.length > 0 && (
          <div className="bg-white border border-[#E8E3D9] rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-serif font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#C58B39]" />
                <span>Ceremonies & Sub-Events ({event.subEvents.length})</span>
              </div>
            </div>

            <div className="space-y-2">
              {event.subEvents.map((sub, idx) => (
                <div key={sub.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D9] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900">{sub.name}</span>
                    <span className="font-mono text-[11px] text-[#C58B39] font-medium">{sub.startTime} - {sub.endTime}</span>
                  </div>
                  <div className="text-neutral-500 text-[11px] mt-1 flex items-center justify-between">
                    <span>📍 {sub.venue || event.venue}</span>
                    <span>{sub.date ? new Date(sub.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}</span>
                  </div>
                  {sub.description && (
                    <div className="text-[11px] text-neutral-600 mt-1.5 font-light bg-white p-2 rounded border border-[#E8E3D9]/60">
                      {sub.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Vertical Timeline */}
        {event.timeline && event.timeline.length > 0 && (
          <div className="bg-white border border-[#E8E3D9] rounded-2xl p-4 shadow-xs space-y-3">
            <div className="font-serif font-bold text-sm text-neutral-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#C58B39]" />
              <span>Production Timeline / Run-of-Show</span>
            </div>

            <div className="relative pl-4 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8E3D9]">
              {event.timeline.map((item, idx) => (
                <div key={item.id} className="relative pl-3 text-xs">
                  {/* Timeline bullet */}
                  <div className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full bg-[#C58B39] ring-4 ring-white" />
                  
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono font-bold text-[#C58B39] text-[11px]">{item.time}</span>
                    {item.priority === 'Critical' && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold">
                        Critical
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-neutral-900 text-xs mt-0.5">{item.title}</div>
                  {item.description && (
                    <div className="text-neutral-600 text-[11px] mt-0.5">{item.description}</div>
                  )}
                  {item.venue && (
                    <div className="text-[10px] text-neutral-400 mt-0.5">📍 {item.venue}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dedicated POVs / Content Tasks Section */}
        <div className="bg-white border border-[#E8E3D9] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-serif font-bold text-sm text-neutral-900 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#C58B39]" />
              <span>Your Assigned POVs & Shot Queue</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-500 font-medium">
              {myPOVs.filter(p => p.status === 'Captured' || p.status === 'Delivered').length} / {myPOVs.length} Done
            </span>
          </div>

          {myPOVs.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500 bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E3D9]">
              No individual POVs assigned specifically to your queue yet. Follow the general timeline.
            </div>
          ) : (
            <div className="space-y-3">
              {myPOVs.map(pov => {
                const isCaptured = pov.status === 'Captured' || pov.status === 'Delivered';
                const isInProgress = pov.status === 'In Progress';

                return (
                  <div
                    key={pov.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCaptured 
                        ? 'bg-emerald-50/60 border-emerald-200' 
                        : isInProgress
                        ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300'
                        : 'bg-[#FAF8F5] border-[#E8E3D9]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-neutral-900 uppercase tracking-wide">
                            {pov.type}
                          </span>
                          {pov.priority === 'High' || pov.priority === 'Urgent' ? (
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                              {pov.priority} Priority
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs text-neutral-800 mt-1 font-medium leading-snug">
                          {pov.description}
                        </div>
                      </div>

                      {/* Status Tag */}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold whitespace-nowrap shrink-0 ${
                        isCaptured 
                          ? 'bg-emerald-600 text-white' 
                          : isInProgress 
                          ? 'bg-amber-600 text-white'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {pov.status}
                      </span>
                    </div>

                    {pov.shotNotes && (
                      <div className="mt-2 text-[11px] text-neutral-600 bg-white p-2 rounded-lg border border-[#E8E3D9]/60 flex items-start gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#C58B39] shrink-0 mt-0.5" />
                        <span>{pov.shotNotes}</span>
                      </div>
                    )}

                    {/* Crew Interactive POV Status Controls */}
                    <div className="mt-3 pt-2.5 border-t border-[#E8E3D9]/70 flex items-center justify-end gap-2">
                      {!isCaptured && !isInProgress && (
                        <button
                          onClick={() => handleUpdateMyPOV(pov.id, 'In Progress')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Mark In Progress</span>
                        </button>
                      )}

                      {!isCaptured && (
                        <button
                          onClick={() => handleUpdateMyPOV(pov.id, 'Captured')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Captured</span>
                        </button>
                      )}

                      {isCaptured && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Shot Captured & Stored</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Special Instructions & Notes */}
        {(event.notes || event.consentUsageNotes) && (
          <div className="bg-white border border-[#E8E3D9] rounded-2xl p-4 shadow-xs space-y-2 text-xs">
            <div className="font-serif font-bold text-sm text-neutral-900">
              Special Instructions & Client Notes
            </div>
            {event.notes && (
              <p className="text-neutral-700 bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E3D9] leading-relaxed">
                {event.notes}
              </p>
            )}
            {event.consentUsageNotes && (
              <div className="text-[11px] text-neutral-500 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                🔒 <strong>Usage / Consent Notes:</strong> {event.consentUsageNotes}
              </div>
            )}
          </div>
        )}

        {/* Assigned Crew On Site */}
        <div className="bg-white border border-[#E8E3D9] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="font-serif font-bold text-sm text-neutral-900 flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#C58B39]" />
            <span>Assigned Crew On Site ({assignedCrewMembers.length})</span>
          </div>

          <div className="space-y-2">
            {assignedCrewMembers.map((member) => (
              <div key={member.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D9] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <span>{member.name}</span>
                    {member.id === activeCrew.id && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#C58B39]/20 text-[#C58B39] font-semibold">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-500">{member.role} · Call: {member.callTime}</div>
                </div>

                {member.phone && member.id !== activeCrew.id && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCallCrew(member.phone)}
                      className="p-2 rounded-lg bg-white border border-[#E8E3D9] text-neutral-700 hover:text-black active:scale-95"
                      title="Call Phone"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleWhatsAppColleague(member.phone, member.name)}
                      className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 active:scale-95"
                      title="WhatsApp Colleague"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Export Modal (iOS & Android) */}
      <CalendarExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        event={event}
        crewMember={activeCrew}
        title="Sync Shoot to Phone Calendar"
      />
    </div>
  );
};
