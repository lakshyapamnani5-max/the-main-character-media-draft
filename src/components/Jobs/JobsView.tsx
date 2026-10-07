import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  ArrowRight, 
  MessageCircle, 
  AlertCircle, 
  Eye, 
  Filter, 
  Briefcase, 
  Sparkles,
  Phone,
  Mail,
  Star,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  EventShoot, 
  Client, 
  PaymentRecord, 
  Quotation, 
  Enquiry, 
  PlannerVendor, 
  EventStatus 
} from '../../types';
import { StorageService } from '../../services/storage';
import { EventModal } from '../Events/EventModal';
import { EventCommandCenter } from '../Events/EventCommandCenter';
import { AddPaymentModal } from '../Clients/AddPaymentModal';

export type JobFilterTab = 
  | 'all' 
  | 'upcoming' 
  | 'active' 
  | 'completed' 
  | 'enquiries' 
  | 'planners' 
  | 'other';

interface JobsViewProps {
  events: EventShoot[];
  clients: Client[];
  quotes: Quotation[];
  payments: PaymentRecord[];
  enquiries: Enquiry[];
  initialTab?: JobFilterTab;
  onSaveEvent: (eventData: Partial<EventShoot> & { eventName: string; clientName: string }) => void;
  onToggleDeliverable: (eventId: string, deliverableId: string) => void;
  onRecordPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
  onSelectQuoteForPreview?: (quote: Quotation) => void;
  onOpenSendReminder?: (event: EventShoot) => void;
  onQuickQuoteForEnquiry?: (enquiry: Enquiry) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  events,
  clients,
  quotes,
  payments,
  enquiries,
  initialTab = 'all',
  onSaveEvent,
  onToggleDeliverable,
  onRecordPayment,
  onSelectQuoteForPreview = () => {},
  onOpenSendReminder = () => {},
  onQuickQuoteForEnquiry = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<JobFilterTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventShoot | null>(null);
  const [activeCommandCenterEvent, setActiveCommandCenterEvent] = useState<EventShoot | null>(null);
  const [payingEvent, setPayingEvent] = useState<EventShoot | null>(null);

  // Planners state
  const [planners, setPlanners] = useState<PlannerVendor[]>(() => StorageService.getPlanners());
  const [isAddPlannerOpen, setIsAddPlannerOpen] = useState(false);
  const [newPlanner, setNewPlanner] = useState({
    name: '',
    companyName: '',
    role: 'Wedding Planner' as PlannerVendor['role'],
    phone: '',
    email: '',
    city: 'Mumbai',
    instagram: '',
    notes: ''
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const handleAddNew = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleSavePlanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanner.name || !newPlanner.companyName || !newPlanner.phone) return;
    StorageService.savePlanner(newPlanner);
    setPlanners(StorageService.getPlanners());
    setIsAddPlannerOpen(false);
    setNewPlanner({
      name: '',
      companyName: '',
      role: 'Wedding Planner',
      phone: '',
      email: '',
      city: 'Mumbai',
      instagram: '',
      notes: ''
    });
  };

  const handleConvertEnquiryToJob = (enq: Enquiry) => {
    const result = StorageService.convertEnquiryToClient(enq.id, true);
    if (result && result.event) {
      onSaveEvent(result.event);
      setActiveCommandCenterEvent(result.event);
    }
  };

