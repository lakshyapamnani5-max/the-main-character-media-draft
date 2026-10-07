/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { NavModule } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MobileBottomNav } from './components/Navigation/MobileBottomNav';
import { NotificationDrawer } from './components/Navigation/NotificationDrawer';

// Production ERP Views
import { HomeView } from './components/Home/HomeView';
import { CalendarView } from './components/Calendar/CalendarView';
import { JobsView, JobFilterTab } from './components/Jobs/JobsView';
import { MoneyView, MoneyTab } from './components/Money/MoneyView';
import { MoreView, MoreSubTab } from './components/More/MoreView';

// Dedicated Mobile-First Crew App
import { CrewAppLayout } from './components/CrewApp/CrewAppLayout';

// Reminders
import { WhatsAppReminderModal } from './components/Reminders/WhatsAppReminderModal';
import { ReminderSettingsModal } from './components/Reminders/ReminderSettingsModal';

import { 
  EventCharge, 
  Quotation, 
  Enquiry, 
  Client, 
  EventShoot, 
  PaymentRecord, 
  DashboardMetrics,
  QuoteStatus,
  CrewMember,
  CrewRole,
  LocationVenue,
  Expense,
  CrewNotification
} from './types';
import { StorageService } from './services/storage';

// Modals
import { EventChargeModal } from './components/EventCharges/EventChargeModal';
import { RateCardPreviewModal } from './components/EventCharges/RateCardPreviewModal';
import { QuoteBuilderModal } from './components/Quotations/QuoteBuilderModal';
import { QuotePreviewModal } from './components/Quotations/QuotePreviewModal';
import { EnquiryModal } from './components/Enquiries/EnquiryModal';
import { EventModal } from './components/Events/EventModal';
import { AddPaymentModal } from './components/Clients/AddPaymentModal';

