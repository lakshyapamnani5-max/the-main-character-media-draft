import React, { useState } from 'react';
import { 
  Home, 
  Camera, 
  Calendar, 
  Bell, 
  User, 
  ArrowLeftRight, 
  Sparkles,
  ShieldCheck,
  Building2,
  Smartphone,
  Wallet
} from 'lucide-react';
import { EventShoot, CrewMember, CrewNotification } from '../../types';
import { StorageService } from '../../services/storage';

// Tabs
import { CrewHomeTab } from './CrewHomeTab';
import { CrewShootsTab } from './CrewShootsTab';
import { CrewCalendarTab } from './CrewCalendarTab';
import { CrewNotificationsTab } from './CrewNotificationsTab';
import { CrewProfileTab } from './CrewProfileTab';
import { CrewShootDetailView } from './CrewShootDetailView';
import { CrewPayoutsTab } from './CrewPayoutsTab';

export type CrewNavTab = 'home' | 'shoots' | 'payouts' | 'calendar' | 'notifications' | 'profile';

interface CrewAppLayoutProps {
  events: EventShoot[];
  crewRoster: CrewMember[];
  activeCrewId: string;
  onChangeCrewPersona: (crewId: string) => void;
  onRefreshData: () => void;
  onSignOut?: () => void;
}

export const CrewAppLayout: React.FC<CrewAppLayoutProps> = ({
  events,
  crewRoster,
  activeCrewId,
  onChangeCrewPersona,
  onRefreshData,
  onSignOut
}) => {
  const [activeTab, setActiveTab] = useState<CrewNavTab>('home');
  const [selectedEventDetail, setSelectedEventDetail] = useState<EventShoot | null>(null);

  const activeCrew: CrewMember = crewRoster.find(c => c.id === activeCrewId) || crewRoster[0] || {
    id: 'creator-portal',
    name: 'Crew Member',
    phone: '',
    email: '',
    role: 'Content Creator',
    specialization: 'Luxury Weddings & Social POV',
    experience: 'Production Specialist',
    defaultPayout: 0,
    availability: 'Available',
    status: 'Active'
  };

  const notifications = StorageService.getCrewNotifications(activeCrew.id);
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const todayStr = new Date().toISOString().split('T')[0];

  // My shoots
  const myShoots = events.filter(e => {
    return (e.crewAssignments && e.crewAssignments.some(a => a.crewId === activeCrew.id)) ||
      (e.crewMembers && e.crewMembers.some(name => name.toLowerCase() === activeCrew.name.toLowerCase()));
  });

  const todayShoot = myShoots.find(e => {
    const start = e.startDate || e.shootDate || '';
    const end = e.endDate || start;
    return (todayStr >= start && todayStr <= end) && e.status !== 'Cancelled' && e.status !== 'Archived';
  }) || null;

  const upcomingShoots = myShoots.filter(e => {
    const start = e.startDate || e.shootDate || '';
    return start >= todayStr && e.status !== 'Completed' && e.status !== 'Cancelled' && e.status !== 'Archived';
  });

  // If viewing a single shoot detail:
  if (selectedEventDetail) {
    // Keep updated object
    const freshEvent = events.find(e => e.id === selectedEventDetail.id) || selectedEventDetail;
    return (
      <CrewShootDetailView
        event={freshEvent}
        activeCrew={activeCrew}
        onBack={() => setSelectedEventDetail(null)}
        onRefreshData={onRefreshData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col text-[#1E1E1E] select-none max-w-md mx-auto relative shadow-2xl border-x border-[#E8E3D9]">
      
      {/* Top Mobile Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#121212] text-white px-4 py-3 border-b border-[#222222] flex items-center justify-between shadow-md">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded border border-[#C58B39] bg-[#1C1A18] flex items-center justify-center font-serif text-[#C58B39] font-bold text-sm tracking-wider">
            M
          </div>
          <div>
            <div className="font-serif tracking-widest text-xs font-bold text-white uppercase">
              The Main Character
            </div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-[#C58B39]">
              Crew Portal
            </div>
          </div>
        </div>

        {/* Right Actions: Switch to ERP & Notification Bell */}
        <div className="flex items-center gap-2">

          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-2 text-neutral-300 hover:text-white rounded-lg active:bg-white/10 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C58B39] text-white text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-[#121212]">
                {unreadNotifsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Tab Viewport */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {activeTab === 'home' && (
          <CrewHomeTab
            activeCrew={activeCrew}
            todayShoot={todayShoot}
            upcomingShoots={upcomingShoots}
            onSelectShoot={(event) => setSelectedEventDetail(event)}
            onNavigateToShoots={() => setActiveTab('shoots')}
          />
        )}

        {activeTab === 'shoots' && (
          <CrewShootsTab
            activeCrew={activeCrew}
            allShoots={events}
            onSelectShoot={(event) => setSelectedEventDetail(event)}
          />
        )}

        {activeTab === 'calendar' && (
          <CrewCalendarTab
            activeCrew={activeCrew}
            allShoots={events}
            onSelectShoot={(event) => setSelectedEventDetail(event)}
          />
        )}

        {activeTab === 'notifications' && (
          <CrewNotificationsTab
            notifications={notifications}
            allShoots={events}
            onSelectShootById={(id) => {
              const evt = events.find(e => e.id === id);
              if (evt) setSelectedEventDetail(evt);
            }}
            onRefreshData={onRefreshData}
          />
        )}

        {activeTab === 'payouts' && (
          <CrewPayoutsTab
            activeCrew={activeCrew}
            allShoots={events}
          />
        )}

        {activeTab === 'profile' && (
          <CrewProfileTab
            activeCrew={activeCrew}
            allCrew={crewRoster}
            allShoots={events}
            onSelectCrewPersona={(id) => {
              onChangeCrewPersona(id);
              onRefreshData();
            }}
            onSignOut={onSignOut}
          />
        )}
      </main>

      {/* Bottom Fixed Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-md border-t border-[#262626] text-white max-w-md mx-auto shadow-2xl safe-bottom">
        <div className="grid grid-cols-5 h-16">
          
          {/* HOME */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'home' ? 'text-[#C58B39]' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-wide uppercase">Home</span>
          </button>

          {/* SHOOTS */}
          <button
            onClick={() => setActiveTab('shoots')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'shoots' ? 'text-[#C58B39]' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-wide uppercase">Shoots</span>
          </button>

          {/* CALENDAR */}
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'calendar' ? 'text-[#C58B39]' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-wide uppercase">Calendar</span>
          </button>

          {/* PAYOUTS */}
          <button
            onClick={() => setActiveTab('payouts')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'payouts' ? 'text-[#C58B39]' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-wide uppercase">Payouts</span>
          </button>

          {/* PROFILE */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'profile' ? 'text-[#C58B39]' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-wide uppercase">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
