import React, { useState } from 'react';
import { 
  Wallet, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MapPin, 
  Filter, 
  IndianRupee,
  ShieldCheck,
  Building2,
  FileText
} from 'lucide-react';
import { EventShoot, CrewMember } from '../../types';

interface CrewPayoutsTabProps {
  activeCrew: CrewMember;
  allShoots: EventShoot[];
}

export const CrewPayoutsTab: React.FC<CrewPayoutsTabProps> = ({
  activeCrew,
  allShoots
}) => {
  const [filter, setFilter] = useState<'all' | 'unsettled' | 'settled'>('all');

  // Find all shoots this creator is assigned to
  const myShoots = allShoots.filter(event => {
    return (event.crewAssignments && event.crewAssignments.some(a => a.crewId === activeCrew.id)) ||
      (event.crewMembers && event.crewMembers.some(name => name.toLowerCase() === activeCrew.name.toLowerCase()));
  });

  // Calculate earnings items
  const shootPayoutItems = myShoots.map(event => {
    const asg = event.crewAssignments?.find(a => a.crewId === activeCrew.id);
    const amount = asg?.payout || activeCrew.defaultPayout || 0;
    const isSettled = asg?.paymentStatus === 'Paid';
    const role = asg?.role || activeCrew.role;
    const date = event.startDate || (event as any).shootDate || 'Upcoming';

    return {
      event,
      amount,
      isSettled,
      paidAt: asg?.paidAt,
      role,
      date
    };
  });

  const totalSettled = shootPayoutItems.filter(item => item.isSettled).reduce((sum, item) => sum + item.amount, 0);
  const totalUnsettled = shootPayoutItems.filter(item => !item.isSettled).reduce((sum, item) => sum + item.amount, 0);
  const totalEarned = totalSettled + totalUnsettled;

  const filteredItems = shootPayoutItems.filter(item => {
    if (filter === 'settled') return item.isSettled;
    if (filter === 'unsettled') return !item.isSettled;
    return true;
  });

  return (
    <div className="space-y-4 pb-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-[#1C1A18] to-[#121212] border border-[#2A2825] rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#C58B39] font-mono font-bold uppercase tracking-wider">
              <Wallet className="w-3.5 h-3.5" />
              <span>Compensation Ledger</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-white tracking-tight mt-1">
              My Payouts & Settlement
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Track settled earnings and pending event day payouts
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-[#25221F] border border-[#C58B39]/40 flex items-center justify-center font-serif text-lg font-bold text-[#C58B39]">
            ₹
          </div>
        </div>

        {/* 2-Card Metric Overview */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-emerald-400 font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Settled (Paid)</span>
            </div>
            <div className="font-mono text-xl font-bold text-white mt-0.5">
              ₹{totalSettled.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              Transferred to your bank
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-[#C58B39] font-bold">
              <Clock className="w-3 h-3 text-[#C58B39]" />
              <span>Unsettled (Pending)</span>
            </div>
            <div className="font-mono text-xl font-bold text-[#C58B39] mt-0.5">
              ₹{totalUnsettled.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              Awaiting admin settlement
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
            filter === 'all'
              ? 'bg-[#181818] text-white border-[#181818]'
              : 'bg-white text-neutral-600 border-[#E8E3D9] hover:bg-[#FAF8F5]'
          }`}
        >
          All Shoots ({shootPayoutItems.length})
        </button>
        <button
          onClick={() => setFilter('unsettled')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
            filter === 'unsettled'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white text-neutral-600 border-[#E8E3D9] hover:bg-[#FAF8F5]'
          }`}
        >
          Unsettled ({shootPayoutItems.filter(i => !i.isSettled).length})
        </button>
        <button
          onClick={() => setFilter('settled')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
            filter === 'settled'
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-neutral-600 border-[#E8E3D9] hover:bg-[#FAF8F5]'
          }`}
        >
          Settled ({shootPayoutItems.filter(i => i.isSettled).length})
        </button>
      </div>

      {/* Shoots Payout List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-[#E8E3D9] rounded-2xl p-8 text-center space-y-2">
            <Wallet className="w-8 h-8 text-neutral-300 mx-auto mb-1" />
            <h3 className="font-serif font-bold text-base text-neutral-800">
              No Shoot Payouts Found
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              {filter === 'all' 
                ? 'You have not been assigned to any shoots with recorded compensation yet.' 
                : `No ${filter} payouts at this moment.`}
            </p>
          </div>
        ) : (
          filteredItems.map(({ event, amount, isSettled, paidAt, role, date }) => (
            <div
              key={event.id}
              className="bg-white border border-[#E8E3D9] rounded-2xl p-4 shadow-xs space-y-3 hover:border-[#D5CEBF] transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-semibold border border-neutral-200">
                      {event.eventType || 'Shoot'}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      {date}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-neutral-900 mt-1 truncate">
                    {event.eventName}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>

                {/* Status Badge (Read Only) */}
                <div className="text-right shrink-0">
                  <div className="font-mono text-base font-bold text-neutral-900">
                    ₹{amount.toLocaleString('en-IN')}
                  </div>
                  
                  {isSettled ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Settled</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-2.5 h-2.5 text-amber-600" />
                      <span>Unsettled</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom details */}
              <div className="pt-2.5 border-t border-[#F0EBE1] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                <div>
                  Role: <strong className="text-neutral-800">{role}</strong>
                </div>
                {isSettled ? (
                  <div className="text-emerald-700">
                    Settled on {paidAt ? new Date(paidAt).toLocaleDateString('en-IN') : 'Completed'}
                  </div>
                ) : (
                  <div className="text-amber-700">
                    Pending Admin Settlement
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Information Note */}
      <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl text-[11px] text-neutral-600 space-y-1">
        <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C58B39]" />
          <span>Settlement Policy</span>
        </div>
        <p className="text-neutral-500 leading-relaxed">
          Shoot compensation is reviewed post-production and marked Settled upon bank or UPI transfer. For payment queries, reach out to production administration.
        </p>
      </div>

    </div>
  );
};
