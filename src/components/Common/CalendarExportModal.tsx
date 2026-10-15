import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Smartphone, 
  Download, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Share2,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { EventShoot, CrewMember } from '../../types';
import { 
  exportShootToAppleCalendar, 
  exportShootToGoogleCalendar, 
  exportAllShootsToICS, 
  downloadICSFile, 
  generateICSContent 
} from '../../utils/calendarExport';

interface CalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: EventShoot | null;
  shoot?: EventShoot | null;
  allEvents?: EventShoot[];
  allShoots?: EventShoot[];
  crewMember?: CrewMember;
  title?: string;
}

export const CalendarExportModal: React.FC<CalendarExportModalProps> = ({
  isOpen,
  onClose,
  event: propEvent,
  shoot: propShoot,
  allEvents: propAllEvents,
  allShoots: propAllShoots,
  crewMember,
  title = 'Export Shoots to Calendar'
}) => {
  const event = propEvent || propShoot || null;
  const allEvents = propAllEvents || propAllShoots || [];
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentEvent = event || allEvents[0];
  const totalCount = allEvents.length > 0 ? allEvents.length : event ? 1 : 0;

  const handleAppleExportSingle = () => {
    if (!currentEvent) return;
    exportShootToAppleCalendar(currentEvent, crewMember);
    setDownloadSuccess('apple-single');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleGoogleExportSingle = () => {
    if (!currentEvent) return;
    exportShootToGoogleCalendar(currentEvent, crewMember);
  };

  const handleBulkExport = () => {
    const list = allEvents.length > 0 ? allEvents : event ? [event] : [];
    if (list.length === 0) return;
    const prefix = crewMember ? `tmc_${crewMember.name.toLowerCase().replace(/\s+/g, '_')}` : 'tmc_production';
    exportAllShootsToICS(list, crewMember, prefix);
    setDownloadSuccess('bulk');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-md bg-white border border-[#E8E3D9] rounded-2xl shadow-2xl overflow-hidden z-10 space-y-0">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-[#1C1A18] to-[#121212] text-white flex items-center justify-between border-b border-[#2A2825]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25221F] border border-[#C58B39]/50 flex items-center justify-center text-[#C58B39]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C58B39] font-bold block">
                Sync to Device
              </span>
              <h2 className="font-serif text-lg font-bold text-white tracking-tight">
                {title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shoot Preview Pill */}
        {currentEvent && (
          <div className="px-5 py-3.5 bg-[#FAF8F5] border-b border-[#E8E3D9] text-xs">
            <span className="text-[10px] font-mono text-[#8C6428] uppercase font-bold block">
              Target Shoot
            </span>
            <div className="font-serif font-bold text-sm text-neutral-900 mt-0.5 truncate">
              {currentEvent.eventName}
            </div>
            <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
              <span>📅 {currentEvent.startDate || (currentEvent as any).shootDate}</span>
              <span>·</span>
              <span className="truncate">📍 {currentEvent.venue}</span>
            </div>
          </div>
        )}

        {/* Options Content */}
        <div className="p-5 space-y-4">
          
          <div className="space-y-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold block">
              Select Your Mobile Device / Calendar
            </span>

            {/* 1. iPhone / Apple Calendar (iOS) */}
            <button
              type="button"
              onClick={handleAppleExportSingle}
              className="w-full p-3.5 bg-white hover:bg-[#FAF8F5] border border-[#E8E3D9] hover:border-[#C58B39] rounded-xl flex items-center justify-between transition-all group text-left shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0 font-bold text-lg">
                  
                </div>
                <div>
                  <div className="font-semibold text-xs text-neutral-900 group-hover:text-black flex items-center gap-1.5">
                    <span>iPhone / Apple Calendar (iOS)</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-neutral-100 rounded text-neutral-600 font-mono">.ics</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    1-tap native calendar prompt on iPhone, iPad & Mac
                  </div>
                </div>
              </div>

              {downloadSuccess === 'apple-single' ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </span>
              ) : (
                <Download className="w-4 h-4 text-neutral-400 group-hover:text-[#C58B39] shrink-0" />
              )}
            </button>

            {/* 2. Android / Google Calendar */}
            <button
              type="button"
              onClick={handleGoogleExportSingle}
              className="w-full p-3.5 bg-white hover:bg-[#FAF8F5] border border-[#E8E3D9] hover:border-[#C58B39] rounded-xl flex items-center justify-between transition-all group text-left shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-neutral-900 group-hover:text-black flex items-center gap-1.5">
                    <span>Android / Google Calendar</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded font-mono">Instant</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Opens directly in Google Calendar app on Android
                  </div>
                </div>
              </div>

              <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-[#C58B39] shrink-0" />
            </button>
          </div>

          {/* Bulk Export Option if multiple shoots exist */}
          {allEvents.length > 1 && (
            <div className="pt-2 border-t border-[#F0ECE1]">
              <button
                type="button"
                onClick={handleBulkExport}
                className="w-full p-3 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DCD6C8] rounded-xl flex items-center justify-between transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-[#C58B39]" />
                  <div>
                    <div className="font-semibold text-xs text-neutral-900">
                      Export All {allEvents.length} Shoots (.ics)
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Sync entire schedule to iPhone or Android in 1 file
                    </div>
                  </div>
                </div>

                {downloadSuccess === 'bulk' ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Downloaded!
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-[#8C6428]">
                    {allEvents.length} Shoots
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Quick instructions pill */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
            <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>How it works:</span>
            </div>
            <ul className="list-disc list-inside text-[10px] text-neutral-500 space-y-0.5">
              <li><strong>iPhone (iOS):</strong> Tap , your iPhone will ask <em>"Add to Calendar"</em>.</li>
              <li><strong>Android:</strong> Tap Google Calendar, your phone opens the pre-filled event.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
