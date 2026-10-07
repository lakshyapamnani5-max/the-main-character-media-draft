import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  FileText, 
  Calendar, 
  UserCheck, 
  Plus, 
  Download, 
  ChevronRight, 
  X,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Building2,
  ExternalLink,
  Smartphone,
  Bell
} from 'lucide-react';
import { NavModule } from './Header';
import { DashboardMetrics, Enquiry, EventShoot, Quotation, Client } from '../types';

interface SidebarProps {
  activeModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  metrics: DashboardMetrics;
  enquiries: Enquiry[];
  quotations: Quotation[];
  clients: Client[];
  events: EventShoot[];
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenNewEnquiry: () => void;
  onOpenNewEventCharge: () => void;
  onOpenNewQuote: () => void;
  onOpenNewEvent: () => void;
  onDownloadRateCard: () => void;
  onSwitchToCrewApp?: () => void;
  onOpenReminderSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  metrics,
  enquiries,
  quotations,
  clients,
  events,
  isOpenMobile,
  onCloseMobile,
  onOpenNewEnquiry,
  onOpenNewEventCharge,
  onOpenNewQuote,
  onOpenNewEvent,
  onDownloadRateCard,
  onSwitchToCrewApp,
  onOpenReminderSettings
}) => {
  const pendingEnquiriesCount = enquiries.filter(
    e => e.pipelineStage !== 'Confirmed' && e.pipelineStage !== 'Lost'
  ).length;
  
  const upcomingShootsCount = events.filter(
    e => e.status === 'Confirmed' || e.status === 'Scheduled' || e.status === 'In Progress'
  ).length;

  const activeQuotesCount = quotations.filter(
    q => q.status === 'Sent' || q.status === 'Draft' || q.status === 'Viewed'
  ).length;

  const navSections = [
    {
      group: 'Primary Operations',
      items: [
        {
          id: 'home' as NavModule,
          label: 'Home',
          subtext: 'Today shoots & ledger',
          icon: LayoutDashboard,
          badge: metrics.todayShootsCount > 0 ? `${metrics.todayShootsCount} today` : null,
          badgeColor: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/40',
        },
        {
          id: 'jobs' as NavModule,
          label: 'Weddings / Jobs',
          subtext: 'Shoot productions & command',
          icon: Calendar,
          badge: upcomingShootsCount > 0 ? `${upcomingShootsCount} upcoming` : null,
          badgeColor: 'bg-[#C58B39]/20 text-[#D89B48] border-[#C58B39]/30',
        },
        {
          id: 'calendar' as NavModule,
          label: 'Calendar',
          subtext: 'Weddings, functions & crew',
          icon: Calendar,
          badge: null,
        },
        {
          id: 'money' as NavModule,
          label: 'Money & Profit',
          subtext: 'Payments, payouts & expenses',
          icon: TrendingUp,
          badge: metrics.pendingBalanceTotal > 0 ? `₹${(metrics.pendingBalanceTotal / 1000).toFixed(0)}k due` : null,
          badgeColor: 'bg-amber-900/30 text-amber-300 border-amber-700/40',
        },
        {
          id: 'more' as NavModule,
          label: 'More Modules',
          subtext: 'Leads, crew, quotes & reports',
          icon: Layers,
          badge: pendingEnquiriesCount > 0 ? `${pendingEnquiriesCount} leads` : null,
          badgeColor: 'bg-blue-900/30 text-blue-300 border-blue-700/40',
        },
      ],
    },
    {
      group: 'Quick Jumps',
      items: [
        {
          id: 'enquiries' as NavModule,
          label: 'Leads / CRM',
          subtext: 'Enquiries pipeline',
          icon: Users,
          badge: null,
        },
        {
          id: 'crew' as NavModule,
          label: 'Crew Database',
          subtext: `${metrics.crewOnRosterCount} creators on roster`,
          icon: UserCheck,
          badge: null,
        },
        {
          id: 'quotations' as NavModule,
          label: 'Quotes & Rate Card',
          subtext: 'Master pricing catalogue',
          icon: FileText,
          badge: null,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#121212] text-neutral-200 border-r border-[#222222] flex flex-col transition-transform duration-200 ease-in-out select-none md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-[#222222] flex items-center justify-between">
          <button
            onClick={() => {
              onSelectModule('dashboard');
              if (isOpenMobile) onCloseMobile();
            }}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded border border-[#C58B39] bg-[#1C1A18] flex items-center justify-center font-serif text-[#C58B39] font-bold text-base tracking-wider group-hover:scale-105 transition-transform shadow-xs">
              M
            </div>
            <div>
              <div className="font-serif tracking-widest text-sm font-bold text-white uppercase group-hover:text-[#FAF8F5] transition-colors">
                The Main Character
              </div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-[#C58B39] flex items-center gap-1.5 mt-0.5">
                <span>Media ERP</span>
                <span className="text-neutral-600">·</span>
                <span className="text-neutral-400">v2.6</span>
              </div>
            </div>
          </button>

          <button
            onClick={onCloseMobile}
            className="p-1.5 text-neutral-400 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Create Action Panel */}
        <div className="px-4 pt-3.5 pb-2">
          <button
            onClick={() => {
              onOpenNewQuote();
              if (isOpenMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#C58B39] hover:bg-[#B37B2E] text-white text-xs font-semibold rounded tracking-wide transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            <span>Create Custom Quote</span>
          </button>
        </div>

        {/* Main Navigation Modules */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-thin">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold mb-1.5">
                {section.group}
              </div>

              {section.items.map((item) => {
                const isActive = 
                  activeModule === item.id || 
                  (item.id === 'home' && activeModule === 'dashboard') || 
                  (item.id === 'jobs' && activeModule === 'events');
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectModule(item.id);
                      if (isOpenMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left transition-all ${
                      isActive
                        ? 'bg-[#1F1E1C] text-white border-l-2 border-[#C58B39] shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181818]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#C58B39]' : 'text-neutral-500'
                        }`}
                      />
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-medium tracking-wide truncate ${
                            isActive ? 'text-white font-semibold' : 'text-neutral-300'
                          }`}
                        >
                          {item.label}
                        </div>
                        <div className="text-[10px] text-neutral-500 truncate font-light">
                          {item.subtext}
                        </div>
                      </div>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border text-right font-medium whitespace-nowrap ml-1.5 ${
                          item.badgeColor || 'bg-neutral-800 text-neutral-300 border-neutral-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Mobile Crew Experience Quick Trigger */}
          {onSwitchToCrewApp && (
            <div className="pt-2 px-1">
              <button
                onClick={() => {
                  onSwitchToCrewApp();
                  if (isOpenMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-between p-2.5 bg-[#C58B39]/15 hover:bg-[#C58B39]/25 border border-[#C58B39]/40 rounded text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-[#C58B39]" />
                  <div className="text-[11px] font-semibold text-[#FAF8F5]">Open Crew Mobile App</div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#C58B39] text-white font-bold">PWA</span>
              </button>
            </div>
          )}

          {/* Master Rate Card Quick Trigger */}
          <div className="pt-1 px-1 space-y-1">
            <button
              onClick={() => {
                onDownloadRateCard();
                if (isOpenMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between p-2.5 bg-[#181818] hover:bg-[#202020] border border-[#282828] hover:border-[#383838] rounded text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-[#C58B39]" />
                <div className="text-[11px] font-medium text-neutral-300">Rate Card Catalogue</div>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">PDF</span>
            </button>

            {onOpenReminderSettings && (
              <button
                onClick={() => {
                  onOpenReminderSettings();
                  if (isOpenMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-between p-2 bg-[#141414] hover:bg-[#1C1C1C] border border-[#222222] rounded text-left transition-colors text-neutral-400 hover:text-neutral-200 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-3 h-3 text-[#C58B39]" />
                  <span>WhatsApp Reminder Rules</span>
                </div>
                <span className="text-[9px] font-mono text-neutral-500">24h / 2h</span>
              </button>
            )}
          </div>
        </div>

        {/* User & System Footer */}
        <div className="p-3.5 border-t border-[#222222] bg-[#101010]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#242220] border border-[#C58B39]/40 flex items-center justify-center font-serif text-xs font-bold text-[#C58B39] shrink-0">
                DS
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-neutral-200 truncate">
                  Devansh Saxena
                </div>
                <div className="text-[10px] text-neutral-500 truncate">
                  Creative Director · Admin
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5" title="System Operational & Synced">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
