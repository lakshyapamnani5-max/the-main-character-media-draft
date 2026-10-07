import React from 'react';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpRight,
  FileText, 
  UserPlus, 
  Layers, 
  ArrowRight, 
  MessageCircle, 
  AlertCircle, 
  Eye,
  Plus,
  Receipt,
  Wallet,
  Activity,
  CalendarCheck,
  ChevronRight,
  Sparkles,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { 
  DashboardMetrics, 
  EventShoot, 
  Enquiry, 
  Quotation,
  PaymentRecord,
  Expense
} from '../../types';
import { NavModule } from '../Header';
import { AdminReminderBanner } from '../Reminders/AdminReminderBanner';

interface HomeViewProps {
  metrics: DashboardMetrics;
  events: EventShoot[];
  enquiries: Enquiry[];
  quotations: Quotation[];
  payments: PaymentRecord[];
  expenses: Expense[];
  onNavigate: (module: NavModule, subTab?: string) => void;
  onOpenNewEnquiry: () => void;
  onOpenNewEventCharge: () => void;
  onOpenNewQuote: () => void;
  onOpenNewEvent: () => void;
  onOpenAddExpense: () => void;
  onSelectQuoteForPreview: (quote: Quotation) => void;
  onQuickQuoteForEnquiry: (enquiry: Enquiry) => void;
  onOpenSendReminder: (event: EventShoot) => void;
  onOpenReminderSettings: () => void;
  onOpenEventDetail: (event: EventShoot) => void;
  onOpenRecordPayment: (event?: EventShoot) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  metrics,
  events,
  enquiries,
  quotations,
  payments,
  expenses,
  onNavigate,
  onOpenNewEnquiry,
  onOpenNewEventCharge,
  onOpenNewQuote,
  onOpenNewEvent,
  onOpenAddExpense,
  onSelectQuoteForPreview,
  onQuickQuoteForEnquiry,
  onOpenSendReminder,
  onOpenReminderSettings,
  onOpenEventDetail,
  onOpenRecordPayment
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Today's events
  const todayEvents = events.filter(e => {
    const start = e.startDate || (e as any).shootDate || '';
    const end = e.endDate || start;
    return (todayStr >= start && todayStr <= end) && e.status !== 'Cancelled' && e.status !== 'Archived';
  });

