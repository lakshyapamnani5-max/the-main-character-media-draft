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
  Eye
} from 'lucide-react';
import { 
  DashboardMetrics, 
  EventShoot, 
  Enquiry, 
  Quotation 
} from '../../types';
import { NavModule } from '../Header';
import { AdminReminderBanner } from '../Reminders/AdminReminderBanner';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  upcomingEvents: EventShoot[];
  pendingEnquiries: Enquiry[];
  recentQuotes: Quotation[];
  onNavigate: (module: NavModule) => void;
  onOpenNewEnquiry: () => void;
  onOpenNewEventCharge: () => void;
  onOpenNewQuote: () => void;
  onOpenNewEvent: () => void;
  onSelectQuoteForPreview: (quote: Quotation) => void;
  onQuickQuoteForEnquiry: (enquiry: Enquiry) => void;
  onOpenSendReminder?: (event: EventShoot) => void;
  onOpenReminderSettings?: () => void;
  onOpenEventDetail?: (event: EventShoot) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  upcomingEvents,
  pendingEnquiries,
  recentQuotes,
  onNavigate,
  onOpenNewEnquiry,
  onOpenNewEventCharge,
  onOpenNewQuote,
  onOpenNewEvent,
  onSelectQuoteForPreview,
  onQuickQuoteForEnquiry,
  onOpenSendReminder = () => {},
  onOpenReminderSettings = () => {},
  onOpenEventDetail
}) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white border border-[#E8E3D9] rounded-lg p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C58B39]">
              <span>Executive Command Center</span>
              <span className="text-neutral-300">·</span>
              <span className="text-neutral-500 font-normal">Season 2026-2027</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#181818] mt-1 tracking-tight">
              The Main Character Media
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl font-light">
              Master administration, real-time sales pipeline, rate card catalogue, client proposals, and shoot logistics.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenNewEnquiry}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-[#181818] hover:bg-[#282828] rounded transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>+ New Enquiry</span>
            </button>
            <button
              onClick={onOpenNewEventCharge}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#181818] bg-[#F4EFE6] hover:bg-[#EBE4D8] border border-[#DDD6C8] rounded transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>+ Add Event Charge</span>
            </button>
            <button
              onClick={onOpenNewQuote}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-[#C58B39] hover:bg-[#B37B2E] rounded transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-white" />
              <span>+ Create Quote</span>
            </button>
            <button
              onClick={onOpenNewEvent}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-800 bg-white hover:bg-neutral-50 border border-[#E8E3D9] rounded transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>+ New Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Internal Admin Reminder Alert Banner */}
      <AdminReminderBanner
        upcomingEvents={upcomingEvents}
        onOpenSendReminder={onOpenSendReminder}
        onOpenReminderSettings={onOpenReminderSettings}
      />

      {/* 9 Metric Cards Grid */}
      <div>
        <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
          Key Performance & Financial Ledger
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3.5 sm:gap-4">
          
          {/* Card 1: Upcoming Shoots */}
          <div className="bg-white border border-[#E8E3D9] rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-medium">Upcoming Shoots</span>
              <Calendar className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#181818] font-mono tabular-nums">
                {metrics.upcomingShootsCount}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Confirmed on calendar</div>
            </div>
          </div>

          {/* Card 2: This Month */}
          <div className="bg-white border border-[#E8E3D9] rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-medium">This Month</span>
              <Clock className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#181818] font-mono tabular-nums">
                {metrics.thisMonthShootsCount}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Scheduled for this month</div>
            </div>
          </div>

          {/* Card 3: Pending Balance */}
          <div className="bg-white border border-[#E8E3D9] rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-medium">Pending Balance</span>
              <TrendingUp className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#D97706] font-mono tabular-nums">
                ₹{metrics.pendingBalanceTotal.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Due from clients on/before shoots</div>
            </div>
          </div>

          {/* Card 4: Crew on Roster */}
          <div className="bg-white border border-[#E8E3D9] rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-medium">Crew on Roster</span>
              <Users className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#181818] font-mono tabular-nums">
                {metrics.crewOnRosterCount}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Creators, pilots & editors</div>
            </div>
          </div>

          {/* Card 5: Revenue */}
          <div className="bg-white border border-[#E8E3D9] rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-medium">Total Booked Revenue</span>
              <DollarSign className="w-4 h-4 text-[#181818]" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#181818] font-mono tabular-nums">
                ₹{metrics.totalRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Gross contracted package values</div>
            </div>
          </div>

          {/* Card 6: Collected */}
          <div className="bg-white border border-[#E8E3D9] rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-medium">Collected</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700 font-mono tabular-nums">
                ₹{metrics.collectedRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Received in bank / UPI</div>
            </div>
          </div>

          {/* Card 7: Crew Commissions */}
          <div className="bg-white border border-[#E8E3D9] rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#C58B39]/50 transition-colors">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-semibold text-neutral-800">Crew Commissions</span>
              <Users className="w-4 h-4 text-[#C58B39]" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 font-mono tabular-nums">
                ₹{metrics.crewPayoutTotal.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 flex items-center justify-between">
                <span>Committed creator payouts</span>
                <span className="text-emerald-700 font-medium font-mono text-[10px]">Retained Margin: ₹{metrics.grossProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Card 8: Gross Profit */}
          <div className="bg-[#181818] text-white border border-[#2A2A2A] rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-300">
              <span className="text-xs font-medium">Gross Profit</span>
              <span className="text-[11px] text-[#C58B39] font-medium uppercase tracking-wider">Agency Margin</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#FAF8F5] font-mono tabular-nums">
                ₹{metrics.grossProfit.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">Revenue minus crew compensation</div>
            </div>
          </div>

          {/* Card 9: Pending Enquiries */}
          <div className="bg-white border border-[#E8E3D9] rounded-lg p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-medium">Pending Enquiries</span>
              <ArrowUpRight className="w-4 h-4 text-[#C58B39]" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#181818] font-mono tabular-nums">
                {metrics.pendingEnquiriesCount}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">Active leads in sales pipeline</div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: Upcoming Shoots & Pending Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        
        {/* Section 1: Upcoming Shoots */}
        <div className="bg-white border border-[#E8E3D9] rounded-lg shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#E8E3D9] flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#181818]">Upcoming Shoots</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Confirmed wedding shoots & crew deployments</p>
            </div>
            <button
              onClick={() => onNavigate('events')}
              className="text-xs font-medium text-[#C58B39] hover:text-[#9A6722] flex items-center gap-1"
            >
              <span>View All Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#F0ECE1] flex-1">
            {upcomingEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No upcoming shoots scheduled. Click "+ New Event" to schedule.
              </div>
            ) : (
              upcomingEvents.slice(0, 4).map((event) => {
                const totalCrew = (event.crewAssignments && event.crewAssignments.length > 0)
                  ? event.crewAssignments.length
                  : (event.crewMembers || []).length;

                const remindedCount = (event.crewReminders || []).filter(r => r.status === 'WhatsApp Opened').length;
                const isAllReminded = remindedCount >= totalCrew && totalCrew > 0;
                const callTime = event.crewAssignments?.[0]?.callTime || event.shootTime?.split('-')[0]?.trim() || '08:00 AM';

                return (
                  <div key={event.id} className="p-4 sm:p-5 hover:bg-[#FAF8F5] transition-colors space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#C58B39] bg-[#C58B39]/10 px-2 py-0.5 rounded">
                            UPCOMING SHOOT
                          </span>
                          <span className="text-xs text-neutral-500 font-mono">
                            {event.startDate || event.shootDate ? new Date(event.startDate || event.shootDate || '').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Date TBD'} · {callTime}
                          </span>
                          <span className="text-neutral-300">·</span>
                          <span className="text-xs text-neutral-600 font-mono font-medium">
                            {totalCrew} Crew
                          </span>
                        </div>

                        <div className="font-serif font-bold text-base text-[#181818]">
                          {event.eventName}
                        </div>

                        <div className="text-xs text-neutral-600 flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-neutral-800">{event.venue}</span>
                          <span>·</span>
                          <span>{event.locationCity || event.city || 'Mumbai'}</span>
                        </div>
                      </div>

                      {/* Reminder Status Badge & Price */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0">
                        {isAllReminded ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1">
                            <span>✓ WhatsApp Opened</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-300 font-medium flex items-center gap-1">
                            <span>⚠️ Reminder Pending</span>
                          </span>
                        )}

                        <div className="text-xs font-mono font-medium text-neutral-900 tabular-nums">
                          ₹{event.packageTotal.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions: View Event & Send Crew Reminder */}
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          if (onOpenEventDetail) {
                            onOpenEventDetail(event);
                          } else {
                            onNavigate('events');
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-black bg-[#FAF8F5] hover:bg-neutral-100 border border-[#E8E3D9] rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-neutral-500" />
                        <span>View Event</span>
                      </button>

                      <button
                        onClick={() => onOpenSendReminder(event)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-2xs ${
                          isAllReminded
                            ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                            : 'bg-[#C58B39] hover:bg-[#B37B2E] text-white'
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isAllReminded ? 'Resend Reminder' : 'SEND CREW REMINDER'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section 2: Pending Enquiries */}
        <div className="bg-white border border-[#E8E3D9] rounded-lg shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#E8E3D9] flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#181818]">Pending Enquiries</h2>
              <p className="text-xs text-neutral-500 mt-0.5">High-intent leads requiring quote or follow-up</p>
            </div>
            <button
              onClick={() => onNavigate('enquiries')}
              className="text-xs font-medium text-[#C58B39] hover:text-[#9A6722] flex items-center gap-1"
            >
              <span>CRM Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#F0ECE1] flex-1">
            {pendingEnquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No active pending enquiries in pipeline.
              </div>
            ) : (
              pendingEnquiries.slice(0, 4).map((enq) => (
                <div key={enq.id} className="p-4 hover:bg-[#FAF8F5] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#181818] truncate">{enq.clientName}</span>
                        <span className="text-[11px] text-neutral-500 font-light">({enq.leadSource})</span>
                      </div>
                      <div className="text-xs text-neutral-600 mt-0.5 truncate">
                        {enq.eventName} · {enq.venue || 'Venue TBD'}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-1">
                        Target Date: {enq.date} · Rep: {enq.salesperson}
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1.5">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#FAF6EE] text-[#9A6722] border border-[#EADBBE]">
                        {enq.pipelineStage}
                      </span>
                      <button
                        onClick={() => onQuickQuoteForEnquiry(enq)}
                        className="text-[11px] text-neutral-900 underline hover:text-[#C58B39]"
                      >
                        Create Quote
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Grid Row 2: Recent Quotations & Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        
        {/* Section 3: Recent Quotations (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-[#E8E3D9] rounded-lg shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E8E3D9] flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#181818]">Recent Quotations</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Commercial estimates generated with snapshotted pricing</p>
            </div>
            <button
              onClick={() => onNavigate('quotations')}
              className="text-xs font-medium text-[#C58B39] hover:text-[#9A6722] flex items-center gap-1"
            >
              <span>All Quotations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-neutral-500 uppercase tracking-wider text-[11px] border-b border-[#E8E3D9]">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Quote #</th>
                  <th className="py-2.5 px-4 font-medium">Client / Event</th>
                  <th className="py-2.5 px-4 font-medium text-right">Grand Total</th>
                  <th className="py-2.5 px-4 font-medium text-center">Status</th>
                  <th className="py-2.5 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1]">
                {recentQuotes.slice(0, 5).map((quote) => (
                  <tr key={quote.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-neutral-800">
                      {quote.quoteNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-neutral-900">{quote.clientName}</div>
                      <div className="text-[11px] text-neutral-500">{quote.eventName}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-neutral-900 tabular-nums">
                      ₹{quote.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded ${
                        quote.status === 'Accepted' || quote.status === 'Converted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : quote.status === 'Sent'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                      }`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectQuoteForPreview(quote)}
                        className="text-xs text-[#C58B39] hover:underline font-medium"
                      >
                        Preview / PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Financial Overview (1 Col) */}
        <div className="bg-white border border-[#E8E3D9] rounded-lg shadow-xs p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold text-[#181818]">Financial Overview</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Cashflow health & realization</p>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-600">Collection Realization</span>
                  <span className="font-mono font-semibold text-neutral-900 tabular-nums">
                    {metrics.totalRevenue > 0 
                      ? `${Math.round((metrics.collectedRevenue / metrics.totalRevenue) * 100)}%` 
                      : '0%'}
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{
                      width: `${metrics.totalRevenue > 0 ? Math.min(100, (metrics.collectedRevenue / metrics.totalRevenue) * 100) : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0ECE1] space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Gross Contracted:</span>
                  <span className="font-mono tabular-nums text-neutral-800">₹{metrics.totalRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total Collected:</span>
                  <span className="font-mono tabular-nums text-emerald-700 font-medium">₹{metrics.collectedRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Outstanding Balance:</span>
                  <span className="font-mono tabular-nums text-[#D97706] font-medium">₹{metrics.pendingBalanceTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Crew Remuneration:</span>
                  <span className="font-mono tabular-nums text-neutral-700">₹{metrics.crewPayoutTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#F0ECE1] font-semibold text-sm">
                  <span className="text-[#181818]">Net Gross Margin:</span>
                  <span className="font-mono tabular-nums text-[#C58B39]">₹{metrics.grossProfit.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F0ECE1] bg-[#FAF8F5] -mx-5 -mb-5 p-4 rounded-b-lg">
            <div className="text-[11px] text-neutral-500">
              Average agency take-home margin is <span className="font-semibold text-neutral-800">{metrics.totalRevenue > 0 ? `${Math.round((metrics.grossProfit / metrics.totalRevenue) * 100)}%` : '65%'}</span> on booked productions.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
