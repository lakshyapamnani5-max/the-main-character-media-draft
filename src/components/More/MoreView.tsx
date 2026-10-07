import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  UserCheck, 
  Layers, 
  MessageCircle, 
  Smartphone, 
  Download, 
  Sparkles, 
  Building2, 
  HelpCircle,
  Database,
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { 
  Enquiry, 
  CrewMember, 
  Quotation, 
  EventCharge, 
  LocationVenue, 
  EventShoot, 
  DashboardMetrics,
  QuoteStatus,
  CrewRole
} from '../../types';
import { EnquiriesView } from '../Enquiries/EnquiriesView';
import { CrewManagementView } from '../Crew/CrewManagementView';
import { QuotationsView } from '../Quotations/QuotationsView';
import { EventChargesView } from '../EventCharges/EventChargesView';
import { LocationsView } from '../Locations/LocationsView';

export type MoreSubTab = 
  | 'hub' 
  | 'leads' 
  | 'crew' 
  | 'quotes' 
  | 'rate-card' 
  | 'locations' 
  | 'reports' 
  | 'settings';

interface MoreViewProps {
  initialSubTab?: MoreSubTab;
  enquiries: Enquiry[];
  crewRoster: CrewMember[];
  quotations: Quotation[];
  eventCharges: EventCharge[];
  locations: LocationVenue[];
  events: EventShoot[];
  metrics: DashboardMetrics;
  onSaveEnquiry: (enquiryData: Partial<Enquiry> & { clientName: string; eventName: string }) => void;
  onAddFollowUp: (enquiryId: string, notes: string, nextDate?: string, createdBy?: string) => void;
  onConvertEnquiry: (enquiryId: string, createEventAlso: boolean) => void;
  onCreateQuoteFromEnquiry: (enquiry: Enquiry) => void;
  onSaveCrew: (crewData: Partial<CrewMember> & { name: string; phone: string; role: CrewRole }) => void;
  onOpenCreateQuote: () => void;
  onEditQuote: (quote: Quotation) => void;
  onUpdateQuoteStatus: (quoteId: string, status: QuoteStatus) => void;
  onOpenQuotePreview: (quote: Quotation) => void;
  onSaveCharge: (chargeData: Partial<EventCharge> & { name: string; price: number }) => void;
  onDeleteCharge: (chargeId: string) => { success: boolean; action: 'archived' | 'deleted'; message: string };
  onAddChargeToQuote: (charge: EventCharge) => void;
  onSaveLocation: (locData: Partial<LocationVenue> & { venue: string; city: string }) => void;
  onDownloadRateCard: () => void;
  onOpenReminderSettings: () => void;
  onSwitchToCrewApp: () => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  initialSubTab = 'hub',
  enquiries,
  crewRoster,
  quotations,
  eventCharges,
  locations,
  events,
  metrics,
  onSaveEnquiry,
  onAddFollowUp,
  onConvertEnquiry,
  onCreateQuoteFromEnquiry,
  onSaveCrew,
  onOpenCreateQuote,
  onEditQuote,
  onUpdateQuoteStatus,
  onOpenQuotePreview,
  onSaveCharge,
  onDeleteCharge,
  onAddChargeToQuote,
  onSaveLocation,
  onDownloadRateCard,
  onOpenReminderSettings,
  onSwitchToCrewApp
}) => {
  const [currentTab, setCurrentTab] = useState<MoreSubTab>(initialSubTab);

  // If viewing a dedicated sub-tool
  if (currentTab === 'leads') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setCurrentTab('hub')}
          className="text-xs font-semibold text-[#C58B39] hover:underline flex items-center gap-1"
        >
          <span>← Back to More Hub</span>
        </button>
        <EnquiriesView
          enquiries={enquiries}
          onSaveEnquiry={onSaveEnquiry}
          onAddFollowUp={onAddFollowUp}
          onConvertEnquiry={onConvertEnquiry}
          onCreateQuoteFromEnquiry={onCreateQuoteFromEnquiry}
        />
      </div>
    );
  }

  if (currentTab === 'crew') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setCurrentTab('hub')}
          className="text-xs font-semibold text-[#C58B39] hover:underline flex items-center gap-1"
        >
          <span>← Back to More Hub</span>
        </button>
        <CrewManagementView
          crew={crewRoster}
          events={events}
          onSaveCrew={onSaveCrew}
        />
      </div>
    );
  }

  if (currentTab === 'quotes') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentTab('hub')}
            className="text-xs font-semibold text-[#C58B39] hover:underline flex items-center gap-1"
          >
            <span>← Back to More Hub</span>
          </button>
          
          <button
            onClick={() => setCurrentTab('rate-card')}
            className="text-xs font-semibold text-neutral-800 hover:text-black flex items-center gap-1"
          >
            <span>View Master Rate Card →</span>
          </button>
        </div>

        <QuotationsView
          quotations={quotations}
          onOpenCreateQuote={onOpenCreateQuote}
          onEditQuote={onEditQuote}
          onUpdateQuoteStatus={onUpdateQuoteStatus}
          onOpenPreview={onOpenQuotePreview}
        />
      </div>
    );
  }

  if (currentTab === 'rate-card') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentTab('hub')}
            className="text-xs font-semibold text-[#C58B39] hover:underline flex items-center gap-1"
          >
            <span>← Back to More Hub</span>
          </button>

          <button
            onClick={() => setCurrentTab('quotes')}
            className="text-xs font-semibold text-neutral-800 hover:text-black flex items-center gap-1"
          >
            <span>← View Quotations</span>
          </button>
        </div>

        <EventChargesView
          charges={eventCharges}
          onSaveCharge={onSaveCharge}
          onDeleteCharge={onDeleteCharge}
          onAddChargeToQuote={onAddChargeToQuote}
          onCreateCustomQuote={onOpenCreateQuote}
        />
      </div>
    );
  }

  if (currentTab === 'locations') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setCurrentTab('hub')}
          className="text-xs font-semibold text-[#C58B39] hover:underline flex items-center gap-1"
        >
          <span>← Back to More Hub</span>
        </button>
        <LocationsView
          locations={locations}
          onSaveLocation={onSaveLocation}
        />
      </div>
    );
  }

  // HUB / DIRECTORY VIEW:
  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="text-[11px] font-mono uppercase tracking-widest text-[#C58B39] font-semibold">
          System Modules & Administration
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-0.5 tracking-tight">
          Management Hub & Resources
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Master databases, CRM leads, creator roster, proposals catalogue, reports, and production preferences.
        </p>
      </div>

      {/* Primary Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Module 1: Leads / CRM */}
        <div 
          onClick={() => setCurrentTab('leads')}
          className="bg-white border border-[#E8E3D9] hover:border-[#C58B39] rounded-xl p-5 shadow-xs cursor-pointer transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#E8E3D9] flex items-center justify-center text-neutral-900 group-hover:bg-[#C58B39] group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-neutral-900 group-hover:text-[#C58B39] transition-colors">
              Leads / CRM
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Sales pipeline stages, enquiry tracking, client conversion, and follow-up reminders.
            </p>
          </div>

          <div className="pt-2 border-t border-[#F0EBE1] flex items-center justify-between text-xs font-medium text-neutral-600">
            <span>{enquiries.length} Inbound Leads</span>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Module 2: Crew Database */}
        <div 
          onClick={() => setCurrentTab('crew')}
          className="bg-white border border-[#E8E3D9] hover:border-[#C58B39] rounded-xl p-5 shadow-xs cursor-pointer transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#E8E3D9] flex items-center justify-center text-neutral-900 group-hover:bg-[#C58B39] group-hover:text-white transition-colors">
            <UserCheck className="w-5 h-5" />
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-neutral-900 group-hover:text-[#C58B39] transition-colors">
              Crew Database
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Creator roster, role specializations, daily rates, phone normalization, and availability status.
            </p>
          </div>

          <div className="pt-2 border-t border-[#F0EBE1] flex items-center justify-between text-xs font-medium text-neutral-600">
            <span>{crewRoster.length} Crew on Roster</span>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Module 3: Quotes & Estimates */}
        <div 
          onClick={() => setCurrentTab('quotes')}
          className="bg-white border border-[#E8E3D9] hover:border-[#C58B39] rounded-xl p-5 shadow-xs cursor-pointer transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#E8E3D9] flex items-center justify-center text-neutral-900 group-hover:bg-[#C58B39] group-hover:text-white transition-colors">
            <FileText className="w-5 h-5" />
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-neutral-900 group-hover:text-[#C58B39] transition-colors">
              Quotes & Proposals
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Custom quotation builder, automated calculations, client proposals, and printable PDFs.
            </p>
          </div>

          <div className="pt-2 border-t border-[#F0EBE1] flex items-center justify-between text-xs font-medium text-neutral-600">
            <span>{quotations.length} Quotations</span>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Module 4: Rate Card Catalogue */}
        <div 
          onClick={() => setCurrentTab('rate-card')}
          className="bg-white border border-[#E8E3D9] hover:border-[#C58B39] rounded-xl p-5 shadow-xs cursor-pointer transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#E8E3D9] flex items-center justify-center text-neutral-900 group-hover:bg-[#C58B39] group-hover:text-white transition-colors">
            <Layers className="w-5 h-5" />
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-neutral-900 group-hover:text-[#C58B39] transition-colors">
              Event Charges / Rate Card
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Master pricing catalogue for Wedding Day, Haldi, Mehendi, Drone, and Extra Creators.
            </p>
          </div>

          <div className="pt-2 border-t border-[#F0EBE1] flex items-center justify-between text-xs font-medium text-neutral-600">
            <span>{eventCharges.length} Master Packages</span>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Module 5: Venues & Locations */}
        <div 
          onClick={() => setCurrentTab('locations')}
          className="bg-white border border-[#E8E3D9] hover:border-[#C58B39] rounded-xl p-5 shadow-xs cursor-pointer transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#E8E3D9] flex items-center justify-center text-neutral-900 group-hover:bg-[#C58B39] group-hover:text-white transition-colors">
            <Building2 className="w-5 h-5" />
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-neutral-900 group-hover:text-[#C58B39] transition-colors">
              Venues & Locations
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Banquet maps, parking notes, drone clearance permissions, and manager contacts.
            </p>
          </div>

          <div className="pt-2 border-t border-[#F0EBE1] flex items-center justify-between text-xs font-medium text-neutral-600">
            <span>{locations.length} Venue Dossiers</span>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Module 6: Reports & Analytics */}
        <div 
          onClick={() => setCurrentTab('reports')}
          className="bg-white border border-[#E8E3D9] hover:border-[#C58B39] rounded-xl p-5 shadow-xs cursor-pointer transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#E8E3D9] flex items-center justify-center text-neutral-900 group-hover:bg-[#C58B39] group-hover:text-white transition-colors">
            <BarChart3 className="w-5 h-5" />
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-neutral-900 group-hover:text-[#C58B39] transition-colors">
              Reports & Analytics
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Commercial metrics, average booking ticket size, lead-to-shoot conversion, and creator load.
            </p>
          </div>

          <div className="pt-2 border-t border-[#F0EBE1] flex items-center justify-between text-xs font-medium text-neutral-600">
            <span>Executive Analytics</span>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Quick Settings & App Tools Panel */}
      <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-neutral-900">
          Production Utilities & Settings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          <button
            onClick={onOpenReminderSettings}
            className="p-3.5 rounded-xl border border-[#E8E3D9] bg-[#FAF8F5] hover:bg-white text-left transition-all space-y-1"
          >
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-[#C58B39]" />
              <span>WhatsApp Reminder Settings</span>
            </div>
            <p className="text-neutral-500 text-[11px]">
              Customize automated templates, tokens, and T-24h call alerts.
            </p>
          </button>

          <button
            onClick={onDownloadRateCard}
            className="p-3.5 rounded-xl border border-[#E8E3D9] bg-[#FAF8F5] hover:bg-white text-left transition-all space-y-1"
          >
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#C58B39]" />
              <span>Download Master Rate Card PDF</span>
            </div>
            <p className="text-neutral-500 text-[11px]">
              Generate official branded catalogue PDF for client dissemination.
            </p>
          </button>

          <button
            onClick={onSwitchToCrewApp}
            className="p-3.5 rounded-xl border border-[#E8E3D9] bg-[#FAF8F5] hover:bg-white text-left transition-all space-y-1"
          >
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#C58B39]" />
              <span>Launch Mobile Crew App View</span>
            </div>
            <p className="text-neutral-500 text-[11px]">
              Switch to dedicated mobile-first creator workspace & POV queue.
            </p>
          </button>

        </div>
      </div>

    </div>
  );
};
