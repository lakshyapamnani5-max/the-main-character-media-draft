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
  ChevronRight,
  Key,
  Lock,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  LogIn,
  Wallet,
  ChevronDown,
  ChevronUp,
  MapPin
} from 'lucide-react';
import { CrewMember, CrewRole, EventShoot } from '../../types';
import { CrewModal } from './CrewModal';
import { FirebaseConfigModal } from './FirebaseConfigModal';
import { getEffectiveFirebaseConfig } from '../../services/firebase';
import { StorageService } from '../../services/storage';

interface CrewManagementViewProps {
  crew: CrewMember[];
  events: EventShoot[];
  onSaveCrew: (crewData: Partial<CrewMember> & { name: string; phone: string; role: CrewRole; email?: string; password?: string; firebaseUid?: string }) => void;
  onDeleteCrew?: (crewId: string) => void;
  onOpenEventCommandCenter?: (event: EventShoot) => void;
  onRefreshData?: () => void;
  onLoginAsCrew?: (crew: CrewMember) => void;
}

export const CrewManagementView: React.FC<CrewManagementViewProps> = ({
  crew,
  events,
  onSaveCrew,
  onDeleteCrew,
  onOpenEventCommandCenter,
  onRefreshData,
  onLoginAsCrew
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'roster' | 'calendar' | 'payouts'>('roster');
  const [expandedCrewPayoutId, setExpandedCrewPayoutId] = useState<string | null>(null);
  const [payoutFilter, setPayoutFilter] = useState<'all' | 'unsettled' | 'settled'>('all');

  const handleUpdatePayoutStatus = (eventId: string, crewId: string, status: 'Paid' | 'Unpaid') => {
    StorageService.updateCrewAssignmentPaymentStatus(eventId, crewId, status);
    if (onRefreshData) {
      onRefreshData();
    }
  };

  // Calendar Date selector
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Modals
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<CrewMember | null>(null);
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState(false);

  // Copy credentials feedback
  const [copiedCrewId, setCopiedCrewId] = useState<string | null>(null);

  const firebaseConfig = getEffectiveFirebaseConfig();

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

  const handleDelete = (crewMember: CrewMember) => {
    if (confirm(`Remove ${crewMember.name} from the crew roster?`)) {
      if (onDeleteCrew) {
        onDeleteCrew(crewMember.id);
      }
    }
  };

  const handleCopyCredentials = (cr: CrewMember) => {
    const text = `🎬 The Main Character Media - Crew Portal Credentials\n\nHi ${cr.name},\nHere are your login credentials for the Crew Portal:\n\nEmail: ${cr.email || 'Not set'}\nPassword: ${cr.password || '••••••••'}\nRole: ${cr.role}\n\nSign in here: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedCrewId(cr.id);
    setTimeout(() => setCopiedCrewId(null), 2500);
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
  const firebaseSyncedCount = crew.filter(c => c.firebaseUid || (c.email && c.password)).length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">Creative Workforce & Roster</span>
            <span className="text-neutral-300">·</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Firebase Auth Connected</span>
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#181818] tracking-tight mt-1">
            Crew Management & Deployment
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Onboard creators with Email & Password, connect with Firebase Auth, and manage shoot deployments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Firebase Credentials Config Button */}
          <button
            onClick={() => setIsFirebaseConfigOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DCD6C8] rounded transition-colors"
            title="View or update Firebase Project Credentials"
          >
            <Key className="w-3.5 h-3.5 text-[#C58B39]" />
            <span>Firebase Config</span>
          </button>

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
            <button
              onClick={() => setActiveTab('payouts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors font-medium ${
                activeTab === 'payouts' ? 'bg-[#181818] text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>Crew Payouts</span>
            </button>
          </div>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#181818] hover:bg-[#282828] rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
            <span>+ Add Crew Member</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: ROSTER VIEW */}
      {activeTab === 'roster' && (
        <div className="space-y-5">
          
          {/* Metrics summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#E8E3D9] p-3.5 rounded-lg shadow-2xs">
              <span className="text-[10px] uppercase font-mono text-neutral-500 font-bold block">Total Crew</span>
              <span className="font-serif font-bold text-xl text-neutral-900">{crew.length}</span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Creators on roster</span>
            </div>

            <div className="bg-white border border-[#E8E3D9] p-3.5 rounded-lg shadow-2xs">
              <span className="text-[10px] uppercase font-mono text-neutral-500 font-bold block">Available Today</span>
              <span className="font-serif font-bold text-xl text-emerald-700">
                {crew.filter(c => c.availability === 'Available').length}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Ready for booking</span>
            </div>

            <div className="bg-white border border-[#E8E3D9] p-3.5 rounded-lg shadow-2xs">
              <span className="text-[10px] uppercase font-mono text-neutral-500 font-bold block">Firebase Auth Synced</span>
              <span className="font-serif font-bold text-xl text-[#C58B39]">
                {firebaseSyncedCount}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">With login credentials</span>
            </div>

            <div className="bg-white border border-[#E8E3D9] p-3.5 rounded-lg shadow-2xs">
              <span className="text-[10px] uppercase font-mono text-neutral-500 font-bold block">Active Roles</span>
              <span className="font-serif font-bold text-xl text-neutral-900">
                {new Set(crew.map(c => c.role)).size}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">Specializations</span>
            </div>
          </div>

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
                placeholder="Search crew by name, phone, email..."
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

              const hasFirebaseAuth = Boolean(cr.firebaseUid || (cr.email && cr.password));

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
                          {cr.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-base text-[#181818]">{cr.name}</h3>
                          <span className="text-[10px] font-mono text-[#8C6428] font-bold uppercase tracking-wide block">
                            {cr.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          cr.availability === 'Available'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : cr.availability === 'Booked'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                        }`}>
                          {cr.availability}
                        </span>

                        {hasFirebaseAuth ? (
                          <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Auth Active</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.2 rounded">
                            Local Roster
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Coordinates & Specialization */}
                    <div className="py-2.5 space-y-1.5 text-xs text-neutral-600">
                      <div className="flex items-center gap-1.5 font-mono text-neutral-800 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{cr.phone}</span>
                      </div>
                      
                      {cr.email ? (
                        <div className="flex items-center gap-1.5 truncate text-neutral-700">
                          <Mail className="w-3.5 h-3.5 text-[#C58B39]" />
                          <span className="truncate font-mono text-[11px]">{cr.email}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-700 italic flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>No login email assigned</span>
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

                    {/* Credentials Preview Box */}
                    <div className="mt-2.5 p-2.5 bg-neutral-50 border border-neutral-200 rounded text-[11px] flex items-center justify-between">
                      <div className="truncate pr-2">
                        <span className="text-[9px] uppercase font-bold text-neutral-400 block">Portal Auth</span>
                        <span className="font-mono text-neutral-700 truncate block">
                          {cr.email ? cr.email : 'No email'} · {cr.password ? '••••••••' : 'No pass'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCredentials(cr)}
                        className="flex items-center gap-1 px-2 py-1 bg-white border border-neutral-300 rounded hover:bg-neutral-100 text-neutral-700 text-[10px] font-mono shrink-0 transition-colors"
                        title="Copy credentials formatted for WhatsApp"
                      >
                        {copiedCrewId === cr.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Share</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onLoginAsCrew && onLoginAsCrew(cr)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181818] hover:bg-[#282828] text-white rounded text-xs font-semibold shadow-2xs transition-all active:scale-[0.98]"
                      title={`Login as ${cr.name} into Creator App`}
                    >
                      <LogIn className="w-3.5 h-3.5 text-[#C58B39]" />
                      <span>Login as Crew</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(cr)}
                        className="p-1.5 text-neutral-700 hover:text-black font-semibold text-xs flex items-center gap-1 transition-colors"
                        title="Edit Details & Credentials"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C58B39]" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(cr)}
                        className="p-1.5 text-neutral-400 hover:text-red-700 text-xs flex items-center gap-1 transition-colors"
                        title="Remove crew member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {crew.length === 0 ? (
            <div className="py-16 px-6 text-center bg-white border border-[#E8E3D9] rounded-xl shadow-xs max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#E8E3D9] flex items-center justify-center mx-auto text-[#C58B39]">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C58B39] font-bold">Production Roster Ready</span>
                <h3 className="font-serif font-bold text-xl text-[#181818] mt-1">No Crew Members Added Yet</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 leading-relaxed">
                  Onboard your first filmmaker, editor, drone operator, or content creator with their email & password to enable mobile crew login and shoot dispatching.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#181818] hover:bg-[#282828] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#C58B39]" />
                  <span>+ Onboard First Creator</span>
                </button>
                <button
                  onClick={() => setIsFirebaseConfigOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DCD6C8] text-neutral-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Key className="w-3.5 h-3.5 text-[#C58B39]" />
                  <span>Firebase Config</span>
                </button>
              </div>
            </div>
          ) : filteredCrew.length === 0 ? (
            <div className="py-12 text-center bg-white border border-[#E8E3D9] rounded-lg">
              <Camera className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <h3 className="font-serif font-bold text-base text-neutral-700">No crew members match filter</h3>
              <p className="text-xs text-neutral-500 mt-1">Try resetting the search query or role filter.</p>
              <button
                onClick={() => {
                  setSelectedRole('All');
                  setSelectedAvailability('All');
                  setSearchQuery('');
                }}
                className="mt-3 px-4 py-2 bg-[#181818] text-white text-xs font-semibold rounded hover:bg-[#282828]"
              >
                Reset Filters
              </button>
            </div>
          ) : null}
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

            {/* Booked Crew */}
            <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE1]">
                <h4 className="font-serif font-bold text-sm text-amber-800 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Already Booked ({bookedCrewIdsOnDate.size})</span>
                </h4>
              </div>

              {bookedCrewIdsOnDate.size === 0 ? (
                <div className="py-4 text-center text-neutral-400 italic text-xs">
                  No creators booked on this date.
                </div>
              ) : (
                <div className="divide-y divide-[#F0ECE1]">
                  {crew.filter(c => bookedCrewIdsOnDate.has(c.id)).map(c => (
                    <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-neutral-900">{c.name}</div>
                        <div className="text-[11px] text-neutral-500">{c.role} · {c.phone}</div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Booked
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* VIEW 3: CREW PAYOUTS VIEW */}
      {activeTab === 'payouts' && (() => {
        // Compute financial stats for each creator
        const crewPayoutList = crew.map(cr => {
          const assignedShoots = events.filter(e => 
            (e.crewAssignments && e.crewAssignments.some(a => a.crewId === cr.id)) ||
            (e.crewMembers && e.crewMembers.includes(cr.name))
          );

          let settled = 0;
          let unsettled = 0;

          const shootsDetails = assignedShoots.map(ev => {
            const asg = ev.crewAssignments?.find(a => a.crewId === cr.id);
            const amount = asg?.payout || cr.defaultPayout || 0;
            const status: 'Paid' | 'Unpaid' = asg?.paymentStatus || 'Unpaid';
            if (status === 'Paid') {
              settled += amount;
            } else {
              unsettled += amount;
            }

            return {
              event: ev,
              assignment: asg,
              amount,
              status,
              role: asg?.role || cr.role
            };
          });

          return {
            crew: cr,
            shootsDetails,
            shootsCount: assignedShoots.length,
            totalCommitted: settled + unsettled,
            settled,
            unsettled
          };
        });

        const totalAllCommitted = crewPayoutList.reduce((sum, c) => sum + c.totalCommitted, 0);
        const totalAllSettled = crewPayoutList.reduce((sum, c) => sum + c.settled, 0);
        const totalAllUnsettled = crewPayoutList.reduce((sum, c) => sum + c.unsettled, 0);

        const filteredPayoutList = crewPayoutList.filter(item => {
          const matchesSearch = 
            item.crew.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.crew.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.crew.phone.includes(searchQuery);

          if (!matchesSearch) return false;
          if (payoutFilter === 'unsettled') return item.unsettled > 0;
          if (payoutFilter === 'settled') return item.settled > 0 && item.unsettled === 0;
          return true;
        });

        return (
          <div className="space-y-5">
            {/* Summary Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-[#E8E3D9] p-3.5 rounded-lg shadow-2xs">
                <span className="text-[10px] uppercase font-mono text-neutral-500 font-bold block">Total Committed</span>
                <span className="font-serif font-bold text-xl text-neutral-900">
                  ₹{totalAllCommitted.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">Across all booked shoots</span>
              </div>

              <div className="bg-white border border-[#E8E3D9] p-3.5 rounded-lg shadow-2xs">
                <span className="text-[10px] uppercase font-mono text-emerald-700 font-bold block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Settled (Paid)</span>
                </span>
                <span className="font-serif font-bold text-xl text-emerald-700">
                  ₹{totalAllSettled.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">Disbursed to crew</span>
              </div>

              <div className="bg-white border border-[#E8E3D9] p-3.5 rounded-lg shadow-2xs">
                <span className="text-[10px] uppercase font-mono text-amber-700 font-bold block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Unsettled (Pending)</span>
                </span>
                <span className="font-serif font-bold text-xl text-amber-700">
                  ₹{totalAllUnsettled.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-600 block mt-0.5">Awaiting payout</span>
              </div>

              <div className="bg-white border border-[#E8E3D9] p-3.5 rounded-lg shadow-2xs">
                <span className="text-[10px] uppercase font-mono text-neutral-500 font-bold block">Roster Creators</span>
                <span className="font-serif font-bold text-xl text-neutral-900">
                  {crew.length}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">Active creative team</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPayoutFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                    payoutFilter === 'all'
                      ? 'bg-[#181818] text-white'
                      : 'bg-white text-neutral-600 hover:text-neutral-900 border border-[#E8E3D9]'
                  }`}
                >
                  All Creators ({crewPayoutList.length})
                </button>
                <button
                  onClick={() => setPayoutFilter('unsettled')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                    payoutFilter === 'unsettled'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-neutral-600 hover:text-neutral-900 border border-[#E8E3D9]'
                  }`}
                >
                  Has Unsettled Dues ({crewPayoutList.filter(c => c.unsettled > 0).length})
                </button>
                <button
                  onClick={() => setPayoutFilter('settled')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                    payoutFilter === 'settled'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-neutral-600 hover:text-neutral-900 border border-[#E8E3D9]'
                  }`}
                >
                  Fully Settled ({crewPayoutList.filter(c => c.totalCommitted > 0 && c.unsettled === 0).length})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search creator payouts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E8E3D9] rounded text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#C58B39]"
                />
              </div>
            </div>

            {/* Crew Cards Grid */}
            {crew.length === 0 ? (
              <div className="py-16 px-6 text-center bg-white border border-[#E8E3D9] rounded-xl shadow-xs max-w-xl mx-auto space-y-3">
                <Wallet className="w-10 h-10 text-neutral-300 mx-auto" />
                <h3 className="font-serif font-bold text-lg text-neutral-800">No Crew Members on Roster</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Add creators in the Roster View to track their event-by-event compensation, settled payouts, and pending dues.
                </p>
                <button
                  onClick={handleAddNew}
                  className="px-4 py-2 bg-[#181818] text-white text-xs font-semibold rounded-lg hover:bg-[#282828]"
                >
                  + Add Crew Member
                </button>
              </div>
            ) : filteredPayoutList.length === 0 ? (
              <div className="py-12 text-center bg-white border border-[#E8E3D9] rounded-lg">
                <Search className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <h3 className="font-serif font-bold text-base text-neutral-700">No creators match criteria</h3>
                <p className="text-xs text-neutral-500 mt-1">Try resetting the search query or settlement filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPayoutList.map(({ crew: cr, shootsDetails, shootsCount, totalCommitted, settled, unsettled }) => {
                  const isExpanded = expandedCrewPayoutId === cr.id;

                  return (
                    <div
                      key={cr.id}
                      className={`bg-white border rounded-xl shadow-xs transition-all flex flex-col justify-between ${
                        isExpanded ? 'border-[#C58B39] ring-2 ring-[#C58B39]/20' : 'border-[#E8E3D9] hover:border-[#D5CEBF]'
                      }`}
                    >
                      <div className="p-5 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#F0ECE1]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1C1A18] border border-[#C58B39]/50 flex items-center justify-center text-sm font-serif font-bold text-[#C58B39] shrink-0">
                              {cr.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <h3 className="font-serif font-bold text-base text-[#181818]">{cr.name}</h3>
                              <span className="text-[10px] font-mono text-[#8C6428] font-bold uppercase tracking-wide block">
                                {cr.role}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3D9] text-neutral-700 font-semibold shrink-0">
                            ₹{cr.defaultPayout.toLocaleString('en-IN')}/day
                          </span>
                        </div>

                        {/* Financial Stats Breakdown */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg">
                            <span className="text-[9px] uppercase font-mono text-neutral-500 font-bold block">Shoots</span>
                            <span className="font-mono font-bold text-sm text-neutral-900 mt-0.5 block">
                              {shootsCount}
                            </span>
                          </div>

                          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                            <span className="text-[9px] uppercase font-mono text-emerald-800 font-bold block">Settled</span>
                            <span className="font-mono font-bold text-sm text-emerald-800 mt-0.5 block">
                              ₹{settled.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg">
                            <span className="text-[9px] uppercase font-mono text-amber-800 font-bold block">Unsettled</span>
                            <span className="font-mono font-bold text-sm text-amber-800 mt-0.5 block">
                              ₹{unsettled.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {/* Contact details */}
                        <div className="text-xs text-neutral-600 flex items-center justify-between font-mono">
                          <span>Phone: {cr.phone}</span>
                          <span>Total: ₹{totalCommitted.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Expandable Shoots & Payouts List */}
                      <div className="border-t border-[#F0ECE1] bg-[#FAF8F5]/50 rounded-b-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedCrewPayoutId(isExpanded ? null : cr.id)}
                          className="w-full px-5 py-3 flex items-center justify-between text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-[#F2ECE1]/50 transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5 text-[#C58B39]" />
                            <span>{isExpanded ? 'Hide Event Payouts' : `View Event Payouts (${shootsCount})`}</span>
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="p-4 space-y-3 bg-white border-t border-[#E8E3D9]">
                            {shootsDetails.length === 0 ? (
                              <div className="py-4 text-center text-xs text-neutral-400 italic">
                                No shoot assignments recorded for {cr.name} yet.
                              </div>
                            ) : (
                              <div className="space-y-2.5 divide-y divide-[#F0ECE1]">
                                {shootsDetails.map(({ event, amount, status, role }) => (
                                  <div key={event.id} className="pt-2.5 first:pt-0 space-y-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-xs text-neutral-900 truncate">
                                          {event.eventName}
                                        </div>
                                        <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                                          <Calendar className="w-3 h-3 text-neutral-400" />
                                          <span>{event.startDate || (event as any).shootDate || 'Upcoming'}</span>
                                          <span className="text-neutral-300">·</span>
                                          <span className="truncate">{event.venue}</span>
                                        </div>
                                        <div className="text-[10px] text-[#C58B39] font-mono mt-0.5">
                                          Role: {role}
                                        </div>
                                      </div>

                                      {/* Amount & Status Dropdown */}
                                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                                        <span className="font-mono font-bold text-xs text-neutral-900">
                                          ₹{amount.toLocaleString('en-IN')}
                                        </span>

                                        <select
                                          value={status}
                                          onChange={(e) => handleUpdatePayoutStatus(event.id, cr.id, e.target.value as 'Paid' | 'Unpaid')}
                                          className={`text-[11px] font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none transition-all ${
                                            status === 'Paid'
                                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                                              : 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                                          }`}
                                        >
                                          <option value="Unpaid">⏳ Unpaid</option>
                                          <option value="Paid">✓ Paid</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Crew Modal for Adding / Editing */}
      <CrewModal
        isOpen={isCrewModalOpen}
        onClose={() => {
          setIsCrewModalOpen(false);
          setEditingCrew(null);
        }}
        onSave={onSaveCrew}
        initialData={editingCrew}
      />

      {/* Firebase Config Modal */}
      <FirebaseConfigModal
        isOpen={isFirebaseConfigOpen}
        onClose={() => setIsFirebaseConfigOpen(false)}
      />

    </div>
  );
};