  // Filter events based on tab
  const filteredEvents = events.filter(e => {
    const start = e.startDate || (e as any).shootDate || '';

    // Tab filtering
    if (activeTab === 'upcoming') {
      const isUpcoming = (e.status === 'Confirmed' || e.status === 'Scheduled') && start >= todayStr;
      if (!isUpcoming) return false;
    } else if (activeTab === 'active') {
      const isActive = e.status === 'In Progress' || (start <= todayStr && (e.endDate || start) >= todayStr && e.status !== 'Completed' && e.status !== 'Cancelled');
      if (!isActive) return false;
    } else if (activeTab === 'completed') {
      if (e.status !== 'Completed') return false;
    } else if (activeTab === 'other') {
      const type = (e.eventType || '').toLowerCase();
      const isOther = !type.includes('wedding') && !type.includes('sangeet') && !type.includes('reception');
      if (!isOther) return false;
    }

    // Status filter
    if (statusFilter !== 'All' && e.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match = 
        e.eventName.toLowerCase().includes(q) ||
        e.clientName.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        (e.locationCity || e.city || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // If viewing single event command center
  if (activeCommandCenterEvent) {
    const fresh = events.find(e => e.id === activeCommandCenterEvent.id) || activeCommandCenterEvent;
    return (
      <EventCommandCenter
        isOpen={true}
        onClose={() => setActiveCommandCenterEvent(null)}
        event={fresh}
        quotes={quotes}
        payments={payments}
        onSaveEvent={onSaveEvent}
        onToggleDeliverable={onToggleDeliverable}
        onRecordPayment={onRecordPayment}
        onSelectQuoteForPreview={onSelectQuoteForPreview}
      />
    );
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#C58B39] font-semibold">
            Operations & Productions
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-0.5 tracking-tight">
            Weddings & Production Jobs
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Confirmed wedding shoots, active creator deployments, planners, and raw footage milestones.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#121212] hover:bg-black rounded-lg transition-all shadow-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-[#C58B39] stroke-[2.5]" />
          <span>+ New Job</span>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-white border border-[#E8E3D9] rounded-xl shadow-2xs overflow-x-auto">
        {[
          { id: 'all', label: 'All Jobs', count: events.length },
          { id: 'upcoming', label: 'Upcoming', count: events.filter(e => (e.status === 'Confirmed' || e.status === 'Scheduled') && (e.startDate || (e as any).shootDate || '') >= todayStr).length },
          { id: 'active', label: 'Active', count: events.filter(e => e.status === 'In Progress').length },
          { id: 'completed', label: 'Completed', count: events.filter(e => e.status === 'Completed').length },
          { id: 'enquiries', label: 'Enquiries', count: enquiries.length },
          { id: 'planners', label: 'Event Planners', count: planners.length },
          { id: 'other', label: 'Other Shoots', count: events.filter(e => !e.eventType.toLowerCase().includes('wedding')).length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as JobFilterTab)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-black hover:bg-[#FAF8F5]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* SUB-VIEW 1: ENQUIRIES TAB */}
      {activeTab === 'enquiries' && (
        <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-neutral-900">Enquiries Pipeline</h2>
              <p className="text-xs text-neutral-500">Inbound leads awaiting quotation or negotiation</p>
            </div>
          </div>

          <div className="space-y-3">
            {enquiries.map(enq => (
              <div key={enq.id} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E3D9] hover:border-[#C58B39] transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-neutral-900">{enq.clientName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 font-semibold">
                      {enq.pipelineStage}
                    </span>
                  </div>

                  <div className="text-neutral-600">
                    <strong>{enq.eventName}</strong> · 📅 {enq.date} · 📍 {enq.venue || 'Venue TBD'}
                  </div>

                  <div className="text-neutral-500 text-[11px]">
                    Phone: {enq.phone} · Source: {enq.leadSource} · Budget: <strong className="text-neutral-800 font-mono">₹{enq.budget.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                  <button
                    onClick={() => handleConvertEnquiryToJob(enq)}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                    title="Convert into Confirmed Job and open Command Center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C58B39]" />
                    <span>Convert to Confirmed Job</span>
                  </button>

                  <button
                    onClick={() => onQuickQuoteForEnquiry(enq)}
                    className="px-3 py-1.5 bg-[#C58B39] hover:bg-[#B37B2E] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>Create Custom Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: EVENT PLANNERS & VENDORS TAB */}
      {activeTab === 'planners' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-neutral-900">Event Planners & Vendor Directory</h2>
              <p className="text-xs text-neutral-500">Luxury wedding planners, decor designers, and venue managers</p>
            </div>

            <button
              onClick={() => setIsAddPlannerOpen(!isAddPlannerOpen)}
              className="px-3.5 py-1.5 bg-[#121212] hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>+ Add Planner / Vendor</span>
            </button>
          </div>

          {/* Add Planner Drawer / Form */}
          {isAddPlannerOpen && (
            <form onSubmit={handleSavePlanner} className="bg-white border-2 border-[#C58B39] rounded-xl p-5 shadow-md space-y-4 animate-in fade-in duration-150">
              <h3 className="font-serif font-bold text-base text-neutral-900">Add New Planner / Partner</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={newPlanner.name}
                    onChange={e => setNewPlanner({ ...newPlanner, name: e.target.value })}
                    placeholder="e.g. Rhea Singhania"
                    className="w-full p-2 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Company / Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={newPlanner.companyName}
                    onChange={e => setNewPlanner({ ...newPlanner, companyName: e.target.value })}
                    placeholder="e.g. The Regal Affair"
                    className="w-full p-2 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Role / Specialization *</label>
                  <select
                    value={newPlanner.role}
                    onChange={e => setNewPlanner({ ...newPlanner, role: e.target.value as any })}
                    className="w-full p-2 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
                  >
                    <option value="Wedding Planner">Wedding Planner</option>
                    <option value="Decor Designer">Decor Designer</option>
                    <option value="DJ / Sound">DJ / Sound</option>
                    <option value="MUA">MUA</option>
                    <option value="Choreographer">Choreographer</option>
                    <option value="Caterer">Caterer</option>
                    <option value="Venue Manager">Venue Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newPlanner.phone}
                    onChange={e => setNewPlanner({ ...newPlanner, phone: e.target.value })}
                    placeholder="+919820011223"
                    className="w-full p-2 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={newPlanner.email}
                    onChange={e => setNewPlanner({ ...newPlanner, email: e.target.value })}
                    placeholder="planner@example.com"
                    className="w-full p-2 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 font-medium mb-1">City / Base</label>
                  <input
                    type="text"
                    value={newPlanner.city}
                    onChange={e => setNewPlanner({ ...newPlanner, city: e.target.value })}
                    placeholder="Mumbai / Delhi"
                    className="w-full p-2 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPlannerOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C58B39] text-white font-semibold text-xs rounded-lg shadow-xs"
                >
                  Save Partner
                </button>
              </div>
            </form>
          )}

          {/* Planners Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planners.map(p => (
              <div key={p.id} className="bg-white border border-[#E8E3D9] rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#C58B39] font-bold">{p.role}</span>
                    <h3 className="font-serif font-bold text-base text-neutral-900 mt-0.5">{p.companyName}</h3>
                    <div className="text-xs text-neutral-600 font-medium">{p.name}</div>
                  </div>
                  <div className="flex items-center text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                    <span>{p.rating || 5}.0</span>
                  </div>
                </div>

                <div className="text-xs text-neutral-500 space-y-1 pt-2 border-t border-[#F0EBE1]">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-neutral-400" />
                    <span className="font-mono text-neutral-800">{p.phone}</span>
                  </div>
                  {p.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-neutral-400" />
                      <span className="truncate">{p.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    <span>{p.city}</span>
                  </div>
                </div>

                {p.notes && (
                  <p className="text-[11px] text-neutral-600 bg-[#FAF8F5] p-2 rounded-lg border border-[#E8E3D9]">
                    {p.notes}
                  </p>
                )}

                <div className="pt-1 flex items-center justify-between text-xs">
                  <a
                    href={`tel:${p.phone}`}
                    className="text-[#C58B39] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Call Partner</span>
                  </a>
                  {p.instagram && (
                    <span className="text-neutral-400 text-[11px] font-mono">{p.instagram}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: STANDARD JOBS LIST (All, Upcoming, Active, Completed, Other) */}
      {activeTab !== 'enquiries' && activeTab !== 'planners' && (
        <div className="space-y-4">
          
          {/* Search & Status Filters */}
          <div className="bg-white border border-[#E8E3D9] rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by client, venue, city or event name..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg px-2.5 py-1.5 font-medium text-neutral-800 focus:outline-none focus:border-[#C58B39]"
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.length === 0 ? (
              <div className="col-span-2 p-12 text-center text-xs text-neutral-500 bg-white rounded-xl border border-[#E8E3D9]">
                No jobs match the selected filter. Click "+ New Job" to schedule.
              </div>
            ) : (
              filteredEvents.map(event => {
                const totalCrew = (event.crewAssignments && event.crewAssignments.length > 0)
                  ? event.crewAssignments.length
                  : (event.crewMembers || []).length;
                const remindedCount = (event.crewReminders || []).filter(r => r.status === 'WhatsApp Opened').length;
                const isAllReminded = remindedCount >= totalCrew && totalCrew > 0;
                const callTime = event.crewAssignments?.[0]?.callTime || event.shootTime?.split('-')[0]?.trim() || '08:00 AM';

                return (
                  <div
                    key={event.id}
                    className="p-5 rounded-xl border border-[#E8E3D9] bg-white hover:border-[#C58B39] transition-all space-y-3.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <span className="font-mono text-[#C58B39] font-bold">
                            {event.startDate || (event as any).shootDate ? new Date(event.startDate || (event as any).shootDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{callTime}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-neutral-700">{event.eventType}</span>
                        </div>

                        <h3 className="font-serif text-xl font-bold text-neutral-900 tracking-tight mt-1">
                          {event.eventName}
                        </h3>

                        <div className="text-xs text-neutral-600 mt-0.5">
                          Client: <strong className="text-neutral-800">{event.clientName}</strong>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3D9] text-neutral-800 font-semibold uppercase shrink-0">
                        {event.status}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-600 flex items-center gap-1.5 truncate">
                      <span>📍</span>
                      <span className="font-medium text-neutral-900">{event.venue}</span>
                      <span>·</span>
                      <span>{event.locationCity || event.city || 'Mumbai'}</span>
                    </div>

                    {/* Vitals Grid */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-[#F0EBE1] text-xs">
                      <div>
                        <span className="text-neutral-500 block text-[11px]">Assigned Crew</span>
                        <span className="font-bold text-neutral-900 font-mono mt-0.5 block">{totalCrew} Creators</span>
                      </div>

                      <div>
                        <span className="text-neutral-500 block text-[11px]">Total Value</span>
                        <span className="font-bold text-neutral-900 font-mono mt-0.5 block">₹{event.packageTotal.toLocaleString('en-IN')}</span>
                      </div>

                      <div>
                        <span className="text-neutral-500 block text-[11px]">Balance Due</span>
                        <span className={`font-bold font-mono mt-0.5 block ${event.balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {event.balanceDue > 0 ? `₹${event.balanceDue.toLocaleString('en-IN')}` : 'Paid in Full'}
                        </span>
                      </div>
                    </div>

                    {/* Event Charges Breakdown Cards as required by brief:
                        e.g., WEDDING — ₹45,000 | Haldi — ₹8,000 | Sangeet — ₹12,000 | Wedding Day — ₹20,000 | Drone — ₹5,000 */}
                    <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1 font-mono">
                          <span>{event.eventType.toUpperCase()}</span>
                          <span className="text-neutral-400">·</span>
                          <span className="text-[#C58B39]">₹{event.packageTotal.toLocaleString('en-IN')}</span>
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {(event.subEvents?.length || 0) + (event.addOns?.length || 0)} charges
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {event.subEvents && event.subEvents.length > 0 ? (
                          event.subEvents.map((sub) => (
                            <div
                              key={sub.id}
                              className="px-2 py-1 bg-white border border-[#E8E3D9] rounded text-[11px] flex items-center gap-1.5 shadow-2xs"
                            >
                              <span className="font-medium text-neutral-800">{sub.name}</span>
                              <span className="text-neutral-400">―</span>
                              <span className="font-mono font-bold text-neutral-900">
                                ₹{(sub.eventCharge || Math.round(event.packageTotal / event.subEvents.length)).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="px-2 py-1 bg-white border border-[#E8E3D9] rounded text-[11px] flex items-center gap-1.5 shadow-2xs">
                            <span className="font-medium text-neutral-800">Main Event Day</span>
                            <span className="text-neutral-400">―</span>
                            <span className="font-mono font-bold text-neutral-900">
                              ₹{event.packageTotal.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}

                        {event.addOns && event.addOns.map((add, i) => (
                          <div
                            key={i}
                            className="px-2 py-1 bg-amber-50/70 border border-amber-200/80 rounded text-[11px] flex items-center gap-1.5 shadow-2xs"
                          >
                            <span className="font-medium text-amber-900">{add.name}</span>
                            <span className="text-amber-400">―</span>
                            <span className="font-mono font-bold text-amber-950">
                              ₹{add.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div>
                        {isAllReminded ? (
                          <span className="text-[11px] font-mono text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reminded</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-amber-700 font-medium flex items-center gap-1">
                            <span>⚠️ Reminder Pending</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenSendReminder(event)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#C58B39] hover:bg-[#B37B2E] rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => setActiveCommandCenterEvent(event)}
                          className="px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-[#FAF8F5] hover:bg-neutral-100 border border-[#E8E3D9] rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <span>Command Center</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Global Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={onSaveEvent}
        initialData={editingEvent}
      />

      {/* Add Payment Modal */}
      {payingEvent && (
        <AddPaymentModal
          isOpen={true}
          onClose={() => setPayingEvent(null)}
          client={clients.find(c => c.id === payingEvent.clientId) || {
            id: payingEvent.clientId,
            name: payingEvent.clientName,
            phone: payingEvent.clientContact?.phone || '',
            email: payingEvent.clientContact?.email || '',
            notes: '',
            createdAt: '',
            updatedAt: ''
          }}
          events={events}
          onRecordPayment={(pmt) => {
            onRecordPayment({
              ...pmt,
              clientId: payingEvent.clientId,
              eventId: payingEvent.id
            });
            setPayingEvent(null);
          }}
        />
      )}

    </div>
  );
};
