import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  ChevronDown, 
  UserPlus, 
  Layers, 
  FileText, 
  Calendar, 
  Clock,
  ArrowRight,
  UserCheck,
  Smartphone,
  Bell,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { NavModule } from './Header';
import { Enquiry, Quotation, Client, EventShoot, DashboardMetrics, CrewNotification } from '../types';
import { PWAInstallButton } from './Common/PWAInstallButton';

interface TopBarProps {
  activeModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  onOpenMobileSidebar: () => void;
  onOpenNewEnquiry: () => void;
  onOpenNewEventCharge: () => void;
  onOpenNewQuote: () => void;
  onOpenNewEvent: () => void;
  metrics: DashboardMetrics;
  enquiries: Enquiry[];
  quotations: Quotation[];
  clients: Client[];
  events: EventShoot[];
  notifications?: CrewNotification[];
  onOpenNotifications?: () => void;
  onSelectQuoteForPreview: (quote: Quotation) => void;
  onSwitchToCrewApp?: () => void;
  appViewMode?: 'admin' | 'crew';
  onToggleAppViewMode?: (mode: 'admin' | 'crew') => void;
  isAdmin?: boolean;
  onSignOut?: () => void;
  userSession?: any;
}

interface SearchResultItem {
  type: string;
  id: string;
  title: string;
  sub: string;
  target: NavModule;
  quoteObj?: Quotation;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeModule,
  onSelectModule,
  onOpenMobileSidebar,
  onOpenNewEnquiry,
  onOpenNewEventCharge,
  onOpenNewQuote,
  onOpenNewEvent,
  metrics,
  enquiries,
  quotations,
  clients,
  events,
  notifications = [],
  onOpenNotifications = () => {},
  onSelectQuoteForPreview,
  onSwitchToCrewApp,
  appViewMode = 'admin',
  onToggleAppViewMode,
  isAdmin = true,
  onSignOut,
  userSession
}) => {
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumb = () => {
    switch (activeModule) {
      case 'home':
      case 'dashboard':
        return { section: 'Production ERP', page: 'Home Control Center' };
      case 'jobs':
      case 'events':
        return { section: 'Operations & Production', page: 'Weddings & Production Jobs' };
      case 'partners':
        return { section: 'B2B & Agencies', page: 'Partners & Event Planners' };
      case 'calendar':
        return { section: 'Operations & Scheduling', page: 'Production Calendar' };
      case 'money':
        return { section: 'Commercial & Financial Ledger', page: 'Money, Payouts & Expenses' };
      case 'more':
        return { section: 'System Administration', page: 'Modules, CRM & Settings' };
      case 'enquiries':
        return { section: 'Commercial & Sales', page: 'Enquiries & CRM Pipeline' };
      case 'event-charges':
        return { section: 'Commercial & Sales', page: 'Master Event Charges & Rates' };
      case 'quotations':
        return { section: 'Commercial & Sales', page: 'Client Quotations & Estimates' };
      case 'clients':
        return { section: 'Operations & Production', page: 'Client Directory & Ledger' };
      case 'crew':
        return { section: 'Operations & Production', page: 'Crew Management & Roster' };
      case 'locations':
        return { section: 'Operations & Production', page: 'Venues & Locations Directory' };
      case 'settings':
        return { section: 'System Administration', page: 'Company Profile & Settings' };
      default:
        return { section: 'System', page: 'Overview' };
    }
  };

  const breadcrumb = getBreadcrumb();

  // Global search filtering
  const queryClean = (searchQuery || '').trim().toLowerCase();
  const searchResults: SearchResultItem[] = queryClean === '' ? [] : [
    ...(enquiries || [])
      .filter(e => e && ((e.clientName || '').toLowerCase().includes(queryClean) || (e.eventName || '').toLowerCase().includes(queryClean)))
      .slice(0, 3)
      .map(e => ({ type: 'Enquiry', id: e.id, title: e.clientName || 'Enquiry', sub: `${e.eventName || ''} · Stage: ${e.pipelineStage || 'New'}`, target: 'enquiries' as NavModule })),
    ...(quotations || [])
      .filter(q => q && ((q.quoteNumber || '').toLowerCase().includes(queryClean) || (q.clientName || '').toLowerCase().includes(queryClean)))
      .slice(0, 3)
      .map(q => ({ type: 'Quote', id: q.id, title: q.quoteNumber || 'Quote', sub: `${q.clientName || ''} · ₹${(q.grandTotal || 0).toLocaleString('en-IN')}`, target: 'quotations' as NavModule, quoteObj: q })),
    ...(clients || [])
      .filter(c => c && ((c.name || '').toLowerCase().includes(queryClean) || ((c.phone || '').includes(queryClean))))
      .slice(0, 3)
      .map(c => ({ type: 'Client', id: c.id, title: c.name || 'Client', sub: c.phone || c.email || 'Client Profile', target: 'clients' as NavModule })),
    ...(events || [])
      .filter(ev => ev && ((ev.eventName || '').toLowerCase().includes(queryClean) || (ev.clientName || '').toLowerCase().includes(queryClean) || (ev.venue || '').toLowerCase().includes(queryClean)))
      .slice(0, 3)
      .map(ev => ({ type: 'Shoot', id: ev.id, title: ev.eventName || 'Shoot', sub: `${ev.venue || ''} · ${ev.startDate || ev.shootDate || 'Scheduled'}`, target: 'events' as NavModule }))
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#E8E3D9] text-[#1E1E1E] shadow-2xs select-none no-print">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onOpenMobileSidebar}
              className="md:hidden p-1.5 text-neutral-600 hover:text-neutral-900 rounded focus:outline-none"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* ERP Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
              <span className="text-neutral-400 font-normal">TMC ERP</span>
              <span className="text-neutral-300">/</span>
              <span className="text-neutral-500 font-medium">{breadcrumb.section}</span>
              <span className="text-neutral-300">/</span>
              <span className="text-[#181818] font-bold font-sans text-xs">{breadcrumb.page}</span>
            </div>

            <div className="sm:hidden font-serif font-bold text-sm text-[#181818] truncate">
              {breadcrumb.page}
            </div>
          </div>

          {/* Center: Global ERP Search Finder */}
          <div ref={searchContainerRef} className="relative hidden md:block w-72 lg:w-96">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Global finder (clients, quotes, shoots, leads)..."
                className="w-full pl-8 pr-12 py-1.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-[#C58B39] transition-all"
              />
              <span className="absolute right-2.5 top-2 text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1 py-0.5 rounded border border-neutral-200">
                ERP
              </span>
            </div>

            {/* Global Search Results Dropdown */}
            {isSearchFocused && searchQuery.trim() !== '' && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E8E3D9] rounded-lg shadow-xl py-2 z-50 text-xs max-h-80 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-mono uppercase text-neutral-400 font-semibold border-b border-[#F0ECE1] mb-1">
                  Matching Records ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div className="px-3 py-4 text-center text-neutral-400 italic text-[11px]">
                    No matches found across ERP database.
                  </div>
                ) : (
                  searchResults.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onSelectModule(res.target);
                        if (res.quoteObj) {
                          onSelectQuoteForPreview(res.quoteObj);
                        }
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#FAF8F5] flex items-center justify-between gap-2 border-b border-[#F5F2EA] last:border-b-0"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 font-bold border border-neutral-200">
                            {res.type}
                          </span>
                          <span className="font-semibold text-neutral-900">{res.title}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">{res.sub}</div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-neutral-400 shrink-0" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right: Quick Action & Season Badge */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* PWA In-App Install Button */}
            <PWAInstallButton variant="compact" />



            {/* Season pill */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF8F5] border border-[#E8E3D9] rounded text-[11px] text-neutral-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span className="font-mono font-medium">Wedding Season '26</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700" />
              {notifications && notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C58B39] text-white text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-white">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* Top Sign Out Button */}
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                title="Sign Out to Login Page"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px]">Sign Out</span>
              </button>
            )}

            {/* Quick Action Dropdown */}
            <div className="relative">
              <button
                onClick={() => setQuickActionOpen(!quickActionOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#181818] hover:bg-[#282828] rounded transition-colors whitespace-nowrap shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                <span className="hidden sm:inline">+ Quick Action</span>
                <span className="sm:hidden">+ Action</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {quickActionOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setQuickActionOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E8E3D9] rounded-lg shadow-xl py-1 z-50 text-xs">
                    <button
                      onClick={() => {
                        setQuickActionOpen(false);
                        onOpenNewEnquiry();
                      }}
                      className="w-full text-left px-3.5 py-2 text-neutral-800 hover:bg-[#FAF8F5] flex items-center gap-2.5"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#C58B39]" />
                      + New Enquiry
                    </button>
                    <button
                      onClick={() => {
                        setQuickActionOpen(false);
                        onOpenNewEventCharge();
                      }}
                      className="w-full text-left px-3.5 py-2 text-neutral-800 hover:bg-[#FAF8F5] flex items-center gap-2.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#C58B39]" />
                      + Add Event Charge
                    </button>
                    <button
                      onClick={() => {
                        setQuickActionOpen(false);
                        onOpenNewQuote();
                      }}
                      className="w-full text-left px-3.5 py-2 text-neutral-800 hover:bg-[#FAF8F5] flex items-center gap-2.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#C58B39]" />
                      + Create Custom Quote
                    </button>
                    <button
                      onClick={() => {
                        setQuickActionOpen(false);
                        onOpenNewEvent();
                      }}
                      className="w-full text-left px-3.5 py-2 text-neutral-800 hover:bg-[#FAF8F5] flex items-center gap-2.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#C58B39]" />
                      + New Event Shoot
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