export default function App() {
  const [appViewMode, setAppViewMode] = useState<'admin' | 'crew'>(() => StorageService.getAppViewMode());
  const [activeCrewId, setActiveCrewId] = useState<string>(() => StorageService.getActiveCrewMemberId());

  // Navigation state (Default to 'home')
  const [activeModule, setActiveModule] = useState<NavModule>('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Sub-tab deep links
  const [jobsSubTab, setJobsSubTab] = useState<JobFilterTab>('all');
  const [moneySubTab, setMoneySubTab] = useState<MoneyTab>('overview');
  const [moreSubTab, setMoreSubTab] = useState<MoreSubTab>('hub');

  // Application Data States
  const [metrics, setMetrics] = useState<DashboardMetrics>(() => StorageService.getDashboardMetrics());
  const [eventCharges, setEventCharges] = useState<EventCharge[]>(() => StorageService.getEventCharges());
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => StorageService.getEnquiries());
  const [quotations, setQuotations] = useState<Quotation[]>(() => StorageService.getQuotations());
  const [clients, setClients] = useState<Client[]>(() => StorageService.getClients());
  const [events, setEvents] = useState<EventShoot[]>(() => StorageService.getEvents());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => StorageService.getPayments());
  const [expenses, setExpenses] = useState<Expense[]>(() => StorageService.getExpenses());
  const [crew, setCrew] = useState<CrewMember[]>(() => StorageService.getCrewRoster());
  const [locations, setLocations] = useState<LocationVenue[]>(() => StorageService.getLocations());
  const [notifications, setNotifications] = useState<CrewNotification[]>(() => StorageService.getCrewNotifications());

  // Global Action Modals
  const [isNewEnquiryOpen, setIsNewEnquiryOpen] = useState(false);
  const [isNewChargeOpen, setIsNewChargeOpen] = useState(false);
  const [isQuoteBuilderOpen, setIsQuoteBuilderOpen] = useState(false);
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [isRateCardPreviewOpen, setIsRateCardPreviewOpen] = useState(false);

  // Initial date for event modal
  const [initialEventDate, setInitialEventDate] = useState<string | undefined>(undefined);

  // Payment Recording Modal
  const [isGlobalRecordPaymentOpen, setIsGlobalRecordPaymentOpen] = useState(false);
  const [selectedEventForPayment, setSelectedEventForPayment] = useState<EventShoot | null>(null);

  // Reminder Modals
  const [isWhatsAppReminderOpen, setIsWhatsAppReminderOpen] = useState(false);
  const [eventForReminder, setEventForReminder] = useState<EventShoot | null>(null);
  const [isReminderSettingsOpen, setIsReminderSettingsOpen] = useState(false);

  // Preloads for Quote Builder
  const [quoteToEdit, setQuoteToEdit] = useState<Quotation | null>(null);
  const [preloadedChargeForQuote, setPreloadedChargeForQuote] = useState<EventCharge | null>(null);
  const [preloadedEnquiryForQuote, setPreloadedEnquiryForQuote] = useState<Enquiry | null>(null);
  const [preloadedClientForQuote, setPreloadedClientForQuote] = useState<Client | null>(null);

  // Global Preview Modal
  const [previewingQuote, setPreviewingQuote] = useState<Quotation | null>(null);

  // Sync state from storage
  const refreshAllData = useCallback(() => {
    setMetrics(StorageService.getDashboardMetrics());
    setEventCharges(StorageService.getEventCharges());
    setEnquiries(StorageService.getEnquiries());
    setQuotations(StorageService.getQuotations());
    setClients(StorageService.getClients());
    setEvents(StorageService.getEvents());
    setPayments(StorageService.getPayments());
    setExpenses(StorageService.getExpenses());
    setCrew(StorageService.getCrewRoster());
    setLocations(StorageService.getLocations());
    setNotifications(StorageService.getCrewNotifications());
  }, []);

  useEffect(() => {
    StorageService.initialize();
    refreshAllData();

    const handleStorageUpdate = () => {
      refreshAllData();
    };

    window.addEventListener('tmc_storage_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('tmc_storage_updated', handleStorageUpdate);
    };
  }, [refreshAllData]);

  // Navigation dispatcher
  const handleNavigate = (module: NavModule, subTab?: string) => {
    // Legacy mapping
    if (module === 'dashboard') {
      setActiveModule('home');
      return;
    }
    if (module === 'events') {
      setActiveModule('jobs');
      return;
    }
    if (module === 'enquiries') {
      setActiveModule('more');
      setMoreSubTab('leads');
      return;
    }
    if (module === 'crew') {
      setActiveModule('more');
      setMoreSubTab('crew');
      return;
    }
    if (module === 'quotations') {
      setActiveModule('more');
      setMoreSubTab('quotes');
      return;
    }
    if (module === 'event-charges') {
      setActiveModule('more');
      setMoreSubTab('rate-card');
      return;
    }
    if (module === 'locations') {
      setActiveModule('more');
      setMoreSubTab('locations');
      return;
    }

    setActiveModule(module);

    if (module === 'jobs' && subTab) {
      setJobsSubTab(subTab as JobFilterTab);
    } else if (module === 'money' && subTab) {
      setMoneySubTab(subTab as MoneyTab);
    } else if (module === 'more' && subTab) {
      setMoreSubTab(subTab as MoreSubTab);
    }
  };

  // Handlers for Event Charges
  const handleSaveEventCharge = (chargeData: Partial<EventCharge> & { name: string; price: number }) => {
    StorageService.saveEventCharge(chargeData);
    refreshAllData();
  };

  const handleDeleteEventCharge = (chargeId: string) => {
    const result = StorageService.deleteOrArchiveEventCharge(chargeId);
    refreshAllData();
    return result;
  };

  const handleAddChargeToQuote = (charge: EventCharge) => {
    setPreloadedChargeForQuote(charge);
    setQuoteToEdit(null);
    setPreloadedEnquiryForQuote(null);
    setPreloadedClientForQuote(null);
    setIsQuoteBuilderOpen(true);
  };

  // Handlers for Quotations
  const handleSaveQuotation = (quoteData: Partial<Quotation>) => {
    const saved = StorageService.saveQuotation(quoteData);
    refreshAllData();
    return saved;
  };

  const handleUpdateQuoteStatus = (quoteId: string, status: QuoteStatus) => {
    StorageService.updateQuoteStatus(quoteId, status);
    refreshAllData();
  };

  // Handlers for Enquiries
  const handleSaveEnquiry = (enquiryData: Partial<Enquiry> & { clientName: string; eventName: string }) => {
    StorageService.saveEnquiry(enquiryData);
    refreshAllData();
  };

  const handleAddFollowUp = (enquiryId: string, notes: string, nextDate?: string, createdBy?: string) => {
    StorageService.addFollowUp(enquiryId, notes, nextDate, createdBy);
    refreshAllData();
  };

  const handleConvertEnquiry = (enquiryId: string, createEventAlso: boolean) => {
    StorageService.convertEnquiryToClient(enquiryId, createEventAlso);
    refreshAllData();
  };

  const handleCreateQuoteFromEnquiry = (enquiry: Enquiry) => {
    setPreloadedEnquiryForQuote(enquiry);
    setQuoteToEdit(null);
    setPreloadedChargeForQuote(null);
    setPreloadedClientForQuote(null);
    setIsQuoteBuilderOpen(true);
  };

  // Handlers for Clients
  const handleSaveClient = (clientData: Partial<Client> & { name: string }) => {
    StorageService.saveClient(clientData);
    refreshAllData();
  };

  // Handlers for Events
  const handleSaveEvent = (eventData: Partial<EventShoot> & { eventName: string; clientName: string }) => {
    StorageService.saveEvent(eventData);
    refreshAllData();
  };

  const handleToggleDeliverable = (eventId: string, deliverableId: string) => {
    StorageService.toggleDeliverable(eventId, deliverableId);
    refreshAllData();
  };

  // Handlers for Payments
  const handleRecordPayment = (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => {
    StorageService.recordPayment(payment);
    refreshAllData();
  };

  // Handlers for Expenses
  const handleSaveExpense = (expenseData: Partial<Expense> & { title: string; amount: number; category: Expense['category'] }) => {
    StorageService.saveExpense(expenseData);
    refreshAllData();
  };

  const handleDeleteExpense = (id: string) => {
    StorageService.deleteExpense(id);
    refreshAllData();
  };

  // Handlers for Crew
  const handleSaveCrew = (crewData: Partial<CrewMember> & { name: string; phone: string; role: CrewRole }) => {
    StorageService.saveCrewMember(crewData);
    refreshAllData();
  };

  // Handlers for Locations
  const handleSaveLocation = (locData: Partial<LocationVenue> & { venue: string; city: string }) => {
    StorageService.saveLocation(locData);
    refreshAllData();
  };

  // Handlers for View Mode Switching
  const handleSwitchToCrewMode = (crewId?: string) => {
    if (crewId) {
      setActiveCrewId(crewId);
      StorageService.setActiveCrewMemberId(crewId);
    }
    setAppViewMode('crew');
    StorageService.setAppViewMode('crew');
  };

  const handleSwitchToAdminMode = () => {
    setAppViewMode('admin');
    StorageService.setAppViewMode('admin');
  };

  // Handlers for WhatsApp Reminders
  const handleOpenReminderForEvent = (event: EventShoot) => {
    setEventForReminder(event);
    setIsWhatsAppReminderOpen(true);
  };

  // If in Mobile-First Crew App View Mode
  if (appViewMode === 'crew') {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <CrewAppLayout
          events={events}
          crewRoster={crew}
          activeCrewId={activeCrewId}
          onChangeCrewPersona={(id) => {
            setActiveCrewId(id);
            StorageService.setActiveCrewMemberId(id);
          }}
          onSwitchToAdmin={handleSwitchToAdminMode}
          onRefreshData={refreshAllData}
        />
      </div>
    );
  }

  const upcomingCount = events.filter(
    e => e.status === 'Confirmed' || e.status === 'Scheduled' || e.status === 'In Progress'
  ).length;

  const pendingBalanceCount = events.filter(e => (e.balanceDue || 0) > 0).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E]">
      
      {/* Fixed Left ERP Sidebar (Desktop) */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={handleNavigate}
        metrics={metrics}
        enquiries={enquiries}
        quotations={quotations}
        clients={clients}
        events={events}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenNewEnquiry={() => setIsNewEnquiryOpen(true)}
        onOpenNewEventCharge={() => setIsNewChargeOpen(true)}
        onOpenNewQuote={() => {
          setQuoteToEdit(null);
          setPreloadedChargeForQuote(null);
          setPreloadedEnquiryForQuote(null);
          setPreloadedClientForQuote(null);
          setIsQuoteBuilderOpen(true);
        }}
        onOpenNewEvent={() => {
          setInitialEventDate(undefined);
          setIsNewEventOpen(true);
        }}
        onDownloadRateCard={() => setIsRateCardPreviewOpen(true)}
        onSwitchToCrewApp={() => handleSwitchToCrewMode()}
        onOpenReminderSettings={() => setIsReminderSettingsOpen(true)}
      />

      {/* Main ERP Viewport Area (offset by sidebar width on desktop) */}
      <div className="md:pl-72 flex flex-col min-h-screen">
        
        {/* Top ERP Action Header */}
        <TopBar
          activeModule={activeModule}
          onSelectModule={handleNavigate}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenNewEnquiry={() => setIsNewEnquiryOpen(true)}
          onOpenNewEventCharge={() => setIsNewChargeOpen(true)}
          onOpenNewQuote={() => {
            setQuoteToEdit(null);
            setPreloadedChargeForQuote(null);
            setPreloadedEnquiryForQuote(null);
            setPreloadedClientForQuote(null);
            setIsQuoteBuilderOpen(true);
          }}
          onOpenNewEvent={() => {
            setInitialEventDate(undefined);
            setIsNewEventOpen(true);
          }}
          metrics={metrics}
          enquiries={enquiries}
          quotations={quotations}
          clients={clients}
          events={events}
          notifications={notifications}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          onSelectQuoteForPreview={(quote) => setPreviewingQuote(quote)}
          onSwitchToCrewApp={() => handleSwitchToCrewMode()}
        />

        {/* Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-20 md:pb-8">
          
          {/* 1. HOME VIEW */}
          {(activeModule === 'home' || activeModule === 'dashboard') && (
            <HomeView
              metrics={metrics}
              events={events}
              enquiries={enquiries}
              quotations={quotations}
              payments={payments}
              expenses={expenses}
              onNavigate={handleNavigate}
              onOpenNewEnquiry={() => setIsNewEnquiryOpen(true)}
              onOpenNewEventCharge={() => setIsNewChargeOpen(true)}
              onOpenNewQuote={() => {
                setQuoteToEdit(null);
                setPreloadedChargeForQuote(null);
                setPreloadedEnquiryForQuote(null);
                setPreloadedClientForQuote(null);
                setIsQuoteBuilderOpen(true);
              }}
              onOpenNewEvent={() => {
                setInitialEventDate(undefined);
                setIsNewEventOpen(true);
              }}
              onOpenAddExpense={() => {
                setActiveModule('money');
                setMoneySubTab('expenses');
              }}
              onSelectQuoteForPreview={(quote) => setPreviewingQuote(quote)}
              onQuickQuoteForEnquiry={handleCreateQuoteFromEnquiry}
              onOpenSendReminder={handleOpenReminderForEvent}
              onOpenReminderSettings={() => setIsReminderSettingsOpen(true)}
              onOpenEventDetail={(event) => {
                setActiveModule('jobs');
              }}
              onOpenRecordPayment={(event) => {
                setSelectedEventForPayment(event || null);
                setIsGlobalRecordPaymentOpen(true);
              }}
            />
          )}

          {/* 2. CALENDAR VIEW */}
          {activeModule === 'calendar' && (
            <CalendarView
              events={events}
              crewRoster={crew}
              onSelectEvent={(event) => {
                setActiveModule('jobs');
              }}
              onOpenNewEvent={(date) => {
                setInitialEventDate(date);
                setIsNewEventOpen(true);
              }}
            />
          )}

          {/* 3. WEDDINGS / JOBS VIEW */}
          {(activeModule === 'jobs' || activeModule === 'events') && (
            <JobsView
              events={events}
              clients={clients}
              quotes={quotations}
              payments={payments}
              enquiries={enquiries}
              initialTab={jobsSubTab}
              onSaveEvent={handleSaveEvent}
              onToggleDeliverable={handleToggleDeliverable}
              onRecordPayment={handleRecordPayment}
              onSelectQuoteForPreview={(quote) => setPreviewingQuote(quote)}
              onOpenSendReminder={handleOpenReminderForEvent}
              onQuickQuoteForEnquiry={handleCreateQuoteFromEnquiry}
            />
          )}

          {/* 4. MONEY VIEW */}
          {activeModule === 'money' && (
            <MoneyView
              metrics={metrics}
              events={events}
              payments={payments}
              crewRoster={crew}
              expenses={expenses}
              initialTab={moneySubTab}
              onRecordPayment={handleRecordPayment}
              onSaveExpense={handleSaveExpense}
              onDeleteExpense={handleDeleteExpense}
              onRefreshData={refreshAllData}
            />
          )}

          {/* 5. MORE VIEW */}
          {(activeModule === 'more' || activeModule === 'enquiries' || activeModule === 'event-charges' || activeModule === 'quotations' || activeModule === 'clients' || activeModule === 'crew' || activeModule === 'locations') && (
            <MoreView
              initialSubTab={moreSubTab}
              enquiries={enquiries}
              crewRoster={crew}
              quotations={quotations}
              eventCharges={eventCharges}
              locations={locations}
              events={events}
              metrics={metrics}
              onSaveEnquiry={handleSaveEnquiry}
              onAddFollowUp={handleAddFollowUp}
              onConvertEnquiry={handleConvertEnquiry}
              onCreateQuoteFromEnquiry={handleCreateQuoteFromEnquiry}
              onSaveCrew={handleSaveCrew}
              onOpenCreateQuote={() => {
                setQuoteToEdit(null);
                setPreloadedChargeForQuote(null);
                setPreloadedEnquiryForQuote(null);
                setPreloadedClientForQuote(null);
                setIsQuoteBuilderOpen(true);
              }}
              onEditQuote={(quote) => {
                setQuoteToEdit(quote);
                setPreloadedChargeForQuote(null);
                setPreloadedEnquiryForQuote(null);
                setPreloadedClientForQuote(null);
                setIsQuoteBuilderOpen(true);
              }}
              onUpdateQuoteStatus={handleUpdateQuoteStatus}
              onOpenQuotePreview={(quote) => setPreviewingQuote(quote)}
              onSaveCharge={handleSaveEventCharge}
              onDeleteCharge={handleDeleteEventCharge}
              onAddChargeToQuote={handleAddChargeToQuote}
              onSaveLocation={handleSaveLocation}
              onDownloadRateCard={() => setIsRateCardPreviewOpen(true)}
              onOpenReminderSettings={() => setIsReminderSettingsOpen(true)}
              onSwitchToCrewApp={() => handleSwitchToCrewMode()}
            />
          )}

        </main>

        {/* Clean Minimal ERP Footer */}
        <footer className="mt-auto border-t border-[#E8E3D9] bg-white text-xs text-neutral-500 py-4 no-print hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-neutral-800 tracking-wider">
                THE MAIN CHARACTER MEDIA
              </span>
              <span className="text-neutral-300">·</span>
              <span className="font-mono text-neutral-400">Production Management ERP</span>
            </div>

            <div className="flex items-center gap-4 text-neutral-400 font-mono">
              <button
                onClick={() => handleSwitchToCrewMode()}
                className="hover:text-[#C58B39] transition-colors"
              >
                Launch Crew PWA
              </button>
              <span>·</span>
              <span>Storage: LocalStorage Only (Backend-Ready Schema)</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed for Mobile Screens) */}
      <MobileBottomNav
        activeModule={activeModule}
        onSelectModule={handleNavigate}
        upcomingCount={upcomingCount}
        pendingBalanceCount={pendingBalanceCount}
      />

      {/* Interactive Top-Right Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        upcomingEvents={events}
        onSelectEvent={(event) => {
          setActiveModule('jobs');
        }}
        onRefreshData={refreshAllData}
      />

      {/* Global Quick Action Modals */}
      <EnquiryModal
        isOpen={isNewEnquiryOpen}
        onClose={() => setIsNewEnquiryOpen(false)}
        onSave={handleSaveEnquiry}
      />

      <EventChargeModal
        isOpen={isNewChargeOpen}
        onClose={() => setIsNewChargeOpen(false)}
        onSave={handleSaveEventCharge}
      />

      <QuoteBuilderModal
        isOpen={isQuoteBuilderOpen}
        onClose={() => {
          setIsQuoteBuilderOpen(false);
          setQuoteToEdit(null);
          setPreloadedChargeForQuote(null);
          setPreloadedEnquiryForQuote(null);
          setPreloadedClientForQuote(null);
        }}
        onSave={handleSaveQuotation}
        initialQuote={quoteToEdit}
        preloadedCharge={preloadedChargeForQuote}
        preloadedEnquiry={preloadedEnquiryForQuote}
        preloadedClient={preloadedClientForQuote}
      />

      <EventModal
        isOpen={isNewEventOpen}
        onClose={() => {
          setIsNewEventOpen(false);
          setInitialEventDate(undefined);
        }}
        onSave={handleSaveEvent}
        initialData={initialEventDate ? { startDate: initialEventDate, endDate: initialEventDate } as any : undefined}
      />

      {/* Master Rate Card Document Preview Modal */}
      <RateCardPreviewModal
        isOpen={isRateCardPreviewOpen}
        onClose={() => setIsRateCardPreviewOpen(false)}
        charges={eventCharges}
      />

      {/* Global Quote Preview Modal */}
      {previewingQuote && (
        <QuotePreviewModal
          isOpen={true}
          onClose={() => setPreviewingQuote(null)}
          quote={previewingQuote}
          onUpdateStatus={(id, st) => {
            handleUpdateQuoteStatus(id, st);
            setPreviewingQuote({ ...previewingQuote, status: st });
          }}
        />
      )}

      {/* Global Record Payment Modal */}
      {isGlobalRecordPaymentOpen && (
        <AddPaymentModal
          isOpen={true}
          onClose={() => {
            setIsGlobalRecordPaymentOpen(false);
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
            handleRecordPayment({
              ...pmt,
              clientId: selectedEventForPayment?.clientId || 'cli-general',
              eventId: selectedEventForPayment?.id
            });
            setIsGlobalRecordPaymentOpen(false);
            setSelectedEventForPayment(null);
          }}
        />
      )}

      {/* Semi-Automated WhatsApp Reminder Modal */}
      <WhatsAppReminderModal
        isOpen={isWhatsAppReminderOpen}
        onClose={() => {
          setIsWhatsAppReminderOpen(false);
          setEventForReminder(null);
        }}
        event={eventForReminder}
        onReminderLogged={refreshAllData}
      />

      {/* Reminder Settings Modal */}
      <ReminderSettingsModal
        isOpen={isReminderSettingsOpen}
        onClose={() => setIsReminderSettingsOpen(false)}
        onSaveSettings={refreshAllData}
      />
    </div>
  );
}
