import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Users, 
  Receipt, 
  Plus, 
  Search, 
  Calendar, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Building2,
  Trash2,
  Tag,
  CreditCard,
  X,
  FileCheck2,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  PaymentRecord, 
  EventShoot, 
  CrewMember, 
  Expense, 
  DashboardMetrics,
  Invoice
} from '../../types';
import { StorageService } from '../../services/storage';
import { AddPaymentModal } from '../Clients/AddPaymentModal';
import { InvoicesView } from '../Invoices/InvoicesView';

export type MoneyTab = 'overview' | 'invoices' | 'payments' | 'payouts' | 'expenses';

interface MoneyViewProps {
  metrics: DashboardMetrics;
  events: EventShoot[];
  payments: PaymentRecord[];
  crewRoster: CrewMember[];
  expenses: Expense[];
  initialTab?: MoneyTab;
  onRecordPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
  onSaveExpense: (expense: Partial<Expense> & { title: string; amount: number; category: Expense['category'] }) => void;
  onDeleteExpense: (id: string) => void;
  onRefreshData: () => void;
}

export const MoneyView: React.FC<MoneyViewProps> = ({
  metrics,
  events,
  payments,
  crewRoster,
  expenses,
  initialTab = 'overview',
  onRecordPayment,
  onSaveExpense,
  onDeleteExpense,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<MoneyTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [selectedEventForPayment, setSelectedEventForPayment] = useState<EventShoot | null>(null);
  const [expandedCrewId, setExpandedCrewId] = useState<string | null>(null);

  const handleUpdateCrewPayoutStatus = (eventId: string, crewId: string, status: 'Paid' | 'Unpaid') => {
    StorageService.updateCrewAssignmentPaymentStatus(eventId, crewId, status);
    onRefreshData();
  };
  
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<{
    title: string;
    category: Expense['category'];
    amount: string;
    date: string;
    eventId?: string;
    paidBy: string;
    paymentMode: 'UPI' | 'Bank Transfer' | 'Cash' | 'Credit Card';
    notes: string;
  }>({
    title: '',
    category: 'Equipment Rental',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    eventId: '',
    paidBy: 'Devansh Saxena',
    paymentMode: 'UPI',
    notes: ''
  });

  // Invoices list from storage
  const invoices = StorageService.getInvoices();
  const outstandingInvoices = invoices.filter(i => (i.balanceDue || 0) > 0 && i.paymentStatus !== 'Paid');
  const outstandingInvoicesAmount = outstandingInvoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);

  // Calculate Money Summary
  const totalBookedRevenue = events.reduce((sum, e) => sum + (e.packageTotal || 0), 0);
  const totalCollectedRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPendingReceivables = events.reduce((sum, e) => sum + (e.balanceDue || 0), 0);
  
  const totalCrewPayouts = events.reduce((sum, e) => sum + (e.crewPayout || 0), 0);
  const totalOperatingExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  
  const netEstimatedProfit = totalBookedRevenue - totalCrewPayouts - totalOperatingExpenses;
  const profitMarginPercent = totalBookedRevenue > 0 
    ? Math.round((netEstimatedProfit / totalBookedRevenue) * 100) 
    : 0;

  // Expense by category calculation
  const expensesByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  // Crew compensation breakdown
  const crewPayoutSummary = crewRoster.map(crew => {
    let assignedShootCount = 0;
    let totalEarned = 0;
    let settled = 0;
    let unsettled = 0;
    const shootsDetails: { event: EventShoot; amount: number; status: 'Paid' | 'Unpaid'; role: string }[] = [];

    events.forEach(ev => {
      const assignment = (ev.crewAssignments || []).find(a => a.crewId === crew.id);
      if (assignment) {
        assignedShootCount++;
        const amt = assignment.payout || crew.defaultPayout || 0;
        const status = assignment.paymentStatus || 'Unpaid';
        totalEarned += amt;
        if (status === 'Paid') settled += amt; else unsettled += amt;
        shootsDetails.push({ event: ev, amount: amt, status, role: assignment.role });
      } else if (ev.crewMembers && ev.crewMembers.includes(crew.name)) {
        assignedShootCount++;
        const amt = crew.defaultPayout || 0;
        totalEarned += amt;
        unsettled += amt;
        shootsDetails.push({ event: ev, amount: amt, status: 'Unpaid', role: crew.role });
      }
    });

    return {
      crew,
      shootsCount: assignedShootCount,
      totalEarned,
      settled,
      unsettled,
      shootsDetails
    };
  });

  // Clients with pending balance
  const outstandingClients = events.filter(e => 
    (e.balanceDue || 0) > 0 && e.status !== 'Cancelled' && e.status !== 'Archived'
  );

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(newExpense.amount);
    if (!newExpense.title || !amt || amt <= 0) return;

    const taggedEvent = events.find(ev => ev.id === newExpense.eventId);

    onSaveExpense({
      title: newExpense.title.trim(),
      category: newExpense.category,
      amount: amt,
      date: newExpense.date,
      eventId: newExpense.eventId || undefined,
      eventName: taggedEvent?.eventName,
      paidBy: newExpense.paidBy,
      paymentMode: newExpense.paymentMode,
      notes: newExpense.notes.trim()
    });

    setIsAddExpenseOpen(false);
    setNewExpense({
      title: '',
      category: 'Equipment Rental',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      eventId: '',
      paidBy: 'Devansh Saxena',
      paymentMode: 'UPI',
      notes: ''
    });
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#C58B39] font-semibold">
            Commercial & Financial Ledger
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-0.5 tracking-tight">
            Money, Cashflow & Profit
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Client payment tracking, creator payouts, equipment expenses, and real-time net agency profit margins.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              setSelectedEventForPayment(null);
              setIsAddPaymentOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record Client Payment</span>
          </button>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-800 bg-[#FAF8F5] hover:bg-neutral-100 border border-[#E8E3D9] rounded-lg transition-colors"
          >
            <Receipt className="w-4 h-4 text-red-600" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1 p-1 bg-white border border-[#E8E3D9] rounded-xl shadow-2xs overflow-x-auto">
        {[
          { id: 'overview', label: 'Profit & Cashflow Overview' },
          { id: 'invoices', label: 'Tax Invoices & Billing', count: invoices.length },
          { id: 'payments', label: 'Client Payments & Receivables', count: payments.length },
          { id: 'payouts', label: 'Crew Payouts & Compensation', count: crewPayoutSummary.length },
          { id: 'expenses', label: 'Expenses & Equipment Outflow', count: expenses.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as MoneyTab)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-black hover:bg-[#FAF8F5]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & PROFIT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Complete Money Dashboard Cards matching user brief:
              Total Sales, Received, Pending, Crew Payouts, Expenses, Profit, Outstanding Invoices */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            
            {/* 1. Total Sales */}
            <div className="bg-white border border-[#E8E3D9] rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Total Sales</span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 font-mono mt-1.5">
                ₹{totalBookedRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">Booked contracts</div>
            </div>

            {/* 2. Received */}
            <div className="bg-white border border-[#E8E3D9] rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Received</span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-700 font-mono mt-1.5">
                ₹{totalCollectedRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-600 mt-1">
                {totalBookedRevenue > 0 ? Math.round((totalCollectedRevenue / totalBookedRevenue) * 100) : 0}% collected
              </div>
            </div>

            {/* 3. Pending */}
            <div className="bg-white border border-[#E8E3D9] rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Pending</span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-amber-700 font-mono mt-1.5">
                ₹{totalPendingReceivables.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-amber-600 mt-1">Due on call-time</div>
            </div>

            {/* 4. Crew Payouts */}
            <div className="bg-white border border-[#E8E3D9] rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Crew Payouts</span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-neutral-800 font-mono mt-1.5">
                ₹{totalCrewPayouts.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">{crewPayoutSummary.length} creators</div>
            </div>

            {/* 5. Expenses */}
            <div className="bg-white border border-[#E8E3D9] rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Expenses</span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-rose-700 font-mono mt-1.5">
                ₹{totalOperatingExpenses.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">{expenses.length} expense logs</div>
            </div>

            {/* 6. Profit */}
            <div className="bg-[#121212] text-white border border-[#262626] rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-neutral-300 uppercase tracking-wider">Profit</span>
                <span className="text-[10px] font-mono text-[#C58B39] font-bold">{profitMarginPercent}%</span>
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-white font-mono mt-1.5">
                ₹{netEstimatedProfit.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Net gross margin</div>
            </div>

            {/* 7. Outstanding Invoices */}
            <div className="bg-white border border-[#E8E3D9] rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Outstanding Invoices</span>
                <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-1 rounded border border-amber-200">
                  {outstandingInvoices.length}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-amber-800 font-mono mt-1.5">
                ₹{outstandingInvoicesAmount.toLocaleString('en-IN')}
              </div>
              <button 
                onClick={() => setActiveTab('invoices')}
                className="text-[10px] text-[#C58B39] font-semibold text-left hover:underline mt-1"
              >
                View all invoices →
              </button>
            </div>

          </div>

          {/* Breakdown Section: Revenue vs Expenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Expense Categories Distribution */}
            <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-neutral-900">Operating Expenses by Category</h3>
                  <p className="text-xs text-neutral-500">Gear rental, transportation, media drives and catering</p>
                </div>
                <span className="font-mono text-sm font-bold text-neutral-900">₹{totalOperatingExpenses.toLocaleString('en-IN')}</span>
              </div>

              <div className="space-y-3 pt-2">
                {Object.entries(expensesByCategory).map(([cat, amt]) => {
                  const pct = totalOperatingExpenses > 0 ? Math.round((amt / totalOperatingExpenses) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-neutral-800">{cat}</span>
                        <span className="font-mono font-bold text-neutral-900">₹{amt.toLocaleString('en-IN')} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                        <div 
                          className="h-full bg-[#C58B39] rounded-full" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Outstanding Balances */}
            <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-neutral-900">Outstanding Client Balances</h3>
                  <p className="text-xs text-neutral-500">Uncollected balances requiring deposit reminders</p>
                </div>
                <span className="font-mono text-xs text-amber-700 font-bold">{outstandingClients.length} Pending</span>
              </div>

              <div className="space-y-2.5">
                {outstandingClients.slice(0, 5).map(ev => (
                  <div key={ev.id} className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E8E3D9] text-xs flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-neutral-900">{ev.clientName}</div>
                      <div className="text-[11px] text-neutral-500">
                        {ev.eventName} · 📅 {ev.startDate || (ev as any).shootDate}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-amber-700">₹{ev.balanceDue.toLocaleString('en-IN')}</div>
                      <button
                        onClick={() => {
                          setSelectedEventForPayment(ev);
                          setIsAddPaymentOpen(true);
                        }}
                        className="text-[10px] font-semibold text-emerald-700 hover:underline"
                      >
                        + Record Payment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: CLIENT PAYMENTS & RECEIVABLES */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          
          {/* Outstanding Balances Box */}
          <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-neutral-900">Clients with Outstanding Balances</h2>
                <p className="text-xs text-neutral-500">Payment milestones due prior to final media export</p>
              </div>

              <span className="font-mono font-bold text-amber-700 text-sm">
                Total Pending: ₹{totalPendingReceivables.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="divide-y divide-[#F0EBE1]">
              {outstandingClients.map(ev => (
                <div key={ev.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-neutral-900 text-sm">{ev.clientName}</div>
                    <div className="text-neutral-500 mt-0.5">
                      {ev.eventName} · Total Contract: <strong className="font-mono text-neutral-800">₹{ev.packageTotal.toLocaleString('en-IN')}</strong> · Advance Paid: <strong className="font-mono text-emerald-700">₹{ev.advancePaid.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono text-neutral-400 block font-semibold">Balance Due</span>
                      <span className="font-mono font-bold text-amber-700 text-sm">₹{ev.balanceDue.toLocaleString('en-IN')}</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedEventForPayment(ev);
                        setIsAddPaymentOpen(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs"
                    >
                      Record Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Received Payments Ledger */}
          <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-neutral-900">Received Payments Ledger</h2>
                <p className="text-xs text-neutral-500">Complete record of UPI, Bank Transfers, and Cash transactions</p>
              </div>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                Total Received: +₹{totalCollectedRevenue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-neutral-600 font-mono uppercase text-[11px] border-y border-[#E8E3D9]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Reference / Transaction</th>
                    <th className="py-2.5 px-3">Payment Mode</th>
                    <th className="py-2.5 px-3">Notes</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE1]">
                  {payments.map(pmt => (
                    <tr key={pmt.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-3 font-mono text-neutral-800">{pmt.date}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-neutral-900">{pmt.referenceNumber || 'Deposit'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {pmt.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-600">{pmt.notes || '—'}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 text-sm">
                        +₹{pmt.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: CREW PAYOUTS */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-neutral-900">Crew Compensation Roster</h2>
                <p className="text-xs text-neutral-500">Agreed day-rates and shoot deployments per creator with Paid / Unpaid settlement controls</p>
              </div>
              <span className="font-mono font-bold text-neutral-900 text-sm">
                Total Committed: ₹{totalCrewPayouts.toLocaleString('en-IN')}
              </span>
            </div>

            {crewPayoutSummary.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400 italic">
                No crew members currently on roster.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crewPayoutSummary.map(({ crew, shootsCount, totalEarned, settled, unsettled, shootsDetails }) => {
                  const isExpanded = expandedCrewId === crew.id;

                  return (
                    <div key={crew.id} className={`rounded-xl border transition-all flex flex-col justify-between ${
                      isExpanded ? 'border-[#C58B39] bg-white ring-2 ring-[#C58B39]/20' : 'border-[#E8E3D9] bg-[#FAF8F5]'
                    }`}>
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-serif font-bold text-base text-neutral-900">{crew.name}</h3>
                            <div className="text-xs text-neutral-500">{crew.role}</div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E8E3D9] text-neutral-700">
                            {shootsCount} Shoot{shootsCount > 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                            <span className="text-[9px] uppercase font-mono text-emerald-800 font-bold block">Settled</span>
                            <span className="font-mono font-bold text-emerald-800 text-xs block">
                              ₹{settled.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                            <span className="text-[9px] uppercase font-mono text-amber-800 font-bold block">Unsettled</span>
                            <span className="font-mono font-bold text-amber-800 text-xs block">
                              ₹{unsettled.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#E8E3D9] flex items-center justify-between text-xs">
                          <span className="text-neutral-500">Total Compensation:</span>
                          <span className="font-mono font-bold text-neutral-900 text-sm">
                            ₹{totalEarned.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Expandable shoot payout details */}
                      <div className="border-t border-[#E8E3D9] bg-white rounded-b-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedCrewId(isExpanded ? null : crew.id)}
                          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-[#FAF8F5]"
                        >
                          <span>{isExpanded ? 'Hide Shoots' : `View Shoots (${shootsCount})`}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isExpanded && (
                          <div className="p-3 border-t border-[#E8E3D9] space-y-2 bg-[#FAF8F5]/50">
                            {shootsDetails.length === 0 ? (
                              <div className="text-center py-2 text-xs text-neutral-400 italic">No shoots assigned.</div>
                            ) : (
                              shootsDetails.map(({ event, amount, status, role }) => (
                                <div key={event.id} className="p-2 bg-white border border-[#E8E3D9] rounded-lg flex items-center justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-xs text-neutral-900 truncate">{event.eventName}</div>
                                    <div className="text-[10px] text-neutral-500 font-mono">
                                      {event.startDate || (event as any).shootDate} · Role: {role}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="font-mono font-bold text-xs text-neutral-900">
                                      ₹{amount.toLocaleString('en-IN')}
                                    </span>
                                    <select
                                      value={status}
                                      onChange={(e) => handleUpdateCrewPayoutStatus(event.id, crew.id, e.target.value as 'Paid' | 'Unpaid')}
                                      className={`text-[10px] font-semibold px-2 py-1 rounded border cursor-pointer focus:outline-none ${
                                        status === 'Paid'
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                                          : 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                                      }`}
                                    >
                                      <option value="Unpaid">Unpaid</option>
                                      <option value="Paid">Paid</option>
                                    </select>
                                  </div>
                                </div>
                              ))
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
        </div>
      )}

      {/* TAB 4: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-neutral-900">Operating Expenses & Purchases</h2>
                <p className="text-xs text-neutral-500">Rental gear, storage hard drives, transport, and on-set consumables</p>
              </div>

              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="px-3.5 py-1.5 bg-[#121212] hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                <span>+ Add Expense</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-neutral-600 font-mono uppercase text-[11px] border-y border-[#E8E3D9]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Title / Item</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Tagged Event</th>
                    <th className="py-2.5 px-3">Paid By / Mode</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE1]">
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-3 font-mono text-neutral-700">{exp.date}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-neutral-900">{exp.title}</div>
                        {exp.notes && <div className="text-[11px] text-neutral-500 mt-0.5">{exp.notes}</div>}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-600 font-medium">
                        {exp.eventName || 'General Operating'}
                      </td>
                      <td className="py-3 px-3 text-neutral-500">
                        {exp.paidBy} ({exp.paymentMode})
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-red-700 text-sm">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB: INVOICES */}
      {activeTab === 'invoices' && (
        <InvoicesView
          invoices={invoices}
          events={events}
          onRefreshData={onRefreshData}
        />
      )}

      {/* Add Payment Modal */}
      {isAddPaymentOpen && (
        <AddPaymentModal
          isOpen={true}
          onClose={() => {
            setIsAddPaymentOpen(false);
            setSelectedEventForPayment(null);
          }}
          client={{
            id: selectedEventForPayment?.clientId || 'cli-general',
            name: selectedEventForPayment?.clientName || 'General Client Payment',
            phone: selectedEventForPayment?.clientContact?.phone || '',
            email: selectedEventForPayment?.clientContact?.email || '',
            notes: '',
            createdAt: '',
            updatedAt: ''
          }}
          events={events}
          onRecordPayment={(pmt) => {
            onRecordPayment({
              ...pmt,
              clientId: selectedEventForPayment?.clientId || 'cli-general',
              eventId: selectedEventForPayment?.id
            });
            setIsAddPaymentOpen(false);
            setSelectedEventForPayment(null);
            onRefreshData();
          }}
        />
      )}

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E3D9] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
              <h3 className="font-serif font-bold text-lg text-neutral-900">Record Production Expense</h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Expense Title / Item *</label>
                <input
                  type="text"
                  required
                  value={newExpense.title}
                  onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
                  placeholder="e.g. Sony FX3 Lens Rental / 2TB SSD / Taxi"
                  className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Category *</label>
                  <select
                    value={newExpense.category}
                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value as any })}
                    className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
                  >
                    <option value="Equipment Rental">Equipment Rental</option>
                    <option value="Hard Drives & Storage">Hard Drives & Storage</option>
                    <option value="Travel & Cab">Travel & Cab</option>
                    <option value="Food & Catering">Food & Catering</option>
                    <option value="Studio & Office">Studio & Office</option>
                    <option value="Costumes & Props">Costumes & Props</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="e.g. 4500"
                    className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Payment Mode</label>
                  <select
                    value={newExpense.paymentMode}
                    onChange={e => setNewExpense({ ...newExpense, paymentMode: e.target.value as any })}
                    className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Tag to Specific Shoot (Optional)</label>
                <select
                  value={newExpense.eventId}
                  onChange={e => setNewExpense({ ...newExpense, eventId: e.target.value })}
                  className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
                >
                  <option value="">General Production Overhead</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.eventName} ({ev.clientName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Notes / Vendor Details</label>
                <input
                  type="text"
                  value={newExpense.notes}
                  onChange={e => setNewExpense({ ...newExpense, notes: e.target.value })}
                  placeholder="Invoice number or vendor name..."
                  className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E3D9]">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-black font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#121212] hover:bg-black text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
