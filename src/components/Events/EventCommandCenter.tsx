import React, { useState, useEffect } from 'react';
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
  MessageCircle,
  ArrowRight,
  TrendingUp,
  Receipt,
  Tag,
  Briefcase,
  Sliders,
  ExternalLink,
  Edit2
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
  CrewMember,
  Expense,
  EventDeliverable
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
import { CalendarExportModal } from '../Common/CalendarExportModal';

export type CommandCenterTab = 
  | 'overview' 
  | 'functions' 
  | 'timeline' 
  | 'crew' 
  | 'commercials' 
  | 'content' 
  | 'deliverables' 
  | 'expenses' 
  | 'notes' 
  | 'quotes' 
  | 'payments' 
  | 'files' 
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
  const [editingPOV, setEditingPOV] = useState<POVItem | null>(null);
  
  const [isAssignCrewModalOpen, setIsAssignCrewModalOpen] = useState(false);
  const [editingCrewAssignment, setEditingCrewAssignment] = useState<EventCrewAssignment | null>(null);

  const [isEventFileModalOpen, setIsEventFileModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isWhatsAppReminderOpen, setIsWhatsAppReminderOpen] = useState(false);
  const [isCalendarExportOpen, setIsCalendarExportOpen] = useState(false);

  // Filters for Content / POVs tab
  const [povFilterSubEvent, setPovFilterSubEvent] = useState<string>('All');
  const [povFilterType, setPovFilterType] = useState<string>('All');
  const [povFilterStatus, setPovFilterStatus] = useState<string>('All');

  // Inline forms
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'Travel & Cab' as Expense['category'],
    amount: '' as number | '',
    paidBy: 'Admin',
    paymentMode: 'UPI' as Expense['paymentMode'],
    notes: ''
  });

  const [isAddAddOnOpen, setIsAddAddOnOpen] = useState(false);
  const [newAddOn, setNewAddOn] = useState({
    name: '',
    price: '' as number | ''
  });

  const [isAddDeliverableOpen, setIsAddDeliverableOpen] = useState(false);
  const [newDeliverable, setNewDeliverable] = useState({
    title: '',
    type: 'Social Reel' as EventDeliverable['type'],
    dueDate: '',
    notes: ''
  });

  // Direct editable brief state
  const [clientReqText, setClientReqText] = useState(event.clientRequirements || '');
  const [internalNotesText, setInternalNotesText] = useState(event.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [paymentDueDateVal, setPaymentDueDateVal] = useState(event.paymentDueDate || '');

  useEffect(() => {
    setClientReqText(event.clientRequirements || '');
    setInternalNotesText(event.notes || '');
    setPaymentDueDateVal(event.paymentDueDate || '');
  }, [event]);

  if (!isOpen) return null;

  const crewRoster = StorageService.getCrewRoster();
  const eventQuotes = quotes.filter(q => q.id === event.quoteId || q.eventName === event.eventName || q.clientName.toLowerCase() === event.clientName.toLowerCase());
  const eventPayments = payments.filter(p => p.eventId === event.id || p.clientId === event.clientId);
  const eventExpenses = StorageService.getExpensesByEvent(event.id);

  const totalCrewPayout = (event.crewAssignments || []).reduce((acc, curr) => acc + (curr.payout || 0), 0);
  const totalExpensesAmount = eventExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0) + totalCrewPayout;
  const grossProfit = event.packageTotal - totalExpensesAmount;
  const grossMarginPercent = event.packageTotal > 0 ? Math.round((grossProfit / event.packageTotal) * 100) : 0;

  const completedDeliverables = (event.deliverables || []).filter(d => d.completed).length;
  const totalDeliverables = (event.deliverables || []).length;

  const clientPhone = event.clientContact?.phone || '';
  const clientEmail = event.clientContact?.email || '';

  // Calculate sum of sub-events allocated charges
  const totalEventCharges = (event.subEvents || []).reduce((acc, s) => acc + (s.eventCharge || 0), 0);
  const totalAddOns = (event.addOns || []).reduce((acc, a) => acc + (a.price || 0), 0);

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
      StorageService.updateSubEvent(event.id, editingSubEvent.id, subEventData);
      setEditingSubEvent(null);
    } else {
      StorageService.addSubEvent(event.id, subEventData);
    }
    // Refresh parent state
    const refreshed = StorageService.getEventById(event.id);
    if (refreshed) onSaveEvent(refreshed);
  };

  const handleDeleteSubEvent = (subEventId: string) => {
    StorageService.deleteSubEvent(event.id, subEventId);
    const refreshed = StorageService.getEventById(event.id);
    if (refreshed) onSaveEvent(refreshed);
  };

  const handleSaveTimelineItem = (itemData: Omit<TimelineItem, 'id' | 'eventId'>) => {
    StorageService.addTimelineItem(event.id, itemData);
    const refreshed = StorageService.getEventById(event.id);
    if (refreshed) onSaveEvent(refreshed);
  };

  const handleDeleteTimelineItem = (tlId: string) => {
    StorageService.deleteTimelineItem(event.id, tlId);
    const refreshed = StorageService.getEventById(event.id);
    if (refreshed) onSaveEvent(refreshed);
  };

  const handleSavePOV = (povData: Omit<POVItem, 'id' | 'eventId'>) => {
    if (editingPOV) {
      StorageService.updatePOVItem(event.id, editingPOV.id, povData);
      setEditingPOV(null);
    } else {
      StorageService.addPOVItem(event.id, povData);
    }
    const refreshed = StorageService.getEventById(event.id);
    if (refreshed) onSaveEvent(refreshed);
  };

  const handleDeletePOV = (povId: string) => {
    StorageService.deletePOVItem(event.id, povId);
    const refreshed = StorageService.getEventById(event.id);
    if (refreshed) onSaveEvent(refreshed);
  };

  const handleAssignCrew = (assignmentData: Omit<EventCrewAssignment, 'id' | 'eventId' | 'createdAt'>) => {
    StorageService.assignCrewToEvent(event.id, assignmentData);
    setEditingCrewAssignment(null);
    const refreshed = StorageService.getEventById(event.id);
    if (refreshed) onSaveEvent(refreshed);
  };

  const handleAssignMultipleCrew = (assignments: Omit<EventCrewAssignment, 'id' | 'eventId' | 'createdAt'>[]) => {
    StorageService.assignMultipleCrewToEvent(event.id, assignments);
    setEditingCrewAssignment(null);
    const refreshed = StorageService.getEventById(event.id);
    if (refreshed) onSaveEvent(refreshed);
  };

  const handleSaveFile = (fileData: Omit<EventFile, 'id' | 'eventId' | 'uploadedAt'>) => {
    StorageService.addEventFile(event.id, fileData);
    const refreshed = StorageService.getEventById(event.id);
    if (refreshed) onSaveEvent(refreshed);
  };

  const handleUpdatePOVStatus = (povId: string, status: POVItem['status']) => {
    StorageService.updatePOVStatus(event.id, povId, status);
    const refreshed = StorageService.getEventById(event.id);
    if (refreshed) onSaveEvent(refreshed);
  };

  const handleTogglePOVCompleted = (pov: POVItem) => {
    const isNowDone = !pov.completed;
    StorageService.updatePOVItem(event.id, pov.id, {
      completed: isNowDone,
      status: isNowDone ? 'Delivered' : 'In Progress'
    });
    const refreshed = StorageService.getEventById(event.id);
    if (refreshed) onSaveEvent(refreshed);
  };

  const handleToggleTimelineComplete = (tlId: string) => {
    const target = (event.timeline || []).find(t => t.id === tlId);
    if (target) {
      StorageService.updateTimelineItem(event.id, tlId, { completed: !target.completed });
      const refreshed = StorageService.getEventById(event.id);
      if (refreshed) onSaveEvent(refreshed);
    }
  };

  const handleSaveAddOn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddOn.name.trim() || !newAddOn.price) return;
    StorageService.addEventAddOn(event.id, {
      name: newAddOn.name.trim(),
      price: Number(newAddOn.price)
    });
    setNewAddOn({ name: '', price: '' });
    setIsAddAddOnOpen(false);
    const refreshed = StorageService.getEventById(event.id);
    if (refreshed) onSaveEvent(refreshed);
  };

  const handleRemoveAddOn = (idx: number) => {
    StorageService.removeEventAddOn(event.id, idx);
    const refreshed = StorageService.getEventById(event.id);
    if (refreshed) onSaveEvent(refreshed);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title.trim() || !newExpense.amount) return;
    StorageService.saveExpense({
      title: newExpense.title.trim(),
      category: newExpense.category,
      amount: Number(newExpense.amount),
      date: new Date().toISOString().split('T')[0],
      eventId: event.id,
      eventName: event.eventName,
      paidBy: newExpense.paidBy,
      paymentMode: newExpense.paymentMode,
      notes: newExpense.notes.trim()
    });
    setNewExpense({
      title: '',
      category: 'Travel & Cab',
      amount: '',
      paidBy: 'Admin',
      paymentMode: 'UPI',
      notes: ''
    });
    setIsAddExpenseOpen(false);
  };

  const handleDeleteExpense = (expId: string) => {
    StorageService.deleteExpense(expId);
  };

  const handleSaveDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeliverable.title.trim()) return;
    StorageService.addDeliverable(event.id, {
      title: newDeliverable.title.trim(),
      type: newDeliverable.type,
      completed: false,
      dueDate: newDeliverable.dueDate || event.endDate || event.startDate,
      notes: newDeliverable.notes.trim()
    });
    setNewDeliverable({
      title: '',
      type: 'Social Reel',
      dueDate: '',
      notes: ''
    });
    setIsAddDeliverableOpen(false);
    const refreshed = StorageService.getEventById(event.id);
    if (refreshed) onSaveEvent(refreshed);
  };

  const handleDeleteDeliverable = (delId: string) => {
    StorageService.deleteDeliverable(event.id, delId);
    const refreshed = StorageService.getEventById(event.id);
    if (refreshed) onSaveEvent(refreshed);
  };

  const handleSaveNotesAndBrief = () => {
    setIsSavingNotes(true);
    onSaveEvent({
      id: event.id,
      eventName: event.eventName,
      clientName: event.clientName,
      clientRequirements: clientReqText.trim(),
      notes: internalNotesText.trim(),
      paymentDueDate: paymentDueDateVal || undefined
    });
    setTimeout(() => setIsSavingNotes(false), 500);
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

  // Filtered POVs
  const filteredPOVs = (event.povs || []).filter(p => {
    const matchesSubEvent = povFilterSubEvent === 'All' || p.subEventId === povFilterSubEvent;
    const matchesType = povFilterType === 'All' || p.type === povFilterType;
    const matchesStatus = povFilterStatus === 'All' || p.status === povFilterStatus;
    return matchesSubEvent && matchesType && matchesStatus;
  });

  const tabs: { id: CommandCenterTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'functions', label: 'Functions', count: (event.subEvents || []).length },
    { id: 'timeline', label: 'Timeline', count: (event.timeline || []).length },
    { id: 'crew', label: 'Crew', count: (event.crewAssignments || []).length },
    { id: 'commercials', label: 'Commercials' },
    { id: 'content', label: 'Content', count: (event.povs || []).length },
    { id: 'deliverables', label: 'Deliverables', count: (event.deliverables || []).length },
    { id: 'expenses', label: 'Expenses', count: eventExpenses.length },
    { id: 'notes', label: 'Notes / Brief' },
    { id: 'quotes', label: 'Quotes', count: eventQuotes.length },
    { id: 'payments', label: 'Payments', count: eventPayments.length },
    { id: 'files', label: 'Files', count: (event.files || []).length },
    { id: 'activity', label: 'Activity Log', count: (event.activityLog || []).length }
  ];

  const jobCategory = event.category || (event.eventType.toLowerCase().includes('wedding') ? 'Wedding' : 'Other Shoot');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 no-print-bg">
      <div className="bg-white rounded-xl border border-[#E8E3D9] max-w-6xl w-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* ========================================================
            COMMAND CENTER TOP HEADER LOCKUP
           ======================================================== */}
        <div className="p-4 sm:p-6 bg-[#121212] text-white border-b border-[#242424] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#C58B39]">
              <span className="px-2 py-0.5 rounded bg-white/10 font-bold text-white">
                {jobCategory === 'Wedding' ? '💍 Wedding Job' : jobCategory === 'Event Planner' ? '✨ Event Planner Job' : '🎬 Production Job'}
              </span>
              <span className="text-neutral-600">·</span>
              <span>{event.eventType}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">ID: {event.id}</span>
            </div>

            <div className="flex items-baseline gap-3 mt-1.5">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF8F5] tracking-tight">
                {event.eventName}
              </h1>
            </div>

            {/* Sub Coordinates with quick contact actions */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-300 mt-2 font-light">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C58B39]" />
                <span className="text-white font-semibold">{event.clientName}</span>
                {clientPhone && (
                  <span className="flex items-center gap-1 ml-1">
                    <a 
                      href={`tel:${clientPhone}`} 
                      className="text-[#C58B39] hover:underline font-mono text-[11px]"
                      title="Call Client"
                    >
                      ({clientPhone})
                    </a>
                    <a
                      href={`https://wa.me/${clientPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/70"
                      title="WhatsApp Client"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </a>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-mono text-neutral-200">
                  {event.startDate} {event.endDate && event.endDate !== event.startDate ? `to ${event.endDate}` : ''}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>{event.venue}, {event.locationCity || event.city || 'Mumbai'}</span>
              </div>
            </div>
          </div>

          {/* Top Status & Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#1C1A18] px-2.5 py-1.5 rounded-lg border border-[#2E2E2E]">
              <span className="text-[10px] uppercase font-mono text-neutral-400">Status:</span>
              <select
                value={event.status}
                onChange={(e) => handleStatusChange(e.target.value as EventStatus)}
                className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded border bg-transparent cursor-pointer focus:outline-none ${getStatusBadgeClass(event.status)}`}
              >
                <option value="Inquiry" className="bg-[#181818] text-white">Inquiry</option>
                <option value="Quoted" className="bg-[#181818] text-white">Quoted</option>
                <option value="Confirmed" className="bg-[#181818] text-white">Confirmed</option>
                <option value="Scheduled" className="bg-[#181818] text-white">Scheduled</option>
                <option value="In Progress" className="bg-[#181818] text-white">In Progress</option>
                <option value="Completed" className="bg-[#181818] text-white">Completed</option>
                <option value="Cancelled" className="bg-[#181818] text-white">Cancelled</option>
              </select>
            </div>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-[#FAF8F5] hover:bg-white rounded-lg transition-colors shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>Record Payment</span>
            </button>

            <button
              onClick={() => setIsWhatsAppReminderOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Crew Reminder</span>
            </button>

            <button
              onClick={() => setIsCalendarExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-[#1F1E1B] hover:bg-[#2A2825] hover:text-white border border-[#3E3A33] rounded-lg transition-colors shadow-xs"
              title="Export shoot to Apple Calendar (.ics) or Google Calendar (Android)"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>Export Calendar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================
            NAVIGATION TABS STRIP
           ======================================================== */}
        <div className="px-4 sm:px-6 bg-[#FAF8F5] border-b border-[#E8E3D9] flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
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

        {/* ========================================================
            TAB CONTENT VIEWPORT
           ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs bg-[#FAF8F5] space-y-6">
          
          {/* ========================================================
              TAB 1: OVERVIEW
             ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Top Financial Vitals Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl shadow-2xs">
                  <div className="text-[10px] font-mono uppercase text-neutral-400 font-semibold">Total Package</div>
                  <div className="text-xl font-serif font-bold text-neutral-900 mt-1 font-mono tabular-nums">
                    ₹{event.packageTotal.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Contracted value</div>
                </div>

                <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl shadow-2xs">
                  <div className="text-[10px] font-mono uppercase text-neutral-400 font-semibold">Advance Received</div>
                  <div className="text-xl font-serif font-bold text-emerald-700 mt-1 font-mono tabular-nums">
                    ₹{event.advancePaid.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Bank / UPI realized</div>
                </div>

                <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl shadow-2xs">
                  <div className="text-[10px] font-mono uppercase text-neutral-400 font-semibold">Balance Due</div>
                  <div className={`text-xl font-serif font-bold mt-1 font-mono tabular-nums ${event.balanceDue > 0 ? 'text-[#D97706]' : 'text-neutral-400'}`}>
                    ₹{event.balanceDue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    {event.paymentDueDate ? `Due: ${event.paymentDueDate}` : 'Before shoot wrap'}
                  </div>
                </div>

                <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl shadow-2xs">
                  <div className="text-[10px] font-mono uppercase text-neutral-400 font-semibold">Est. Gross Margin</div>
                  <div className="text-xl font-serif font-bold text-[#C58B39] mt-1 font-mono tabular-nums">
                    ₹{grossProfit.toLocaleString('en-IN')} ({grossMarginPercent}%)
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    After ₹{totalExpensesAmount.toLocaleString('en-IN')} expenses
                  </div>
                </div>
              </div>

              {/* HIERARCHICAL STRUCTURE BREAKDOWN CARD */}
              <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0ECE1]">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#C58B39] font-bold">
                      Hierarchical Architecture
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#181818]">
                      Job Hierarchy Tree
                    </h3>
                    <p className="text-xs text-neutral-500">
                      JOB → Main Event → Sub-Events / Functions → POV / Content Requirements
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('functions')}
                      className="px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-[#FAF8F5] hover:bg-neutral-100 border border-[#E8E3D9] rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Manage Functions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveTab('content')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#181818] hover:bg-black rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Manage POVs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tree Visual Flow */}
                <div className="p-4 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl space-y-4">
                  {/* Level 1: Job Type */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#181818] text-white font-mono text-[11px] font-bold uppercase tracking-wider">
                      Level 1: JOB
                    </span>
                    <span className="font-serif font-bold text-sm text-neutral-900">
                      {jobCategory === 'Wedding' ? '💍 Wedding Production' : jobCategory === 'Event Planner' ? '✨ Event Planner Collaboration' : '🎬 Custom Production Shoot'}
                    </span>
                  </div>

                  {/* Level 2: Main Event */}
                  <div className="ml-4 pl-4 border-l-2 border-[#DCD6C8] space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#C58B39] text-white font-mono text-[10px] font-bold uppercase">
                        Level 2: Main Event
                      </span>
                      <span className="font-serif font-bold text-base text-neutral-900">
                        {event.eventName}
                      </span>
                      <span className="text-neutral-500 font-normal">({event.clientName})</span>
                    </div>

                    {/* Level 3: Sub Events / Functions */}
                    <div className="ml-4 pl-4 border-l-2 border-[#DCD6C8] space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 font-mono text-[10px] font-bold uppercase">
                          Level 3: Sub-Events / Functions ({(event.subEvents || []).length})
                        </span>
                      </div>

                      {/* Functions List in Tree */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                        {(event.subEvents || []).map((sub, idx) => {
                          const linkedPOVs = (event.povs || []).filter(p => p.subEventId === sub.id);
                          return (
                            <div key={sub.id || idx} className="p-3 bg-white border border-[#E8E3D9] rounded-lg shadow-2xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-serif font-bold text-xs text-neutral-900">
                                  {sub.name}
                                </span>
                                <span className="font-mono text-[11px] font-bold text-[#C58B39]">
                                  ₹{(sub.eventCharge || 0).toLocaleString('en-IN')}
                                </span>
                              </div>

                              <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                                <span>📅 {sub.date}</span>
                                <span>·</span>
                                <span>⏰ {sub.startTime}</span>
                                <span>·</span>
                                <span>📍 {sub.venue}</span>
                              </div>

                              {/* Level 4: Linked POVs for this ceremony */}
                              <div className="pt-1.5 border-t border-[#F0ECE1]">
                                <div className="text-[10px] font-mono text-neutral-400 font-bold uppercase mb-1">
                                  Level 4: POVs ({linkedPOVs.length})
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {linkedPOVs.length === 0 ? (
                                    <span className="text-[10px] text-neutral-400 italic">No direct POVs linked yet</span>
                                  ) : (
                                    linkedPOVs.map(p => (
                                      <span
                                        key={p.id}
                                        className="text-[10px] px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3D9] text-neutral-700 font-medium"
                                      >
                                        {p.type} {p.completed ? '✓' : ''}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2-Column Grid: Contact Coordinates & Client Requirements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Client Contact & Schedule Card */}
                <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-2xs space-y-4">
                  <h3 className="font-serif font-bold text-sm text-[#181818] uppercase tracking-wide pb-2 border-b border-[#F0ECE1]">
                    Client Details & Location Coordinates
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500 font-medium">Client / Couple Name:</span>
                      <span className="font-bold text-neutral-900">{event.clientName}</span>
                    </div>

                    <div className="flex items-start justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500 font-medium">Contact Phone:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-neutral-900">{clientPhone || 'Not provided'}</span>
                        {clientPhone && (
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${clientPhone}`}
                              className="px-2 py-0.5 text-[10px] rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            >
                              Call
                            </a>
                            <a
                              href={`https://wa.me/${clientPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 text-[10px] rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            >
                              WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {clientEmail && (
                      <div className="flex items-start justify-between py-1 border-b border-neutral-100">
                        <span className="text-neutral-500 font-medium">Email Address:</span>
                        <a href={`mailto:${clientEmail}`} className="text-[#C58B39] hover:underline">{clientEmail}</a>
                      </div>
                    )}

                    <div className="flex items-start justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500 font-medium">Event Type:</span>
                      <span className="font-semibold text-neutral-800">{event.eventType}</span>
                    </div>

                    <div className="flex items-start justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500 font-medium">Shoot Venue:</span>
                      <span className="font-medium text-neutral-900 text-right">{event.venue}</span>
                    </div>

                    <div className="flex items-start justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-500 font-medium">City / Base:</span>
                      <span>{event.locationCity || event.city || 'Mumbai'}</span>
                    </div>

                    <div className="flex items-start justify-between py-1">
                      <span className="text-neutral-500 font-medium">Production Dates:</span>
                      <span className="font-mono text-neutral-800">
                        {event.startDate} to {event.endDate || event.startDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client Requirements & Notes Card */}
                <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE1]">
                      <h3 className="font-serif font-bold text-sm text-[#181818] uppercase tracking-wide">
                        Client Requirements & Directives
                      </h3>
                      <button
                        onClick={handleSaveNotesAndBrief}
                        className="text-xs font-semibold text-[#C58B39] hover:underline flex items-center gap-1"
                      >
                        {isSavingNotes ? 'Saving...' : 'Save Requirements'}
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Specific Client Brief:
                      </label>
                      <textarea
                        rows={3}
                        value={clientReqText}
                        onChange={(e) => setClientReqText(e.target.value)}
                        placeholder="Client requested preferences, mood, angles, turnaround expectations..."
                        className="w-full p-2.5 rounded-lg border border-[#E8E3D9] bg-[#FAF8F5] text-xs text-neutral-800 focus:outline-none focus:border-[#C58B39]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Internal Production Notes:
                      </label>
                      <textarea
                        rows={3}
                        value={internalNotesText}
                        onChange={(e) => setInternalNotesText(e.target.value)}
                        placeholder="Internal crew call instructions, equipment checklists, gate pass notes..."
                        className="w-full p-2.5 rounded-lg border border-[#E8E3D9] bg-[#FAF8F5] text-xs text-neutral-800 focus:outline-none focus:border-[#C58B39]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveNotesAndBrief}
                      className="px-4 py-1.5 bg-[#181818] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs"
                    >
                      {isSavingNotes ? 'Saving...' : 'Save All Briefs'}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================
              TAB 2: FUNCTIONS (Sub-Events)
             ======================================================== */}
          {activeTab === 'functions' && (
            <div className="space-y-5">
              
              <div className="bg-white border border-[#E8E3D9] p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#C58B39] font-bold">
                    Multi-Day Ceremony Schedule
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#181818]">
                    Sub-Events & Ceremonies ({event.subEvents?.length || 0})
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Total allocated function charges: <strong className="font-mono text-neutral-900">₹{totalEventCharges.toLocaleString('en-IN')}</strong> of ₹{event.packageTotal.toLocaleString('en-IN')} package
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingSubEvent(null);
                    setIsSubEventModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#181818] hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                  <span>+ Add Function / Sub-Event</span>
                </button>
              </div>

              {/* Grid of Functions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(event.subEvents || []).length === 0 ? (
                  <div className="col-span-2 p-10 bg-white border border-[#E8E3D9] rounded-xl text-center text-neutral-400 italic">
                    No functions added yet. Click "+ Add Function / Sub-Event" to structure multi-day ceremonies.
                  </div>
                ) : (
                  (event.subEvents || []).map((sub, idx) => {
                    const assignedCrew = crewRoster.filter(c => (sub.assignedCrewIds || []).includes(c.id));
                    const linkedPOVs = (event.povs || []).filter(p => p.subEventId === sub.id);

                    return (
                      <div key={sub.id || idx} className="bg-white border border-[#E8E3D9] hover:border-[#C58B39] transition-all rounded-xl p-5 shadow-2xs space-y-3.5 flex flex-col justify-between">
                        
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono text-[#C58B39] font-bold uppercase tracking-wider">
                                Ceremony #{idx + 1}
                              </span>
                              <h4 className="font-serif font-bold text-lg text-neutral-900 mt-0.5">
                                {sub.name}
                              </h4>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3D9] text-neutral-800 font-semibold uppercase">
                                {sub.status}
                              </span>
                              <div className="font-mono font-bold text-sm text-[#C58B39] mt-1">
                                ₹{(sub.eventCharge || 0).toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>

                          {/* Coordinates */}
                          <div className="py-2 border-y border-[#F0ECE1] space-y-1 text-xs text-neutral-600">
                            <div className="flex items-center gap-2 font-medium text-neutral-800">
                              <Calendar className="w-3.5 h-3.5 text-[#C58B39]" />
                              <span>{sub.date}</span>
                              <span className="text-neutral-300">·</span>
                              <Clock className="w-3.5 h-3.5 text-[#C58B39]" />
                              <span>{sub.startTime} - {sub.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                              <span>{sub.venue}</span>
                            </div>
                          </div>

                          {sub.description && (
                            <p className="text-xs text-neutral-700 leading-relaxed">
                              {sub.description}
                            </p>
                          )}

                          {/* Assigned Crew */}
                          <div>
                            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block mb-1">
                              Assigned Crew ({assignedCrew.length}):
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {assignedCrew.length === 0 ? (
                                <span className="text-[11px] text-neutral-400 italic">None assigned</span>
                              ) : (
                                assignedCrew.map(c => (
                                  <span key={c.id} className="px-2 py-0.5 bg-[#FAF8F5] border border-[#DCD6C8] rounded text-[11px] text-neutral-800 font-medium">
                                    {c.name} ({c.role.split(' ')[0]})
                                  </span>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Content Requirements / Linked POVs */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                                Content Requirements ({linkedPOVs.length}):
                              </span>
                              <button
                                onClick={() => {
                                  setEditingPOV(null);
                                  setIsPOVModalOpen(true);
                                }}
                                className="text-[11px] font-semibold text-[#C58B39] hover:underline"
                              >
                                + Add POV
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {linkedPOVs.length === 0 ? (
                                (sub.contentRequirements && sub.contentRequirements.length > 0) ? (
                                  sub.contentRequirements.map((cr, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-neutral-50 border border-neutral-200 rounded text-[10px] text-neutral-600 font-medium">
                                      {cr}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[11px] text-neutral-400 italic">No specific POVs added</span>
                                )
                              ) : (
                                linkedPOVs.map(p => (
                                  <span key={p.id} className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                    p.completed 
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                      : 'bg-[#FAF8F5] text-neutral-700 border-[#E8E3D9]'
                                  }`}>
                                    {p.type} {p.completed ? '✓' : ''}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>

                          {sub.notes && (
                            <div className="p-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded text-[11px] text-neutral-600 italic">
                              "{sub.notes}"
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-between">
                          <button
                            onClick={() => handleDeleteSubEvent(sub.id)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingSubEvent(sub);
                              setIsSubEventModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-neutral-100 border border-[#E8E3D9] rounded-lg text-xs font-semibold text-neutral-900 transition-colors"
                          >
                            Edit Function
                          </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 3: TIMELINE
             ======================================================== */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white border border-[#E8E3D9] p-5 rounded-xl shadow-xs">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#181818]">Production Call Sheet & Timeline</h3>
                  <p className="text-xs text-neutral-500">Minute-by-minute cues for lead creators, audio sync, and ceremonies</p>
                </div>
                <button
                  onClick={() => setIsTimelineModalOpen(true)}
                  className="px-3.5 py-2 bg-[#181818] hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                  <span>+ Add Timeline Cue</span>
                </button>
              </div>

              <div className="bg-white border border-[#E8E3D9] rounded-xl divide-y divide-[#F0ECE1] shadow-2xs">
                {(event.timeline || []).length === 0 ? (
                  <div className="p-10 text-center text-neutral-400 italic">
                    No timeline cues added yet. Click "+ Add Timeline Cue" to set the run sheet.
                  </div>
                ) : (
                  (event.timeline || []).map((tl) => (
                    <div key={tl.id} className="p-4 hover:bg-[#FAF8F5] transition-colors flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleTimelineComplete(tl.id)}
                          className="mt-0.5 text-neutral-400 hover:text-emerald-700 transition-colors"
                        >
                          {tl.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-neutral-300" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
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
                            <p className="text-xs text-neutral-600">{tl.description}</p>
                          )}

                          <div className="text-[11px] text-neutral-500 flex flex-wrap items-center gap-3">
                            {tl.venue && <span>📍 {tl.venue}</span>}
                            {tl.notes && <span className="italic text-neutral-400">"{tl.notes}"</span>}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTimelineItem(tl.id)}
                        className="text-neutral-400 hover:text-rose-600 p-1"
                        title="Delete Cue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: CREW ASSIGNED
             ======================================================== */}
          {activeTab === 'crew' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E8E3D9] p-5 rounded-xl shadow-xs">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#181818]">Shoot Crew Deployments & Remuneration</h3>
                  <p className="text-xs text-neutral-500">
                    Individual call times, wrap hours, reporting locations, and payouts (Total payout: <strong className="font-mono text-neutral-900">₹{totalCrewPayout.toLocaleString('en-IN')}</strong>)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWhatsAppReminderOpen(true)}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Remind</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingCrewAssignment(null);
                      setIsAssignCrewModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-[#181818] hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                    <span>+ Assign Crew</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(event.crewAssignments || []).length === 0 ? (
                  <div className="col-span-2 p-10 bg-white border border-[#E8E3D9] rounded-xl text-center text-neutral-400 italic">
                    No crew members assigned yet. Click "+ Assign Crew" to deploy creators.
                  </div>
                ) : (
                  (event.crewAssignments || []).map((asg) => {
                    const member = crewRoster.find(c => c.id === asg.crewId);
                    const phone = asg.phone || member?.phone || '';
                    const reminder = (event.crewReminders || []).find(r => r.crewId === asg.crewId);

                    return (
                      <div key={asg.id} className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-2xs space-y-3.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-[#C58B39] font-bold">{asg.role}</span>
                            <h4 className="font-serif font-bold text-base text-neutral-900 mt-0.5">{asg.crewName}</h4>
                            {phone && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-neutral-600 text-[11px]">{phone}</span>
                                <a
                                  href={`tel:${phone}`}
                                  className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-[10px]"
                                >
                                  Call
                                </a>
                                <a
                                  href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-[10px]"
                                >
                                  WhatsApp
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-base text-neutral-900">
                              ₹{asg.payout.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-neutral-400 block">Agreed Payout</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-xs">
                          <div>
                            <span className="text-neutral-500 block text-[10px]">Call Time:</span>
                            <strong className="font-mono text-neutral-800">{asg.callTime}</strong>
                          </div>
                          <div>
                            <span className="text-neutral-500 block text-[10px]">Wrap Time:</span>
                            <strong className="font-mono text-neutral-800">{asg.wrapTime}</strong>
                          </div>
                          <div className="col-span-2 pt-1 border-t border-[#F0ECE1]">
                            <span className="text-neutral-500 block text-[10px]">Reporting Location:</span>
                            <span className="font-medium text-neutral-800">{asg.reportingLocation || event.venue}</span>
                          </div>
                        </div>

                        {asg.notes && (
                          <p className="text-[11px] text-neutral-600 italic">"{asg.notes}"</p>
                        )}

                        <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between text-xs">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            reminder?.status === 'WhatsApp Opened'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {reminder?.status === 'WhatsApp Opened' ? 'WhatsApp Dispatched' : 'Reminder Pending'}
                          </span>

                          <button
                            onClick={() => {
                              setEditingCrewAssignment(asg);
                              setIsAssignCrewModalOpen(true);
                            }}
                            className="text-[#C58B39] font-semibold hover:underline"
                          >
                            Edit Assignment
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: COMMERCIALS
             ======================================================== */}
          {activeTab === 'commercials' && (
            <div className="space-y-6">
              
              {/* Commercials Summary */}
              <div className="bg-white border border-[#E8E3D9] p-5 rounded-xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0ECE1]">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-neutral-900">
                      Commercial Ledger & Add-ons
                    </h3>
                    <p className="text-xs text-neutral-500">Package pricing, function allocations, extra equipment, and settlements</p>
                  </div>

                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Record Client Payment</span>
                  </button>
                </div>

                {/* Numbers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl space-y-1">
                    <span className="text-neutral-500 font-medium">Contracted Package Total</span>
                    <div className="font-mono text-xl font-bold text-neutral-900">
                      ₹{event.packageTotal.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl space-y-1">
                    <span className="text-neutral-500 font-medium">Advance Received</span>
                    <div className="font-mono text-xl font-bold text-emerald-700">
                      ₹{event.advancePaid.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl space-y-1">
                    <span className="text-neutral-500 font-medium">Balance Due</span>
                    <div className={`font-mono text-xl font-bold ${event.balanceDue > 0 ? 'text-[#D97706]' : 'text-neutral-400'}`}>
                      ₹{event.balanceDue.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl space-y-1">
                    <span className="text-neutral-500 font-medium">Payment Due Date</span>
                    <div className="font-mono text-base font-bold text-neutral-800 mt-1">
                      {event.paymentDueDate || 'Before Wrap'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Event-Wise Charges Breakdown */}
              <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-3">
                <h4 className="font-serif font-bold text-base text-neutral-900 pb-2 border-b border-[#F0ECE1]">
                  Event-Wise Function Charges Breakdown
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-neutral-600 border-b border-[#E8E3D9] uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Function Name</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Venue</th>
                        <th className="py-2.5 px-3 text-right">Allocated Charge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0ECE1]">
                      {(event.subEvents || []).map((sub) => (
                        <tr key={sub.id} className="hover:bg-[#FAF8F5]/50">
                          <td className="py-2.5 px-3 font-semibold text-neutral-900">{sub.name}</td>
                          <td className="py-2.5 px-3 font-mono text-neutral-600">{sub.date}</td>
                          <td className="py-2.5 px-3 text-neutral-600">{sub.venue}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                            ₹{(sub.eventCharge || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-[#FAF8F5] font-bold">
                        <td colSpan={3} className="py-2.5 px-3 uppercase text-[10px] text-neutral-700">Total Function Charges Allocated</td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#C58B39]">
                          ₹{totalEventCharges.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add-Ons Management */}
              <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE1]">
                  <div>
                    <h4 className="font-serif font-bold text-base text-neutral-900">Production Add-Ons & Extras</h4>
                    <p className="text-xs text-neutral-500">Same-Day Edit (SDE), drone passes, additional camera bodies</p>
                  </div>

                  <button
                    onClick={() => setIsAddAddOnOpen(!isAddAddOnOpen)}
                    className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-neutral-100 border border-[#E8E3D9] rounded-lg text-xs font-semibold text-neutral-900 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                    <span>+ Add Add-on</span>
                  </button>
                </div>

                {/* Inline Add-On Form */}
                {isAddAddOnOpen && (
                  <form onSubmit={handleSaveAddOn} className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl flex flex-col sm:flex-row gap-2.5 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">Add-On Title *</label>
                      <input
                        type="text"
                        required
                        value={newAddOn.name}
                        onChange={(e) => setNewAddOn({ ...newAddOn, name: e.target.value })}
                        placeholder="e.g. Same-Day Edit (SDE) Fast Track"
                        className="w-full p-2 border border-[#DCD6C8] rounded-lg bg-white text-xs"
                      />
                    </div>
                    <div className="w-full sm:w-40">
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="500"
                        value={newAddOn.price}
                        onChange={(e) => setNewAddOn({ ...newAddOn, price: e.target.value === '' ? '' : Number(e.target.value) })}
                        placeholder="10000"
                        className="w-full p-2 border border-[#DCD6C8] rounded-lg bg-white text-xs font-mono"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddAddOnOpen(false)}
                        className="px-3 py-2 text-xs text-neutral-600 hover:text-black"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#181818] text-white text-xs font-semibold rounded-lg shadow-xs"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}

                {/* Add-ons list */}
                <div className="space-y-2">
                  {(event.addOns || []).length === 0 ? (
                    <div className="text-neutral-400 italic text-center py-4">No add-ons applied to this contract.</div>
                  ) : (
                    (event.addOns || []).map((addon, idx) => (
                      <div key={idx} className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg flex items-center justify-between">
                        <div className="font-semibold text-neutral-900">{addon.name}</div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-neutral-900">₹{addon.price.toLocaleString('en-IN')}</span>
                          <button
                            onClick={() => handleRemoveAddOn(idx)}
                            className="text-neutral-400 hover:text-rose-600 p-1"
                            title="Remove Add-On"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 6: CONTENT (POVs)
             ======================================================== */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              
              <div className="bg-white border border-[#E8E3D9] p-5 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#C58B39] font-bold">
                    Creative Architecture & Requirements
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#181818]">
                    POV & Content Requirements ({event.povs?.length || 0})
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Bride, Groom, Couple, Rituals, Catering, Decor, Venue, Entry, Dance, Drone, BTS & Custom POVs
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingPOV(null);
                    setIsPOVModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#181818] hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs self-start md:self-auto"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                  <span>+ Add POV Requirement</span>
                </button>
              </div>

              {/* Filters Strip */}
              <div className="bg-white border border-[#E8E3D9] rounded-xl p-3.5 shadow-2xs flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-neutral-500">Ceremony:</span>
                  <select
                    value={povFilterSubEvent}
                    onChange={(e) => setPovFilterSubEvent(e.target.value)}
                    className="p-1.5 border border-[#DCD6C8] rounded-lg bg-[#FAF8F5] text-xs text-neutral-800"
                  >
                    <option value="All">All Ceremonies</option>
                    {(event.subEvents || []).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-neutral-500">POV Type:</span>
                  <select
                    value={povFilterType}
                    onChange={(e) => setPovFilterType(e.target.value)}
                    className="p-1.5 border border-[#DCD6C8] rounded-lg bg-[#FAF8F5] text-xs text-neutral-800"
                  >
                    <option value="All">All Types</option>
                    <option value="Bride POV">Bride POV</option>
                    <option value="Groom POV">Groom POV</option>
                    <option value="Couple POV">Couple POV</option>
                    <option value="Family POV">Family POV</option>
                    <option value="Rituals">Rituals</option>
                    <option value="Catering">Catering</option>
                    <option value="Decor">Decor</option>
                    <option value="Venue">Venue</option>
                    <option value="Guest reactions">Guest reactions</option>
                    <option value="Entry">Entry</option>
                    <option value="Dance">Dance</option>
                    <option value="Behind the scenes">Behind the scenes</option>
                    <option value="Drone">Drone</option>
                    <option value="Cinematic shots">Cinematic shots</option>
                    <option value="Photographer coverage">Photographer coverage</option>
                    <option value="Custom POV">Custom POV</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-neutral-500">Status:</span>
                  <select
                    value={povFilterStatus}
                    onChange={(e) => setPovFilterStatus(e.target.value)}
                    className="p-1.5 border border-[#DCD6C8] rounded-lg bg-[#FAF8F5] text-xs text-neutral-800"
                  >
                    <option value="All">All States</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Captured">Captured</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* POVs Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPOVs.length === 0 ? (
                  <div className="col-span-full p-10 bg-white border border-[#E8E3D9] rounded-xl text-center text-neutral-400 italic">
                    No POV requirements match filter. Click "+ Add POV Requirement" to create.
                  </div>
                ) : (
                  filteredPOVs.map((pov) => {
                    const assignedCreator = crewRoster.find(c => c.id === pov.assignedCrewId);
                    const subEventName = pov.subEventName || (event.subEvents || []).find(s => s.id === pov.subEventId)?.name;

                    return (
                      <div key={pov.id} className="bg-white border border-[#E8E3D9] rounded-xl p-4 shadow-2xs flex flex-col justify-between space-y-3 hover:border-[#C58B39] transition-all">
                        
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-[11px] font-bold text-[#8C6428] uppercase tracking-wider bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#EADBBE]">
                              {pov.type}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              pov.priority === 'Urgent' 
                                ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                : pov.priority === 'High'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              {pov.priority}
                            </span>
                          </div>

                          {subEventName && (
                            <div className="text-[10px] font-mono text-[#C58B39] font-bold">
                              📍 {subEventName}
                            </div>
                          )}

                          <p className="font-serif font-bold text-sm text-neutral-900 leading-snug">
                            {pov.description}
                          </p>

                          {pov.shotNotes && (
                            <div className="p-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-[11px] text-neutral-600">
                              <span className="font-semibold text-neutral-800">Directives:</span> {pov.shotNotes}
                            </div>
                          )}

                          <div className="text-[11px] text-neutral-500 space-y-1 pt-1 border-t border-[#F0ECE1]">
                            <div className="flex justify-between items-center">
                              <span>Assignee:</span>
                              <strong className="text-neutral-800">{assignedCreator ? assignedCreator.name : 'Team Pool'}</strong>
                            </div>
                            {pov.plannedTime && (
                              <div className="flex justify-between items-center font-mono">
                                <span>Planned Time:</span>
                                <span className="font-semibold text-neutral-800">{pov.plannedTime}</span>
                              </div>
                            )}
                            {pov.platform && (
                              <div className="flex justify-between items-center">
                                <span>Platform:</span>
                                <span className="font-semibold text-[#8C6428]">{pov.platform}</span>
                              </div>
                            )}
                            {pov.plannedPostDate && (
                              <div className="flex justify-between items-center font-mono">
                                <span>Post Date:</span>
                                <span>{pov.plannedPostDate}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status & Actions Bottom Bar */}
                        <div className="pt-2.5 border-t border-[#F0ECE1] flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleTogglePOVCompleted(pov)}
                            className="flex items-center gap-1.5 text-xs text-neutral-700 hover:text-black"
                          >
                            {pov.completed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-neutral-300" />
                            )}
                            <span className="text-[11px] font-medium">{pov.completed ? 'Delivered' : 'Pending'}</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <select
                              value={pov.status}
                              onChange={(e) => handleUpdatePOVStatus(pov.id, e.target.value as POVItem['status'])}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                                pov.status === 'Delivered' || pov.status === 'Captured'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : pov.status === 'In Progress'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-neutral-100 text-neutral-700'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Captured">Captured</option>
                              <option value="Reviewed">Reviewed</option>
                              <option value="Delivered">Delivered</option>
                            </select>

                            <button
                              onClick={() => {
                                setEditingPOV(pov);
                                setIsPOVModalOpen(true);
                              }}
                              className="text-neutral-400 hover:text-black p-1"
                              title="Edit POV"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeletePOV(pov.id)}
                              className="text-neutral-400 hover:text-rose-600 p-1"
                              title="Delete POV"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* ========================================================
              TAB 7: DELIVERABLES
             ======================================================== */}
          {activeTab === 'deliverables' && (
            <div className="space-y-5">
              
              <div className="bg-white border border-[#E8E3D9] p-5 rounded-xl shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F0ECE1]">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-neutral-900">
                      Master Deliverables Checklist & Delivery Tracking ({completedDeliverables}/{totalDeliverables})
                    </h3>
                    <p className="text-xs text-neutral-500">Toggle raw drive handover, reels delivery, teasers, and client approvals</p>
                  </div>

                  <button
                    onClick={() => setIsAddDeliverableOpen(!isAddDeliverableOpen)}
                    className="px-3.5 py-2 bg-[#181818] hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                    <span>+ Add Deliverable</span>
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Inline Add Deliverable Form */}
              {isAddDeliverableOpen && (
                <form onSubmit={handleSaveDeliverable} className="p-4 bg-white border border-[#E8E3D9] rounded-xl shadow-xs space-y-3">
                  <h4 className="font-serif font-bold text-sm text-neutral-900">New Deliverable Item</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">Title *</label>
                      <input
                        type="text"
                        required
                        value={newDeliverable.title}
                        onChange={(e) => setNewDeliverable({ ...newDeliverable, title: e.target.value })}
                        placeholder="e.g. Wedding 9:16 Cinematic Master Film"
                        className="w-full p-2 border border-[#DCD6C8] rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">Delivery Deadline</label>
                      <input
                        type="date"
                        value={newDeliverable.dueDate}
                        onChange={(e) => setNewDeliverable({ ...newDeliverable, dueDate: e.target.value })}
                        className="w-full p-2 border border-[#DCD6C8] rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddDeliverableOpen(false)}
                      className="px-3 py-1.5 text-xs text-neutral-600 hover:text-black"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#181818] text-white text-xs font-semibold rounded-lg shadow-xs"
                    >
                      Save Deliverable
                    </button>
                  </div>
                </form>
              )}

              {/* Deliverables List */}
              <div className="space-y-2.5">
                {(event.deliverables || []).map((del) => (
                  <div
                    key={del.id}
                    className="p-4 rounded-xl border border-[#E8E3D9] bg-white hover:border-[#C58B39] transition-all flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onToggleDeliverable(event.id, del.id)}
                        className="mt-0.5 text-neutral-400 hover:text-emerald-700 transition-colors"
                      >
                        {del.completed ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-neutral-300" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className={`font-semibold text-sm ${del.completed ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                          {del.title}
                        </div>
                        {del.notes && (
                          <p className="text-xs text-neutral-500">{del.notes}</p>
                        )}
                        {del.dueDate && (
                          <div className="text-[11px] font-mono text-neutral-400">
                            Deadline: <strong className="text-neutral-700">{del.dueDate}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteDeliverable(del.id)}
                      className="text-neutral-400 hover:text-rose-600 p-1"
                      title="Delete Deliverable"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 8: EXPENSES
             ======================================================== */}
          {activeTab === 'expenses' && (
            <div className="space-y-5">
              
              <div className="bg-white border border-[#E8E3D9] p-5 rounded-xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0ECE1]">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-neutral-900">
                      Shoot Expenses & Operational Profitability
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Travel, food, equipment rental, crew remuneration, and logistics
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddExpenseOpen(!isAddExpenseOpen)}
                    className="px-3.5 py-2 bg-[#181818] hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                    <span>+ Add Job Expense</span>
                  </button>
                </div>

                {/* Financial Health Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Contract Value</span>
                    <strong className="font-mono text-lg text-neutral-900 block mt-0.5">₹{event.packageTotal.toLocaleString('en-IN')}</strong>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Crew Remuneration</span>
                    <strong className="font-mono text-lg text-neutral-800 block mt-0.5">₹{totalCrewPayout.toLocaleString('en-IN')}</strong>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Other Expenses</span>
                    <strong className="font-mono text-lg text-rose-700 block mt-0.5">
                      ₹{eventExpenses.reduce((a, b) => a + b.amount, 0).toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl">
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">Estimated Net Profit</span>
                    <strong className="font-mono text-lg text-[#C58B39] block mt-0.5">
                      ₹{grossProfit.toLocaleString('en-IN')} ({grossMarginPercent}%)
                    </strong>
                  </div>
                </div>
              </div>

              {/* Inline Add Expense Form */}
              {isAddExpenseOpen && (
                <form onSubmit={handleSaveExpense} className="p-4 bg-white border border-[#E8E3D9] rounded-xl shadow-xs space-y-3">
                  <h4 className="font-serif font-bold text-sm text-neutral-900">Record New Shoot Expense</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">Expense Title *</label>
                      <input
                        type="text"
                        required
                        value={newExpense.title}
                        onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                        placeholder="e.g. Taxi transport for 3 creators to Turf Club"
                        className="w-full p-2 border border-[#DCD6C8] rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">Category *</label>
                      <select
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                        className="w-full p-2 border border-[#DCD6C8] rounded-lg text-xs bg-white"
                      >
                        <option value="Travel & Cab">Travel & Cab</option>
                        <option value="Food & Catering">Food & Catering</option>
                        <option value="Equipment Rental">Equipment Rental</option>
                        <option value="Hard Drives & Storage">Hard Drives & Storage</option>
                        <option value="Miscellaneous">Miscellaneous / Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">Amount (₹) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="100"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value === '' ? '' : Number(e.target.value) })}
                        placeholder="2500"
                        className="w-full p-2 border border-[#DCD6C8] rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddExpenseOpen(false)}
                      className="px-3 py-1.5 text-xs text-neutral-600 hover:text-black"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#181818] text-white text-xs font-semibold rounded-lg shadow-xs"
                    >
                      Save Expense
                    </button>
                  </div>
                </form>
              )}

              {/* List of recorded expenses */}
              <div className="bg-white border border-[#E8E3D9] rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-neutral-600 border-b border-[#E8E3D9] uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-4">Expense Title</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Paid By</th>
                      <th className="py-3 px-3 text-right">Amount (₹)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE1]">
                    {eventExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-neutral-400 italic">
                          No direct expenses logged for this event.
                        </td>
                      </tr>
                    ) : (
                      eventExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-[#FAF8F5]/80">
                          <td className="py-3 px-4 font-semibold text-neutral-900">{exp.title}</td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3D9] text-neutral-700">
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-neutral-600">{exp.date}</td>
                          <td className="py-3 px-3 text-neutral-600">{exp.paidBy || 'Admin'}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900">
                            ₹{exp.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="text-neutral-400 hover:text-rose-600 p-1"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
              TAB 9: NOTES / BRIEF
             ======================================================== */}
          {activeTab === 'notes' && (
            <div className="space-y-5">
              <div className="bg-white border border-[#E8E3D9] p-5 rounded-xl shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE1]">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#181818]">
                      Free-Form Client Brief & Internal Notes
                    </h3>
                    <p className="text-xs text-neutral-500">Unrestricted creative directives, couple preferences, and logistics</p>
                  </div>
                  <button
                    onClick={handleSaveNotesAndBrief}
                    className="px-4 py-2 bg-[#181818] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs"
                  >
                    {isSavingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-neutral-800 text-xs mb-1.5">Free-Form Client Brief:</label>
                    <textarea
                      rows={5}
                      value={clientReqText}
                      onChange={(e) => setClientReqText(e.target.value)}
                      placeholder="Paste the couple's brief, mood references, VIP family member requests..."
                      className="w-full p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-[#C58B39]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 text-xs mb-1.5">Internal Production Notes:</label>
                    <textarea
                      rows={4}
                      value={internalNotesText}
                      onChange={(e) => setInternalNotesText(e.target.value)}
                      placeholder="Internal crew call rules, memory card workflow, parking permits..."
                      className="w-full p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-[#C58B39]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-800 text-xs mb-1">Consent & Social Media Usage Policy:</label>
                    <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl text-xs text-neutral-700 leading-relaxed">
                      {event.consentUsageNotes || 'Standard Social Media Usage Permission Granted by Client.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 10: QUOTES (Linked Proposals)
             ======================================================== */}
          {activeTab === 'quotes' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#181818]">Linked Commercial Quotations</h3>
                  <p className="text-xs text-neutral-500">Official proposals associated with this shoot</p>
                </div>
              </div>

              <div className="space-y-3">
                {eventQuotes.length === 0 ? (
                  <div className="bg-white border border-[#E8E3D9] p-8 text-center text-neutral-400 italic rounded-xl">
                    No quotations directly attached to this shoot.
                  </div>
                ) : (
                  eventQuotes.map(q => (
                    <div key={q.id} className="bg-white border border-[#E8E3D9] rounded-xl p-4 flex items-center justify-between shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-neutral-900">{q.quoteNumber}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3D9]">
                            {q.status}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-600 mt-1">{q.eventName} · {q.items.length} line items</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="font-mono font-bold text-sm text-neutral-900 tabular-nums">
                          ₹{q.grandTotal.toLocaleString('en-IN')}
                        </div>
                        <button
                          onClick={() => onSelectQuoteForPreview(q)}
                          className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DCD6C8] rounded-lg text-xs font-semibold text-neutral-800 flex items-center gap-1"
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
              TAB 11: PAYMENTS (Transaction Receipts)
             ======================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#181818]">Client Payment Receipts</h3>
                  <p className="text-xs text-neutral-500">Verified transaction receipts and settlements</p>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#181818] hover:bg-[#282828] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                  <span>+ Record Payment</span>
                </button>
              </div>

              <div className="bg-white border border-[#E8E3D9] rounded-xl overflow-hidden shadow-2xs">
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
              TAB 12: FILES
             ======================================================== */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#181818]">Production Files & Moodboards</h3>
                  <p className="text-xs text-neutral-500">Contracts, moodboards, shot lists, venue gate passes, and references</p>
                </div>
                <button
                  onClick={() => setIsEventFileModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#181818] hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#C58B39]" />
                  <span>+ Upload File</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(event.files || []).length === 0 ? (
                  <div className="col-span-full bg-white border border-[#E8E3D9] p-8 text-center text-neutral-400 italic rounded-xl">
                    No files attached yet. Click "+ Upload File" to add contracts or moodboards.
                  </div>
                ) : (
                  (event.files || []).map(f => (
                    <div key={f.id} className="bg-white border border-[#E8E3D9] rounded-xl p-4 shadow-2xs space-y-2">
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
              TAB 13: ACTIVITY LOG
             ======================================================== */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl">
                <h3 className="font-serif font-bold text-base text-[#181818]">Production Audit Log</h3>
                <p className="text-xs text-neutral-500">Complete timeline of state transitions, crew assignments, and milestones</p>
              </div>

              <div className="bg-white border border-[#E8E3D9] rounded-xl divide-y divide-[#F0ECE1] shadow-2xs">
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
        onDeleteSubEvent={handleDeleteSubEvent}
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
        onClose={() => {
          setIsPOVModalOpen(false);
          setEditingPOV(null);
        }}
        event={event}
        onSavePOV={handleSavePOV}
        onDeletePOV={handleDeletePOV}
        initialData={editingPOV}
      />

      <AssignCrewModal
        isOpen={isAssignCrewModalOpen}
        onClose={() => {
          setIsAssignCrewModalOpen(false);
          setEditingCrewAssignment(null);
        }}
        event={event}
        onAssignCrew={handleAssignCrew}
        onAssignMultipleCrew={handleAssignMultipleCrew}
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

      <CalendarExportModal
        isOpen={isCalendarExportOpen}
        onClose={() => setIsCalendarExportOpen(false)}
        shoot={event}
        allShoots={[event]}
      />
    </div>
  );
};
