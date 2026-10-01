/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { NavModule } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';

import { DashboardView } from './components/Dashboard/DashboardView';
import { EventChargesView } from './components/EventCharges/EventChargesView';
import { QuotationsView } from './components/Quotations/QuotationsView';
import { EnquiriesView } from './components/Enquiries/EnquiriesView';
import { ClientsView } from './components/Clients/ClientsView';
import { EventsView } from './components/Events/EventsView';
import { CrewManagementView } from './components/Crew/CrewManagementView';
import { LocationsView } from './components/Locations/LocationsView';

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
  LocationVenue 
} from './types';
import { StorageService } from './services/storage';
import { PDFGeneratorService } from './services/pdfGenerator';

// Modals
import { EventChargeModal } from './components/EventCharges/EventChargeModal';
import { RateCardPreviewModal } from './components/EventCharges/RateCardPreviewModal';
import { QuoteBuilderModal } from './components/Quotations/QuoteBuilderModal';
import { QuotePreviewModal } from './components/Quotations/QuotePreviewModal';
import { EnquiryModal } from './components/Enquiries/EnquiryModal';
import { EventModal } from './components/Events/EventModal';

export default function App() {
  const [appViewMode, setAppViewMode] = useState<'admin' | 'crew'>(() => StorageService.getAppViewMode());
  const [activeCrewId, setActiveCrewId] = useState<string>(() => StorageService.getActiveCrewMemberId());

  const [activeModule, setActiveModule] = useState<NavModule>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Application Data States
  const [metrics, setMetrics] = useState<DashboardMetrics>(() => StorageService.getDashboardMetrics());
  const [eventCharges, setEventCharges] = useState<EventCharge[]>(() => StorageService.getEventCharges());
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => StorageService.getEnquiries());
  const [quotations, setQuotations] = useState<Quotation[]>(() => StorageService.getQuotations());
  const [clients, setClients] = useState<Client[]>(() => StorageService.getClients());
  const [events, setEvents] = useState<EventShoot[]>(() => StorageService.getEvents());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => StorageService.getPayments());
  const [crew, setCrew] = useState<CrewMember[]>(() => StorageService.getCrewRoster());
  const [locations, setLocations] = useState<LocationVenue[]>(() => StorageService.getLocations());

  // Global Action Modals
  const [isNewEnquiryOpen, setIsNewEnquiryOpen] = useState(false);
  const [isNewChargeOpen, setIsNewChargeOpen] = useState(false);
  const [isQuoteBuilderOpen, setIsQuoteBuilderOpen] = useState(false);
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [isRateCardPreviewOpen, setIsRateCardPreviewOpen] = useState(false);

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
    setCrew(StorageService.getCrewRoster());
    setLocations(StorageService.getLocations());
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

  const handleCreateQuoteForClient = (client: Client) => {
    setPreloadedClientForQuote(client);
    setQuoteToEdit(null);
    setPreloadedChargeForQuote(null);
    setPreloadedEnquiryForQuote(null);
    setIsQuoteBuilderOpen(true);
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

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E]">
      
      {/* Fixed Left ERP Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
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
        onOpenNewEvent={() => setIsNewEventOpen(true)}
        onDownloadRateCard={() => setIsRateCardPreviewOpen(true)}
        onSwitchToCrewApp={() => handleSwitchToCrewMode()}
        onOpenReminderSettings={() => setIsReminderSettingsOpen(true)}
      />

      {/* Main ERP Viewport Area (offset by sidebar width on desktop) */}
      <div className="md:pl-72 flex flex-col min-h-screen">
        
        {/* Top ERP Action Header */}
        <TopBar
          activeModule={activeModule}
          onSelectModule={setActiveModule}
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
          onOpenNewEvent={() => setIsNewEventOpen(true)}
          metrics={metrics}
          enquiries={enquiries}
          quotations={quotations}
          clients={clients}
          events={events}
          onSelectQuoteForPreview={(quote) => setPreviewingQuote(quote)}
          onSwitchToCrewApp={() => handleSwitchToCrewMode()}
        />

        {/* Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7">
          {activeModule === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              upcomingEvents={events.filter(e => e.status === 'Confirmed' || e.status === 'Scheduled' || e.status === 'In Progress')}
              pendingEnquiries={enquiries.filter(e => e.pipelineStage !== 'Confirmed' && e.pipelineStage !== 'Lost')}
              recentQuotes={quotations}
              onNavigate={setActiveModule}
              onOpenNewEnquiry={() => setIsNewEnquiryOpen(true)}
              onOpenNewEventCharge={() => setIsNewChargeOpen(true)}
              onOpenNewQuote={() => {
                setQuoteToEdit(null);
                setPreloadedChargeForQuote(null);
                setPreloadedEnquiryForQuote(null);
                setPreloadedClientForQuote(null);
                setIsQuoteBuilderOpen(true);
              }}
              onOpenNewEvent={() => setIsNewEventOpen(true)}
              onSelectQuoteForPreview={(quote) => setPreviewingQuote(quote)}
              onQuickQuoteForEnquiry={handleCreateQuoteFromEnquiry}
              onOpenSendReminder={handleOpenReminderForEvent}
              onOpenReminderSettings={() => setIsReminderSettingsOpen(true)}
              onOpenEventDetail={(event) => {
                setActiveModule('events');
              }}
            />
          )}

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

          {activeModule === 'quotations' && (
            <QuotationsView
              quotations={quotations}
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
              onOpenPreview={(quote) => setPreviewingQuote(quote)}
            />
          )}

          {activeModule === 'enquiries' && (
            <EnquiriesView
              enquiries={enquiries}
              onSaveEnquiry={handleSaveEnquiry}
              onAddFollowUp={handleAddFollowUp}
              onConvertEnquiry={handleConvertEnquiry}
              onCreateQuoteFromEnquiry={handleCreateQuoteFromEnquiry}
            />
          )}

          {activeModule === 'clients' && (
            <ClientsView
              clients={clients}
              events={events}
              quotations={quotations}
              payments={payments}
              onSaveClient={handleSaveClient}
              onRecordPayment={handleRecordPayment}
              onCreateQuoteForClient={handleCreateQuoteForClient}
              onSelectQuoteForPreview={(quote) => setPreviewingQuote(quote)}
            />
          )}

          {activeModule === 'events' && (
            <EventsView
              events={events}
              clients={clients}
              quotes={quotations}
              payments={payments}
              onSaveEvent={handleSaveEvent}
              onToggleDeliverable={handleToggleDeliverable}
              onRecordPayment={handleRecordPayment}
              onSelectQuoteForPreview={(quote) => setPreviewingQuote(quote)}
            />
          )}

          {activeModule === 'crew' && (
            <CrewManagementView
              crew={crew}
              events={events}
              onSaveCrew={handleSaveCrew}
            />
          )}

          {activeModule === 'locations' && (
            <LocationsView
              locations={locations}
              onSaveLocation={handleSaveLocation}
            />
          )}
        </main>

        {/* Clean Minimal ERP Footer */}
        <footer className="mt-auto border-t border-[#E8E3D9] bg-white text-xs text-neutral-500 py-4 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-neutral-800 tracking-wider">
                THE MAIN CHARACTER MEDIA
              </span>
              <span className="text-neutral-300">·</span>
              <span className="font-mono text-neutral-400">Production & Commercial ERP</span>
            </div>

            <div className="flex items-center gap-4 text-neutral-400 font-mono">
              <button
                onClick={() => handleSwitchToCrewMode()}
                className="hover:text-[#C58B39] transition-colors"
              >
                Launch Crew PWA
              </button>
              <span>·</span>
              <span>Database: Local Storage Persistent</span>
            </div>
          </div>
        </footer>
      </div>

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
        onClose={() => setIsNewEventOpen(false)}
        onSave={handleSaveEvent}
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
