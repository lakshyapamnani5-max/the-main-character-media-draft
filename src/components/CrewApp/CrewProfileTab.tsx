import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Camera, 
  Award, 
  Smartphone, 
  ArrowRightLeft, 
  ChevronRight, 
  Check, 
  SlidersHorizontal,
  LogOut,
  Building2,
  Lock,
  Instagram
} from 'lucide-react';
import { CrewMember, EventShoot } from '../../types';
import { StorageService } from '../../services/storage';
import { PWAInstallButton } from '../Common/PWAInstallButton';

interface CrewProfileTabProps {
  activeCrew: CrewMember;
  allCrew: CrewMember[];
  allShoots: EventShoot[];
  onSelectCrewPersona: (crewId: string) => void;
  onSignOut?: () => void;
}

export const CrewProfileTab: React.FC<CrewProfileTabProps> = ({
  activeCrew,
  allCrew,
  allShoots,
  onSelectCrewPersona,
  onSignOut
}) => {
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);

  const myShoots = allShoots.filter(event => {
    return (event.crewAssignments && event.crewAssignments.some(a => a.crewId === activeCrew.id)) ||
      (event.crewMembers && event.crewMembers.some(name => name.toLowerCase() === activeCrew.name.toLowerCase()));
  });

  const completedCount = myShoots.filter(e => e.status === 'Completed').length;
  const upcomingCount = myShoots.filter(e => e.status !== 'Completed' && e.status !== 'Cancelled').length;

  return (
    <div className="space-y-4 pb-6">
      
      {/* Profile Header Card */}
      <div className="bg-white border border-[#E8E3D9] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1C1A18] to-[#121212] border-2 border-[#C58B39] flex items-center justify-center font-serif text-xl font-bold text-[#C58B39] shadow-md">
            {activeCrew.name.split(' ').map(n => n[0]).join('')}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-bold text-neutral-900 truncate">
                {activeCrew.name}
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Active
              </span>
            </div>
            <div className="text-xs text-[#C58B39] font-medium font-mono">
              {activeCrew.role}
            </div>
            <div className="text-[11px] text-neutral-500 truncate">
              {activeCrew.email || `${activeCrew.username || 'crew'}@themaincharactermedia.com`}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-[#F0EBE1]">
          <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E3D9]">
            <div className="text-[10px] uppercase font-mono text-neutral-400 font-semibold">Assigned</div>
            <div className="font-mono text-base font-bold text-neutral-900 mt-0.5">{myShoots.length}</div>
          </div>
          <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E3D9]">
            <div className="text-[10px] uppercase font-mono text-neutral-400 font-semibold">Upcoming</div>
            <div className="font-mono text-base font-bold text-[#C58B39] mt-0.5">{upcomingCount}</div>
          </div>
          <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E3D9]">
            <div className="text-[10px] uppercase font-mono text-neutral-400 font-semibold">Completed</div>
            <div className="font-mono text-base font-bold text-emerald-700 mt-0.5">{completedCount}</div>
          </div>
        </div>
      </div>

      {/* Earnings & Settlement Status */}
      <div className="bg-white border border-[#E8E3D9] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-serif font-bold text-sm text-neutral-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C58B39]" />
            <span>Earnings & Settlement Status</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Live Account</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-800 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Settled</span>
            </span>
            <div className="font-mono text-base font-bold text-emerald-900">
              ₹{myShoots.reduce((sum, ev) => {
                const asg = ev.crewAssignments?.find(a => a.crewId === activeCrew.id);
                const isPaid = asg?.paymentStatus === 'Paid';
                const amt = asg?.payout || activeCrew.defaultPayout || 0;
                return isPaid ? sum + amt : sum;
              }, 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-700">Paid to your account</div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-amber-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Unsettled</span>
            </span>
            <div className="font-mono text-base font-bold text-amber-900">
              ₹{myShoots.reduce((sum, ev) => {
                const asg = ev.crewAssignments?.find(a => a.crewId === activeCrew.id);
                const isPaid = asg?.paymentStatus === 'Paid';
                const amt = asg?.payout || activeCrew.defaultPayout || 0;
                return !isPaid ? sum + amt : sum;
              }, 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-amber-700">Payment pending</div>
          </div>
        </div>
      </div>

      {/* Production Skills & Payout info */}
      <div className="bg-white border border-[#E8E3D9] rounded-2xl p-4 shadow-xs space-y-2.5 text-xs">
        <div className="font-serif font-bold text-sm text-neutral-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#C58B39]" />
          <span>Specialization & Standard Payout</span>
        </div>

        <div className="space-y-1.5 pt-1 text-neutral-600">
          <div>
            <strong>Specialization:</strong> {activeCrew.specialization}
          </div>
          <div>
            <strong>Experience:</strong> {activeCrew.experience}
          </div>
          <div>
            <strong>Standard Day Rate:</strong> <span className="font-mono text-neutral-900 font-bold">₹{activeCrew.defaultPayout.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <strong>WhatsApp Contact:</strong> <span className="font-mono text-neutral-900">{activeCrew.phone || 'Not configured'}</span>
          </div>
        </div>
      </div>

      {/* Crew Portal Sign Out */}
      {onSignOut && (
        <button
          type="button"
          onClick={onSignOut}
          className="w-full py-3 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>Sign Out of Crew Terminal</span>
        </button>
      )}

      {/* Developer Attribution */}
      <div className="pt-3 pb-2 text-center text-[10px] text-neutral-400 font-mono space-y-1 border-t border-[#E8E3D9]/60">
        <div>Made by <strong className="text-neutral-700 font-semibold">DRONA Tech Solutions</strong></div>
        <div className="flex items-center justify-center gap-3 text-[10px]">
          <a
            href="https://instagram.com/_.drona._"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#C58B39] hover:underline"
            title="Instagram: _.drona._"
          >
            <Instagram className="w-3 h-3" />
            <span>_.drona._</span>
          </a>
          <span>·</span>
          <a
            href="tel:7620366390"
            className="inline-flex items-center gap-1 text-neutral-600 hover:underline"
            title="Call DRONA Tech Solutions"
          >
            <Phone className="w-3 h-3 text-[#C58B39]" />
            <span>7620366390</span>
          </a>
        </div>
      </div>
    </div>
  );
};