  // Upcoming 7 days events
  const next7DaysStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const upcoming7DaysEvents = events.filter(e => {
    const start = e.startDate || (e as any).shootDate || '';
    return start >= todayStr && start <= next7DaysStr && e.status !== 'Cancelled' && e.status !== 'Archived';
  }).sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));

  // Confirmed upcoming events
  const upcomingEvents = events.filter(e => 
    e.status === 'Confirmed' || e.status === 'Scheduled' || e.status === 'In Progress'
  ).sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));

  // Events with pending balance
  const eventsWithPendingBalance = events.filter(e => 
    (e.balanceDue || 0) > 0 && e.status !== 'Cancelled' && e.status !== 'Archived'
  ).slice(0, 4);

  // Pending tasks
  const unassignedCrewEvents = events.filter(e => 
    (e.status === 'Confirmed' || e.status === 'Scheduled') && 
    (!e.crewAssignments || e.crewAssignments.length === 0)
  );

  const pendingReminderEvents = upcomingEvents.filter(e => {
    const totalCrew = (e.crewAssignments && e.crewAssignments.length > 0)
      ? e.crewAssignments.length
      : (e.crewMembers || []).length;
    const remindedCount = (e.crewReminders || []).filter(r => r.status === 'WhatsApp Opened').length;
    return remindedCount < totalCrew && totalCrew > 0;
  });

  const recentEnquiries = enquiries.slice(0, 4);
  const recentPayments = payments.slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      
      {/* Editorial Hero Banner */}
      <div className="bg-[#121212] text-white border border-[#262626] rounded-xl p-5 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#C58B39]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-[#C58B39] font-semibold">
              <span>Production Control Center</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">Live Operating System</span>
            </div>
            
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mt-1">
              The Main Character Media
            </h1>
            
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl font-light leading-relaxed">
              Real-time wedding shoots, creator logistics, client commercials, and semi-automated production reminders.
            </p>
          </div>

          {/* Quick Action Primary Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={onOpenNewEvent}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#121212] bg-[#FAF8F5] hover:bg-white rounded-lg transition-all shadow-xs active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-[#C58B39] stroke-[2.5]" />
              <span>New Job</span>
            </button>

            <button
              onClick={onOpenNewEnquiry}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>New Enquiry</span>
            </button>

            <button
              onClick={onOpenNewQuote}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#C58B39] hover:bg-[#B37B2E] rounded-lg transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-white" />
              <span>Create Quote</span>
            </button>

            <button
              onClick={() => onNavigate('calendar')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>View Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reminder Alert Banner */}
      <AdminReminderBanner
        upcomingEvents={upcomingEvents}
        onOpenSendReminder={onOpenSendReminder}
        onOpenReminderSettings={onOpenReminderSettings}
      />

      {/* SECTION 1: TODAY'S EVENTS (Highlight Card) */}
      <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight">
              Today's Events
            </h2>
          </div>
          
          <span className="text-xs font-mono text-neutral-500">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {todayEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayEvents.map(event => {
              const callTime = event.crewAssignments?.[0]?.callTime || event.shootTime?.split('-')[0]?.trim() || '08:00 AM';
              const totalCrew = event.crewAssignments?.length || event.crewMembers?.length || 0;

              return (
                <div 
                  key={event.id}
                  className="p-4 rounded-xl bg-gradient-to-br from-[#FAF8F5] to-white border-2 border-[#C58B39] shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#C58B39] font-bold">
                        {event.eventType} · Live Today
                      </div>
                      <h3 className="font-serif text-xl font-bold text-neutral-900 mt-0.5">
                        {event.eventName}
                      </h3>
                      <div className="text-xs text-neutral-600 mt-0.5 font-medium">
                        Client: {event.clientName}
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold uppercase">
                      {event.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[#E8E3D9]">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Call Time:</span>
                      <span className="font-mono font-bold text-neutral-900 text-sm">{callTime}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Venue:</span>
                      <span className="font-medium text-neutral-900 truncate block">{event.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-neutral-600 font-mono">
                      <span>{totalCrew} Crew Deployed</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenSendReminder(event)}
                        className="px-3 py-1.5 bg-[#C58B39] hover:bg-[#B37B2E] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Send WhatsApp</span>
                      </button>

                      <button
                        onClick={() => onOpenEventDetail(event)}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <span>View Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center rounded-lg bg-[#FAF8F5] border border-dashed border-[#E8E3D9] text-neutral-600 space-y-1">
            <div className="text-sm font-medium text-neutral-800">
              No live shoots scheduled for today.
            </div>
            <div className="text-xs text-neutral-500 font-light">
              Creators are on post-production reels editing and equipment prep. Next shoot starts in upcoming schedule.
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: 9 KEY METRICS (Exact Cards Requested) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-medium">
            Production & Commercial Ledger
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">Local Storage Synced</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
          
          {/* 1. Upcoming Shoots */}
          <div 
            onClick={() => onNavigate('jobs', 'upcoming')}
            className="bg-white border border-[#E8E3D9] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#C58B39]/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span className="font-medium">Upcoming Shoots</span>
              <Calendar className="w-4 h-4 text-[#C58B39]" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 font-mono tabular-nums">
                {metrics.upcomingShootsCount}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Confirmed on calendar</div>
            </div>
          </div>

          {/* 2. Today's Shoots */}
          <div className="bg-white border border-[#E8E3D9] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span className="font-medium">Today's Shoots</span>
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 font-mono tabular-nums">
                {metrics.todayShootsCount}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Live active shoots today</div>
            </div>
          </div>

          {/* 3. Active Jobs */}
          <div 
            onClick={() => onNavigate('jobs', 'active')}
            className="bg-white border border-[#E8E3D9] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#C58B39]/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span className="font-medium">Active Jobs</span>
              <Activity className="w-4 h-4 text-neutral-500" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 font-mono tabular-nums">
                {metrics.activeJobsCount}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">In progress & scheduled</div>
            </div>
          </div>

          {/* 4. Pending Client Payments */}
          <div 
            onClick={() => onNavigate('money', 'payments')}
            className="bg-white border border-[#E8E3D9] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-amber-300 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span className="font-medium">Pending Client Payments</span>
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-700 font-mono tabular-nums">
                ₹{metrics.pendingBalanceTotal.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Outstanding receivables</div>
            </div>
          </div>

          {/* 5. Crew Payouts */}
          <div 
            onClick={() => onNavigate('money', 'payouts')}
            className="bg-white border border-[#E8E3D9] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#C58B39]/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span className="font-medium">Crew Payouts</span>
              <Users className="w-4 h-4 text-neutral-500" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-neutral-800 font-mono tabular-nums">
                ₹{metrics.crewPayoutTotal.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Committed creator compensation</div>
            </div>
          </div>

          {/* 6. Monthly Revenue */}
          <div 
            onClick={() => onNavigate('money', 'overview')}
            className="bg-white border border-[#E8E3D9] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#C58B39]/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span className="font-medium">Monthly Revenue</span>
              <DollarSign className="w-4 h-4 text-neutral-800" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 font-mono tabular-nums">
                ₹{metrics.monthlyRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Booked contracted package values</div>
            </div>
          </div>

          {/* 7. Monthly Expenses */}
          <div 
            onClick={() => onNavigate('money', 'expenses')}
            className="bg-white border border-[#E8E3D9] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-red-300 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span className="font-medium">Monthly Expenses</span>
              <Receipt className="w-4 h-4 text-red-500" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-red-700 font-mono tabular-nums">
                ₹{metrics.monthlyExpenses.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Gear rental, cabs & storage</div>
            </div>
          </div>

          {/* 8. Estimated Profit */}
          <div 
            onClick={() => onNavigate('money', 'overview')}
            className="bg-[#181818] text-white border border-[#2E2E2E] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#C58B39] cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-neutral-300 text-xs">
              <span className="font-medium">Estimated Profit</span>
              <span className="text-[10px] font-mono text-[#C58B39] uppercase font-bold tracking-wider">Net Margin</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-white font-mono tabular-nums">
                ₹{metrics.estimatedProfit.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">Revenue minus crew & expenses</div>
            </div>
          </div>

          {/* 9. New Enquiries */}
          <div 
            onClick={() => onNavigate('more', 'leads')}
            className="bg-white border border-[#E8E3D9] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#C58B39]/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-neutral-500 text-xs">
              <span className="font-medium">New Enquiries</span>
              <ArrowUpRight className="w-4 h-4 text-[#C58B39]" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 font-mono tabular-nums">
                {metrics.pendingEnquiriesCount}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">{metrics.newEnquiriesCount} fresh leads awaiting quote</div>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 3: UPCOMING 7 DAYS & ACTIONABLE TASKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Upcoming 7 Days Shoots */}
        <div className="lg:col-span-2 bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-neutral-900">Upcoming 7 Days Schedule</h2>
              <p className="text-xs text-neutral-500">Fast timeline of imminent wedding shoots</p>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs font-semibold text-[#C58B39] hover:text-[#9A6722] flex items-center gap-1"
            >
              <span>Full Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcoming7DaysEvents.length > 0 ? (
            <div className="divide-y divide-[#F0EBE1]">
              {upcoming7DaysEvents.map(event => {
                const totalCrew = event.crewAssignments?.length || event.crewMembers?.length || 0;
                const callTime = event.crewAssignments?.[0]?.callTime || event.shootTime?.split('-')[0]?.trim() || '08:00 AM';

                return (
                  <div key={event.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] -mx-2 px-2 rounded-lg transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#FAF8F5] border border-[#E8E3D9] flex flex-col items-center justify-center shrink-0 text-center">
                        <span className="text-[10px] uppercase font-mono text-neutral-500 font-bold">
                          {new Date(event.startDate || (event as any).shootDate || '').toLocaleDateString('en-IN', { month: 'short' })}
                        </span>
                        <span className="font-serif font-bold text-base text-neutral-900 leading-none">
                          {new Date(event.startDate || (event as any).shootDate || '').getDate()}
                        </span>
                      </div>

                      <div>
                        <div className="font-serif font-bold text-sm text-neutral-900">
                          {event.eventName}
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                          <span>{event.eventType}</span>
                          <span>·</span>
                          <span className="truncate max-w-[200px]">📍 {event.venue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right text-xs">
                        <span className="font-mono text-neutral-900 font-bold block">{callTime}</span>
                        <span className="text-neutral-500 text-[11px]">{totalCrew} Crew Members</span>
                      </div>

                      <button
                        onClick={() => onOpenEventDetail(event)}
                        className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                        title="Open Shoot Command Center"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-neutral-500 bg-[#FAF8F5] rounded-lg border border-dashed border-[#E8E3D9]">
              No shoots scheduled in the next 7 days. Calendar is open for booking.
            </div>
          )}
        </div>

        {/* Right 1 Col: Payments Due & Pending Tasks */}
        <div className="space-y-6">
          
          {/* Payments Due Card */}
          <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-serif font-bold text-base text-neutral-900 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-amber-600" />
                <span>Payments Due</span>
              </div>
              <button 
                onClick={() => onNavigate('money', 'payments')}
                className="text-[11px] font-semibold text-[#C58B39] hover:underline"
              >
                View Ledger
              </button>
            </div>

            {eventsWithPendingBalance.length > 0 ? (
              <div className="space-y-2.5">
                {eventsWithPendingBalance.map(event => (
                  <div key={event.id} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E3D9] text-xs flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-neutral-900 truncate">{event.clientName}</div>
                      <div className="text-neutral-500 text-[11px] truncate">{event.eventName}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-amber-700 text-xs">
                        ₹{event.balanceDue.toLocaleString('en-IN')}
                      </div>
                      <button
                        onClick={() => onOpenRecordPayment(event)}
                        className="text-[10px] text-emerald-700 font-semibold hover:underline"
                      >
                        + Record
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-neutral-500 text-center py-4 bg-[#FAF8F5] rounded-lg">
                All confirmed shoots are 100% paid up.
              </div>
            )}
          </div>

          {/* Pending Tasks & Attention Required */}
          <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-3">
            <div className="font-serif font-bold text-base text-neutral-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#C58B39]" />
              <span>Pending Tasks</span>
            </div>

            <div className="space-y-2 text-xs">
              {unassignedCrewEvents.length > 0 && (
                <div 
                  onClick={() => onNavigate('jobs')}
                  className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 cursor-pointer hover:bg-amber-100/70 transition-colors"
                >
                  <span className="font-semibold">{unassignedCrewEvents.length} Shoot(s) with unassigned crew roster.</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">Assign lead cinematographers and creators.</p>
                </div>
              )}

              {pendingReminderEvents.length > 0 && (
                <div 
                  onClick={() => onOpenSendReminder(pendingReminderEvents[0])}
                  className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200 text-orange-900 cursor-pointer hover:bg-orange-100/70 transition-colors"
                >
                  <span className="font-semibold">{pendingReminderEvents.length} Shoot(s) pending WhatsApp reminders.</span>
                  <p className="text-[11px] text-orange-800 mt-0.5">Dispatch call times and Google Maps links to team.</p>
                </div>
              )}

              {unassignedCrewEvents.length === 0 && pendingReminderEvents.length === 0 && (
                <div className="text-xs text-neutral-500 text-center py-4 bg-[#FAF8F5] rounded-lg">
                  ✓ All production checklists and crew dispatches are up to date!
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 4: UPCOMING EVENTS (Clean Detailed Cards Requested) */}
      <div className="bg-white border border-[#E8E3D9] rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E8E3D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-neutral-900">Upcoming Shoots</h2>
            <p className="text-xs text-neutral-500">Confirmed production jobs, crew allocations, and commercial values</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewEvent}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#121212] hover:bg-black rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>+ New Job</span>
            </button>

            <button
              onClick={() => onNavigate('jobs')}
              className="text-xs font-semibold text-[#C58B39] hover:text-[#9A6722] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingEvents.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-xs text-neutral-500">
              No upcoming shoots found. Click "+ New Job" to schedule a confirmed shoot.
            </div>
          ) : (
            upcomingEvents.slice(0, 4).map(event => {
              const totalCrew = (event.crewAssignments && event.crewAssignments.length > 0)
                ? event.crewAssignments.length
                : (event.crewMembers || []).length;
              const remindedCount = (event.crewReminders || []).filter(r => r.status === 'WhatsApp Opened').length;
              const isAllReminded = remindedCount >= totalCrew && totalCrew > 0;
              const callTime = event.crewAssignments?.[0]?.callTime || event.shootTime?.split('-')[0]?.trim() || '08:00 AM';

              return (
                <div 
                  key={event.id}
                  className="p-4 sm:p-5 rounded-xl border border-[#E8E3D9] bg-[#FAF8F5] hover:bg-white transition-all space-y-3.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {/* Quiet Unboxed Metadata */}
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span className="font-mono text-[#C58B39] font-bold">
                          {event.startDate || (event as any).shootDate ? new Date(event.startDate || (event as any).shootDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Date TBD'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{callTime}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-neutral-700">{event.eventType}</span>
                      </div>

                      {/* Couple / Client Name */}
                      <h3 className="font-serif text-lg font-bold text-neutral-900 tracking-tight mt-1">
                        {event.eventName}
                      </h3>

                      <div className="text-xs text-neutral-600 mt-0.5">
                        Client: <strong className="text-neutral-800">{event.clientName}</strong>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E8E3D9] text-neutral-800 font-semibold uppercase shrink-0">
                      {event.status}
                    </span>
                  </div>

                  {/* Venue & Location */}
                  <div className="text-xs text-neutral-600 flex items-center gap-1.5 truncate">
                    <span>📍</span>
                    <span className="font-medium text-neutral-900">{event.venue}</span>
                    <span>·</span>
                    <span>{event.locationCity || event.city || 'Mumbai'}</span>
                  </div>

                  {/* Financial & Crew Details Grid */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-[#E8E3D9] text-xs">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Assigned Crew</span>
                      <span className="font-bold text-neutral-900 font-mono mt-0.5 block">{totalCrew} Creators</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">Package Total</span>
                      <span className="font-bold text-neutral-900 font-mono mt-0.5 block">₹{event.packageTotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">Balance Due</span>
                      <span className={`font-bold font-mono mt-0.5 block ${event.balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {event.balanceDue > 0 ? `₹${event.balanceDue.toLocaleString('en-IN')}` : 'Paid in Full'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div>
                      {isAllReminded ? (
                        <span className="text-[11px] font-mono text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>WhatsApp Dispatched</span>
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
                        <span>Send Reminder</span>
                      </button>

                      <button
                        onClick={() => onOpenEventDetail(event)}
                        className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:text-black bg-white hover:bg-neutral-100 border border-[#E8E3D9] rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-neutral-500" />
                        <span>View Event</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 5: RECENT ENQUIRIES & RECENT PAYMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Enquiries / CRM */}
        <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-neutral-900">Recent Enquiries</h2>
              <p className="text-xs text-neutral-500">Sales pipeline leads & pending quotations</p>
            </div>

            <button
              onClick={() => onNavigate('more', 'leads')}
              className="text-xs font-semibold text-[#C58B39] hover:text-[#9A6722] flex items-center gap-1"
            >
              <span>View CRM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentEnquiries.map(enq => (
              <div key={enq.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D9] text-xs flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-neutral-900 text-sm truncate">{enq.clientName}</div>
                  <div className="text-neutral-500 text-[11px] truncate">
                    {enq.eventName} · 📅 {enq.date} · 📍 {enq.venue || 'Venue TBD'}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="font-mono font-bold text-neutral-900 block">₹{enq.budget.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-[#C58B39] font-medium">{enq.pipelineStage}</span>
                  </div>

                  <button
                    onClick={() => onQuickQuoteForEnquiry(enq)}
                    className="p-1.5 rounded-lg bg-white border border-[#E8E3D9] text-neutral-700 hover:text-black hover:border-neutral-400"
                    title="Generate Quote"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#C58B39]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Client Payments */}
        <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-neutral-900">Recent Client Payments</h2>
              <p className="text-xs text-neutral-500">Bank transfers, UPI advances, and receipts</p>
            </div>

            <button
              onClick={() => onNavigate('money', 'payments')}
              className="text-xs font-semibold text-[#C58B39] hover:text-[#9A6722] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentPayments.map(pmt => (
              <div key={pmt.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D9] text-xs flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-neutral-900 text-sm">{pmt.referenceNumber || 'Advance Deposit'}</div>
                  <div className="text-neutral-500 text-[11px] truncate">
                    {pmt.date} · via <span className="font-medium text-neutral-700">{pmt.paymentMode}</span>
                    {pmt.notes && ` · ${pmt.notes}`}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-emerald-700 text-sm">
                    +₹{pmt.amount.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                    Received
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
