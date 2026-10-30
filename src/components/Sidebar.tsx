import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  UserCheck, 
  Plus, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  X,
  TrendingUp,
  Building2,
  Bell,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
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
  onSignOut?: () => void;
  userSession?: any;
  currentUser?: any;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  onOpenNewQuote,
  onDownloadRateCard,
  onOpenReminderSettings,
  onOpenAuthModal,
  onSignOut,
  userSession,
  currentUser,
  isCollapsed = false,
  onToggleCollapse
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
    e => !e.archived && e.pipelineStage !== 'Confirmed' && e.pipelineStage !== 'Lost'
  ).length;
  
  const upcomingShootsCount = events.filter(
    e => e.status === 'Confirmed' || e.status === 'Scheduled' || e.status === 'In Progress'
  ).length;

  const partnerShootsCount = events.filter(e => e.partnerId).length;

  const activeQuotesCount = quotations.filter(
    q => q.status === 'Sent' || q.status === 'Draft' || q.status === 'Viewed'
  ).length;

  // Streamlined, Production-Focused Tabs (All duplicates and unwanted items removed)
  const navItems = [
    {
      id: 'home' as NavModule,
      label: 'Home Dashboard',
      shortLabel: 'Home',
      subtext: 'Overview & today ledger',
      icon: LayoutDashboard,
      badge: metrics.todayShootsCount > 0 ? `${metrics.todayShootsCount} today` : null,
      badgeColor: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/40',
    },
    {
      id: 'jobs' as NavModule,
      label: 'Weddings & Shoots',
      shortLabel: 'Shoots',
      subtext: 'Production jobs & timeline',
      icon: Calendar,
      badge: upcomingShootsCount > 0 ? `${upcomingShootsCount}` : null,
      badgeColor: 'bg-[#C58B39]/20 text-[#D89B48] border-[#C58B39]/30',
    },
    {
      id: 'calendar' as NavModule,
      label: 'Production Calendar',
      shortLabel: 'Calendar',
      subtext: 'Interactive dates & assignments',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'quotations' as NavModule,
      label: 'Quotes & Rate Card',
      shortLabel: 'Quotes',
      subtext: 'Proposals, ratecard & pricing',
      icon: FileText,
      badge: activeQuotesCount > 0 ? `${activeQuotesCount}` : null,
      badgeColor: 'bg-[#C58B39]/20 text-[#D89B48] border-[#C58B39]/30',
    },
    {
      id: 'money' as NavModule,
      label: 'Money & Profit',
      shortLabel: 'Finances',
      subtext: 'Payments, payouts & expenses',
      icon: TrendingUp,
      badge: metrics.pendingBalanceTotal > 0 ? `₹${(metrics.pendingBalanceTotal / 1000).toFixed(0)}k due` : null,
      badgeColor: 'bg-amber-900/30 text-amber-300 border-amber-700/40',
    },
    {
      id: 'enquiries' as NavModule,
      label: 'Leads & Enquiries',
      shortLabel: 'Leads',
      subtext: 'CRM sales pipeline',
      icon: Users,
      badge: pendingEnquiriesCount > 0 ? `${pendingEnquiriesCount}` : null,
      badgeColor: 'bg-blue-900/30 text-blue-300 border-blue-700/40',
    },
    {
      id: 'crew' as NavModule,
      label: 'Crew Roster',
      shortLabel: 'Crew',
      subtext: 'Creators, gear & rates',
      icon: UserCheck,
      badge: metrics.crewOnRosterCount > 0 ? `${metrics.crewOnRosterCount}` : null,
      badgeColor: 'bg-[#C58B39]/25 text-[#D89B48] border-[#C58B39]/40',
    },
    {
      id: 'partners' as NavModule,
      label: 'Event Partners',
      shortLabel: 'Partners',
      subtext: 'Outsourced event planners',
      icon: Building2,
      badge: partnerShootsCount > 0 ? `${partnerShootsCount}` : null,
      badgeColor: 'bg-[#C58B39]/20 text-[#D89B48] border-[#C58B39]/30',
    },
    {
      id: 'settings' as NavModule,
      label: 'Company Settings',
      shortLabel: 'Settings',
      subtext: 'Bank, UPI, invoice styling',
      icon: Settings,
      badge: null,
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

      {/* Sidebar Container with Collapsible Width Transition */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#121212] text-neutral-200 border-r border-[#222222] flex flex-col transition-all duration-300 ease-in-out select-none md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-72'} no-print`}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b border-[#222222] flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <button
            onClick={() => {
              onSelectModule('dashboard');
              if (isOpenMobile) onCloseMobile();
            }}
            className="flex items-center gap-3 text-left group focus:outline-none min-w-0"
            title="The Main Character Media"
          >
            {companySettings.logoUrl ? (
              <img 
                src={companySettings.logoUrl} 
                alt="Logo" 
                className="w-8 h-8 rounded border border-[#C58B39]/50 bg-white p-0.5 object-contain group-hover:scale-105 transition-transform shadow-xs shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded border border-[#C58B39] bg-[#1C1A18] flex items-center justify-center font-serif text-[#C58B39] font-bold text-base tracking-wider group-hover:scale-105 transition-transform shadow-xs shrink-0">
                {companySettings.companyName.charAt(0) || 'M'}
              </div>
            )}
            
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="font-serif tracking-widest text-xs font-bold text-white uppercase group-hover:text-[#FAF8F5] transition-colors truncate max-w-[150px]">
                  {companySettings.companyName}
                </div>
                <div className="text-[9px] uppercase font-mono tracking-widest text-[#C58B39] flex items-center gap-1.5 mt-0.5">
                  <span>Media ERP</span>
                  <span className="text-neutral-600">·</span>
                  <span className="text-emerald-400">Live</span>
                </div>
              </div>
            )}
          </button>

          {/* Desktop Collapse / Expand Toggle Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`hidden md:flex p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors ${
                isCollapsed ? 'mt-2' : ''
              }`}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-[#C58B39]" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-neutral-400" />
              )}
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-neutral-400 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Create Action */}
        <div className={`pt-3.5 pb-2 ${isCollapsed ? 'px-2 flex justify-center' : 'px-4'}`}>
          <button
            onClick={() => {
              onOpenNewQuote();
              if (isOpenMobile) onCloseMobile();
            }}
            className={`flex items-center justify-center gap-2 bg-[#C58B39] hover:bg-[#B37B2E] text-white font-semibold rounded tracking-wide transition-colors shadow-xs ${
              isCollapsed ? 'w-10 h-10 p-0 rounded-lg' : 'w-full py-2 px-3 text-xs'
            }`}
            title="Create Custom Quote"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5] shrink-0" />
            {!isCollapsed && <span>Create Custom Quote</span>}
          </button>
        </div>

        {/* Clean, Streamlined Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-2 space-y-1 scrollbar-thin">
          {!isCollapsed && (
            <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold mb-1.5">
              Production Workspace
            </div>
          )}

          {navItems.map((item) => {
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
                className={`w-full flex items-center rounded-lg text-left transition-all ${
                  isCollapsed ? 'justify-center p-2.5 relative' : 'justify-between px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-[#1F1E1C] text-white border-l-2 border-[#C58B39] shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181818]'
                }`}
                title={isCollapsed ? `${item.label}${item.badge ? ` (${item.badge})` : ''}` : undefined}
              >
                <div className={`flex items-center min-w-0 ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#C58B39]' : 'text-neutral-500'
                    }`}
                  />
                  {!isCollapsed && (
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
                  )}
                </div>

                {/* Badge rendering */}
                {item.badge && (
                  isCollapsed ? (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C58B39]" />
                  ) : (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border text-right font-medium whitespace-nowrap ml-1.5 ${
                        item.badgeColor || 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )
                )}
              </button>
            );
          })}

          {/* Quick Rate Card Catalogue Link */}
          <div className={`pt-3 border-t border-[#202020] mt-3 ${isCollapsed ? 'px-1 space-y-2 flex flex-col items-center' : 'px-1 space-y-1'}`}>
            <button
              onClick={() => {
                onDownloadRateCard();
                if (isOpenMobile) onCloseMobile();
              }}
              className={`flex items-center bg-[#181818] hover:bg-[#202020] border border-[#282828] hover:border-[#383838] rounded-lg transition-colors ${
                isCollapsed ? 'w-10 h-10 justify-center p-0' : 'w-full justify-between p-2.5'
              }`}
              title="Download Master Rate Card PDF"
            >
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-[#C58B39] shrink-0" />
                {!isCollapsed && <div className="text-[11px] font-medium text-neutral-300">Rate Card Catalogue</div>}
              </div>
              {!isCollapsed && <span className="text-[10px] font-mono text-neutral-500">PDF</span>}
            </button>

            {onOpenReminderSettings && (
              <button
                onClick={() => {
                  onOpenReminderSettings();
                  if (isOpenMobile) onCloseMobile();
                }}
                className={`flex items-center bg-[#141414] hover:bg-[#1C1C1C] border border-[#222222] rounded-lg transition-colors text-neutral-400 hover:text-neutral-200 ${
                  isCollapsed ? 'w-10 h-10 justify-center p-0' : 'w-full justify-between p-2 text-[11px]'
                }`}
                title="WhatsApp Shoot Reminders"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-3 h-3 text-[#C58B39] shrink-0" />
                  {!isCollapsed && <span>WhatsApp Reminders</span>}
                </div>
                {!isCollapsed && <span className="text-[9px] font-mono text-neutral-500">24h / 2h</span>}
              </button>
            )}
          </div>
        </div>

        {/* User & System Footer */}
        <div className={`border-t border-[#222222] bg-[#101010] ${isCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-3.5 space-y-2'}`}>
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'justify-between'}`}>
            <div 
              onClick={() => {
                if (onOpenAuthModal) onOpenAuthModal();
                if (isOpenMobile) onCloseMobile();
              }}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
              title="Admin Credentials & Session"
            >
              <div className="w-8 h-8 rounded-full bg-[#242220] border border-[#C58B39]/50 flex items-center justify-center font-serif text-xs font-bold text-[#C58B39] shrink-0 shadow-xs">
                {userSession?.name ? userSession.name.charAt(0).toUpperCase() : 'A'}
              </div>
              
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-neutral-200 truncate">
                    {userSession?.name || 'Executive Producer'}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span>Realtime Connected</span>
                  </div>
                </div>
              )}
            </div>

            <div className={`flex items-center ${isCollapsed ? 'flex-col gap-1' : 'gap-1'}`}>
              <button
                onClick={() => {
                  if (onOpenAuthModal) onOpenAuthModal();
                  if (isOpenMobile) onCloseMobile();
                }}
                className="p-1.5 text-neutral-400 hover:text-[#C58B39] hover:bg-[#1A1A1A] rounded transition-colors text-xs"
                title="Firebase Settings"
              >
                ⚙️
              </button>

              {onSignOut && (
                <button
                  onClick={() => {
                    if (onSignOut) onSignOut();
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                  title="Sign Out to Login Page"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
