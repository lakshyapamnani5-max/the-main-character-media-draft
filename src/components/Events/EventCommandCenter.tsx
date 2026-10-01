import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  CheckSquare, 
  Square, 
  DollarSign, 
  CreditCard, 
  Plus, 
  Download, 
  Eye, 
  Camera, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  Layers, 
  Upload, 
  Trash2, 
  Check, 
  Clock3,
  Phone,
  Mail,
  UserCheck,
  MessageCircle
} from 'lucide-react';
import { 
  EventShoot, 
  EventStatus, 
  SubEvent, 
  TimelineItem, 
  POVItem, 
  EventCrewAssignment, 
  EventFile, 
  Quotation, 
  PaymentRecord,
  CrewMember
} from '../../types';
import { StorageService } from '../../services/storage';

// Modals
import { SubEventModal } from './SubEventModal';
import { TimelineModal } from './TimelineModal';
import { POVModal } from './POVModal';
import { AssignCrewModal } from './AssignCrewModal';
import { EventFileModal } from './EventFileModal';
import { AddPaymentModal } from '../Clients/AddPaymentModal';
import { WhatsAppReminderModal } from '../Reminders/WhatsAppReminderModal';

export type CommandCenterTab = 
  | 'overview' 
  | 'sub-events' 
  | 'timeline' 
  | 'povs' 
  | 'crew' 
  | 'commercials' 
  | 'quotes' 
  | 'payments' 
  | 'files' 
  | 'notes' 
  | 'activity';

interface EventCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventShoot;
  onSaveEvent: (eventData: Partial<EventShoot> & { eventName: string; clientName: string }) => void;
  onToggleDeliverable: (eventId: string, deliverableId: string) => void;
  onRecordPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
  onSelectQuoteForPreview: (quote: Quotation) => void;
  quotes: Quotation[];
  payments: PaymentRecord[];
}

