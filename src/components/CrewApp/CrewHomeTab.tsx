import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Compass, 
  Camera, 
  Layers,
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon,
  Sunset
} from 'lucide-react';
import { EventShoot, CrewMember } from '../../types';

interface CrewHomeTabProps {
  activeCrew: CrewMember;
  todayShoot: EventShoot | null;
  upcomingShoots: EventShoot[];
  onSelectShoot: (event: EventShoot) => void;
  onNavigateToShoots: () => void;
}

export const CrewHomeTab: React.FC<CrewHomeTabProps> = ({
  activeCrew,
  todayShoot,
  upcomingShoots,
  onSelectShoot,
  onNavigateToShoots
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sun };
    if (hour < 17) return { text: 'Good Afternoon', icon: Sunset };
    return { text: 'Good Evening', icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const todayAssignment = todayShoot?.crewAssignments?.find(a => a.crewId === activeCrew.id);
  const todayRole = todayAssignment?.role || activeCrew.role;
  const todayCallTime = todayAssignment?.callTime || todayShoot?.shootTime?.split('-')[0]?.trim() || '08:00 AM';

  return (
    <div className="space-y-5 pb-6">
      
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-[#1C1A18] to-[#121212] border border-[#2A2825] rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#C58B39]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#C58B39] font-medium">
              <GreetingIcon className="w-3.5 h-3.5" />
              <span>{greeting.text}</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-white tracking-tight mt-0.5">
              {activeCrew.name.split(' ')[0]}
            </h1>
            <div className="text-xs text-neutral-400 mt-0.5 font-light">
              {activeCrew.role} · {activeCrew.specialization.split(',')[0]}
            </div>
          </div>

          <div className="w-12 h-12 rounded-xl bg-[#25221F] border border-[#C58B39]/40 flex items-center justify-center font-serif text-lg font-bold text-[#C58B39] shadow-inner">
            {activeCrew.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </div>

      {/* TODAY'S SHOOT SECTION */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="font-serif font-bold text-base text-neutral-900 tracking-tight">
            Today's Shoot
          </span>
          {todayShoot && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              Live Assignment
            </span>
          )}
        </div>

        {todayShoot ? (
          <div className="bg-white border-2 border-[#C58B39] rounded-2xl p-5 shadow-md space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C58B39] font-bold">
                  {todayShoot.eventType}
                </span>
                <h2 className="font-serif text-xl font-bold text-neutral-900 tracking-tight">
                  {todayShoot.eventName}
                </h2>
                <div className="text-xs text-neutral-600 mt-0.5 font-medium">
                  Client: {todayShoot.clientName}
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#FAF8F5] border border-[#E8E3D9] text-neutral-800 font-semibold uppercase">
                {todayShoot.status}
              </span>
            </div>

            {/* Time & Venue Big Highlight */}
            <div className="grid grid-cols-2 gap-3 py-2 border-y border-[#F0EBE1]">
              <div>
                <div className="text-[10px] uppercase font-mono text-neutral-500 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#C58B39]" />
                  <span>Call Time</span>
                </div>
                <div className="font-mono text-lg font-bold text-neutral-900 mt-0.5">
                  {todayCallTime}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-mono text-neutral-500 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C58B39]" />
                  <span>Venue</span>
                </div>
                <div className="font-medium text-xs text-neutral-900 truncate mt-0.5">
                  {todayShoot.venue}
                </div>
                <div className="text-[10px] text-neutral-500 truncate">{todayShoot.locationCity || todayShoot.city || 'Mumbai'}</div>
              </div>
            </div>

            {/* Role Tag & Big View Action */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-xs text-neutral-700">
                Role: <strong className="text-neutral-900">{todayRole}</strong>
              </div>

              <button
                onClick={() => onSelectShoot(todayShoot)}
                className="py-3 px-5 bg-[#C58B39] hover:bg-[#B37B2E] active:scale-[0.98] text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-md flex items-center gap-2"
              >
                <span>VIEW SHOOT</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E8E3D9] rounded-2xl p-6 text-center shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="font-serif font-bold text-base text-neutral-900">
              NO SHOOTS TODAY
            </div>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              You're all clear for today. Review your upcoming schedule and gear preparedness below.
            </p>
          </div>
        )}
      </div>

      {/* UPCOMING SHOOTS SECTION */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-serif font-bold text-base text-neutral-900 tracking-tight">
            Upcoming Shoots ({upcomingShoots.length})
          </span>
          <button
            onClick={onNavigateToShoots}
            className="text-xs text-[#C58B39] font-medium hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingShoots.length === 0 ? (
          <div className="p-6 bg-white border border-[#E8E3D9] rounded-2xl text-center text-xs text-neutral-500">
            No upcoming shoots scheduled currently on your roster.
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcomingShoots.slice(0, 3).map((event) => {
              const assignment = event.crewAssignments?.find(a => a.crewId === activeCrew.id);
              const callTime = assignment?.callTime || event.shootTime?.split('-')[0]?.trim() || '08:00 AM';
              const shootDate = event.startDate || event.shootDate || '';

              return (
                <div
                  key={event.id}
                  onClick={() => onSelectShoot(event)}
                  className="bg-white border border-[#E8E3D9] hover:border-[#C58B39] active:bg-[#FAF8F5] rounded-xl p-4 transition-all cursor-pointer shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#C58B39]">
                        {new Date(shootDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                      </span>
                      <span className="text-neutral-300">·</span>
                      <span className="text-[10px] font-mono text-neutral-500">{callTime}</span>
                    </div>

                    <div className="font-serif font-bold text-sm text-neutral-900 truncate">
                      {event.eventName}
                    </div>

                    <div className="text-[11px] text-neutral-500 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span className="truncate">{event.venue}, {event.locationCity || event.city || ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] font-medium text-neutral-600">{assignment?.role || activeCrew.role}</div>
                      <div className="text-[10px] font-mono text-emerald-700">₹{(assignment?.payout || activeCrew.defaultPayout).toLocaleString('en-IN')}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Crew Gear & Readiness Quick Tip */}
      <div className="bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl p-4 text-xs space-y-1.5">
        <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C58B39]" />
          <span>Production Standards Reminder</span>
        </div>
        <p className="text-neutral-600 text-[11px] leading-relaxed">
          Maintain 4K 60fps ProRes formats for all bridal entries and slow-motion ceremonial highlights. Ensure backup memory cards are cleared.
        </p>
      </div>
    </div>
  );
};
