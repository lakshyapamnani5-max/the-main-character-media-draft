import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Smartphone
} from 'lucide-react';
import { EventShoot, CrewMember } from '../../types';
import { CalendarExportModal } from '../Common/CalendarExportModal';

interface CrewCalendarTabProps {
  activeCrew: CrewMember;
  allShoots: EventShoot[];
  onSelectShoot: (event: EventShoot) => void;
}

export const CrewCalendarTab: React.FC<CrewCalendarTabProps> = ({
  activeCrew,
  allShoots,
  onSelectShoot
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [eventToExport, setEventToExport] = useState<EventShoot | null>(null);

  // Month navigation
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Shoots assigned to active crew
  const myShoots = allShoots.filter(event => {
    return (event.crewAssignments && event.crewAssignments.some(a => a.crewId === activeCrew.id)) ||
      (event.crewMembers && event.crewMembers.some(name => name.toLowerCase() === activeCrew.name.toLowerCase()));
  });

  // Get booked dates set
  const bookedDatesSet = new Set<string>();
  myShoots.forEach(e => {
    const start = e.startDate || e.shootDate || '';
    const end = e.endDate || start;
    if (start) {
      bookedDatesSet.add(start);
      if (end && end !== start) {
        bookedDatesSet.add(end);
      }
    }
  });

  const shootsOnSelectedDate = myShoots.filter(e => {
    const start = e.startDate || e.shootDate || '';
    const end = e.endDate || start;
    return selectedDate >= start && selectedDate <= end;
  });

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-4 pb-6">
      
      {/* Title & Calendar Export Button */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="font-serif text-xl font-bold text-neutral-900 tracking-tight">
            Production Schedule & Calendar
          </h1>
          <p className="text-[11px] text-neutral-500">
            {myShoots.length} shoot{myShoots.length === 1 ? '' : 's'} booked on your schedule
          </p>
        </div>

        <button
          onClick={() => {
            setEventToExport(null);
            setIsExportModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#C58B39]/50 rounded-xl text-xs font-semibold text-[#8C6222] transition-colors shadow-2xs shrink-0"
          title="Export schedule to iPhone (iOS) or Android"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#C58B39]" />
          <span>Export (iOS / Android)</span>
        </button>
      </div>

      {/* Calendar Month Widget */}
      <div className="bg-white border border-[#E8E3D9] rounded-2xl p-4 shadow-xs space-y-3">
        {/* Month Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
          <div className="font-serif font-bold text-base text-neutral-900">
            {monthNames[month]} {year}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-[#E8E3D9] hover:bg-neutral-100 text-neutral-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-[#E8E3D9] hover:bg-neutral-100 text-neutral-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold text-neutral-400">
          <span>SU</span>
          <span>MO</span>
          <span>TU</span>
          <span>WE</span>
          <span>TH</span>
          <span>FR</span>
          <span>SA</span>
        </div>

        {/* Date Matrix */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-9" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isBooked = bookedDatesSet.has(dateStr);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-9 rounded-xl flex flex-col items-center justify-center relative transition-all ${
                  isSelected 
                    ? 'bg-[#121212] text-white font-bold shadow-xs ring-2 ring-[#C58B39]' 
                    : isBooked
                    ? 'bg-[#C58B39]/15 text-[#8F5F1B] font-bold border border-[#C58B39]/30'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>{dayNum}</span>
                {isBooked && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#C58B39]' : 'bg-[#C58B39]'}`} />
                )}
                {isToday && !isSelected && !isBooked && (
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Agenda for Selected Date */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono">
            Agenda: {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          </div>

          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
            shootsOnSelectedDate.length > 0 
              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          }`}>
            {shootsOnSelectedDate.length > 0 ? 'Booked for Shoot' : 'Available / Free'}
          </span>
        </div>

        {shootsOnSelectedDate.length === 0 ? (
          <div className="bg-white border border-[#E8E3D9] rounded-2xl p-6 text-center text-xs text-neutral-500 space-y-1">
            <div className="font-serif font-bold text-neutral-800 text-sm">
              No Productions Scheduled
            </div>
            <p className="text-[11px] text-neutral-400">
              You have no call times booked on this date.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {shootsOnSelectedDate.map(event => {
              const assignment = event.crewAssignments?.find(a => a.crewId === activeCrew.id);
              const callTime = assignment?.callTime || event.shootTime?.split('-')[0]?.trim() || '08:00 AM';

              return (
                <div
                  key={event.id}
                  onClick={() => onSelectShoot(event)}
                  className="bg-white border-2 border-[#C58B39] rounded-2xl p-4 shadow-xs space-y-3 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#C58B39] font-bold">
                        {event.eventType}
                      </span>
                      <h2 className="font-serif text-base font-bold text-neutral-900">
                        {event.eventName}
                      </h2>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Confirmed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E3D9]">
                    <div>
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">Call Time</div>
                      <div className="font-mono font-bold text-neutral-900 mt-0.5">{callTime}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">Venue</div>
                      <div className="font-medium text-neutral-900 truncate mt-0.5">{event.venue}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2">
                    <span className="text-xs text-neutral-600 truncate">
                      Role: <strong>{assignment?.role || activeCrew.role}</strong>
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEventToExport(event);
                          setIsExportModalOpen(true);
                        }}
                        className="py-1 px-2 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DCD6C8] rounded-lg text-[11px] font-semibold text-neutral-700 flex items-center gap-1 transition-colors"
                        title="Export this shoot to Phone Calendar"
                      >
                        <Smartphone className="w-3 h-3 text-[#C58B39]" />
                        <span>Sync</span>
                      </button>

                      <button
                        onClick={() => onSelectShoot(event)}
                        className="py-1 px-2.5 bg-[#121212] text-white rounded-lg text-[11px] font-semibold flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Calendar Export Modal (iOS & Android) */}
      <CalendarExportModal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setEventToExport(null);
        }}
        event={eventToExport}
        allEvents={myShoots}
        crewMember={activeCrew}
        title={eventToExport ? `Export ${eventToExport.eventName}` : 'Export My Shoots to Calendar'}
      />
    </div>
  );
};
