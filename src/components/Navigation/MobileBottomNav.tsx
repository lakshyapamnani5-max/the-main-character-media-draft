import React from 'react';
import { 
  Home, 
  Calendar, 
  Briefcase, 
  Wallet, 
  MoreHorizontal,
  Layers
} from 'lucide-react';
import { NavModule } from '../Header';

interface MobileBottomNavProps {
  activeModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  upcomingCount?: number;
  pendingBalanceCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeModule,
  onSelectModule,
  upcomingCount = 0,
  pendingBalanceCount = 0
}) => {
  const isTabActive = (mod: 'home' | 'jobs' | 'calendar' | 'money' | 'more') => {
    if (mod === 'home') return activeModule === 'home' || activeModule === 'dashboard';
    if (mod === 'jobs') return activeModule === 'jobs' || activeModule === 'events';
    if (mod === 'calendar') return activeModule === 'calendar';
    if (mod === 'money') return activeModule === 'money';
    if (mod === 'more') return activeModule === 'more' || activeModule === 'enquiries' || activeModule === 'event-charges' || activeModule === 'quotations' || activeModule === 'clients' || activeModule === 'crew' || activeModule === 'locations';
    return false;
  };

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-md border-t border-[#262626] text-white safe-bottom shadow-2xl select-none"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        
        {/* HOME */}
        <button
          onClick={() => onSelectModule('home')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            isTabActive('home') ? 'text-[#C58B39]' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide uppercase">Home</span>
          {isTabActive('home') && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#C58B39]" />
          )}
        </button>

        {/* JOBS */}
        <button
          onClick={() => onSelectModule('jobs')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            isTabActive('jobs') ? 'text-[#C58B39]' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div className="relative">
            <Briefcase className="w-5 h-5" />
            {upcomingCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-[#C58B39] text-white text-[9px] font-mono font-bold leading-tight">
                {upcomingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-wide uppercase">Jobs</span>
          {isTabActive('jobs') && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#C58B39]" />
          )}
        </button>

        {/* CALENDAR */}
        <button
          onClick={() => onSelectModule('calendar')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            isTabActive('calendar') ? 'text-[#C58B39]' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide uppercase">Calendar</span>
          {isTabActive('calendar') && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#C58B39]" />
          )}
        </button>

        {/* MONEY */}
        <button
          onClick={() => onSelectModule('money')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            isTabActive('money') ? 'text-[#C58B39]' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <div className="relative">
            <Wallet className="w-5 h-5" />
            {pendingBalanceCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-wide uppercase">Money</span>
          {isTabActive('money') && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#C58B39]" />
          )}
        </button>

        {/* MORE */}
        <button
          onClick={() => onSelectModule('more')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            isTabActive('more') ? 'text-[#C58B39]' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide uppercase">More</span>
          {isTabActive('more') && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#C58B39]" />
          )}
        </button>

      </div>
    </nav>
  );
};
