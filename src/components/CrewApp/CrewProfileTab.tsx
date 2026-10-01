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
  Lock
} from 'lucide-react';
import { CrewMember, EventShoot } from '../../types';
import { StorageService } from '../../services/storage';
import { PWAInstallButton } from '../Common/PWAInstallButton';

interface CrewProfileTabProps {
  activeCrew: CrewMember;
  allCrew: CrewMember[];
  allShoots: EventShoot[];
  onSelectCrewPersona: (crewId: string) => void;
  onSwitchToAdmin: () => void;
}

export const CrewProfileTab: React.FC<CrewProfileTabProps> = ({
  activeCrew,
  allCrew,
  allShoots,
  onSelectCrewPersona,
  onSwitchToAdmin
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

      {/* Persona Switcher (For Demo & Testing) */}
      <div className="bg-white border border-[#E8E3D9] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-serif font-bold text-sm text-neutral-900 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-[#C58B39]" />
            <span>Switch Crew Member Persona</span>
          </div>
          <span className="text-[11px] text-neutral-500">Live test</span>
        </div>

        <p className="text-xs text-neutral-600">
          Viewing mobile app as <strong>{activeCrew.name}</strong>. Switch to another creator or cinematographer to test their unique call sheets and POV queues:
        </p>

        <div className="grid grid-cols-2 gap-2">
          {allCrew.map((c) => {
            const isCurrent = c.id === activeCrew.id;

            return (
              <button
                key={c.id}
                onClick={() => onSelectCrewPersona(c.id)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                  isCurrent 
                    ? 'border-[#C58B39] bg-[#FAF8F5] font-bold text-neutral-900 ring-2 ring-[#C58B39]/20' 
                    : 'border-[#E8E3D9] bg-white hover:border-neutral-400 text-neutral-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate">{c.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-neutral-400 truncate font-light">{c.role}</div>
                </div>

                {isCurrent && (
                  <Check className="w-3.5 h-3.5 text-[#C58B39] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* PWA Install Promotion Box */}
      <PWAInstallButton variant="crew-card" />

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
            <strong>WhatsApp Contact:</strong> <span className="font-mono text-neutral-900">{activeCrew.phone}</span>
          </div>
        </div>
      </div>

      {/* Switch to Admin ERP Button */}
      <div className="pt-2">
        <button
          onClick={onSwitchToAdmin}
          className="w-full py-3 px-4 bg-[#121212] hover:bg-[#252525] active:scale-[0.98] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-transform shadow-md"
        >
          <Building2 className="w-4 h-4 text-[#C58B39]" />
          <span>Exit to Admin ERP System</span>
        </button>
      </div>
    </div>
  );
};
