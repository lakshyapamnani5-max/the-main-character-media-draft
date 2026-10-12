import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  X, 
  Users, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Partner, EventShoot, EventStatus } from '../../types';
import { StorageService } from '../../services/storage';

interface PartnerCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner | null;
  events: EventShoot[];
  onOpenEventDetail?: (event: EventShoot) => void;
  onRefreshData: () => void;
  onScheduleShootForPartner: (partner: Partner, date?: string) => void;
}

export const PartnerCalendarModal: React.FC<PartnerCalendarModalProps> = ({
  isOpen,
  onClose,
  partner,
  events,
  onOpenEventDetail,
  onRefreshData,
  onScheduleShootForPartner
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  if (!isOpen || !partner) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrev = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // Filter shoots outsourced by this specific partner
  const partnerShoots = events.filter(e => 
    e.partnerId === partner.id || 
    (e.notes && e.notes.toLowerCase().includes(partner.id.toLowerCase()))
  );

  // Month grid
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: { dateString: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
    days.push({
      dateString: prevDate.toISOString().split('T')[0],
      dayNumber: daysInPrevMonth - i,
      isCurrentMonth: false
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(i).padStart(2, '0');
    days.push({
      dateString: `${year}-${monthStr}-${dayStr}`,
      dayNumber: i,
      isCurrentMonth: true
    });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month + 1, i);
    days.push({
      dateString: nextDate.toISOString().split('T')[0],
      dayNumber: i,
      isCurrentMonth: false
    });
  }

  // Get shoots on date
  const getShootsForDate = (dateStr: string) => {
    return partnerShoots.filter(e => {
      const start = e.startDate || (e as any).shootDate || '';
      const end = e.endDate || start;
      return (dateStr >= start && dateStr <= end) || start === dateStr;
    });
  };

  const selectedDateShoots = getShootsForDate(selectedDate);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-[#E8E3D9] max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E3D9] bg-[#121212] text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1F1E1C] border border-[#C58B39] text-[#C58B39] flex items-center justify-center font-serif text-lg font-bold">
              {partner.companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-white tracking-wide">
                  {partner.companyName}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#222] text-[#C58B39] border border-[#333] font-semibold">
                  Partner Calendar
                </span>
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">
                Outsourced shoots automatically synced with Weddings & Jobs schedule
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onScheduleShootForPartner(partner, selectedDate)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#C58B39] hover:bg-[#B37B2E] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Event on Calendar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Controls & Month Header */}
        <div className="p-4 bg-[#FAF8F5] border-b border-[#E8E3D9] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-[#E8E3D9] rounded-lg overflow-hidden">
              <button
                onClick={handlePrev}
                className="p-1.5 text-neutral-700 hover:bg-neutral-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-semibold border-x border-[#E8E3D9] hover:bg-neutral-100"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 text-neutral-700 hover:bg-neutral-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="font-serif text-base font-bold text-neutral-900 px-2">
              {monthNames[month]} {year}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-neutral-600">
              Total Partner Shoots: <strong className="text-neutral-900">{partnerShoots.length}</strong>
            </span>
            <span className="text-emerald-700 font-semibold">
              Contract Volume: ₹{partnerShoots.reduce((sum, e) => sum + (e.packageTotal || 0), 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Interactive Month Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="border border-[#E8E3D9] rounded-xl overflow-hidden bg-white shadow-2xs">
            
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-[#E8E3D9] bg-[#FAF8F5] text-center text-[11px] font-mono font-bold text-neutral-600 py-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Grid cells */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#F0ECE1]">
              {days.map((d, index) => {
                const dayShoots = getShootsForDate(d.dateString);
                const isSelected = selectedDate === d.dateString;
                const isToday = d.dateString === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(d.dateString)}
                    className={`min-h-[88px] p-1.5 transition-colors cursor-pointer flex flex-col justify-between ${
                      !d.isCurrentMonth ? 'bg-[#FAFAFA] text-neutral-300' : 'bg-white'
                    } ${isSelected ? 'ring-2 ring-inset ring-[#C58B39] bg-amber-50/20' : 'hover:bg-[#FAF8F5]'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isToday 
                          ? 'bg-[#121212] text-white' 
                          : isSelected 
                          ? 'text-[#C58B39]' 
                          : d.isCurrentMonth ? 'text-neutral-800' : 'text-neutral-400'
                      }`}>
                        {d.dayNumber}
                      </span>

                      {dayShoots.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C58B39]" />
                      )}
                    </div>

                    {/* Shoots pills */}
                    <div className="space-y-1 mt-1">
                      {dayShoots.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-900 font-semibold truncate"
                          title={ev.eventName}
                        >
                          {ev.eventName}
                        </div>
                      ))}
                      {dayShoots.length > 2 && (
                        <div className="text-[9px] text-neutral-500 font-mono text-center">
                          +{dayShoots.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Detail Drawer */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E3D9] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-neutral-900">
                Shoots on {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
              </h4>

              <button
                onClick={() => onScheduleShootForPartner(partner, selectedDate)}
                className="text-xs font-semibold text-[#C58B39] hover:underline flex items-center gap-1"
              >
                <span>+ Add Event on {selectedDate}</span>
              </button>
            </div>

            {selectedDateShoots.length === 0 ? (
              <div className="p-3 bg-white rounded-lg border border-[#E8E3D9] text-xs text-neutral-400 italic text-center">
                No outsourced shoots scheduled on this date. Click above to add an event.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedDateShoots.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 bg-white border border-[#E8E3D9] rounded-lg shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#C58B39] font-bold uppercase">{ev.eventType}</span>
                        <h5 className="font-serif font-bold text-sm text-neutral-900">{ev.eventName}</h5>
                        <div className="text-xs text-neutral-600">Client: {ev.clientName}</div>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3D9] font-bold">
                        {ev.status}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-600 flex items-center gap-1">
                      <span>📍 {ev.venue}</span>
                    </div>

                    <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-neutral-900">₹{ev.packageTotal.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-mono text-emerald-700">✓ Synced in Weddings/Jobs</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
