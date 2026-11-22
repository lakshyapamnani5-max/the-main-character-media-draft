import React, { useState, useMemo } from 'react';
import {
  Building2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Search,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  X,
  Layers,
  AlertCircle
} from 'lucide-react';
import { EventShoot, Partner } from '../../types';
import { UserSession } from '../../services/storage';
import {
  formatYYYYMMDD,
  getTodayDateString,
  parseDateSafe,
  formatDisplayDate,
  formatFullDisplayDate,
  normalizeDateString,
  getDatesInRange
} from '../../utils/dateUtils';

interface PartnerPortalLayoutProps {
  partners: Partner[];
  events: EventShoot[];
  partnerId: string;
  session?: UserSession | null;
  isAdminPreview?: boolean;
  onExitPreview?: () => void;
  onSignOut: () => void;
}

type PartnerTab = 'calendar' | 'events';
type EventFilter = 'all' | 'upcoming' | 'ongoing' | 'completed';

export const PartnerPortalLayout: React.FC<PartnerPortalLayoutProps> = ({
  partners,
  events,
  partnerId,
  session,
  isAdminPreview = false,
  onExitPreview,
  onSignOut
}) => {
  const [activeTab, setActiveTab] = useState<PartnerTab>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 12, 0, 0);
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');
  const [selectedEvent, setSelectedEvent] = useState<EventShoot | null>(null);

  const activePartner: Partner = useMemo(() => {
    const found = partners.find(p => p.id === partnerId);
    if (found) return found;
    return {
      id: partnerId,
      name: session?.name || 'Partner Representative',
      companyName: session?.companyName || 'Event Partner',
      phone: session?.phone || '',
      email: session?.email || '',
      city: '',
      portalAccessEnabled: true,
      createdAt: '',
      updatedAt: ''
    };
  }, [partners, partnerId, session]);

  const todayStr = getTodayDateString();

  // Strictly scope events ONLY to this partner company
  const companyEvents = useMemo(() => {
    const targetCompany = (activePartner.companyName || '').trim().toLowerCase();
    return (events || [])
      .filter(e => {
        if (e.partnerId) return e.partnerId === activePartner.id;
        if (targetCompany && e.partnerName) {
          return e.partnerName.trim().toLowerCase() === targetCompany;
        }
        return false;
      })
      .sort((a, b) => {
        const dA = normalizeDateString(a.startDate || a.shootDate);
        const dB = normalizeDateString(b.startDate || b.shootDate);
        return dA.localeCompare(dB);
      });
  }, [events, activePartner]);

  // Calendar events exclude Cancelled/Archived
  const calendarEvents = useMemo(() => {
    return companyEvents.filter(e => e.status !== 'Cancelled' && e.status !== 'Archived');
  }, [companyEvents]);

  // Metrics for this company only
  const stats = useMemo(() => {
    let upcoming = 0;
    let ongoing = 0;
    let completed = 0;
    calendarEvents.forEach(e => {
      const start = normalizeDateString(e.startDate || e.shootDate);
      const rawEnd = normalizeDateString(e.endDate);
      const end = rawEnd && rawEnd >= start ? rawEnd : start;

      if (e.status === 'Completed' || (end && end < todayStr)) {
        completed++;
      } else if (start && start <= todayStr && end >= todayStr) {
        ongoing++;
      } else if (start > todayStr) {
        upcoming++;
      }
    });
    return {
      total: calendarEvents.length,
      upcoming,
      ongoing,
      completed
    };
  }, [calendarEvents, todayStr]);

  // If admin paused access for this partner (and not in admin preview)
  if (!isAdminPreview && activePartner.portalAccessEnabled === false) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#E8E3D9] rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-xl font-bold text-neutral-900">
            Partner Portal Access Paused
          </h1>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Portal access for <strong>{activePartner.companyName}</strong> is currently disabled by The Main Character Media admin. Please reach out to your studio coordinator.
          </p>
          <button
            onClick={onSignOut}
            className="px-5 py-2.5 bg-[#121212] hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1, 12, 0, 0));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1, 12, 0, 0));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1, 12, 0, 0));
    setSelectedDate(getTodayDateString());
  };

  const monthGridDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1, 12, 0, 0).getDay();
    const daysInMonth = new Date(year, month + 1, 0, 12, 0, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0, 12, 0, 0).getDate();

    const days: { dateString: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    const prevYear = month === 0 ? year - 1 : year;
    const prevMonth1Based = month === 0 ? 12 : month;
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      days.push({
        dateString: formatYYYYMMDD(prevYear, prevMonth1Based, dayNum),
        dayNumber: dayNum,
        isCurrentMonth: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        dateString: formatYYYYMMDD(year, month + 1, i),
        dayNumber: i,
        isCurrentMonth: true
      });
    }

    const remaining = 42 - days.length;
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonth1Based = month === 11 ? 1 : month + 2;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dateString: formatYYYYMMDD(nextYear, nextMonth1Based, i),
        dayNumber: i,
        isCurrentMonth: false
      });
    }

    return days;
  }, [year, month]);

  const getEventsForDate = (dateStr: string) => {
    return calendarEvents.filter(e => {
      const start = normalizeDateString(e.startDate || e.shootDate);
      if (!start) return false;
      const rawEnd = normalizeDateString(e.endDate);
      const end = rawEnd && rawEnd >= start ? rawEnd : start;
      return dateStr >= start && dateStr <= end;
    });
  };

  const getMultiDayMeta = (e: EventShoot, dateStr: string) => {
    const start = normalizeDateString(e.startDate || e.shootDate);
    const rawEnd = normalizeDateString(e.endDate);
    const end = rawEnd && rawEnd >= start ? rawEnd : start;
    const spanDates = getDatesInRange(start, end);
    const dayIndex = spanDates.indexOf(dateStr);
    return {
      start,
      end,
      totalDays: spanDates.length,
      dayIndex
    };
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const filteredEventsList = useMemo(() => {
    return companyEvents.filter(e => {
      const start = normalizeDateString(e.startDate || e.shootDate);
      const rawEnd = normalizeDateString(e.endDate);
      const end = rawEnd && rawEnd >= start ? rawEnd : start;

      if (eventFilter === 'upcoming') {
        if (e.status === 'Cancelled' || e.status === 'Archived' || e.status === 'Completed') return false;
        if (end < todayStr) return false;
      } else if (eventFilter === 'ongoing') {
        if (e.status === 'Cancelled' || e.status === 'Archived' || e.status === 'Completed') return false;
        if (!(start && start <= todayStr && end >= todayStr)) return false;
      } else if (eventFilter === 'completed') {
        if (e.status !== 'Completed' && !(end && end < todayStr && e.status !== 'Cancelled' && e.status !== 'Archived')) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const match =
          (e.eventName || '').toLowerCase().includes(q) ||
          (e.clientName || '').toLowerCase().includes(q) ||
          (e.venue || '').toLowerCase().includes(q) ||
          (e.locationCity || e.city || '').toLowerCase().includes(q) ||
          (e.eventType || '').toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [companyEvents, eventFilter, searchQuery, todayStr]);

  const getStatusTextClass = (status: string) => {
    if (status === 'Completed') return 'text-emerald-700';
    if (status === 'Cancelled' || status === 'Archived') return 'text-rose-700';
    if (status === 'In Progress') return 'text-amber-700';
    return 'text-[#9A6B26]';
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col">
      {/* Three-Zone Top Bar */}
      <header className="sticky top-0 z-40 bg-[#121212] text-white border-b border-[#242424]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Company Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded border border-[#C58B39]/60 bg-white p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
              <img src="/logo.png" alt="TMCM" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-white truncate whitespace-nowrap">
              {activePartner.companyName}
            </span>
          </div>

          {/* Zone 2: Clean Nav Links */}
          <nav className="flex items-center gap-6 text-sm font-medium shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'calendar'
                  ? 'text-white border-[#C58B39]'
                  : 'text-neutral-400 border-transparent hover:text-white'
              }`}
            >
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'events'
                  ? 'text-white border-[#C58B39]'
                  : 'text-neutral-400 border-transparent hover:text-white'
              }`}
            >
              Events
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="shrink-0">
            {isAdminPreview && onExitPreview ? (
              <button
                type="button"
                onClick={onExitPreview}
                className="px-4 py-2 bg-[#C58B39] hover:bg-[#B37B2E] text-[#121212] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Admin</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignOut}
                className="px-4 py-2 bg-[#222222] hover:bg-[#2E2E2E] text-white border border-[#333333] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 text-[#C58B39]" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Partner Overview Strip */}
        <section className="bg-white border border-[#E8E3D9] rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              {activePartner.companyName} Schedule
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <span>Partner Portal</span>
              {activePartner.contactPerson && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{activePartner.contactPerson}</span>
                </>
              )}
              {activePartner.phone && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{activePartner.phone}</span>
                </>
              )}
              {activePartner.email && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{activePartner.email}</span>
                </>
              )}
              {activePartner.city && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{activePartner.city}</span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[#E8E3D9] lg:pl-8 shrink-0">
            <div>
              <div className="text-xs text-neutral-500">Total Events</div>
              <div className="font-mono tabular-nums text-2xl font-bold text-neutral-900 mt-0.5">
                {stats.total}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Upcoming & Live</div>
              <div className="font-mono tabular-nums text-2xl font-bold text-[#9A6B26] mt-0.5">
                {stats.upcoming + stats.ongoing}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Completed</div>
              <div className="font-mono tabular-nums text-2xl font-bold text-emerald-700 mt-0.5">
                {stats.completed}
              </div>
            </div>
          </div>
        </section>

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Quick Upcoming Dates Bar */}
            {calendarEvents.length > 0 && (
              <div className="bg-white border border-[#E8E3D9] rounded-xl p-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-neutral-500 mr-1 whitespace-nowrap">
                  Scheduled Dates:
                </span>
                {calendarEvents.slice(0, 8).map(ev => {
                  const start = normalizeDateString(ev.startDate || ev.shootDate);
                  const rawEnd = normalizeDateString(ev.endDate);
                  const end = rawEnd && rawEnd >= start ? rawEnd : start;
                  const isMulti = end > start;
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => {
                        const d = parseDateSafe(start);
                        setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0));
                        setSelectedDate(start);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                        selectedDate >= start && selectedDate <= end
                          ? 'bg-[#121212] text-white border-[#121212]'
                          : 'bg-[#FAF8F5] text-neutral-800 border-[#E8E3D9] hover:border-[#C58B39]'
                      }`}
                    >
                      <span className="font-mono tabular-nums">
                        {formatDisplayDate(start, { day: '2-digit', month: 'short' })}
                        {isMulti ? ` – ${formatDisplayDate(end, { day: '2-digit', month: 'short' })}` : ''}
                      </span>
                      <span className="mx-1.5 text-neutral-400">·</span>
                      <span>{ev.eventName}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Calendar Grid */}
              <div className="lg:col-span-8 bg-white border border-[#E8E3D9] rounded-xl overflow-hidden">
                {/* Month Controls */}
                <div className="p-4 border-b border-[#E8E3D9] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-[#E8E3D9] rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-2 text-neutral-700 hover:bg-neutral-100 transition-colors"
                        aria-label="Previous Month"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleToday}
                        className="px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 border-x border-[#E8E3D9] transition-colors whitespace-nowrap"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-2 text-neutral-700 hover:bg-neutral-100 transition-colors"
                        aria-label="Next Month"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <select
                      value={month}
                      onChange={(e) => setCurrentDate(new Date(year, Number(e.target.value), 1, 12, 0, 0))}
                      className="text-sm font-serif font-bold text-neutral-900 bg-white border border-[#E8E3D9] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C58B39]"
                    >
                      {monthNames.map((name, idx) => (
                        <option key={name} value={idx}>{name}</option>
                      ))}
                    </select>

                    <select
                      value={year}
                      onChange={(e) => setCurrentDate(new Date(Number(e.target.value), month, 1, 12, 0, 0))}
                      className="text-sm font-mono tabular-nums font-bold text-neutral-900 bg-white border border-[#E8E3D9] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C58B39]"
                    >
                      {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div className="text-xs font-mono tabular-nums text-neutral-500">
                    {monthNames[month]} {year}
                  </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-[#E8E3D9] bg-[#FAF8F5] text-center text-[11px] font-mono font-bold text-neutral-500 py-2.5">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                {/* Day Cells */}
                <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#F0ECE1]">
                  {monthGridDays.map((d, index) => {
                    const dayEvents = getEventsForDate(d.dateString);
                    const isSelected = selectedDate === d.dateString;
                    const isToday = d.dateString === todayStr;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedDate(d.dateString)}
                        className={`min-h-[92px] p-1.5 text-left transition-colors flex flex-col justify-between align-top ${
                          !d.isCurrentMonth ? 'bg-[#FAFAFA] text-neutral-300' : 'bg-white'
                        } ${isSelected ? 'ring-2 ring-inset ring-[#C58B39] bg-amber-50/20' : 'hover:bg-[#FAF8F5]'}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-[11px] font-mono tabular-nums font-bold px-1.5 py-0.5 rounded ${
                            isToday
                              ? 'bg-[#121212] text-white'
                              : isSelected
                              ? 'text-[#C58B39]'
                              : d.isCurrentMonth ? 'text-neutral-800' : 'text-neutral-400'
                          }`}>
                            {d.dayNumber}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="text-[10px] font-mono tabular-nums font-semibold text-[#9A6B26]">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mt-1 w-full">
                          {dayEvents.slice(0, 2).map(ev => {
                            const meta = getMultiDayMeta(ev, d.dateString);
                            return (
                              <div
                                key={ev.id}
                                className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-950 font-medium truncate"
                                title={meta.totalDays > 1 ? `${ev.eventName} (Day ${meta.dayIndex + 1} of ${meta.totalDays})` : ev.eventName}
                              >
                                {meta.totalDays > 1 ? `D${meta.dayIndex + 1}/${meta.totalDays} · ` : ''}
                                {ev.eventName}
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-[10px] text-neutral-500 font-mono text-center">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Day Agenda */}
              <div className="lg:col-span-4 bg-white border border-[#E8E3D9] rounded-xl p-5 space-y-4">
                <div className="border-b border-[#F0ECE1] pb-3">
                  <div className="text-xs text-neutral-500">Selected Date</div>
                  <h2 className="font-serif text-lg font-bold text-neutral-900 mt-0.5">
                    {formatFullDisplayDate(selectedDate)}
                  </h2>
                </div>

                {selectedDateEvents.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <CalendarIcon className="w-7 h-7 text-neutral-300 mx-auto" />
                    <div className="text-xs font-medium text-neutral-700">
                      No events scheduled on this date
                    </div>
                    <p className="text-xs text-neutral-400">
                      Select any highlighted date on the calendar to inspect shoot details.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map(ev => {
                      const meta = getMultiDayMeta(ev, selectedDate);
                      const functionsToday = (ev.subEvents || []).filter(se => normalizeDateString(se.date) === selectedDate);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className="p-4 bg-[#FAF8F5] border border-[#E8E3D9] hover:border-[#C58B39] rounded-lg cursor-pointer transition-colors space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs text-neutral-500">
                            <span className="truncate">
                              {ev.eventType}
                              {meta.totalDays > 1 ? ` · Day ${meta.dayIndex + 1} of ${meta.totalDays}` : ''}
                            </span>
                            <span className={`font-semibold shrink-0 ${getStatusTextClass(ev.status)}`}>
                              {ev.status}
                            </span>
                          </div>

                          <h3 className="font-serif font-bold text-base text-neutral-900 leading-snug">
                            {ev.eventName}
                          </h3>

                          <div className="text-xs text-neutral-600 space-y-1">
                            <div>Client: <span className="font-medium text-neutral-900">{ev.clientName}</span></div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                              <span className="font-mono tabular-nums">{ev.shootTime || 'Full Day'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                              <span className="truncate">{ev.venue || 'Venue TBD'}{ev.locationCity ? `, ${ev.locationCity}` : ''}</span>
                            </div>
                          </div>

                          {functionsToday.length > 0 && (
                            <div className="pt-2 border-t border-[#E8E3D9] space-y-1">
                              <div className="text-[11px] font-medium text-neutral-500">
                                Ceremonies on this day:
                              </div>
                              {functionsToday.map(fn => (
                                <div key={fn.id} className="text-xs text-neutral-800 flex items-center justify-between gap-2">
                                  <span className="truncate font-medium">{fn.name}</span>
                                  <span className="font-mono tabular-nums text-[11px] text-neutral-500 shrink-0">
                                    {fn.startTime}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="pt-1 text-xs font-semibold text-[#9A6B26]">
                            View full event details →
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EVENTS LIST TAB */}
        {activeTab === 'events' && (
          <div className="space-y-5">
            {/* Search & Filters */}
            <div className="bg-white border border-[#E8E3D9] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your events, client, venue, or city..."
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg self-start sm:self-auto">
                {(['all', 'upcoming', 'ongoing', 'completed'] as EventFilter[]).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setEventFilter(tab)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors whitespace-nowrap shrink-0 ${
                      eventFilter === tab
                        ? 'bg-[#121212] text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredEventsList.length === 0 ? (
              <div className="bg-white border border-[#E8E3D9] rounded-xl p-12 text-center space-y-2">
                <Building2 className="w-8 h-8 text-neutral-300 mx-auto" />
                <div className="font-serif text-base font-bold text-neutral-800">
                  No events found for {activePartner.companyName}
                </div>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  {companyEvents.length === 0
                    ? 'Events assigned to your company by The Main Character Media will appear here automatically.'
                    : 'No events match your current search or filter selection.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEventsList.map(ev => {
                  const start = normalizeDateString(ev.startDate || ev.shootDate);
                  const rawEnd = normalizeDateString(ev.endDate);
                  const end = rawEnd && rawEnd >= start ? rawEnd : start;
                  const isMulti = end > start;
                  const teamCount = ev.crewAssignments?.length || ev.crewMembers?.length || 0;

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="bg-white border border-[#E8E3D9] hover:border-[#C58B39] rounded-xl p-5 cursor-pointer transition-colors flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2 text-xs text-neutral-500">
                          <span className="truncate font-mono tabular-nums">
                            {ev.eventType} · {formatDisplayDate(start)}
                            {isMulti ? ` – ${formatDisplayDate(end)}` : ''}
                          </span>
                          <span className={`font-semibold shrink-0 ${getStatusTextClass(ev.status)}`}>
                            {ev.status}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-bold text-neutral-900 leading-snug">
                          {ev.eventName}
                        </h3>

                        <div className="text-xs text-neutral-600 space-y-1.5 pt-1">
                          <div>
                            Client: <span className="font-medium text-neutral-900">{ev.clientName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate">{ev.venue || 'TBD'}{ev.locationCity ? `, ${ev.locationCity}` : ''}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="font-mono tabular-nums">{ev.shootTime || 'Full Day Coverage'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-between text-xs text-neutral-500">
                        <span className="font-mono tabular-nums">
                          {teamCount} Crew · {(ev.subEvents || []).length} Functions
                        </span>
                        <span className="font-semibold text-[#9A6B26]">
                          Details →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Event Detail Modal (Strictly Company-Scoped Production Info, Zero Internal Studio Margins/Payouts) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E3D9] rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#E8E3D9] bg-[#121212] text-white flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs text-[#C58B39] font-mono tabular-nums">
                  {selectedEvent.eventType} · {formatDisplayDate(selectedEvent.startDate || selectedEvent.shootDate)}
                  {selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate
                    ? ` – ${formatDisplayDate(selectedEvent.endDate)}`
                    : ''}
                </div>
                <h2 className="font-serif text-xl font-bold text-white">
                  {selectedEvent.eventName}
                </h2>
                <div className="text-xs text-neutral-300">
                  Client: {selectedEvent.clientName} · Status: {selectedEvent.status}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
              {/* Venue & Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-[#E8E3D9]">
                <div>
                  <div className="text-neutral-500 mb-1">Venue & City</div>
                  <div className="font-medium text-neutral-900">
                    {selectedEvent.venue || 'TBD'}
                    {selectedEvent.locationCity ? `, ${selectedEvent.locationCity}` : ''}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1">Coverage Window</div>
                  <div className="font-mono tabular-nums font-medium text-neutral-900">
                    {selectedEvent.shootTime || 'Full Day Coverage'}
                  </div>
                </div>
              </div>

              {/* Ceremonies & Sub-Events */}
              <div className="space-y-2.5">
                <h3 className="font-serif font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#C58B39]" />
                  <span>Ceremonies & Functions ({(selectedEvent.subEvents || []).length})</span>
                </h3>
                {(!selectedEvent.subEvents || selectedEvent.subEvents.length === 0) ? (
                  <p className="text-neutral-500">No separate ceremonies listed for this booking.</p>
                ) : (
                  <div className="divide-y divide-[#E8E3D9] border border-[#E8E3D9] rounded-lg">
                    {selectedEvent.subEvents.map(se => (
                      <div key={se.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold text-neutral-900">{se.name}</div>
                          <div className="text-neutral-500">{se.venue || selectedEvent.venue || 'Main Venue'}</div>
                        </div>
                        <div className="font-mono tabular-nums text-neutral-700 sm:text-right">
                          <div>{formatDisplayDate(se.date)}</div>
                          <div className="text-neutral-500">{se.startTime} – {se.endTime}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assigned Team (Names & Roles Only, No Internal Payouts) */}
              <div className="space-y-2.5">
                <h3 className="font-serif font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#C58B39]" />
                  <span>Assigned Production Crew</span>
                </h3>
                {(!selectedEvent.crewAssignments || selectedEvent.crewAssignments.length === 0) &&
                (!selectedEvent.crewMembers || selectedEvent.crewMembers.length === 0) ? (
                  <p className="text-neutral-500">Crew assignments will appear here once finalized.</p>
                ) : (
                  <div className="divide-y divide-[#E8E3D9] border border-[#E8E3D9] rounded-lg">
                    {selectedEvent.crewAssignments && selectedEvent.crewAssignments.length > 0
                      ? selectedEvent.crewAssignments.map(asg => (
                          <div key={asg.id} className="p-3 flex items-center justify-between gap-2">
                            <div>
                              <div className="font-semibold text-neutral-900">{asg.crewName}</div>
                              <div className="text-neutral-500">{asg.role}</div>
                            </div>
                            <div className="font-mono tabular-nums text-neutral-600 text-right">
                              {asg.callTime} – {asg.wrapTime}
                            </div>
                          </div>
                        ))
                      : selectedEvent.crewMembers.map((name, i) => (
                          <div key={i} className="p-3 font-medium text-neutral-900">
                            {name}
                          </div>
                        ))}
                  </div>
                )}
              </div>

              {/* Deliverables Status */}
              {selectedEvent.deliverables && selectedEvent.deliverables.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="font-serif font-bold text-sm text-neutral-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C58B39]" />
                    <span>Deliverables</span>
                  </h3>
                  <div className="divide-y divide-[#E8E3D9] border border-[#E8E3D9] rounded-lg">
                    {selectedEvent.deliverables.map(del => (
                      <div key={del.id} className="p-3 flex items-center justify-between gap-3">
                        <span className={del.completed ? 'text-neutral-900 font-medium' : 'text-neutral-700'}>
                          {del.title}
                        </span>
                        <span className={`font-mono text-[11px] font-semibold shrink-0 ${
                          del.completed ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {del.completed ? 'Delivered' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedEvent.notes && (
                <div className="space-y-1.5">
                  <div className="font-semibold text-neutral-700">Production Brief / Notes</div>
                  <p className="text-neutral-600 whitespace-pre-wrap leading-relaxed bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg p-3">
                    {selectedEvent.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E8E3D9] bg-[#FAF8F5] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 bg-[#121212] hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
