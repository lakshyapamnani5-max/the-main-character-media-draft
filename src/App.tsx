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
import { ShieldCheck, Smartphone, Instagram, Phone } from 'lucide-react';

// Production ERP Views
import { HomeView } from './components/Home/HomeView';
import { CalendarView } from './components/Calendar/CalendarView';
import { JobsView, JobFilterTab } from './components/Jobs/JobsView';
import { MoneyView, MoneyTab } from './components/Money/MoneyView';
import { MoreView, MoreSubTab } from './components/More/MoreView';
import { PartnersView } from './components/Partners/PartnersView';
import { PartnerCalendarModal } from './components/Partners/PartnerCalendarModal';
import { AddPartnerEventModal } from './components/Partners/AddPartnerEventModal';
import { AuthModal } from './components/Auth/AuthModal';
import { AuthPage } from './components/Auth/AuthPage';
import { CrewManagementView } from './components/Crew/CrewManagementView';
import { EventChargesView } from './components/EventCharges/EventChargesView';
import { InvoiceModal } from './components/Invoices/InvoiceModal';

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
  CrewNotification,
  Partner,
  Invoice
} from './types';
import { StorageService, UserSession } from './services/storage';
import { 
  auth, 
  onAuthStateChanged, 
  signOut,
  FirebaseUser, 
  subscribeToFirestorePartners, 
  subscribeToFirestoreEvents,
  subscribeToFirestoreCrew,
  subscribeToRealtimeCrew,
  saveCrewToFirestore,
  deleteCrewFromFirestore
} from './services/firebase';

// Modals
import { EventChargeModal } from './components/EventCharges/EventChargeModal';
import { RateCardPreviewModal } from './components/EventCharges/RateCardPreviewModal';
import { QuoteBuilderModal } from './components/Quotations/QuoteBuilderModal';
import { QuotePreviewModal } from './components/Quotations/QuotePreviewModal';
import { EnquiryModal } from './components/Enquiries/EnquiryModal';
import { EventModal } from './components/Events/EventModal';
import { AddPaymentModal } from './components/Clients/AddPaymentModal';
import { CompanySettingsView } from './components/Settings/CompanySettingsView';

