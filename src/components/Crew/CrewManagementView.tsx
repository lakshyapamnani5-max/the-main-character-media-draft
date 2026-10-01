import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Edit3, 
  UserCheck, 
  Clock, 
  AlertCircle,
  Camera,
  Layers,
  ChevronRight
} from 'lucide-react';
import { CrewMember, CrewRole, EventShoot } from '../../types';
import { CrewModal } from './CrewModal';

interface CrewManagementViewProps {
  crew: CrewMember[];
  events: EventShoot[];
  onSaveCrew: (crewData: Partial<CrewMember> & { name: string; phone: string; role: CrewRole }) => void;
  onOpenEventCommandCenter?: (event: EventShoot) => void;
}

export const CrewManagementView: React.FC<CrewManagementViewProps> = ({
  crew,
  events,
  onSaveCrew,
  onOpenEventCommandCenter
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'roster' | 'calendar'>('roster');

  // Calendar Date selector
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Modal
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<CrewMember | null>(null);

  const roles: string[] = [
    'All',
    'Content Creator',
    'Cinematographer',
    'Photographer',
    'Videographer',
    'Drone Operator',
    'Editor',
    'Assistant',
    'Social Media Manager'
  ];

  const filteredCrew = crew.filter(c => {
    const matchesRole = selectedRole === 'All' || c.role === selectedRole;
    const matchesAvailability = selectedAvailability === 'All' || c.availability === selectedAvailability;
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRole && matchesAvailability && matchesSearch;
  });

  const handleAddNew = () => {
    setEditingCrew(null);
    setIsCrewModalOpen(true);
  };

  const handleEdit = (crewMember: CrewMember) => {
    setEditingCrew(crewMember);
    setIsCrewModalOpen(true);
  };

  // Find assignments on selected date
  const assignmentsOnSelectedDate = events
    .filter(e => {
      if (e.status === 'Cancelled' || e.status === 'Archived') return false;
      const start = e.startDate || (e as any).shootDate;
      const end = e.endDate || start;
      return selectedDate >= start && selectedDate <= end;
    })
    .map(e => ({
      event: e,
      assignedCrewIds: (e.crewAssignments || []).map(a => a.crewId)
    }));

  const bookedCrewIdsOnDate = new Set(assignmentsOnSelectedDate.flatMap(a => a.assignedCrewIds));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">Creative Workforce & Roster</div>
          <h1 className="font-serif text-2xl font-bold text-[#181818] tracking-tight">
            Crew Management & Deployment
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Photographers, Cinematographers, Drone Pilots, Mobile Creators, and Editors with conflict detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Roster / Calendar View Switcher */}
          <div className="bg-[#FAF8F5] p-1 border border-[#E8E3D9] rounded flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded transition-colors font-medium ${
                activeTab === 'roster' ? 'bg-[#181818] text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Roster View
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 rounded transition-colors font-medium ${
                activeTab === 'calendar' ? 'bg-[#181818] text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Availability Calendar
            </button>
          </div>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#181818] hover:bg-[#282828] rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
            <span>+ Add Crew</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: ROSTER VIEW */}
      {activeTab === 'roster' && (
        <div className="space-y-5">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Roles Bar */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                    selectedRole === r
                      ? 'bg-[#181818] text-white'
                      : 'bg-white text-neutral-600 hover:text-neutral-900 border border-[#E8E3D9]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search crew by name, phone, spec..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E8E3D9] rounded text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#C58B39]"
              />
            </div>
          </div>

          {/* Crew Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCrew.map((cr) => {
              const activeAssignments = events.filter(e => 
                (e.crewAssignments && e.crewAssignments.some(a => a.crewId === cr.id)) ||
                (e.crewMembers && e.crewMembers.includes(cr.name))
              );

              return (
                <div
                  key={cr.id}
                  className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-[#D5CEBF] transition-all space-y-3"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#F0ECE1]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1C1A18] border border-[#C58B39]/50 flex items-center justify-center text-sm font-serif font-bold text-[#C58B39] shrink-0">
                          {cr.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-base text-[#181818]">{cr.name}</h3>
                          <span className="text-[10px] font-mono text-[#8C6428] font-bold uppercase tracking-wide block">
                            {cr.role}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        cr.availability === 'Available'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : cr.availability === 'Booked'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                      }`}>
                        {cr.availability}
                      </span>
                    </div>

                    {/* Coordinates & Specialization */}
                    <div className="py-2.5 space-y-1.5 text-xs text-neutral-600">
                      <div className="flex items-center gap-1.5 font-mono text-neutral-800 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{cr.phone}</span>
                      </div>
                      {cr.email && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="truncate">{cr.email}</span>
                        </div>
                      )}
                      <div className="text-[11px] text-neutral-700 pt-1">
                        <strong>Specialization:</strong> {cr.specialization}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        <strong>Experience:</strong> {cr.experience}
                      </div>
                    </div>

                    {/* Financial & Shoot Count Strip */}
                    <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase block">Daily Rate</span>
                        <span className="font-mono font-bold text-neutral-900 tabular-nums">
                          ₹{cr.defaultPayout.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 uppercase block">Shoots Booked</span>
                        <span className="font-mono font-bold text-[#C58B39] tabular-nums">
                          {activeAssignments.length} Shoots
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-between">
                    <button
                      onClick={() => handleEdit(cr)}
                      className="p-1.5 text-neutral-600 hover:text-neutral-900 text-xs flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </button>

                    <div className="text-[10px] font-mono text-neutral-400">
                      ID: {cr.id}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: CALENDAR & AVAILABILITY */}
      {activeTab === 'calendar' && (
        <div className="space-y-5">
          {/* Date Selector Bar */}
          <div className="bg-white border border-[#E8E3D9] p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-base text-[#181818]">Crew Calendar & Date Availability</h3>
              <p className="text-xs text-neutral-500">Inspect shoot assignments and detect double-booking overlaps</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-600 font-medium">Select Production Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 border border-[#DCD6C8] rounded text-xs text-neutral-900 font-mono font-medium bg-[#FAF8F5]"
              />
            </div>
          </div>

          {/* Active Shoots on this date */}
          <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-2xs space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#181818] uppercase tracking-wide pb-2 border-b border-[#F0ECE1]">
              Shoots Scheduled on {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </h4>

            {assignmentsOnSelectedDate.length === 0 ? (
              <div className="py-6 text-center text-neutral-400 italic text-xs">
                No event shoots scheduled on this date. Entire roster is available.
              </div>
            ) : (
              <div className="space-y-3">
                {assignmentsOnSelectedDate.map(({ event }) => (
                  <div key={event.id} className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg flex items-center justify-between gap-3">
                    <div>
                      <div className="font-serif font-bold text-sm text-[#181818]">{event.eventName}</div>
                      <div className="text-xs text-neutral-600 mt-0.5">
                        Client: {event.clientName} · 📍 {event.venue}, {event.locationCity}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-1">
                        Deployed Crew: <strong className="text-neutral-800">{event.crewMembers?.join(', ') || 'None'}</strong>
                      </div>
                    </div>

                    {onOpenEventCommandCenter && (
                      <button
                        onClick={() => onOpenEventCommandCenter(event)}
                        className="px-3 py-1.5 bg-white border border-[#DCD6C8] hover:bg-[#F2ECE1] rounded text-xs font-semibold text-neutral-800"
                      >
                        Open Event Workspace
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Roster Availability Grid for Selected Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Available Crew */}
            <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE1]">
                <h4 className="font-serif font-bold text-sm text-emerald-800 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Available for Booking ({crew.filter(c => !bookedCrewIdsOnDate.has(c.id)).length})</span>
                </h4>
              </div>

              <div className="divide-y divide-[#F0ECE1]">
                {crew.filter(c => !bookedCrewIdsOnDate.has(c.id)).map(c => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-neutral-900">{c.name}</div>
                      <div className="text-[11px] text-neutral-500">{c.role} · {c.phone}</div>
                    </div>
                    <span className="font-mono text-neutral-700">₹{c.defaultPayout.toLocaleString('en-IN')}/day</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Booked / Assigned Crew */}
            <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE1]">
                <h4 className="font-serif font-bold text-sm text-blue-800 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Already Booked on Date ({crew.filter(c => bookedCrewIdsOnDate.has(c.id)).length})</span>
                </h4>
              </div>

              <div className="divide-y divide-[#F0ECE1]">
                {crew.filter(c => bookedCrewIdsOnDate.has(c.id)).length === 0 ? (
                  <div className="py-6 text-center text-neutral-400 italic text-xs">
                    No crew booked on this date.
                  </div>
                ) : (
                  crew.filter(c => bookedCrewIdsOnDate.has(c.id)).map(c => (
                    <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-neutral-900">{c.name}</div>
                        <div className="text-[11px] text-neutral-500">{c.role} · {c.phone}</div>
                      </div>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Booked on Shoot
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Crew Modal */}
      <CrewModal
        isOpen={isCrewModalOpen}
        onClose={() => setIsCrewModalOpen(false)}
        onSave={onSaveCrew}
        initialData={editingCrew}
      />
    </div>
  );
};