export const EventCommandCenter: React.FC<EventCommandCenterProps> = ({
  isOpen,
  onClose,
  event,
  onSaveEvent,
  onToggleDeliverable,
  onRecordPayment,
  onSelectQuoteForPreview,
  quotes,
  payments
}) => {
  const [activeTab, setActiveTab] = useState<CommandCenterTab>('overview');

  // Modal Triggers
  const [isSubEventModalOpen, setIsSubEventModalOpen] = useState(false);
  const [editingSubEvent, setEditingSubEvent] = useState<SubEvent | null>(null);

  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [isPOVModalOpen, setIsPOVModalOpen] = useState(false);
  
  const [isAssignCrewModalOpen, setIsAssignCrewModalOpen] = useState(false);
  const [editingCrewAssignment, setEditingCrewAssignment] = useState<EventCrewAssignment | null>(null);

  const [isEventFileModalOpen, setIsEventFileModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isWhatsAppReminderOpen, setIsWhatsAppReminderOpen] = useState(false);

  // Filters
  const [povFilterType, setPovFilterType] = useState<string>('All');
  const [povFilterStatus, setPovFilterStatus] = useState<string>('All');

  if (!isOpen) return null;

  const crewRoster = StorageService.getCrewRoster();
  const eventQuotes = quotes.filter(q => q.id === event.quoteId || q.eventName === event.eventName || q.clientName.toLowerCase() === event.clientName.toLowerCase());
  const eventPayments = payments.filter(p => p.eventId === event.id || p.clientId === event.clientId);

  const totalCrewPayout = (event.crewAssignments || []).reduce((acc, curr) => acc + (curr.payout || 0), 0);
  const grossProfit = event.packageTotal - totalCrewPayout;
  const grossMarginPercent = event.packageTotal > 0 ? Math.round((grossProfit / event.packageTotal) * 100) : 0;

  const completedDeliverables = (event.deliverables || []).filter(d => d.completed).length;
  const totalDeliverables = (event.deliverables || []).length;

  const handleStatusChange = (newStatus: EventStatus) => {
    onSaveEvent({
      id: event.id,
      eventName: event.eventName,
      clientName: event.clientName,
      status: newStatus
    });
  };

  const handleSaveSubEvent = (subEventData: Omit<SubEvent, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>) => {
    if (editingSubEvent) {
      const updatedSubEvents = (event.subEvents || []).map(s => 
        s.id === editingSubEvent.id 
          ? { ...s, ...subEventData, updatedAt: new Date().toISOString() } 
          : s
      );
      onSaveEvent({
        id: event.id,
        eventName: event.eventName,
        clientName: event.clientName,
        subEvents: updatedSubEvents
      });
      setEditingSubEvent(null);
    } else {
      StorageService.addSubEvent(event.id, subEventData);
    }
  };

  const handleSaveTimelineItem = (itemData: Omit<TimelineItem, 'id' | 'eventId'>) => {
    StorageService.addTimelineItem(event.id, itemData);
  };

  const handleSavePOV = (povData: Omit<POVItem, 'id' | 'eventId'>) => {
    StorageService.addPOVItem(event.id, povData);
  };

  const handleAssignCrew = (assignmentData: Omit<EventCrewAssignment, 'id' | 'eventId' | 'createdAt'>) => {
    StorageService.assignCrewToEvent(event.id, assignmentData);
    setEditingCrewAssignment(null);
  };

  const handleSaveFile = (fileData: Omit<EventFile, 'id' | 'eventId' | 'uploadedAt'>) => {
    StorageService.addEventFile(event.id, fileData);
  };

  const handleUpdatePOVStatus = (povId: string, status: POVItem['status']) => {
    StorageService.updatePOVStatus(event.id, povId, status);
  };

  const handleToggleTimelineComplete = (tlId: string) => {
    const updatedTimeline = (event.timeline || []).map(t => 
      t.id === tlId ? { ...t, completed: !t.completed } : t
    );
    onSaveEvent({
      id: event.id,
      eventName: event.eventName,
      clientName: event.clientName,
      timeline: updatedTimeline
    });
  };

  const getStatusBadgeClass = (status: EventStatus) => {
    switch (status) {
      case 'Confirmed':
      case 'Scheduled':
        return 'bg-emerald-900/30 text-emerald-300 border-emerald-600/40';
      case 'In Progress':
        return 'bg-blue-900/30 text-blue-300 border-blue-600/40';
      case 'Completed':
        return 'bg-neutral-800 text-neutral-300 border-neutral-600';
      case 'Cancelled':
      case 'Archived':
        return 'bg-rose-900/30 text-rose-300 border-rose-600/40';
      case 'Inquiry':
      case 'Quoted':
      case 'Negotiation':
      default:
        return 'bg-[#C58B39]/20 text-[#E0A85B] border-[#C58B39]/40';
    }
  };

  const tabs: { id: CommandCenterTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'sub-events', label: 'Sub-Events', count: (event.subEvents || []).length },
    { id: 'timeline', label: 'Timeline', count: (event.timeline || []).length },
    { id: 'povs', label: 'POVs / Content', count: (event.povs || []).length },
    { id: 'crew', label: 'Crew Assigned', count: (event.crewAssignments || []).length },
    { id: 'commercials', label: 'Commercials' },
    { id: 'quotes', label: 'Quotes', count: eventQuotes.length },
    { id: 'payments', label: 'Invoices & Payments', count: eventPayments.length },
    { id: 'files', label: 'Production Files', count: (event.files || []).length },
    { id: 'notes', label: 'Creative Notes' },
    { id: 'activity', label: 'Activity Log', count: (event.activityLog || []).length }
  ];

  const filteredPOVs = (event.povs || []).filter(p => {
    const matchesType = povFilterType === 'All' || p.type === povFilterType;
    const matchesStatus = povFilterStatus === 'All' || p.status === povFilterStatus;
    return matchesType && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 no-print-bg">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-6xl w-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Command Center Top Header Lockup */}
        <div className="p-4 sm:p-6 bg-[#121212] text-white border-b border-[#242424] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#C58B39]">
              <span>Event Command Center</span>
              <span className="text-neutral-600">·</span>
              <span>{event.eventType}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">ID: {event.id}</span>
            </div>

            <div className="flex items-baseline gap-3 mt-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF8F5] tracking-tight">
                {event.eventName}
              </h1>
            </div>

            {/* Sub Coordinates */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 mt-1.5 font-light">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-neutral-200 font-medium">{event.clientName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-mono text-neutral-300">
                  {event.startDate} {event.endDate && event.endDate !== event.startDate ? `to ${event.endDate}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                <span>{event.venue}, {event.locationCity}</span>
              </div>
            </div>
          </div>

          {/* Top Status & Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#1C1A18] px-2.5 py-1.5 rounded border border-[#2E2E2E]">
              <span className="text-[10px] uppercase font-mono text-neutral-400">Status:</span>
              <select
                value={event.status}
                onChange={(e) => handleStatusChange(e.target.value as EventStatus)}
                className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded border bg-transparent cursor-pointer focus:outline-none ${getStatusBadgeClass(event.status)}`}
              >
                <option value="Inquiry" className="bg-[#181818] text-white">Inquiry</option>
                <option value="Quoted" className="bg-[#181818] text-white">Quoted</option>
                <option value="Negotiation" className="bg-[#181818] text-white">Negotiation</option>
                <option value="Confirmed" className="bg-[#181818] text-white">Confirmed</option>
                <option value="Scheduled" className="bg-[#181818] text-white">Scheduled</option>
                <option value="In Progress" className="bg-[#181818] text-white">In Progress</option>
                <option value="Completed" className="bg-[#181818] text-white">Completed</option>
                <option value="Cancelled" className="bg-[#181818] text-white">Cancelled</option>
                <option value="Archived" className="bg-[#181818] text-white">Archived</option>
              </select>
            </div>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#181818] bg-[#FAF8F5] hover:bg-white rounded transition-colors shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>Record Payment</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Navigation Tabs Strip */}
        <div className="px-4 sm:px-6 bg-[#FAF8F5] border-b border-[#E8E3D9] flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-2.5 sm:px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'border-[#C58B39] text-[#181818] font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-[#181818] text-white'
                        : 'bg-[#E8E3D9] text-neutral-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Viewport */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 text-xs bg-[#FAF8F5] space-y-6">
          
          {/* ========================================================
              TAB 1: OVERVIEW
             ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-white border border-[#E8E3D9] p-4 rounded-lg shadow-2xs">
                  <div className="text-[10px] font-mono uppercase text-neutral-400 font-semibold">Package Total</div>
                  <div className="text-xl font-serif font-bold text-neutral-900 mt-1 font-mono tabular-nums">
                    ₹{event.packageTotal.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Contracted value</div>
                </div>

                <div className="bg-white border border-[#E8E3D9] p-4 rounded-lg shadow-2xs">
                  <div className="text-[10px] font-mono uppercase text-neutral-400 font-semibold">Advance Received</div>
                  <div className="text-xl font-serif font-bold text-emerald-700 mt-1 font-mono tabular-nums">
                    ₹{event.advancePaid.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Bank / UPI realized</div>
                </div>

                <div className="bg-white border border-[#E8E3D9] p-4 rounded-lg shadow-2xs">
                  <div className="text-[10px] font-mono uppercase text-neutral-400 font-semibold">Balance Due</div>
                  <div className={`text-xl font-serif font-bold mt-1 font-mono tabular-nums ${event.balanceDue > 0 ? 'text-[#D97706]' : 'text-neutral-400'}`}>
                    ₹{event.balanceDue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Due before shoot wrap</div>
                </div>

                <div className="bg-white border border-[#E8E3D9] p-4 rounded-lg shadow-2xs">
                  <div className="text-[10px] font-mono uppercase text-neutral-400 font-semibold">Gross Profit Margin</div>
                  <div className="text-xl font-serif font-bold text-[#C58B39] mt-1 font-mono tabular-nums">
                    ₹{grossProfit.toLocaleString('en-IN')} ({grossMarginPercent}%)
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">After ₹{totalCrewPayout.toLocaleString('en-IN')} crew payout</div>
                </div>
              </div>

              {/* Grid 2 Cols: Sub-events Schedule & Assigned Crew */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Sub-Events Overview */}
                <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#181818] uppercase tracking-wide">
                        Ceremonies & Sub-Events
                      </h3>
                      <p className="text-[11px] text-neutral-500">Multi-day wedding itinerary breakdown</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingSubEvent(null);
                        setIsSubEventModalOpen(true);
                      }}
                      className="text-xs font-semibold text-[#C58B39] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Sub-Event</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {(event.subEvents || []).length === 0 ? (
                      <div className="py-6 text-center text-neutral-400 italic">
                        No sub-events listed. Click "+ Add Sub-Event" to structure multi-day ceremonies.
                      </div>
                    ) : (
                      (event.subEvents || []).map((sub) => (
                        <div key={sub.id} className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded flex items-center justify-between gap-3">
                          <div>
                            <div className="font-serif font-bold text-sm text-[#181818]">{sub.name}</div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              📅 {sub.date} · ⏰ {sub.startTime} - {sub.endTime} · 📍 {sub.venue}
                            </div>
                            {sub.description && (
                              <div className="text-[11px] text-neutral-600 mt-1 line-clamp-1">{sub.description}</div>
                            )}
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white border border-[#E8E3D9] text-neutral-700 whitespace-nowrap">
                            {sub.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Assigned Crew Overview */}
                <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#181818] uppercase tracking-wide">
                        Crew Deployment & Roster
                      </h3>
                      <p className="text-[11px] text-neutral-500">Assigned creators, pilots, and editors</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCrewAssignment(null);
                        setIsAssignCrewModalOpen(true);
                      }}
                      className="text-xs font-semibold text-[#C58B39] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Assign Crew</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {(event.crewAssignments || []).length === 0 ? (
                      <div className="py-6 text-center text-neutral-400 italic">
                        No crew members deployed yet. Click "+ Assign Crew" to assign creators.
                      </div>
                    ) : (
                      (event.crewAssignments || []).map((asg) => (
                        <div key={asg.id} className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-neutral-900">{asg.crewName}</div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              Role: <strong className="text-neutral-700">{asg.role}</strong> · Call: {asg.callTime} · Wrap: {asg.wrapTime}
                            </div>
                            {asg.notes && (
                              <div className="text-[10px] text-neutral-500 italic mt-0.5">{asg.notes}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-neutral-900 tabular-nums">
                              ₹{asg.payout.toLocaleString('en-IN')}
                            </div>
                            <span className="text-[10px] text-neutral-400">Payout</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Deliverables Checklist Toggle */}
              <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE1]">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#181818] uppercase tracking-wide">
                      Master Deliverables Checklist ({completedDeliverables}/{totalDeliverables})
                    </h3>
                    <p className="text-[11px] text-neutral-500">Toggle raw handover, reels delivery, and client approvals</p>
                  </div>
                  <div className="w-48 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(event.deliverables || []).map((del) => (
                    <button
                      key={del.id}
                      type="button"
                      onClick={() => onToggleDeliverable(event.id, del.id)}
                      className="flex items-center gap-2 p-2.5 rounded border border-[#E8E3D9] hover:bg-[#FAF8F5] transition-colors text-left"
                    >
                      {del.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-neutral-400 shrink-0" />
                      )}
                      <span className={`text-xs ${del.completed ? 'line-through text-neutral-400' : 'text-neutral-900 font-medium'}`}>
                        {del.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: SUB-EVENTS
             ======================================================== */}
          {activeTab === 'sub-events' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white border border-[#E8E3D9] p-4 rounded-lg">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#181818]">Multi-Day Wedding Ceremonies</h3>
                  <p className="text-xs text-neutral-500">Define Haldi, Mehendi, Sangeet, Wedding, Reception, and Prep schedules</p>
                </div>
                <button
                  onClick={() => {
                    setEditingSubEvent(null);
                    setIsSubEventModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-[#181818] hover:bg-[#282828] text-white rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                  <span>+ Add Sub-Event</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(event.subEvents || []).map((sub, idx) => {
                  const assignedCrew = crewRoster.filter(c => (sub.assignedCrewIds || []).includes(c.id));
                  return (
                    <div key={sub.id || idx} className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-2xs space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-[#C58B39] font-bold uppercase tracking-wider">
                            Day {idx + 1}
                          </span>
                          <h4 className="font-serif font-bold text-base text-[#181818]">{sub.name}</h4>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3D9] text-neutral-700">
                          {sub.status}
                        </span>
                      </div>

                      <div className="py-2 border-y border-[#F0ECE1] space-y-1 text-xs text-neutral-600">
                        <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{sub.date}</span>
                          <span className="text-neutral-300">·</span>
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{sub.startTime} - {sub.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{sub.venue}</span>
                        </div>
                      </div>

                      {sub.description && (
                        <p className="text-xs text-neutral-700">{sub.description}</p>
                      )}

                      {assignedCrew.length > 0 && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#8C6428] tracking-wider block mb-1">
                            Assigned Crew:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {assignedCrew.map(c => (
                              <span key={c.id} className="px-2 py-0.5 bg-[#FAF8F5] border border-[#DCD6C8] rounded text-[11px] text-neutral-800 font-medium">
                                {c.name} ({c.role.split(' ')[0]})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {sub.notes && (
                        <div className="p-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded text-[11px] text-neutral-500 italic">
                          "{sub.notes}"
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#F0ECE1] flex justify-end">
                        <button
                          onClick={() => {
                            setEditingSubEvent(sub);
                            setIsSubEventModalOpen(true);
                          }}
                          className="text-xs font-semibold text-[#C58B39] hover:underline"
                        >
                          Edit Sub-Event
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: TIMELINE
             ======================================================== */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white border border-[#E8E3D9] p-4 rounded-lg">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#181818]">Production Call Sheet & Timeline</h3>
                  <p className="text-xs text-neutral-500">Minute-by-minute cues for lead creators, audio sync, and ceremonies</p>
                </div>
                <button
                  onClick={() => setIsTimelineModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#181818] hover:bg-[#282828] text-white rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                  <span>+ Add Timeline Cue</span>
                </button>
              </div>

              <div className="bg-white border border-[#E8E3D9] rounded-lg divide-y divide-[#F0ECE1] shadow-2xs">
                {(event.timeline || []).map((tl) => (
                  <div key={tl.id} className="p-4 hover:bg-[#FAF8F5] transition-colors flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleTimelineComplete(tl.id)}
                        className="mt-0.5"
                      >
                        {tl.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-neutral-300" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-[#181818] text-white px-2 py-0.5 rounded">
                            {tl.time}
                          </span>
                          <span className={`font-serif font-bold text-sm ${tl.completed ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                            {tl.title}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            tl.priority === 'Critical' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : tl.priority === 'High' 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                              : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {tl.priority}
                          </span>
                        </div>

                        {tl.description && (
                          <p className="text-xs text-neutral-600 mt-1">{tl.description}</p>
                        )}

                        <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-3">
                          {tl.venue && <span>📍 {tl.venue}</span>}
                          {tl.notes && <span className="italic text-neutral-400 font-light">"{tl.notes}"</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: POVS / CONTENT
             ======================================================== */}
          {activeTab === 'povs' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E8E3D9] p-4 rounded-lg">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#181818]">Content POV Architecture & Shot List</h3>
                  <p className="text-xs text-neutral-500">Bride POV, Groom POV, Couple POV, Rituals, Reels, Drone & BTS Directives</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={povFilterType}
                    onChange={(e) => setPovFilterType(e.target.value)}
                    className="px-2.5 py-1.5 border border-[#DCD6C8] rounded bg-[#FAF8F5] text-xs text-neutral-900"
                  >
                    <option value="All">All POV Types</option>
                    <option value="Bride POV">Bride POV</option>
                    <option value="Groom POV">Groom POV</option>
                    <option value="Couple POV">Couple POV</option>
                    <option value="Rituals">Rituals</option>
                    <option value="Reels">Reels</option>
                    <option value="Drone">Drone</option>
                    <option value="BTS">BTS</option>
                  </select>

                  <button
                    onClick={() => setIsPOVModalOpen(true)}
                    className="px-3.5 py-1.5 bg-[#181818] hover:bg-[#282828] text-white rounded text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                    <span>+ Add POV</span>
                  </button>
                </div>
              </div>

              {/* POVs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPOVs.map((pov) => {
                  const assignedCreator = crewRoster.find(c => c.id === pov.assignedCrewId);
                  return (
                    <div key={pov.id} className="bg-white border border-[#E8E3D9] rounded-lg p-4 shadow-2xs flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[11px] font-bold text-[#8C6428] uppercase tracking-wider bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#EADBBE]">
                            {pov.type}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            pov.priority === 'Urgent' ? 'bg-rose-50 text-rose-700' : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {pov.priority}
                          </span>
                        </div>

                        <p className="font-serif font-bold text-sm text-[#181818] mt-2">
                          {pov.description}
                        </p>

                        {pov.shotNotes && (
                          <div className="p-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded text-[11px] text-neutral-600 mt-2">
                            <span className="font-semibold text-neutral-800">Shot Directives:</span> {pov.shotNotes}
                          </div>
                        )}

                        <div className="text-[11px] text-neutral-500 mt-2 flex items-center justify-between">
                          <span>Assignee: <strong>{assignedCreator ? assignedCreator.name : 'Team Pool'}</strong></span>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-neutral-400">Capture State:</span>
                        <select
                          value={pov.status}
                          onChange={(e) => handleUpdatePOVStatus(pov.id, e.target.value as POVItem['status'])}
                          className={`text-[11px] font-semibold px-2 py-1 rounded border ${
                            pov.status === 'Captured' || pov.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : pov.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Captured">Captured</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: CREW ASSIGNED
             ======================================================== */}
          {activeTab === 'crew' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white border border-[#E8E3D9] p-4 rounded-lg">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#181818]">Shoot Crew Deployments & Payouts</h3>
                  <p className="text-xs text-neutral-500">Individual call times, wrap hours, sub-event assignments, and remuneration</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCrewAssignment(null);
                    setIsAssignCrewModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-[#181818] hover:bg-[#282828] text-white rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                  <span>+ Assign Crew Member</span>
                </button>
              </div>

              <div className="overflow-x-auto bg-white border border-[#E8E3D9] rounded-lg shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-neutral-600 border-b border-[#E8E3D9] uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Crew Member</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Call Time</th>
                      <th className="py-3 px-3">Wrap Time</th>
                      <th className="py-3 px-3 text-right">Agreed Payout</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE1]">
                    {(event.crewAssignments || []).map((asg) => {
                      const crewMember = crewRoster.find(c => c.id === asg.crewId);
                      return (
                        <tr key={asg.id} className="hover:bg-[#FAF8F5]/80">
                          <td className="py-3 px-4 font-semibold text-neutral-900">
                            <div>{asg.crewName}</div>
                            {crewMember?.phone && (
                              <div className="font-mono text-[10px] text-neutral-400">{crewMember.phone}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 font-medium text-neutral-800">{asg.role}</td>
                          <td className="py-3 px-3 font-mono text-neutral-600">{asg.callTime}</td>
                          <td className="py-3 px-3 font-mono text-neutral-600">{asg.wrapTime}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900 tabular-nums">
                            ₹{asg.payout.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setEditingCrewAssignment(asg);
                                setIsAssignCrewModalOpen(true);
                              }}
                              className="text-xs text-[#C58B39] font-medium hover:underline"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* CREW REMINDERS & WHATSAPP LOG */}
              <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0ECE1]">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#C58B39] font-bold">
                      Semi-Automated Dispatch
                    </div>
                    <h4 className="font-serif font-bold text-base text-[#181818]">
                      Crew Reminders & WhatsApp Status
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Dispatched reminders per crew member. Status tracked as Prepared or WhatsApp Opened.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsWhatsAppReminderOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-lg text-xs font-semibold transition-all shadow-xs self-start sm:self-auto"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>Send Crew Reminder (WhatsApp)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(event.crewAssignments && event.crewAssignments.length > 0 ? event.crewAssignments : (event.crewMembers || []).map(name => ({ crewId: `cr-${name}`, crewName: name, role: 'Crew', callTime: '08:00 AM' }))).map((asg) => {
                    const reminder = (event.crewReminders || []).find(r => r.crewId === asg.crewId);
                    const isOpened = reminder?.status === 'WhatsApp Opened';

                    return (
                      <div key={asg.crewId} className="p-3.5 rounded-lg border border-[#E8E3D9] bg-[#FAF8F5] flex flex-col justify-between space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-xs text-neutral-900">{asg.crewName}</div>
                            <div className="text-[11px] text-neutral-500">{asg.role} · Call: {asg.callTime}</div>
                          </div>

                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                            isOpened 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {isOpened ? 'WhatsApp Opened' : 'Reminder: Pending'}
                          </span>
                        </div>

                        {reminder && (
                          <div className="text-[10px] text-neutral-400 font-mono pt-1 border-t border-neutral-200">
                            Logged by {reminder.adminName} · {new Date(reminder.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 6: COMMERCIALS
             ======================================================== */}
          {activeTab === 'commercials' && (
            <div className="space-y-5">
              <div className="bg-white border border-[#E8E3D9] p-5 rounded-lg shadow-2xs space-y-4">
                <h3 className="font-serif font-bold text-base text-[#181818] pb-2 border-b border-[#F0ECE1]">
                  Commercial Production Ledger & Profitability
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded space-y-1">
                    <span className="text-neutral-500 font-medium">Contracted Package Value</span>
                    <div className="font-mono text-xl font-bold text-neutral-900">
                      ₹{event.packageTotal.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded space-y-1">
                    <span className="text-neutral-500 font-medium">Total Crew Remuneration</span>
                    <div className="font-mono text-xl font-bold text-neutral-700">
                      ₹{totalCrewPayout.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded space-y-1">
                    <span className="text-neutral-500 font-medium">Estimated Net Gross Margin</span>
                    <div className="font-mono text-xl font-bold text-[#C58B39]">
                      ₹{grossProfit.toLocaleString('en-IN')} ({grossMarginPercent}%)
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF6EE] border border-[#E2D5BE] rounded text-xs text-[#8C6428] space-y-1 font-mono">
                  <div><strong>Advance Paid:</strong> ₹{event.advancePaid.toLocaleString('en-IN')}</div>
                  <div><strong>Remaining Balance Due:</strong> ₹{event.balanceDue.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 7: QUOTES
             ======================================================== */}
          {activeTab === 'quotes' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E8E3D9] p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#181818]">Linked Commercial Quotations</h3>
                  <p className="text-xs text-neutral-500">Official snapshot proposals associated with this event</p>
                </div>
              </div>

              <div className="space-y-3">
                {eventQuotes.length === 0 ? (
                  <div className="bg-white border border-[#E8E3D9] p-8 text-center text-neutral-400 italic rounded-lg">
                    No quotations directly attached to this shoot.
                  </div>
                ) : (
                  eventQuotes.map(q => (
                    <div key={q.id} className="bg-white border border-[#E8E3D9] rounded-lg p-4 flex items-center justify-between shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-neutral-900">{q.quoteNumber}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3D9]">
                            {q.status}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-600 mt-1">{q.eventName} · {q.items.length} items</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="font-mono font-bold text-sm text-neutral-900 tabular-nums">
                          ₹{q.grandTotal.toLocaleString('en-IN')}
                        </div>
                        <button
                          onClick={() => onSelectQuoteForPreview(q)}
                          className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DCD6C8] rounded text-xs font-semibold text-neutral-800 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#C58B39]" />
                          <span>Preview</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 8: PAYMENTS
             ======================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E8E3D9] p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#181818]">Client Payment Receipts & Invoices</h3>
                  <p className="text-xs text-neutral-500">Verified transaction receipts and settlements</p>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#181818] hover:bg-[#282828] text-white rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                  <span>+ Record Payment</span>
                </button>
              </div>

              <div className="bg-white border border-[#E8E3D9] rounded-lg overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-neutral-600 border-b border-[#E8E3D9] uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-3">Mode</th>
                      <th className="py-3 px-3">Ref #</th>
                      <th className="py-3 px-3">Notes</th>
                      <th className="py-3 px-4 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE1]">
                    {eventPayments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-neutral-400 italic">
                          No payments recorded yet for this event.
                        </td>
                      </tr>
                    ) : (
                      eventPayments.map(p => (
                        <tr key={p.id}>
                          <td className="py-3 px-4 font-mono text-neutral-700">{p.date}</td>
                          <td className="py-3 px-3 font-semibold text-neutral-900">{p.paymentMode}</td>
                          <td className="py-3 px-3 font-mono text-neutral-500">{p.referenceNumber || '—'}</td>
                          <td className="py-3 px-3 text-neutral-600">{p.notes || '—'}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                            + ₹{p.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 9: FILES
             ======================================================== */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E8E3D9] p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#181818]">Event Documents & Media Attachments</h3>
                  <p className="text-xs text-neutral-500">Contracts, moodboards, shot lists, venue gate passes, and references</p>
                </div>
                <button
                  onClick={() => setIsEventFileModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#181818] hover:bg-[#282828] text-white rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#C58B39]" />
                  <span>+ Upload File</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(event.files || []).length === 0 ? (
                  <div className="col-span-full bg-white border border-[#E8E3D9] p-8 text-center text-neutral-400 italic rounded-lg">
                    No files attached yet. Click "+ Upload File" to add contracts or moodboards.
                  </div>
                ) : (
                  (event.files || []).map(f => (
                    <div key={f.id} className="bg-white border border-[#E8E3D9] rounded-lg p-4 shadow-2xs space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-mono uppercase text-[#8C6428] font-bold bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#EADBBE]">
                          {f.category}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">{f.fileSize}</span>
                      </div>
                      <div className="font-semibold text-neutral-900 text-xs truncate" title={f.name}>
                        {f.name}
                      </div>
                      {f.notes && (
                        <p className="text-[11px] text-neutral-500 italic truncate">{f.notes}</p>
                      )}
                      <div className="pt-2 border-t border-[#F0ECE1] flex justify-between items-center text-[10px] text-neutral-400">
                        <span>By {f.uploadedBy}</span>
                        <button className="text-[#C58B39] font-semibold hover:underline">Download</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 10: NOTES
             ======================================================== */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E8E3D9] p-5 rounded-lg shadow-2xs space-y-4">
                <h3 className="font-serif font-bold text-base text-[#181818] pb-2 border-b border-[#F0ECE1]">
                  Creative & Production Directives
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-neutral-800 text-xs mb-1">Production Notes:</label>
                    <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded text-xs text-neutral-700 leading-relaxed whitespace-pre-line">
                      {event.notes || 'No specific production notes entered.'}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 text-xs mb-1">Consent & Social Media Usage Policy:</label>
                    <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded text-xs text-neutral-700 leading-relaxed whitespace-pre-line">
                      {event.consentUsageNotes || 'Standard Social Media Usage Permission Granted.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 11: ACTIVITY LOG
             ======================================================== */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E8E3D9] p-4 rounded-lg">
                <h3 className="font-serif font-bold text-base text-[#181818]">Production Audit Log</h3>
                <p className="text-xs text-neutral-500">Complete timeline of state transitions and crew actions</p>
              </div>

              <div className="bg-white border border-[#E8E3D9] rounded-lg divide-y divide-[#F0ECE1] shadow-2xs">
                {(event.activityLog || []).map(act => (
                  <div key={act.id} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-neutral-900">{act.action}</div>
                      <div className="text-neutral-600 mt-0.5">{act.details}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">By {act.performedBy}</div>
                    </div>
                    <div className="font-mono text-[10px] text-neutral-400 shrink-0">
                      {new Date(act.timestamp).toLocaleDateString('en-IN')} {new Date(act.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Embedded Helper Modals */}
      <SubEventModal
        isOpen={isSubEventModalOpen}
        onClose={() => {
          setIsSubEventModalOpen(false);
          setEditingSubEvent(null);
        }}
        event={event}
        onSaveSubEvent={handleSaveSubEvent}
        initialData={editingSubEvent}
      />

      <TimelineModal
        isOpen={isTimelineModalOpen}
        onClose={() => setIsTimelineModalOpen(false)}
        event={event}
        onSaveTimelineItem={handleSaveTimelineItem}
      />

      <POVModal
        isOpen={isPOVModalOpen}
        onClose={() => setIsPOVModalOpen(false)}
        event={event}
        onSavePOV={handleSavePOV}
      />

      <AssignCrewModal
        isOpen={isAssignCrewModalOpen}
        onClose={() => {
          setIsAssignCrewModalOpen(false);
          setEditingCrewAssignment(null);
        }}
        event={event}
        onAssignCrew={handleAssignCrew}
        initialAssignment={editingCrewAssignment}
      />

      <EventFileModal
        isOpen={isEventFileModalOpen}
        onClose={() => setIsEventFileModalOpen(false)}
        event={event}
        onSaveFile={handleSaveFile}
      />

      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        client={{
          id: event.clientId,
          name: event.clientName,
          phone: event.clientContact?.phone || '',
          email: event.clientContact?.email || '',
          notes: '',
          createdAt: '',
          updatedAt: ''
        }}
        events={[event]}
        onRecordPayment={onRecordPayment}
      />

      <WhatsAppReminderModal
        isOpen={isWhatsAppReminderOpen}
        onClose={() => setIsWhatsAppReminderOpen(false)}
        event={event}
      />
    </div>
  );
};