export default function App() {
  const [userSession, setUserSession] = useState<UserSession | null>(() => StorageService.getUserSession());
  const [appViewMode, setAppViewMode] = useState<'admin' | 'crew'>(() => {
    const session = StorageService.getUserSession();
    if (session?.role === 'crew') return 'crew';
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path.includes('/crew') || hash.includes('crew') || search.includes('crew')) {
        return 'crew';
      }
    }
    return session?.role || StorageService.getAppViewMode();
  });
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
  const [partners, setPartners] = useState<Partner[]>(() => StorageService.getPartners());

  // Partner Specific Modals
  const [selectedPartnerForCalendar, setSelectedPartnerForCalendar] = useState<Partner | null>(null);
  const [isPartnerCalendarOpen, setIsPartnerCalendarOpen] = useState(false);
  const [selectedPartnerForEvent, setSelectedPartnerForEvent] = useState<Partner | null>(null);
  const [isAddPartnerEventOpen, setIsAddPartnerEventOpen] = useState(false);
  const [initialPartnerShootDate, setInitialPartnerShootDate] = useState<string | undefined>(undefined);

  // Firebase Auth State & Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tmc_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('tmc_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

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
  const [previewingInvoice, setPreviewingInvoice] = useState<Invoice | null>(null);

  // Sync state from storage
  const refreshAllData = useCallback(() => {
    setMetrics(StorageService.getDashboardMetrics());
    setEventCharges(StorageService.getEventCharges());
    setEnquiries(StorageService.getEnquiries());
    setQuotations(StorageService.getQuotations());
    setClients(StorageService.getClients());
    setEvents(StorageService.getEvents());
    setPartners(StorageService.getPartners());
    setPayments(StorageService.getPayments());
    setExpenses(StorageService.getExpenses());
    setCrew(StorageService.getCrewRoster());
    setLocations(StorageService.getLocations());
    setNotifications(StorageService.getCrewNotifications());
  }, []);

  useEffect(() => {
    StorageService.initialize();
    refreshAllData();

    // Firebase Auth State Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      setCurrentUser(user);
    });

    // Firebase Firestore Realtime Live Sync for Partners
    const unsubscribePartners = subscribeToFirestorePartners((firestorePartners) => {
      if (firestorePartners && firestorePartners.length > 0) {
        localStorage.setItem('tmc_partners_v1', JSON.stringify(firestorePartners));
        setPartners(firestorePartners);
      }
    });

    // Firebase Firestore Realtime Live Sync for Events
    const unsubscribeEvents = subscribeToFirestoreEvents((firestoreEvents) => {
      if (firestoreEvents && firestoreEvents.length > 0) {
        localStorage.setItem('tmc_events_v2', JSON.stringify(firestoreEvents));
        setEvents(firestoreEvents);
      }
    });

    // Firebase Firestore & Realtime Database Live Sync for Crew Roster
    const handleIncomingCrew = (liveCrew: CrewMember[]) => {
      if (liveCrew && liveCrew.length > 0) {
        localStorage.setItem('tmc_crew_roster_v2', JSON.stringify(liveCrew));
        setCrew(liveCrew);
      }
    };

    const unsubscribeCrewFirestore = subscribeToFirestoreCrew(handleIncomingCrew);
    const unsubscribeCrewRealtime = subscribeToRealtimeCrew(handleIncomingCrew);

    const handleStorageUpdate = () => {
      refreshAllData();
    };

    window.addEventListener('tmc_storage_updated', handleStorageUpdate);
    return () => {
      unsubscribeAuth();
      unsubscribePartners();
      unsubscribeEvents();
      unsubscribeCrewFirestore();
      if (unsubscribeCrewRealtime) unsubscribeCrewRealtime();
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
    if (module === 'quotations') {
      setActiveModule('more');
      setMoreSubTab('quotes');
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
  const handleSaveCrew = async (crewData: Partial<CrewMember> & { name: string; phone: string; role: CrewRole; email?: string; password?: string; firebaseUid?: string }) => {
    const saved = StorageService.saveCrewMember(crewData);
    try {
      await saveCrewToFirestore(saved);
    } catch (e) {
      console.warn('Could not sync crew to Firestore immediately:', e);
    }
    refreshAllData();
  };

  const handleDeleteCrew = async (crewId: string) => {
    StorageService.deleteCrewMember(crewId);
    try {
      await deleteCrewFromFirestore(crewId);
    } catch (e) {
      console.warn('Could not delete crew from Firestore immediately:', e);
    }
    refreshAllData();
  };

  // Handlers for Locations
  const handleSaveLocation = (locData: Partial<LocationVenue> & { venue: string; city: string }) => {
    StorageService.saveLocation(locData);
    refreshAllData();
  };

  // Session & Login Handlers
  const handleLoginSuccess = (session: UserSession) => {
    StorageService.setUserSession(session);
    setUserSession(session);
    setAppViewMode(session.role);
    if (session.role === 'crew') {
      if (session.crewId) {
        setActiveCrewId(session.crewId);
        StorageService.setActiveCrewMemberId(session.crewId);
      }
    }
    refreshAllData();
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out:', e);
    }
    StorageService.setUserSession(null);
    setUserSession(null);
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(null, '', '/');
      } catch {
        window.location.hash = '';
      }
    }
  };

  const handleSwitchToCrewMode = (targetCrewId?: string) => {
    if (targetCrewId) {
      setActiveCrewId(targetCrewId);
      StorageService.setActiveCrewMemberId(targetCrewId);
    }
    setAppViewMode('crew');
    StorageService.setAppViewMode('crew');
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/crew')) {
      try {
        window.history.pushState(null, '', '/crew');
      } catch {
        window.location.hash = '/crew';
      }
    }
  };

  const handleSwitchToAdminMode = () => {
    if (userSession?.role === 'crew') {
      // Crew members strictly cannot switch to Admin mode
      return;
    }
    setAppViewMode('admin');
    StorageService.setAppViewMode('admin');
    if (typeof window !== 'undefined' && window.location.pathname.includes('/crew')) {
      try {
        window.history.pushState(null, '', '/');
      } catch {
        window.location.hash = '';
      }
    }
  };

  useEffect(() => {
    const handleUrlNav = () => {
      if (userSession?.role === 'crew') {
        setAppViewMode('crew');
        return;
      }
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path.includes('/crew') || hash.includes('crew') || search.includes('crew')) {
        setAppViewMode('crew');
      } else {
        setAppViewMode('admin');
      }
    };

    window.addEventListener('popstate', handleUrlNav);
    window.addEventListener('hashchange', handleUrlNav);
    return () => {
      window.removeEventListener('popstate', handleUrlNav);
      window.removeEventListener('hashchange', handleUrlNav);
    };
  }, [userSession]);

  // Handlers for WhatsApp Reminders
  const handleOpenReminderForEvent = (event: EventShoot) => {
    setEventForReminder(event);
    setIsWhatsAppReminderOpen(true);
  };

  // If user is not authenticated, show the Dedicated AuthPage
  if (!userSession && !currentUser) {
    return (
      <AuthPage
        onLoginSuccess={handleLoginSuccess}
        crewRoster={crew}
      />
    );
  }

  // If in Mobile-First Crew App View Mode or if role is crew
  if (appViewMode === 'crew' || userSession?.role === 'crew') {
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
          onRefreshData={refreshAllData}
          onSignOut={handleSignOut}
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
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        userSession={userSession}
        currentUser={currentUser}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
      />

      {/* Main ERP Viewport Area (offset dynamically by collapsible sidebar width) */}
      <div className={`${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-72'} flex flex-col min-h-screen transition-all duration-300 ease-in-out`}>
        
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
          appViewMode={appViewMode}
          onToggleAppViewMode={(mode) => mode === 'admin' ? handleSwitchToAdminMode() : handleSwitchToCrewMode()}
          isAdmin={userSession?.role !== 'crew'}
          onSignOut={handleSignOut}
          userSession={userSession}
        />

        {/* Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-20 md:pb-8">
          
          {/* PARTNERS VIEW */}
          {activeModule === 'partners' && (
            <PartnersView
              partners={partners}
              events={events}
              onOpenPartnerCalendar={(partner) => {
                setSelectedPartnerForCalendar(partner);
                setIsPartnerCalendarOpen(true);
              }}
              onRefreshData={refreshAllData}
              onOpenNewEventForPartner={(partner) => {
                setSelectedPartnerForEvent(partner);
                setInitialPartnerShootDate(new Date().toISOString().split('T')[0]);
                setIsAddPartnerEventOpen(true);
              }}
            />
          )}

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

          {/* 5. CREW ROSTER VIEW */}
          {activeModule === 'crew' && (
            <CrewManagementView
              crew={crew}
              events={events}
              onSaveCrew={handleSaveCrew}
              onDeleteCrew={handleDeleteCrew}
              onOpenEventCommandCenter={(event) => {
                setActiveModule('jobs');
              }}
              onRefreshData={refreshAllData}
              onLoginAsCrew={(cr) => handleSwitchToCrewMode(cr.id)}
            />
          )}

          {/* 6. EVENT RATES & MASTER CATALOGUE VIEW */}
          {activeModule === 'event-charges' && (
            <EventChargesView
              charges={eventCharges}
              onSaveCharge={handleSaveEventCharge}
              onDeleteCharge={handleDeleteEventCharge}
              onAddChargeToQuote={handleAddChargeToQuote}
              onCreateCustomQuote={() => {
                setQuoteToEdit(null);
                setPreloadedChargeForQuote(null);
                setPreloadedEnquiryForQuote(null);
                setPreloadedClientForQuote(null);
                setIsQuoteBuilderOpen(true);
              }}
            />
          )}

          {/* 7. COMPANY SETTINGS VIEW */}
          {activeModule === 'settings' && (
            <CompanySettingsView
              onSettingsSaved={() => {
                refreshAllData();
              }}
            />
          )}

          {/* 8. MORE VIEW */}
          {(activeModule === 'more' || activeModule === 'enquiries' || activeModule === 'quotations' || activeModule === 'clients' || activeModule === 'locations') && (
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
              onOpenSettings={() => setActiveModule('settings')}
            />
          )}

        </main>

        {/* Clean Minimal ERP Footer with DRONA Tech Solutions Attribution */}
        <footer className="mt-auto border-t border-[#E8E3D9] bg-white text-xs text-neutral-500 py-3.5 no-print hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-neutral-800 tracking-wider">
                THE MAIN CHARACTER MEDIA
              </span>
              <span className="text-neutral-300">·</span>
              <span className="font-mono text-neutral-400">Production Management ERP</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-neutral-500 font-mono text-[11px]">
              <span>Made by <strong className="text-neutral-800 font-semibold">DRONA Tech Solutions</strong></span>
              <span className="text-neutral-300">·</span>
              <a 
                href="https://instagram.com/_.drona._" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1 text-[#C58B39] hover:underline transition-colors"
                title="Follow on Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>_.drona._</span>
              </a>
              <span className="text-neutral-300">·</span>
              <a 
                href="tel:7620366390" 
                className="inline-flex items-center gap-1 text-neutral-700 hover:text-neutral-900 hover:underline transition-colors"
                title="Call DRONA Tech Solutions"
              >
                <Phone className="w-3 h-3 text-[#C58B39]" />
                <span>7620366390</span>
              </a>
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
        eventCharges={eventCharges}
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
        onConvertToInvoice={(quote) => {
          const inv = StorageService.createInvoiceFromQuote(quote);
          setPreviewingInvoice(inv);
          refreshAllData();
        }}
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
          onConvertToInvoice={(quote) => {
            const inv = StorageService.createInvoiceFromQuote(quote);
            setPreviewingQuote(null);
            setPreviewingInvoice(inv);
            refreshAllData();
          }}
        />
      )}

      {/* Global Invoice Preview Modal */}
      {previewingInvoice && (
        <InvoiceModal
          isOpen={true}
          onClose={() => setPreviewingInvoice(null)}
          invoice={previewingInvoice}
          onUpdateStatus={(id, st) => {
            StorageService.updateInvoiceStatus(id, st);
            refreshAllData();
          }}
          onRecordPayment={(id, amt) => {
            StorageService.recordPaymentForInvoice(id, amt);
            refreshAllData();
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

      {/* Partner Calendar Modal */}
      <PartnerCalendarModal
        isOpen={isPartnerCalendarOpen}
        onClose={() => setIsPartnerCalendarOpen(false)}
        partner={selectedPartnerForCalendar}
        events={events}
        onRefreshData={refreshAllData}
        onOpenEventDetail={(event) => {
          setIsPartnerCalendarOpen(false);
          setActiveModule('jobs');
        }}
        onScheduleShootForPartner={(partner, date) => {
          setSelectedPartnerForEvent(partner);
          setInitialPartnerShootDate(date || new Date().toISOString().split('T')[0]);
          setIsAddPartnerEventOpen(true);
        }}
      />

      {/* Add Outsourced Event for Partner Modal */}
      <AddPartnerEventModal
        isOpen={isAddPartnerEventOpen}
        onClose={() => setIsAddPartnerEventOpen(false)}
        partner={selectedPartnerForEvent}
        initialDate={initialPartnerShootDate}
        onSave={(eventData) => {
          handleSaveEvent(eventData);
          setIsAddPartnerEventOpen(false);
          refreshAllData();
        }}
      />

      {/* Firebase Auth & Credentials Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
