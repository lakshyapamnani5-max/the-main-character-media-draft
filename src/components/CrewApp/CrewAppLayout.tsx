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
  Smartphone
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

export type CrewNavTab = 'home' | 'shoots' | 'calendar' | 'notifications' | 'profile';

interface CrewAppLayoutProps {
  events: EventShoot[];
  crewRoster: CrewMember[];
  activeCrewId: string;
  onChangeCrewPersona: (crewId: string) => void;
  onSwitchToAdmin: () => void;
  onRefreshData: () => void;
}

export const CrewAppLayout: React.FC<CrewAppLayoutProps> = ({
  events,
  crewRoster,
  activeCrewId,
  onChangeCrewPersona,
  onSwitchToAdmin,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<CrewNavTab>('home');
  const [selectedEventDetail, setSelectedEventDetail] = useState<EventShoot | null>(null);

  const activeCrew = crewRoster.find(c => c.id === activeCrewId) || crewRoster[0] || {
    id: 'cr-aman',
    name: 'Aman Joshi',
    phone: '+919820666778',
    email: 'aman@themaincharactermedia.com',
    role: 'Editor',
    specialization: 'Same-Day Reel Delivery',
    experience: '3 Years',
    defaultPayout: 4500,
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
            <div className="text-[9px] uppercase font-mono tracking-widest text-[#C58B39]">
              Crew Mobile App
            </div>
          </div>
        </div>

        {/* Right Actions: Switch to ERP & Notification Bell */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToAdmin}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg bg-white/5 active:bg-white/10 flex items-center gap-1 text-[10px] font-mono"
            title="Switch to Admin ERP"
          >
            <Building2 className="w-3.5 h-3.5 text-[#C58B39]" />
            <span className="hidden sm:inline">Admin</span>
          </button>

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

        {activeTab === 'profile' && (
          <CrewProfileTab
            activeCrew={activeCrew}
            allCrew={crewRoster}
            allShoots={events}
            onSelectCrewPersona={(id) => {
              onChangeCrewPersona(id);
              onRefreshData();
            }}
            onSwitchToAdmin={onSwitchToAdmin}
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

          {/* NOTIFICATIONS */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex flex-col items-center justify-center gap-1 relative transition-colors ${
              activeTab === 'notifications' ? 'text-[#C58B39]' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-2 right-5 w-2 h-2 rounded-full bg-[#C58B39] ring-2 ring-[#121212]" />
            )}
            <span className="text-[10px] font-medium tracking-wide uppercase">Notifs</span>
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
