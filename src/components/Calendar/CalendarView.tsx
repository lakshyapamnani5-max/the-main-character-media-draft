import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Filter, 
  Eye, 
  UserCheck, 
  Sparkles,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { EventShoot, CrewMember, SubEvent } from '../../types';
import { CalendarExportModal } from '../Common/CalendarExportModal';
import { 
  formatYYYYMMDD, 
  getTodayDateString, 
  parseDateSafe, 
  formatDisplayDate, 
  formatFullDisplayDate 
} from '../../utils/dateUtils';

export type CalendarType = 'weddings' | 'functions' | 'crew';
export type CalendarViewMode = 'month' | 'week' | 'day';

interface CalendarViewProps {
  events: EventShoot[];
  crewRoster: CrewMember[];
  onSelectEvent: (event: EventShoot) => void;
  onOpenNewEvent: (initialDate?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  crewRoster,
  onSelectEvent,
  onOpenNewEvent
}) => {
  const [calendarType, setCalendarType] = useState<CalendarType>('weddings');
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  
  // Current calendar anchor date (anchor at 12:00 midday to prevent any midnight boundary shifts)
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [eventToExport, setEventToExport] = useState<EventShoot | null>(null);
  
  // Filter by crew member in crew calendar
  const [selectedCrewFilter, setSelectedCrewFilter] = useState<string>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Auto-jump to newly added event if added with a future or different date (e.g., 2027)
  const prevEventsLengthRef = useRef(events.length);
  useEffect(() => {
    if (events.length > prevEventsLengthRef.current) {
      // Find the most recently created or updated event
      const sorted = [...events].sort((a, b) => {
        const tA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const tB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return tB - tA;
      });
      const newest = sorted[0];
      const rawDate = newest?.startDate || (newest as any)?.shootDate;
      if (rawDate) {
        const clean = rawDate.split('T')[0].trim();
        const d = parseDateSafe(clean);
        setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0));
        setSelectedDate(clean);
      }
    }
    prevEventsLengthRef.current = events.length;
  }, [events]);

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1, 12, 0, 0));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
      setSelectedDate(formatYYYYMMDD(d.getFullYear(), d.getMonth() + 1, d.getDate()));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1, 12, 0, 0));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
      setSelectedDate(formatYYYYMMDD(d.getFullYear(), d.getMonth() + 1, d.getDate()));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0));
    setSelectedDate(getTodayDateString());
  };

  // Month grid calculations - Safe from any timezone offsets
  const monthGridDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1, 12, 0, 0).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0, 12, 0, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0, 12, 0, 0).getDate();

    const days: { dateString: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 12 : month; // 1-based
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      days.push({
        dateString: formatYYYYMMDD(prevYear, prevMonth, dayNum),
        dayNumber: dayNum,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        dateString: formatYYYYMMDD(year, month + 1, i),
        dayNumber: i,
        isCurrentMonth: true
      });
    }

    // Next month padding to fill grid to 35 or 42 cells
    const remaining = 42 - days.length;
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 1 : month + 2; // 1-based
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dateString: formatYYYYMMDD(nextYear, nextMonth, i),
        dayNumber: i,
        isCurrentMonth: false
      });
    }

    return days;
  }, [year, month]);

  // Helper to find events active on a specific date
  const getEventsForDate = (dateStr: string) => {
    return events.filter(e => {
      if (e.status === 'Cancelled' || e.status === 'Archived') return false;
      const rawStart = e.startDate || (e as any).shootDate || '';
      const start = rawStart.split('T')[0].trim();
      const rawEnd = e.endDate || start;
      const end = rawEnd.split('T')[0].trim();

      const matchesDate = (dateStr >= start && dateStr <= end) || start === dateStr;
      if (!matchesDate) return false;

      // Filter by crew member if in crew calendar
      if (calendarType === 'crew' && selectedCrewFilter !== 'all') {
        const isAssigned = e.crewAssignments && e.crewAssignments.some(a => a.crewId === selectedCrewFilter);
        const isNamed = e.crewMembers && e.crewMembers.includes(crewRoster.find(c => c.id === selectedCrewFilter)?.name || '');
        return isAssigned || isNamed;
      }

      return true;
    });
  };

  // Helper to find sub-events/ceremonies on a specific date
  const getSubEventsForDate = (dateStr: string) => {
    const list: { subEvent: SubEvent; parentEvent: EventShoot }[] = [];
    events.forEach(e => {
      if (e.status === 'Cancelled' || e.status === 'Archived') return;
      (e.subEvents || []).forEach(sub => {
        const subDate = (sub.date || e.startDate || (e as any).shootDate || '').split('T')[0].trim();
        if (subDate === dateStr) {
          list.push({ subEvent: sub, parentEvent: e });
        }
      });
    });
    return list;
  };

  // Selected date events
  const selectedDateEvents = getEventsForDate(selectedDate);
  const selectedDateSubEvents = getSubEventsForDate(selectedDate);

  // Week days - Anchored safely to Monday midday so dayNumber and dateString always match exactly
  const weekDays = useMemo(() => {
    const anchor = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 12, 0, 0);
    const day = anchor.getDay(); // 0 is Sunday
    const distanceToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(anchor);
    monday.setDate(anchor.getDate() + distanceToMonday);

    const days: { dateString: string; dayName: string; dayNumber: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dayNum = d.getDate();
      days.push({
        dateString: formatYYYYMMDD(d.getFullYear(), d.getMonth() + 1, dayNum),
        dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        dayNumber: dayNum
      });
    }
    return days;
  }, [currentDate]);

  // Summary of all scheduled shoots across all years (2026, 2027, etc.)
  const scheduledShootsByDate = useMemo(() => {
    return events
      .filter(e => e.status !== 'Cancelled' && e.status !== 'Archived')
      .map(e => {
        const start = (e.startDate || (e as any).shootDate || '').split('T')[0].trim();
        const d = parseDateSafe(start);
        return {
          event: e,
          dateStr: start,
          year: d.getFullYear(),
          month: d.getMonth(),
          monthName: monthNames[d.getMonth()],
          day: d.getDate()
        };
      })
      .filter(item => item.dateStr)
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [events]);

  const todayStr = getTodayDateString();

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header & Calendar Controls */}
      <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4">
        
        {/* Row 1: Title and Segmented Calendar Type */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#C58B39] font-semibold">
              Operations & Schedule
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-0.5 tracking-tight">
              Production Calendar
            </h1>
          </div>

          {/* Segmented Controls for Calendar Type */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setCalendarType('weddings')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                calendarType === 'weddings'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Wedding Calendar
            </button>

            <button
              onClick={() => setCalendarType('functions')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                calendarType === 'functions'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Ceremonies & Functions
            </button>

            <button
              onClick={() => setCalendarType('crew')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                calendarType === 'crew'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Crew Roster
            </button>
          </div>
        </div>

        {/* Row 2: Navigation (Month/Week/Day, Year & Month Jump, Prev/Next/Today, + Add Shoot) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0EBE1]">
          
          {/* Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg overflow-hidden">
              <button
                onClick={handlePrev}
                className="p-2 text-neutral-700 hover:bg-neutral-200 transition-colors"
                aria-label="Previous Period"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleToday}
                className="px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-200 border-x border-[#E8E3D9] transition-colors"
              >
                Today
              </button>

              <button
                onClick={handleNext}
                className="p-2 text-neutral-700 hover:bg-neutral-200 transition-colors"
                aria-label="Next Period"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Month & Year Selectors (allows instant jump to 2027, 2028, etc.) */}
            <div className="flex items-center gap-1.5">
              <select
                value={month}
                onChange={(e) => setCurrentDate(new Date(year, Number(e.target.value), 1, 12, 0, 0))}
                className="text-sm font-serif font-bold text-neutral-900 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C58B39] cursor-pointer"
                title="Select Month"
              >
                {monthNames.map((name, idx) => (
                  <option key={name} value={idx}>{name}</option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setCurrentDate(new Date(Number(e.target.value), month, 1, 12, 0, 0))}
                className="text-sm font-mono font-bold text-neutral-900 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C58B39] cursor-pointer"
                title="Select Year"
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* Quick Year Jump Pills */}
              <div className="hidden lg:flex items-center gap-1 bg-[#FAF8F5] p-1 border border-[#E8E3D9] rounded-lg text-xs font-mono">
                {[2026, 2027, 2028].map(y => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setCurrentDate(new Date(y, month, 1, 12, 0, 0))}
                    className={`px-2 py-0.5 rounded transition-all font-semibold ${
                      year === y 
                        ? 'bg-[#C58B39] text-white shadow-2xs' 
                        : 'text-neutral-600 hover:text-black hover:bg-neutral-200'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {viewMode === 'week' && (
              <span className="text-xs font-mono text-neutral-500 hidden sm:inline">
                Week {weekDays[0].dayNumber} {monthNames[parseDateSafe(weekDays[0].dateString).getMonth()]} - {weekDays[6].dayNumber} {monthNames[parseDateSafe(weekDays[6].dateString).getMonth()]}
              </span>
            )}
            {viewMode === 'day' && (
              <span className="text-xs font-mono text-neutral-500 hidden sm:inline">
                {formatDisplayDate(selectedDate)}
              </span>
            )}
          </div>

          {/* Right Controls: Crew Filter, View Mode, Export, Add Event */}
          <div className="flex flex-wrap items-center gap-2.5">
            {calendarType === 'crew' && (
              <select
                value={selectedCrewFilter}
                onChange={(e) => setSelectedCrewFilter(e.target.value)}
                className="text-xs bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg px-2.5 py-1.5 font-medium text-neutral-800 focus:outline-none focus:border-[#C58B39]"
              >
                <option value="all">All Crew Members ({crewRoster.length})</option>
                {crewRoster.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                ))}
              </select>
            )}

            {/* View Mode Segmented */}
            <div className="flex items-center gap-0.5 p-0.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-xs font-medium">
              {(['month', 'week', 'day'] as CalendarViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2.5 py-1 rounded capitalize transition-all ${
                    viewMode === mode
                      ? 'bg-white text-neutral-900 font-bold shadow-2xs border border-[#E8E3D9]'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Export to Calendar (iOS / Android) */}
            <button
              type="button"
              onClick={() => {
                setEventToExport(null);
                setIsExportModalOpen(true);
              }}
              className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#C58B39]/60 text-[#8C6222] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Export shoots to iPhone (iOS) or Android Phone Calendar"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#C58B39]" />
              <span className="hidden sm:inline">Export (iOS / Android)</span>
              <span className="sm:hidden">Export</span>
            </button>

            <button
              onClick={() => onOpenNewEvent(selectedDate)}
              className="px-3.5 py-1.5 bg-[#C58B39] hover:bg-[#B37B2E] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Add Shoot</span>
            </button>
          </div>

        </div>

        {/* Row 3: Quick Jump Bar for Scheduled Shoots (2026, 2027, etc.) */}
        {scheduledShootsByDate.length > 0 && (
          <div className="pt-2.5 border-t border-[#F0EBE1] flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <CalendarIcon className="w-3 h-3 text-[#C58B39]" />
              <span>Booked Shoots:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-nowrap">
              {scheduledShootsByDate.map(item => {
                const isCurrentMonthView = item.year === year && item.month === month;
                return (
                  <button
                    key={item.event.id}
                    onClick={() => {
                      setCurrentDate(new Date(item.year, item.month, 1, 12, 0, 0));
                      setSelectedDate(item.dateStr);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all border ${
                      isCurrentMonthView && selectedDate === item.dateStr
                        ? 'bg-[#181818] text-white border-[#181818] font-bold shadow-2xs'
                        : item.year >= 2027
                        ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 font-semibold'
                        : 'bg-white text-neutral-700 border-[#E8E3D9] hover:bg-[#FAF8F5]'
                    }`}
                    title={`Jump to ${item.event.eventName} on ${item.dateStr}`}
                  >
                    <span className="font-mono font-bold text-[10px] text-[#C58B39]">
                      {item.day} {item.monthName.slice(0, 3)} '{String(item.year).slice(2)}
                    </span>
                    <span className="truncate max-w-[130px]">{item.event.eventName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* VIEW MODE: MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white border border-[#E8E3D9] rounded-xl shadow-xs overflow-hidden">
          
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-[#E8E3D9] bg-[#FAF8F5] text-center text-xs font-mono font-semibold text-neutral-600 py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#E8E3D9]">
            {monthGridDays.map((cell, idx) => {
              const cellEvents = getEventsForDate(cell.dateString);
              const cellSubEvents = getSubEventsForDate(cell.dateString);
              const isToday = cell.dateString === todayStr;
              const isSelected = cell.dateString === selectedDate;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(cell.dateString)}
                  className={`min-h-[100px] sm:min-h-[125px] p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                    !cell.isCurrentMonth ? 'bg-neutral-50/60 text-neutral-400' : 'bg-white text-neutral-900'
                  } ${isSelected ? 'ring-2 ring-[#C58B39] ring-inset z-10' : 'hover:bg-[#FAF8F5]'}`}
                >
                  {/* Date Number Header */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                      isToday 
                        ? 'bg-[#121212] text-white font-bold' 
                        : isSelected 
                        ? 'bg-[#C58B39] text-white' 
                        : ''
                    }`}>
                      {cell.dayNumber}
                    </span>

                    <div className="flex items-center gap-1">
                      {cellEvents.length > 0 && (
                        <span className="text-[10px] font-mono text-neutral-500 font-medium hidden sm:inline">
                          {cellEvents.length} shoot{cellEvents.length > 1 ? 's' : ''}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(cell.dateString);
                          onOpenNewEvent(cell.dateString);
                        }}
                        className="w-5 h-5 rounded hover:bg-[#F2ECE1] text-neutral-400 hover:text-[#C58B39] flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                        title={`Add shoot on ${cell.dateString}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Event Chips inside cell */}
                  <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[85px]">
                    {calendarType === 'weddings' && cellEvents.slice(0, 2).map(ev => {
                      const totalCrew = ev.crewAssignments?.length || ev.crewMembers?.length || 0;
                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(ev);
                          }}
                          className="px-1.5 py-1 rounded bg-[#FAF8F5] border border-[#E8E3D9] hover:border-[#C58B39] text-[10px] text-neutral-900 font-medium truncate flex items-center justify-between gap-1 shadow-2xs"
                          title={`${ev.eventName} - ${ev.venue}`}
                        >
                          <span className="truncate">{ev.eventName}</span>
                          <span className="text-[9px] font-mono text-[#C58B39] font-bold shrink-0">{totalCrew}C</span>
                        </div>
                      );
                    })}

                    {calendarType === 'functions' && cellSubEvents.slice(0, 2).map(({ subEvent, parentEvent }) => (
                      <div
                        key={subEvent.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(parentEvent);
                        }}
                        className="px-1.5 py-1 rounded bg-amber-50/70 border border-amber-200 hover:border-amber-400 text-[10px] text-amber-950 font-medium truncate flex items-center justify-between gap-1 shadow-2xs"
                        title={`${subEvent.name} (${subEvent.startTime}) - ${parentEvent.eventName}`}
                      >
                        <span className="truncate">{subEvent.name}</span>
                        <span className="text-[9px] font-mono text-amber-800 shrink-0">{subEvent.startTime}</span>
                      </div>
                    ))}

                    {calendarType === 'crew' && cellEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(ev);
                        }}
                        className="px-1.5 py-1 rounded bg-emerald-50/70 border border-emerald-200 hover:border-emerald-400 text-[10px] text-emerald-950 font-medium truncate flex items-center justify-between gap-1 shadow-2xs"
                        title={`${ev.eventName} - ${ev.venue}`}
                      >
                        <span className="truncate">{ev.eventName}</span>
                      </div>
                    ))}

                    {cellEvents.length > 2 && (
                      <div className="text-[9px] font-mono text-neutral-400 text-center">
                        +{cellEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW MODE: WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white border border-[#E8E3D9] rounded-xl shadow-xs overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[#E8E3D9] bg-[#FAF8F5] text-center divide-x divide-[#E8E3D9]">
            {weekDays.map(day => {
              const isToday = day.dateString === todayStr;
              const isSelected = day.dateString === selectedDate;
              return (
                <div 
                  key={day.dateString}
                  onClick={() => setSelectedDate(day.dateString)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-white font-bold ring-2 ring-[#C58B39] ring-inset' : 'hover:bg-neutral-100'
                  }`}
                >
                  <div className="text-xs font-mono text-neutral-500 uppercase">{day.dayName}</div>
                  <div className={`mt-1 font-serif text-lg ${isToday ? 'text-[#C58B39] font-bold' : 'text-neutral-900'}`}>
                    {day.dayNumber}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                    {parseDateSafe(day.dateString).toLocaleDateString('en-IN', { month: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 divide-x divide-[#E8E3D9] min-h-[350px] p-2 bg-neutral-50/30">
            {weekDays.map(day => {
              const dayEvents = getEventsForDate(day.dateString);
              return (
                <div key={day.dateString} className="p-1 space-y-2">
                  {dayEvents.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => onSelectEvent(ev)}
                      className="p-2 rounded-lg bg-white border border-[#E8E3D9] hover:border-[#C58B39] shadow-2xs text-xs space-y-1 cursor-pointer transition-all"
                    >
                      <div className="font-bold text-neutral-900 truncate">{ev.eventName}</div>
                      <div className="text-[10px] text-neutral-500 font-mono truncate">
                        {ev.crewAssignments?.[0]?.callTime || ev.shootTime || '08:00 AM'}
                      </div>
                      <div className="text-[10px] text-neutral-600 truncate">📍 {ev.venue}</div>
                    </div>
                  ))}

                  {dayEvents.length === 0 && (
                    <div className="text-[11px] text-neutral-400 text-center py-6 font-mono">
                      Clear
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SELECTED DATE RUN-OF-SHOW & DOSSIER (Always visible or in Day View) */}
      <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EBE1] pb-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#C58B39] font-semibold">
              Selected Day Run-of-Show
            </div>
            <h2 className="font-serif text-xl font-bold text-neutral-900 mt-0.5">
              {formatFullDisplayDate(selectedDate)}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenNewEvent(selectedDate)}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>Schedule Shoot on this Date</span>
            </button>
          </div>
        </div>

        {selectedDateEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedDateEvents.map(event => {
              const callTime = event.crewAssignments?.[0]?.callTime || event.shootTime?.split('-')[0]?.trim() || '08:00 AM';
              const totalCrew = event.crewAssignments?.length || event.crewMembers?.length || 0;

              return (
                <div 
                  key={event.id}
                  className="p-4 rounded-xl border border-[#E8E3D9] bg-[#FAF8F5] hover:bg-white transition-all space-y-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#C58B39] font-bold">
                        {event.eventType} Shoot
                      </div>
                      <h3 className="font-serif text-lg font-bold text-neutral-900 mt-0.5">
                        {event.eventName}
                      </h3>
                      <div className="text-xs text-neutral-600 mt-0.5">
                        Client: <strong className="text-neutral-800">{event.clientName}</strong>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E8E3D9] text-neutral-800 font-semibold uppercase">
                      {event.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[#E8E3D9]">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Call Time:</span>
                      <span className="font-mono font-bold text-neutral-900">{callTime}</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">Venue:</span>
                      <span className="font-medium text-neutral-900 truncate block">{event.venue}</span>
                    </div>
                  </div>

                  {/* Assigned Crew List */}
                  {event.crewAssignments && event.crewAssignments.length > 0 && (
                    <div className="text-xs space-y-1">
                      <span className="text-neutral-500 text-[11px] block">Assigned Crew:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {event.crewAssignments.map(a => (
                          <span key={a.id} className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-[#E8E3D9] text-neutral-800">
                            {a.crewName} ({a.role})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-mono font-bold text-neutral-900">
                      ₹{event.packageTotal.toLocaleString('en-IN')}
                    </span>

                    <button
                      onClick={() => onSelectEvent(event)}
                      className="px-3 py-1.5 bg-[#C58B39] hover:bg-[#B37B2E] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <span>Open Command Center</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-neutral-500 bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E3D9]">
            No wedding shoots booked on {formatDisplayDate(selectedDate, { day: '2-digit', month: 'short', year: 'numeric' })}. Click "+ Schedule Shoot on this Date" to book.
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
        allEvents={events}
        title={eventToExport ? `Export ${eventToExport.eventName}` : 'Export Production Calendar (iOS / Android)'}
      />
    </div>
  );
};
