import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  Filter, 
  Search,
  Camera,
  Layers,
  Share2
} from 'lucide-react';
import { EventShoot, CrewMember } from '../../types';
import { CalendarExportModal } from '../Common/CalendarExportModal';

interface CrewShootsTabProps {
  activeCrew: CrewMember;
  allShoots: EventShoot[];
  onSelectShoot: (event: EventShoot) => void;
}

export const CrewShootsTab: React.FC<CrewShootsTabProps> = ({
  activeCrew,
  allShoots,
  onSelectShoot
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'upcoming' | 'completed'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportShootTarget, setExportShootTarget] = useState<EventShoot | null>(null);
  const [isBulkExportOpen, setIsBulkExportOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Shoots assigned to this crew member
  const myAssignedShoots = allShoots.filter(event => {
    const isAssigned = (event.crewAssignments && event.crewAssignments.some(a => a.crewId === activeCrew.id)) ||
      (event.crewMembers && event.crewMembers.some(name => name.toLowerCase() === activeCrew.name.toLowerCase()));
    return isAssigned;
  });

  const todayShoots = myAssignedShoots.filter(event => {
    const start = event.startDate || event.shootDate || '';
    const end = event.endDate || start;
    return (todayStr >= start && todayStr <= end) && event.status !== 'Cancelled' && event.status !== 'Archived';
  });

  const upcomingShoots = myAssignedShoots.filter(event => {
    const start = event.startDate || event.shootDate || '';
    return start >= todayStr && event.status !== 'Completed' && event.status !== 'Cancelled' && event.status !== 'Archived';
  });

  const completedShoots = myAssignedShoots.filter(event => {
    const start = event.startDate || event.shootDate || '';
    return event.status === 'Completed' || (start < todayStr && event.status !== 'Cancelled');
  });

  const currentList = activeSubTab === 'today' 
    ? todayShoots 
    : activeSubTab === 'upcoming' 
    ? upcomingShoots 
    : completedShoots;

  const filteredShoots = currentList.filter(e => 
    e.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.locationCity && e.locationCity.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4 pb-6">
      
      {/* Title & Stats */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="font-serif text-xl font-bold text-neutral-900 tracking-tight">
            My Shoot Assignments
          </h1>
          <div className="text-xs text-neutral-500">
            {myAssignedShoots.length} total productions assigned
          </div>
        </div>

        {myAssignedShoots.length > 0 && (
          <button
            onClick={() => setIsBulkExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-neutral-100 border border-[#E8E3D9] rounded-xl text-xs font-semibold text-neutral-800 transition-colors shadow-xs active:scale-95"
            title="Export shoots to Apple Calendar (.ics) or Google Calendar (Android)"
          >
            <Calendar className="w-3.5 h-3.5 text-[#C58B39]" />
            <span>Export (iOS / Android)</span>
          </button>
        )}
      </div>

      {/* 3 Mobile Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-white border border-[#E8E3D9] rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('today')}
          className={`py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
            activeSubTab === 'today'
              ? 'bg-[#121212] text-white shadow-xs'
              : 'text-neutral-600 hover:text-black'
          }`}
        >
          <span>Today</span>
          {todayShoots.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('upcoming')}
          className={`py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
            activeSubTab === 'upcoming'
              ? 'bg-[#121212] text-white shadow-xs'
              : 'text-neutral-600 hover:text-black'
          }`}
        >
          <span>Upcoming</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
            activeSubTab === 'upcoming' ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'
          }`}>
            {upcomingShoots.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('completed')}
          className={`py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
            activeSubTab === 'completed'
              ? 'bg-[#121212] text-white shadow-xs'
              : 'text-neutral-600 hover:text-black'
          }`}
        >
          <span>Completed</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
            activeSubTab === 'completed' ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'
          }`}>
            {completedShoots.length}
          </span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search shoots by couple or venue..."
          className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#E8E3D9] rounded-xl focus:border-[#C58B39] focus:outline-none focus:ring-1 focus:ring-[#C58B39]"
        />
      </div>

      {/* Shoots Cards List */}
      {filteredShoots.length === 0 ? (
        <div className="bg-white border border-[#E8E3D9] rounded-2xl p-8 text-center text-xs text-neutral-500 space-y-1.5">
          <div className="font-serif text-sm font-bold text-neutral-800">
            No {activeSubTab} shoots found
          </div>
          <p className="text-[11px] text-neutral-400">
            {searchQuery ? 'Try clearing your search query.' : 'Check other tabs or verify with admin.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredShoots.map((event) => {
            const assignment = event.crewAssignments?.find(a => a.crewId === activeCrew.id);
            const callTime = assignment?.callTime || event.shootTime?.split('-')[0]?.trim() || '08:00 AM';
            const role = assignment?.role || activeCrew.role;
            const shootDate = event.startDate || event.shootDate || '';

            return (
              <div
                key={event.id}
                className="bg-white border border-[#E8E3D9] hover:border-[#C58B39] rounded-2xl p-4 shadow-xs space-y-3 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#C58B39] font-semibold">
                      {event.eventType}
                    </span>
                    <h2 className="font-serif text-base font-bold text-neutral-900 tracking-tight mt-0.5">
                      {event.eventName}
                    </h2>
                    <div className="text-xs text-neutral-500">
                      Client: <strong className="text-neutral-700">{event.clientName}</strong>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3D9] text-neutral-700 font-semibold uppercase">
                    {event.status}
                  </span>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E3D9]">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">Date & Call Time</div>
                    <div className="font-medium text-neutral-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#C58B39]" />
                      <span>{new Date(shootDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="text-[11px] font-mono text-[#C58B39] font-bold pl-4">
                      {callTime}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">Venue & City</div>
                    <div className="font-medium text-neutral-900 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C58B39] shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 pl-4 truncate">
                      {event.locationCity || event.city || 'Mumbai'}
                    </div>
                  </div>
                </div>

                {/* Role & View Action */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="text-xs text-neutral-600 truncate">
                    Role: <strong className="text-neutral-900">{role}</strong>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setExportShootTarget(event)}
                      className="py-2 px-2.5 bg-[#FAF8F5] hover:bg-neutral-100 border border-[#E8E3D9] active:scale-95 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
                      title="Sync shoot to iPhone / Android calendar"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#C58B39]" />
                      <span className="hidden sm:inline">Sync</span>
                    </button>

                    <button
                      onClick={() => onSelectShoot(event)}
                      className="py-2 px-3.5 bg-[#121212] hover:bg-[#252525] active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar Export Modal for Single Shoot */}
      <CalendarExportModal
        isOpen={!!exportShootTarget}
        onClose={() => setExportShootTarget(null)}
        shoot={exportShootTarget}
        crewMember={activeCrew}
        allShoots={myAssignedShoots}
      />

      {/* Calendar Export Modal for Bulk Shoots */}
      <CalendarExportModal
        isOpen={isBulkExportOpen}
        onClose={() => setIsBulkExportOpen(false)}
        crewMember={activeCrew}
        allShoots={myAssignedShoots}
      />
    </div>
  );
};
