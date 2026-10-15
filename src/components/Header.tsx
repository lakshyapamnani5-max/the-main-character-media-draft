import React, { useState } from 'react';
import { 
  Plus, 
  Menu, 
  X,
  FileText,
  UserPlus,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';

export type NavModule = 
  | 'home'
  | 'partners'
  | 'calendar'
  | 'jobs'
  | 'money'
  | 'more'
  | 'dashboard' 
  | 'enquiries' 
  | 'event-charges' 
  | 'quotations' 
  | 'clients' 
  | 'events'
  | 'crew'
  | 'locations'
  | 'settings';

interface HeaderProps {
  activeModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  onOpenNewEnquiry: () => void;
  onOpenNewEventCharge: () => void;
  onOpenNewQuote: () => void;
  onOpenNewEvent: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onSelectModule,
  onOpenNewEnquiry,
  onOpenNewEventCharge,
  onOpenNewQuote,
  onOpenNewEvent,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const navItems: { id: NavModule; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'enquiries', label: 'Enquiries' },
    { id: 'event-charges', label: 'Event Charges' },
    { id: 'quotations', label: 'Quotations' },
    { id: 'clients', label: 'Clients' },
    { id: 'events', label: 'Events' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#121212] text-white border-b border-[#2A2A2A] shadow-sm select-none no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectModule('dashboard')}
              className="group flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-7 h-7 rounded border border-[#C58B39]/50 bg-[#1C1A18] flex items-center justify-center font-serif text-[#C58B39] font-bold text-sm tracking-wider group-hover:border-[#C58B39] transition-colors">
                M
              </div>
              <span className="font-serif tracking-widest text-sm sm:text-base font-semibold text-white/95 uppercase group-hover:text-white transition-colors">
                The Main Character
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links (single line, subtle hover underline) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navItems.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  className={`px-3 py-1.5 text-xs lg:text-sm font-medium tracking-wide transition-all relative ${
                    isActive 
                      ? 'text-[#E5DFD3] font-semibold' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#C58B39]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Action & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                onClick={() => setQuickActionOpen(!quickActionOpen)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#121212] bg-[#FAF8F5] hover:bg-white rounded transition-colors whitespace-nowrap shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                <span className="hidden sm:inline">Quick Action</span>
                <span className="sm:hidden">Action</span>
                <ChevronDown className="w-3 h-3 text-neutral-600" />
              </button>

              {quickActionOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setQuickActionOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-[#1A1A1A] border border-[#2E2E2E] rounded shadow-xl py-1 z-20 text-xs">
                    <button
                      onClick={() => {
                        setQuickActionOpen(false);
                        onOpenNewEnquiry();
                      }}
                      className="w-full text-left px-3.5 py-2 text-neutral-200 hover:text-white hover:bg-[#252525] flex items-center gap-2.5"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#C58B39]" />
                      + New Enquiry
                    </button>
                    <button
                      onClick={() => {
                        setQuickActionOpen(false);
                        onOpenNewEventCharge();
                      }}
                      className="w-full text-left px-3.5 py-2 text-neutral-200 hover:text-white hover:bg-[#252525] flex items-center gap-2.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#C58B39]" />
                      + Add Event Charge
                    </button>
                    <button
                      onClick={() => {
                        setQuickActionOpen(false);
                        onOpenNewQuote();
                      }}
                      className="w-full text-left px-3.5 py-2 text-neutral-200 hover:text-white hover:bg-[#252525] flex items-center gap-2.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#C58B39]" />
                      + Create Quote
                    </button>
                    <button
                      onClick={() => {
                        setQuickActionOpen(false);
                        onOpenNewEvent();
                      }}
                      className="w-full text-left px-3.5 py-2 text-neutral-200 hover:text-white hover:bg-[#252525] flex items-center gap-2.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#C58B39]" />
                      + New Event Shoot
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-300 hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#181818] border-b border-[#2E2E2E] px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded ${
                  isActive
                    ? 'bg-[#242220] text-[#E5DFD3] font-semibold border-l-2 border-[#C58B39]'
                    : 'text-neutral-300 hover:text-white hover:bg-[#202020]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
