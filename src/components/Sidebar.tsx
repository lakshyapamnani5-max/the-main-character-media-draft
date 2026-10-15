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
  Bell,
  Settings
} from 'lucide-react';
import { NavModule } from './Header';
import { DashboardMetrics, Enquiry, EventShoot, Quotation, Client, CompanySettings } from '../types';
import { StorageService } from '../services/storage';

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
  onOpenAuthModal?: () => void;
  onClearDummyData?: () => void;
  currentUser?: any;
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
  onOpenReminderSettings,
  onOpenAuthModal,
  onClearDummyData,
  currentUser
}) => {
  const [companySettings, setCompanySettings] = React.useState<CompanySettings>(() => 
    StorageService.getCompanySettings()
  );

  React.useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) setCompanySettings(e.detail);
    };
    window.addEventListener('tmc_company_settings_updated', handleUpdate);
    return () => window.removeEventListener('tmc_company_settings_updated', handleUpdate);
  }, []);

  const pendingEnquiriesCount = enquiries.filter(
    e => e.pipelineStage !== 'Confirmed' && e.pipelineStage !== 'Lost'
  ).length;
  
  const upcomingShootsCount = events.filter(
    e => e.status === 'Confirmed' || e.status === 'Scheduled' || e.status === 'In Progress'
  ).length;

  const partnerShootsCount = events.filter(e => e.partnerId).length;

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
          id: 'partners' as NavModule,
          label: 'Partners',
          subtext: 'Outsourced event companies',
          icon: Building2,
          badge: partnerShootsCount > 0 ? `${partnerShootsCount} shoots` : null,
          badgeColor: 'bg-[#C58B39]/20 text-[#D89B48] border-[#C58B39]/30',
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
          id: 'crew' as NavModule,
          label: 'Crew Roster',
          subtext: 'Credentials & Firebase Auth',
          icon: UserCheck,
          badge: `${metrics.crewOnRosterCount} crew`,
          badgeColor: 'bg-[#C58B39]/25 text-[#D89B48] border-[#C58B39]/40',
        },
        {
          id: 'event-charges' as NavModule,
          label: 'Event Rates',
          subtext: 'Master ratecard & packages',
          icon: FileText,
          badge: 'Rate Card',
          badgeColor: 'bg-[#C58B39]/20 text-[#D89B48] border-[#C58B39]/30',
        },
        {
          id: 'settings' as NavModule,
          label: 'Company Settings',
          subtext: 'Logo, bank, UPI & signature',
          icon: Settings,
          badge: 'Profile',
          badgeColor: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
        },
        {
          id: 'more' as NavModule,
          label: 'More Modules',
          subtext: 'Leads, CRM, quotes & settings',
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
            {companySettings.logoUrl ? (
              <img 
                src={companySettings.logoUrl} 
                alt="Logo" 
                className="w-8 h-8 rounded border border-[#C58B39]/50 bg-white p-0.5 object-contain group-hover:scale-105 transition-transform shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded border border-[#C58B39] bg-[#1C1A18] flex items-center justify-center font-serif text-[#C58B39] font-bold text-base tracking-wider group-hover:scale-105 transition-transform shadow-xs">
                {companySettings.companyName.charAt(0) || 'M'}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-serif tracking-widest text-sm font-bold text-white uppercase group-hover:text-[#FAF8F5] transition-colors truncate max-w-[170px]" title={companySettings.companyName}>
                {companySettings.companyName}
              </div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-[#C58B39] flex items-center gap-1.5 mt-0.5">
                <span>Media ERP</span>
                <span className="text-neutral-600">·</span>
                <span className="text-neutral-400">Live</span>
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

            {onClearDummyData && (
              <button
                onClick={() => {
                  if (window.confirm('Wipe all mock/dummy records to start completely clean? Real data you add will be saved.')) {
                    onClearDummyData();
                    if (isOpenMobile) onCloseMobile();
                  }
                }}
                className="w-full flex items-center justify-between p-2 bg-[#141414] hover:bg-rose-950/30 border border-[#222222] hover:border-rose-800/40 rounded text-left transition-colors text-neutral-400 hover:text-rose-300 text-[11px]"
                title="Wipe demo dummy data"
              >
                <div className="flex items-center gap-2">
                  <span className="text-rose-400">🗑️</span>
                  <span>Clear All Dummy Data</span>
                </div>
                <span className="text-[9px] font-mono text-neutral-500">Clean DB</span>
              </button>
            )}
          </div>
        </div>

        {/* User & System Footer */}
        <div className="p-3.5 border-t border-[#222222] bg-[#101010] space-y-2">
          <div className="flex items-center justify-between">
            <div 
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal();
                if (isOpenMobile) onCloseMobile();
              }}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
              title="Click to manage Firebase Email Authentication and credentials"
            >
              <div className="w-7 h-7 rounded-full bg-[#242220] border border-[#C58B39]/40 flex items-center justify-center font-serif text-xs font-bold text-[#C58B39] shrink-0">
                {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-neutral-200 truncate">
                  {currentUser?.displayName || currentUser?.email || 'Admin Workspace'}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span>Realtime DB Connected</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal();
                if (isOpenMobile) onCloseMobile();
              }}
              className="p-1.5 text-neutral-400 hover:text-[#C58B39] hover:bg-[#1A1A1A] rounded transition-colors text-xs font-mono"
              title="Firebase Settings & Email Auth"
            >
              🔑
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
