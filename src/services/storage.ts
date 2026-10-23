import {
  EventCharge,
  Enquiry,
  Quotation,
  Client,
  EventShoot,
  PaymentRecord,
  DashboardMetrics,
  QuoteItem,
  CrewMember,
  CrewRole,
  LocationVenue,
  SubEvent,
  TimelineItem,
  POVItem,
  POVStatus,
  EventCrewAssignment,
  EventFile,
  EventStatus,
  EventDeliverable,
  CrewNotification,
  CrewReminderRecord,
  ReminderSettings,
  Expense,
  PlannerVendor,
  Partner,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  CompanySettings
} from '../types';

export interface UserSession {
  role: 'admin' | 'crew';
  name: string;
  email?: string;
  phone?: string;
  crewId?: string;
  authenticatedAt: string;
}
import {
  savePartnerToFirestore,
  deletePartnerFromFirestore,
  saveEventToFirestore,
  deleteEventFromFirestore
} from './firebase';
import { RealtimeSyncService, SyncCollection } from './realtimeSync';

export function normalizeIndianPhoneNumber(input: string): string {
  if (!input) return '';
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.slice(1)}`;
  }
  if (input.startsWith('+')) {
    return `+${digits}`;
  }
  return digits ? `+91${digits}` : '';
}

export function formatWhatsAppNumber(input: string): string {
  if (!input) return '';
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}

const STORAGE_KEYS = {
  EVENT_CHARGES: 'tmc_event_charges',
  ENQUIRIES: 'tmc_enquiries',
  QUOTATIONS: 'tmc_quotations',
  CLIENTS: 'tmc_clients',
  EVENTS: 'tmc_events_v2',
  PAYMENTS: 'tmc_payments',
  CREW_ROSTER: 'tmc_crew_roster_v2',
  LOCATIONS: 'tmc_locations',
  NOTIFICATIONS: 'tmc_notifications_v1',
  REMINDER_SETTINGS: 'tmc_reminder_settings_v1',
  ACTIVE_CREW_ID: 'tmc_active_crew_id_v1',
  APP_VIEW_MODE: 'tmc_app_view_mode_v1',
  EXPENSES: 'tmc_expenses_v2',
  PLANNERS: 'tmc_planners_v1',
  PARTNERS: 'tmc_partners_v1',
  INVOICES: 'tmc_invoices_v1',
  COMPANY_SETTINGS: 'tmc_company_settings_v1',
  AUTH_USER_SESSION: 'tmc_auth_user_session_v1',
};

const DEFAULT_EVENT_CHARGES: EventCharge[] = [
  {
    id: 'chg-wedding-day',
    name: 'Wedding',
    category: 'Wedding Day',
    description: 'Comprehensive royal wedding day storytelling capturing all sacred moments and unfiltered joy.',
    price: 50000,
    duration: '8 Hours',
    crewRequirement: '2 Content Creators',
    includedServices: [
      'Bride POV',
      'Groom POV',
      'Couple POV',
      'Rituals & Mandap',
      'Family',
      'Guests',
      'Decor & Venue',
      '5 Edited Reels'
    ],
    optionalAddOns: [
      'Drone coverage',
      'Same day edit',
      'Extra hour coverage'
    ],
    notes: 'Shot exclusively on flagship iPhone 16 Pro Max 4K ProRes with premium mobile stabilization and wireless lavalier audio.',
    status: 'Active',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z'
  },
  {
    id: 'chg-haldi',
    name: 'Haldi Ceremony',
    category: 'Pre-Wedding Rituals',
    description: 'Vibrant, sun-drenched coverage of yellow turmeric rituals, water splashes, and candid family laughter.',
    price: 8000,
    duration: '4 Hours',
    crewRequirement: '1 Content Creator',
    includedServices: [
      'Floral Shower Moments',
      'Turmeric Application',
      'Unfiltered Candids',
      'Decor & Setup',
      '2 Curated 9:16 Reels',
      'All Raw Uncut Clips'
    ],
    optionalAddOns: ['Extra Creator', 'Slow-Mo Water Canon Edit'],
    notes: 'Waterproof protective gear used during heavy water & phoolon ki holi celebrations.',
    status: 'Active',
    createdAt: '2026-01-11T11:00:00.000Z',
    updatedAt: '2026-01-11T11:00:00.000Z'
  },
  {
    id: 'chg-mehendi',
    name: 'Mehendi Soirée',
    category: 'Pre-Wedding Rituals',
    description: 'Intimate Henna artistry, bridal details, folk singing, and candid interactions with besties.',
    price: 10000,
    duration: '5 Hours',
    crewRequirement: '1 Content Creator',
    includedServices: [
      'Bridal Henna Details',
      'Close-up Jewelry & Outfit',
      'Bridesmaids Moments',
      'Folk Dance & Sing-along',
      '2 Aesthetic Reels',
      'Raw AirDrop Delivery'
    ],
    optionalAddOns: ['Extra Hour', 'Drone Shots of Venue Lawn'],
    notes: 'Includes macro detail shots of personalized hidden bridal initials in mehendi.',
    status: 'Active',
    createdAt: '2026-01-12T12:00:00.000Z',
    updatedAt: '2026-01-12T12:00:00.000Z'
  },
  {
    id: 'chg-sangeet',
    name: 'Sangeet Gala',
    category: 'Pre-Wedding Rituals',
    description: 'High energy dance performances, stage lighting, DJ party madness, and backstage banter.',
    price: 18000,
    duration: '6 Hours',
    crewRequirement: '2 Content Creators',
    includedServices: [
      'Stage Dance POV',
      'Backstage Rehearsals',
      'Glamour Outfit Reveals',
      'DJ Floor Energy',
      '3 High-Beat Reels',
      'Crowd Reaction Snippets'
    ],
    optionalAddOns: ['Same Night Viral Reel Drop', 'Guest Micro-Interviews'],
    notes: 'Equipped with low-light stabilized lenses and wireless mics for crisp audio during speeches.',
    status: 'Active',
    createdAt: '2026-01-13T13:00:00.000Z',
    updatedAt: '2026-01-13T13:00:00.000Z'
  },
  {
    id: 'chg-reception',
    name: 'Reception Evening',
    category: 'Wedding Day',
    description: 'Glamorous evening celebration, grand royal entrance, champagne toasts, and family portraits.',
    price: 20000,
    duration: '6 Hours',
    crewRequirement: '2 Content Creators',
    includedServices: [
      'Grand Stage Entrance',
      'Couple Portraits & Stage Speeches',
      'Family & VIP Greetings',
      'Cake Cutting & Toast',
      '3 Polished Reels',
      'Full Raw Footage Drive'
    ],
    optionalAddOns: ['Drone Entrance Track', 'Next-Morning Instagram Delivery'],
    notes: 'Tailored for luxury ballroom and palace lighting conditions.',
    status: 'Active',
    createdAt: '2026-01-14T14:00:00.000Z',
    updatedAt: '2026-01-14T14:00:00.000Z'
  },
  {
    id: 'chg-engagement',
    name: 'Engagement & Roka',
    category: 'Pre-Wedding Rituals',
    description: 'Romantic ring exchange ceremony, warm family blessings, and intimate couple editorial.',
    price: 12000,
    duration: '5 Hours',
    crewRequirement: '1 Content Creator',
    includedServices: [
      'Ring Exchange POV',
      'Couple Editorial Session',
      'Family Congratulations',
      'Decor & Ambient Setting',
      '2 Elegant Reels',
      'Raw Footage Library'
    ],
    optionalAddOns: ['Second Creator', 'Drone Ring Reveal'],
    notes: 'Focus on emotive expressions and jewelry detail shots.',
    status: 'Active',
    createdAt: '2026-01-15T15:00:00.000Z',
    updatedAt: '2026-01-15T15:00:00.000Z'
  },
  {
    id: 'chg-drone',
    name: 'Aerial Drone Coverage',
    category: 'Add-ons & Gear',
    description: 'High-definition 4K aerial shots of wedding palaces, baraat processions, and outdoor setups.',
    price: 5000,
    duration: '4 Hours',
    crewRequirement: '1 Certified Drone Pilot',
    includedServices: [
      'Palace & Venue Bird’s Eye',
      'Grand Baraat Procession from Above',
      'Outdoor Mandap Establishing Views'
    ],
    optionalAddOns: ['Sunset Twilight Orbit'],
    notes: 'Subject to DGCA airspace permissions and clear weather.',
    status: 'Active',
    createdAt: '2026-01-17T17:00:00.000Z',
    updatedAt: '2026-01-17T17:00:00.000Z'
  },
  {
    id: 'chg-same-day-edit',
    name: 'Same Day Reel Edit',
    category: 'Add-ons & Gear',
    description: 'Ultra-fast on-site editing delivered within 3-4 hours for immediate viral social sharing.',
    price: 4500,
    duration: 'On-site Turnaround',
    crewRequirement: '1 Dedicated Mobile Editor',
    includedServices: [
      'Instant Ingest & Color Grade',
      'Trending Audio Synced Cut',
      'Delivered Ready to Post by Reception'
    ],
    optionalAddOns: [],
    notes: 'Guaranteed delivery before midnight of shoot day for maximum reach.',
    status: 'Active',
    createdAt: '2026-01-20T20:00:00.000Z',
    updatedAt: '2026-01-20T20:00:00.000Z'
  }
];

const DEFAULT_CREW_ROSTER: CrewMember[] = [];

const DEFAULT_LOCATIONS: LocationVenue[] = [
  {
    id: 'loc-001',
    venue: 'Taj Lake Palace',
    address: 'Pichola, P.O. Box No. 5',
    city: 'Udaipur, Rajasthan',
    googleMapsLink: 'https://maps.google.com/?q=Taj+Lake+Palace+Udaipur',
    contactPerson: 'Mr. Vikram Rathore (Banquet Manager)',
    phone: '+91 294 242 8800',
    parking: 'Jetty parking at Rameshwar Ghat with boat valet',
    accessInstructions: 'Crew must board Jetty boat at Rameshwar Ghat by 08:30 AM with equipment flight cases.',
    notes: 'Drone flights require prior palace security gate pass.'
  },
  {
    id: 'loc-002',
    venue: 'ITC Grand Bharat',
    address: 'P.O. Hasanpur, Tauru, Mewat',
    city: 'Manesar, Gurugram, Delhi NCR',
    googleMapsLink: 'https://maps.google.com/?q=ITC+Grand+Bharat+Manesar',
    contactPerson: 'Ms. Shalini Gupta (Events Head)',
    phone: '+91 1267 285 500',
    parking: 'Dedicated production vendor parking at Gate 3',
    accessInstructions: 'Vendor loading dock at Service Basement 2. Elevators direct to Ballroom foyer.',
    notes: 'Golf cart access available for sprawling lawn shoots.'
  },
  {
    id: 'loc-003',
    venue: 'The Tamara Coorg',
    address: 'Kabbinakad Estate, Yevakapadi',
    city: 'Coorg, Karnataka',
    googleMapsLink: 'https://maps.google.com/?q=The+Tamara+Coorg',
    contactPerson: 'Rajesh Muthappa',
    phone: '+91 8272 260 000',
    parking: 'Main resort entrance parking',
    accessInstructions: '4x4 resort buggies transfer crew to plantation cottages.',
    notes: 'Eco-sensitive zone: low noise levels after 10 PM.'
  },
  {
    id: 'loc-004',
    venue: 'Fairmont Jaipur',
    address: '2, Riico, Kukas',
    city: 'Jaipur, Rajasthan',
    googleMapsLink: 'https://maps.google.com/?q=Fairmont+Jaipur',
    contactPerson: 'Aditya Mathur',
    phone: '+91 141 665 5400',
    parking: 'Ample palace forecourt and valet parking',
    accessInstructions: 'Grand central courtyard for royal Baraat shoots.',
    notes: 'Magnificent rooftop sunset vistas for couple editorial.'
  }
];

const DEFAULT_CLIENTS: Client[] = [];

const DEFAULT_EVENTS: EventShoot[] = [];

const DEFAULT_PAYMENTS: PaymentRecord[] = [];

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'The Main Character Media',
  tagline: 'Luxury Wedding & Celebration Content Creation',
  logoUrl: '',
  phone: '+91 98200 12345',
  whatsapp: '+91 98200 12345',
  email: 'hello@themaincharactermedia.com',
  website: 'www.themaincharactermedia.com',
  address: 'Studio 402, Pali Hill, Bandra West',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400050',
  gstin: '27AABCT1234F1Z5',
  bankName: 'HDFC Bank',
  accountName: 'The Main Character Media',
  accountNumber: '50200088912344',
  ifscCode: 'HDFC0000045',
  branch: 'Bandra West, Mumbai',
  upiId: 'tmcmedia@hdfcbank',
  upiQrUrl: '',
  signatureUrl: '',
  signatoryName: 'Authorized Signatory',
  signatoryTitle: 'Creative Producer & Founder',
  defaultAdvancePercentage: 50,
  defaultValidityDays: 15,
  defaultTerms: `1. 50% advance booking deposit required to lock team & equipment on the roster.
2. Remaining 50% balance payable on or before event day prior to final footage handover.
3. Raw uncut 4K footage transferred on-site via AirDrop / fast portable SSD at the end of each function.
4. Curated, color-graded 9:16 high-definition reels delivered within 5-7 working days.
5. Outstation Travel & Stay: Flight/rail tickets and hotel accommodations to be arranged by the client.`,
  defaultCommercialNotes: `Capture formatted exclusively for 9:16 social storytelling with high-bitrate audio and wireless lavalier microphones.`
};

const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  reminder24hEnabled: true,
  reminder2hEnabled: false,
  defaultTemplate: `Hi {CREW_NAME},

Reminder for your upcoming shoot:

{EVENT_NAME} {EVENT_TYPE}

Date:
{EVENT_DATE}

Call Time:
{CALL_TIME}

Venue:
{VENUE}

Role:
{ROLE}

Map & Directions:
{MAP_LINK}

Please reach 15 minutes before call time with full battery packs & formatted SD cards.

— The Main Character Media`
};

const DEFAULT_NOTIFICATIONS: CrewNotification[] = [];

const DEFAULT_EXPENSES: Expense[] = [];

const DEFAULT_PLANNERS: PlannerVendor[] = [];

const DEFAULT_INVOICES: Invoice[] = [];

export class StorageService {
  private static notifyListeners() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tmc_storage_updated'));
    }
  }

  public static persistAndSync<T extends { id?: string }>(
    col: SyncCollection,
    storageKey: string,
    items: T[],
    changedItem?: T | null,
    removedId?: string
  ) {
    localStorage.setItem(storageKey, JSON.stringify(items));
    if (removedId) {
      RealtimeSyncService.removeItem(col, removedId);
    } else if (changedItem) {
      RealtimeSyncService.saveItem(col, changedItem);
    } else {
      RealtimeSyncService.syncAllItems(col, items);
    }
    this.notifyListeners();
  }

  static initialize(): void {
    if (typeof window === 'undefined') return;

    // Connect and initialize Firebase Realtime Database live sync
    RealtimeSyncService.initialize();

    // Completely wipe all mock/dummy records (events, payments, crew payouts, clients, etc.)
    const mockDataPurgedV13 = localStorage.getItem('tmc_purge_all_mock_data_v13');
    if (!mockDataPurgedV13) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PLANNERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CREW_ROSTER, JSON.stringify([]));
      localStorage.setItem('tmc_purge_all_mock_data_v13', 'true');
    }

    if (!localStorage.getItem(STORAGE_KEYS.EVENT_CHARGES)) {
      localStorage.setItem(STORAGE_KEYS.EVENT_CHARGES, JSON.stringify(DEFAULT_EVENT_CHARGES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CREW_ROSTER)) {
      localStorage.setItem(STORAGE_KEYS.CREW_ROSTER, JSON.stringify(DEFAULT_CREW_ROSTER));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(DEFAULT_LOCATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REMINDER_SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.REMINDER_SETTINGS, JSON.stringify(DEFAULT_REMINDER_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PLANNERS)) {
      localStorage.setItem(STORAGE_KEYS.PLANNERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PARTNERS)) {
      localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_CREW_ID)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CREW_ID, '');
    }
    if (!localStorage.getItem(STORAGE_KEYS.APP_VIEW_MODE)) {
      localStorage.setItem(STORAGE_KEYS.APP_VIEW_MODE, 'admin');
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMPANY_SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.COMPANY_SETTINGS, JSON.stringify(DEFAULT_COMPANY_SETTINGS));
    }
  }

  // --- CREW ROSTER & CONFLICT DETECTOR ---
  static getCrewRoster(): CrewMember[] {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CREW_ROSTER);
      return data ? JSON.parse(data) : DEFAULT_CREW_ROSTER;
    } catch {
      return DEFAULT_CREW_ROSTER;
    }
  }

  static saveCrewMember(crewData: Partial<CrewMember> & { name: string; phone: string; role: CrewRole }): CrewMember {
    const roster = this.getCrewRoster();
    const now = new Date().toISOString();
    const normalizedPhone = normalizeIndianPhoneNumber(crewData.phone);

    if (crewData.id) {
      const idx = roster.findIndex(c => c.id === crewData.id);
      if (idx !== -1) {
        roster[idx] = {
          ...roster[idx],
          ...crewData,
          phone: normalizedPhone,
          updatedAt: now
        } as CrewMember;
        localStorage.setItem(STORAGE_KEYS.CREW_ROSTER, JSON.stringify(roster));
        this.notifyListeners();
        return roster[idx];
      }
    }

    const newCrew: CrewMember = {
      id: crewData.id || `cr-${Date.now()}`,
      name: crewData.name.trim(),
      photo: crewData.photo,
      phone: normalizedPhone,
      email: crewData.email ? crewData.email.trim() : '',
      role: crewData.role || 'Content Creator',
      specialization: crewData.specialization || 'Mobile Videography & Reels',
      experience: crewData.experience || '3 Years',
      defaultPayout: Number(crewData.defaultPayout) || 5000,
      availability: crewData.availability || 'Available',
      status: crewData.status || 'Active',
      username: crewData.username || crewData.name.toLowerCase().replace(/\s+/g, '_'),
      password: crewData.password || '',
      firebaseUid: crewData.firebaseUid || undefined,
      notes: crewData.notes || '',
      createdAt: now,
      updatedAt: now
    };

    roster.unshift(newCrew);
    this.persistAndSync('crew', STORAGE_KEYS.CREW_ROSTER, roster, newCrew);
    return newCrew;
  }

  static updateCrewMember(crewId: string, updates: Partial<CrewMember>): CrewMember | null {
    const roster = this.getCrewRoster();
    const idx = roster.findIndex(c => c.id === crewId);
    if (idx === -1) return null;
    const updated = {
      ...roster[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    roster[idx] = updated;
    this.persistAndSync('crew', STORAGE_KEYS.CREW_ROSTER, roster, updated);
    return updated;
  }

  static deleteCrewMember(crewId: string): boolean {
    const roster = this.getCrewRoster();
    const updated = roster.filter(c => c.id !== crewId);
    if (updated.length !== roster.length) {
      this.persistAndSync('crew', STORAGE_KEYS.CREW_ROSTER, updated, null, crewId);
      return true;
    }
    return false;
  }

  /**
   * Conflict Detector: Checks if a crew member is already booked on a particular date.
   */
  static checkCrewConflict(crewId: string, shootDate: string, currentEventId?: string): { hasConflict: boolean; conflictingEvent?: EventShoot } {
    const events = this.getEvents();
    const conflicting = events.find(ev => {
      if (ev.status === 'Cancelled' || ev.status === 'Archived') return false;
      if (currentEventId && ev.id === currentEventId) return false;

      // Check if dates overlap (startDate to endDate or exact date match)
      const eventStart = ev.startDate || (ev as any).shootDate;
      const eventEnd = ev.endDate || eventStart;

      const dateMatches = (shootDate >= eventStart && shootDate <= eventEnd);
      if (!dateMatches) return false;

      // Check if assigned
      const isAssigned = ev.crewAssignments && ev.crewAssignments.some(a => a.crewId === crewId);
      const isNamed = ev.crewMembers && ev.crewMembers.includes(this.getCrewRoster().find(c => c.id === crewId)?.name || '');
      return isAssigned || isNamed;
    });

    if (conflicting) {
      return { hasConflict: true, conflictingEvent: conflicting };
    }
    return { hasConflict: false };
  }

  // --- LOCATIONS & VENUES ---
  static getLocations(): LocationVenue[] {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
      return data ? JSON.parse(data) : DEFAULT_LOCATIONS;
    } catch {
      return DEFAULT_LOCATIONS;
    }
  }

  static saveLocation(locData: Partial<LocationVenue> & { venue: string; city: string }): LocationVenue {
    const locations = this.getLocations();
    const now = new Date().toISOString();

    if (locData.id) {
      const idx = locations.findIndex(l => l.id === locData.id);
      if (idx !== -1) {
        locations[idx] = {
          ...locations[idx],
          ...locData,
          updatedAt: now
        } as LocationVenue;
        localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
        this.notifyListeners();
        return locations[idx];
      }
    }

    const newLoc: LocationVenue = {
      id: `loc-${Date.now()}`,
      venue: locData.venue.trim(),
      address: locData.address || '',
      city: locData.city.trim(),
      googleMapsLink: locData.googleMapsLink || '',
      contactPerson: locData.contactPerson || '',
      phone: locData.phone ? normalizeIndianPhoneNumber(locData.phone) : '',
      parking: locData.parking || '',
      accessInstructions: locData.accessInstructions || '',
      notes: locData.notes || '',
      createdAt: now,
      updatedAt: now
    };

    locations.unshift(newLoc);
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    this.notifyListeners();
    return newLoc;
  }

  // --- EVENTS & COMMAND CENTER ---
  static getEvents(): EventShoot[] {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      const events: EventShoot[] = data ? JSON.parse(data) : DEFAULT_EVENTS;
      return events.filter(e => 
        e.clientName !== 'hello' && 
        e.clientName !== 'Preeti & Karan' && 
        e.clientName !== 'lakshya' &&
        e.eventName !== 'wedding' &&
        e.eventName !== 'Wedding & Reception' &&
        e.eventName !== 'kanak and vishal'
      );
    } catch {
      return DEFAULT_EVENTS;
    }
  }

  static getEventById(eventId: string): EventShoot | null {
    const events = this.getEvents();
    return events.find(e => e.id === eventId) || null;
  }

  static saveEvent(eventData: Partial<EventShoot> & { eventName: string; clientName: string }): EventShoot {
    const events = this.getEvents();
    const now = new Date().toISOString();

    if (eventData.id) {
      const idx = events.findIndex(e => e.id === eventData.id);
      if (idx !== -1) {
        const existing = events[idx];
        const existingCrewIds = new Set((existing.crewAssignments || []).map(a => a.crewId));
        
        const mergedAssignments = eventData.crewAssignments || existing.crewAssignments || [];
        const mergedCrewMembers = eventData.crewMembers && eventData.crewMembers.length > 0
          ? eventData.crewMembers
          : mergedAssignments.map(a => a.crewName);

        const updated: EventShoot = {
          ...existing,
          ...eventData,
          crewMembers: mergedCrewMembers,
          crewAssignments: mergedAssignments,
          crewPayout: mergedAssignments.length > 0 
            ? mergedAssignments.reduce((sum, a) => sum + (a.payout || 0), 0)
            : (eventData.crewPayout !== undefined ? Number(eventData.crewPayout) : existing.crewPayout),
          updatedAt: now
        };
        events[idx] = updated;
        this.persistEvents(events, updated);

        // Notify any newly assigned crew members
        mergedAssignments.forEach(asg => {
          if (!existingCrewIds.has(asg.crewId)) {
            this.addCrewNotification({
              crewId: asg.crewId,
              title: 'New Shoot Assignment 🎬',
              message: `You've been assigned to "${updated.eventName}" on ${updated.startDate} at ${updated.venue || 'TBD'}. Call time: ${asg.callTime}.`,
              type: 'shoot_assigned',
              eventId: updated.id
            });
          }
        });

        this.notifyListeners();
        return updated;
      }
    }

    const startDate = eventData.startDate || (eventData as any).shootDate || new Date().toISOString().split('T')[0];
    const endDate = eventData.endDate || startDate;
    const packageTotal = Number(eventData.packageTotal) || 35000;
    const advancePaid = Number(eventData.advancePaid) || 0;
    const balanceDue = Math.max(0, packageTotal - advancePaid);

    const initialAssignments = eventData.crewAssignments || [];
    const initialCrewMembers = eventData.crewMembers && eventData.crewMembers.length > 0
      ? eventData.crewMembers
      : initialAssignments.map(a => a.crewName);

    const initialCrewPayout = initialAssignments.length > 0
      ? initialAssignments.reduce((sum, a) => sum + (a.payout || 0), 0)
      : (Number(eventData.crewPayout) || 12000);

    const newEvent: EventShoot = {
      id: `evt-${Date.now()}`,
      clientId: eventData.clientId || `cli-${Date.now()}`,
      clientName: eventData.clientName.trim(),
      clientContact: eventData.clientContact || {
        phone: '',
        email: ''
      },
      enquiryId: eventData.enquiryId,
      quoteId: eventData.quoteId,
      eventName: eventData.eventName.trim(),
      eventType: eventData.eventType || 'Wedding',
      startDate,
      endDate,
      venue: eventData.venue || 'TBD Venue',
      locationId: eventData.locationId,
      locationCity: eventData.locationCity || 'Mumbai',
      status: eventData.status || 'Confirmed',
      notes: eventData.notes || '',
      consentUsageNotes: eventData.consentUsageNotes || 'Standard Social Media Usage',
      leadCreator: eventData.leadCreator || (initialCrewMembers[0] || ''),
      crewMembers: initialCrewMembers,
      crewAssignments: initialAssignments,
      subEvents: eventData.subEvents || [
        {
          id: `sub-${Date.now()}-1`,
          eventId: `evt-${Date.now()}`,
          name: 'Main Ceremony & Wedding',
          date: startDate,
          startTime: '04:00 PM',
          endTime: '11:00 PM',
          venue: eventData.venue || 'Main Venue',
          description: 'Ceremonial rituals and couple portraits.',
          status: 'Scheduled',
          assignedCrewIds: initialAssignments.map(a => a.crewId),
          notes: '',
          createdAt: now,
          updatedAt: now
        }
      ],
      timeline: eventData.timeline || [
        {
          id: `tl-${Date.now()}-1`,
          eventId: `evt-${Date.now()}`,
          time: '03:00 PM',
          title: 'Crew Call & Rig Setup',
          venue: eventData.venue || 'Main Venue',
          assignedCrewIds: initialAssignments.map(a => a.crewId),
          priority: 'High',
          completed: false
        }
      ],
      povs: eventData.povs || [
        {
          id: `pov-${Date.now()}-1`,
          eventId: `evt-${Date.now()}`,
          type: 'Bride POV',
          description: 'Bride getting ready and final lehenga reveal.',
          priority: 'Urgent',
          status: 'Pending'
        },
        {
          id: `pov-${Date.now()}-2`,
          eventId: `evt-${Date.now()}`,
          type: 'Couple POV',
          description: 'Mandap sacred moments and varmala exchange.',
          priority: 'Urgent',
          status: 'Pending'
        }
      ],
      files: eventData.files || [],
      activityLog: [
        {
          id: `act-${Date.now()}`,
          eventId: `evt-${Date.now()}`,
          action: 'Event Created',
          details: `Event created for ${eventData.clientName}${initialAssignments.length > 0 ? ` with ${initialAssignments.length} crew deployed` : ''}.`,
          performedBy: 'Admin',
          timestamp: now
        }
      ],
      crewPayout: initialCrewPayout,
      packageTotal,
      advancePaid,
      balanceDue,
      deliverables: eventData.deliverables || [
        { id: `del-${Date.now()}-1`, title: 'Full 4K Uncut ProRes Raw Drive', completed: false },
        { id: `del-${Date.now()}-2`, title: 'Key Highlight Reel (9:16)', completed: false }
      ],
      createdAt: now,
      updatedAt: now
    };

    events.unshift(newEvent);
    this.persistEvents(events, newEvent);

    // Notify all assigned crew members immediately
    initialAssignments.forEach(asg => {
      this.addCrewNotification({
        crewId: asg.crewId,
        title: 'New Shoot Assignment 🎬',
        message: `You've been assigned to "${newEvent.eventName}" on ${newEvent.startDate} at ${newEvent.venue}. Call time: ${asg.callTime}.`,
        type: 'shoot_assigned',
        eventId: newEvent.id
      });
    });

    return newEvent;
  }

  public static persistEvents(events: EventShoot[], modifiedEvent?: EventShoot, deletedEventId?: string) {
    if (deletedEventId) {
      this.persistAndSync('events', STORAGE_KEYS.EVENTS, events, null, deletedEventId);
      deleteEventFromFirestore(deletedEventId).catch(() => {});
    } else if (modifiedEvent) {
      this.persistAndSync('events', STORAGE_KEYS.EVENTS, events, modifiedEvent);
      saveEventToFirestore(modifiedEvent).catch(() => {});
    } else {
      this.persistAndSync('events', STORAGE_KEYS.EVENTS, events);
    }
  }

  static updateEvent(eventId: string, updates: Partial<EventShoot>): EventShoot | null {
    const events = this.getEvents();
    const idx = events.findIndex(e => e.id === eventId);
    if (idx === -1) return null;
    const updated = {
      ...events[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    events[idx] = updated;
    this.persistEvents(events, updated);
    return updated;
  }

  static deleteEvent(eventId: string): boolean {
    const events = this.getEvents();
    const filtered = events.filter(e => e.id !== eventId);
    if (filtered.length !== events.length) {
      this.persistEvents(filtered, undefined, eventId);
      return true;
    }
    return false;
  }

  // Sub-Events Management
  static addSubEvent(eventId: string, subEvent: Omit<SubEvent, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>): SubEvent | null {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return null;

    const now = new Date().toISOString();
    const newSub: SubEvent = {
      id: `sub-${Date.now()}`,
      eventId,
      ...subEvent,
      createdAt: now,
      updatedAt: now
    };

    if (!event.subEvents) event.subEvents = [];
    event.subEvents.push(newSub);
    
    // Log activity
    if (!event.activityLog) event.activityLog = [];
    event.activityLog.unshift({
      id: `act-${Date.now()}`,
      eventId,
      action: 'Sub-Event Added',
      details: `Added sub-event "${subEvent.name}" on ${subEvent.date}.`,
      performedBy: 'Admin',
      timestamp: now
    });

    event.updatedAt = now;
    this.persistEvents(events, event);
    return newSub;
  }

  static updateSubEvent(eventId: string, subEventId: string, updates: Partial<SubEvent>): SubEvent | null {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event || !event.subEvents) return null;

    const idx = event.subEvents.findIndex(s => s.id === subEventId);
    if (idx === -1) return null;

    const updated = {
      ...event.subEvents[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    event.subEvents[idx] = updated;
    event.updatedAt = new Date().toISOString();
    this.persistEvents(events, event);
    return updated;
  }

  static deleteSubEvent(eventId: string, subEventId: string): boolean {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event || !event.subEvents) return false;

    const initialLen = event.subEvents.length;
    event.subEvents = event.subEvents.filter(s => s.id !== subEventId);
    if (event.subEvents.length !== initialLen) {
      event.updatedAt = new Date().toISOString();
      this.persistEvents(events, event);
      return true;
    }
    return false;
  }

  // Timeline Item Management
  static addTimelineItem(eventId: string, item: Omit<TimelineItem, 'id' | 'eventId'>): TimelineItem | null {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return null;

    const newItem: TimelineItem = {
      id: `tl-${Date.now()}`,
      eventId,
      ...item
    };

    if (!event.timeline) event.timeline = [];
    event.timeline.push(newItem);
    event.updatedAt = new Date().toISOString();
    this.persistEvents(events, event);
    return newItem;
  }

  static updateTimelineItem(eventId: string, timelineId: string, updates: Partial<TimelineItem>): TimelineItem | null {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event || !event.timeline) return null;

    const idx = event.timeline.findIndex(t => t.id === timelineId);
    if (idx === -1) return null;

    event.timeline[idx] = { ...event.timeline[idx], ...updates };
    event.updatedAt = new Date().toISOString();
    this.persistEvents(events, event);
    return event.timeline[idx];
  }

  static deleteTimelineItem(eventId: string, timelineId: string): boolean {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event || !event.timeline) return false;

    const initialLen = event.timeline.length;
    event.timeline = event.timeline.filter(t => t.id !== timelineId);
    if (event.timeline.length !== initialLen) {
      event.updatedAt = new Date().toISOString();
      this.persistEvents(events, event);
      return true;
    }
    return false;
  }

  // POV Management
  static addPOVItem(eventId: string, pov: Omit<POVItem, 'id' | 'eventId'>): POVItem | null {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return null;

    const newPOV: POVItem = {
      id: `pov-${Date.now()}`,
      eventId,
      ...pov
    };

    if (!event.povs) event.povs = [];
    event.povs.push(newPOV);
    event.updatedAt = new Date().toISOString();
    this.persistEvents(events, event);
    return newPOV;
  }

  static updatePOVItem(eventId: string, povId: string, updates: Partial<POVItem>): POVItem | null {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event || !event.povs) return null;

    const idx = event.povs.findIndex(p => p.id === povId);
    if (idx === -1) return null;

    event.povs[idx] = { ...event.povs[idx], ...updates };
    event.updatedAt = new Date().toISOString();
    this.persistEvents(events, event);
    return event.povs[idx];
  }

  static deletePOVItem(eventId: string, povId: string): boolean {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event || !event.povs) return false;

    const initialLen = event.povs.length;
    event.povs = event.povs.filter(p => p.id !== povId);
    if (event.povs.length !== initialLen) {
      event.updatedAt = new Date().toISOString();
      this.persistEvents(events, event);
      return true;
    }
    return false;
  }

  // Crew Assignment Management
  static assignCrewToEvent(eventId: string, assignment: Omit<EventCrewAssignment, 'id' | 'eventId' | 'createdAt'>): EventCrewAssignment | null {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return null;

    const now = new Date().toISOString();
    const newAssignment: EventCrewAssignment = {
      id: `asg-${Date.now()}`,
      eventId,
      ...assignment,
      createdAt: now
    };

    if (!event.crewAssignments) event.crewAssignments = [];
    // Remove if already assigned to replace
    event.crewAssignments = event.crewAssignments.filter(a => a.crewId !== assignment.crewId);
    event.crewAssignments.push(newAssignment);

    if (!event.crewMembers.includes(assignment.crewName)) {
      event.crewMembers.push(assignment.crewName);
    }

    // Recalculate total crew payout
    event.crewPayout = event.crewAssignments.reduce((acc, curr) => acc + (curr.payout || 0), 0);

    // Activity Log
    if (!event.activityLog) event.activityLog = [];
    event.activityLog.unshift({
      id: `act-${Date.now()}`,
      eventId,
      action: 'Crew Assigned',
      details: `Assigned ${assignment.crewName} (${assignment.role}) with payout ₹${assignment.payout.toLocaleString('en-IN')}.`,
      performedBy: 'Admin',
      timestamp: now
    });

    event.updatedAt = now;
    this.persistEvents(events, event);

    this.addCrewNotification({
      crewId: assignment.crewId,
      title: 'New Shoot Assignment 🎬',
      message: `You've been assigned to "${event.eventName}" on ${event.startDate || (event as any).shootDate} at ${event.venue || 'TBD'}. Call time: ${assignment.callTime}.`,
      type: 'shoot_assigned',
      eventId: event.id
    });

    return newAssignment;
  }

  static assignMultipleCrewToEvent(
    eventId: string,
    assignments: Omit<EventCrewAssignment, 'id' | 'eventId' | 'createdAt'>[]
  ): EventCrewAssignment[] {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event || assignments.length === 0) return [];

    const now = new Date().toISOString();
    if (!event.crewAssignments) event.crewAssignments = [];
    if (!event.crewMembers) event.crewMembers = [];
    if (!event.activityLog) event.activityLog = [];

    const results: EventCrewAssignment[] = [];

    for (const assignment of assignments) {
      const newAssignment: EventCrewAssignment = {
        id: `asg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        eventId,
        ...assignment,
        paymentStatus: assignment.paymentStatus || 'Unpaid',
        createdAt: now
      };

      event.crewAssignments = event.crewAssignments.filter(a => a.crewId !== assignment.crewId);
      event.crewAssignments.push(newAssignment);
      results.push(newAssignment);

      if (!event.crewMembers.includes(assignment.crewName)) {
        event.crewMembers.push(assignment.crewName);
      }

      this.addCrewNotification({
        crewId: assignment.crewId,
        title: 'New Shoot Assignment 🎬',
        message: `You've been assigned to "${event.eventName}" on ${event.startDate || (event as any).shootDate} at ${event.venue || 'TBD'}. Call time: ${assignment.callTime}.`,
        type: 'shoot_assigned',
        eventId: event.id
      });
    }

    event.crewPayout = event.crewAssignments.reduce((acc, curr) => acc + (curr.payout || 0), 0);

    event.activityLog.unshift({
      id: `act-${Date.now()}`,
      eventId,
      action: 'Crew Assigned',
      details: `Batch assigned ${assignments.map(a => `${a.crewName} (${a.role})`).join(', ')}.`,
      performedBy: 'Admin',
      timestamp: now
    });

    event.updatedAt = now;
    this.persistEvents(events, event);
    return results;
  }

  static updateCrewAssignmentPaymentStatus(
    eventId: string,
    crewId: string,
    paymentStatus: 'Paid' | 'Unpaid'
  ): boolean {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return false;

    if (!event.crewAssignments) {
      event.crewAssignments = [];
    }

    const assignment = event.crewAssignments.find(a => a.crewId === crewId);
    if (assignment) {
      assignment.paymentStatus = paymentStatus;
      if (paymentStatus === 'Paid') {
        assignment.paidAt = new Date().toISOString();
      } else {
        delete assignment.paidAt;
      }
    } else {
      const crewRoster = this.getCrewRoster();
      const crewMember = crewRoster.find(c => c.id === crewId || c.name === crewId);
      event.crewAssignments.push({
        id: `asg-${Date.now()}`,
        eventId,
        crewId: crewMember ? crewMember.id : crewId,
        crewName: crewMember ? crewMember.name : crewId,
        role: crewMember ? crewMember.role : 'Content Creator',
        callTime: '08:00 AM',
        wrapTime: '11:00 PM',
        payout: crewMember ? crewMember.defaultPayout : 6000,
        assignedSubEventIds: [],
        assignedPOVIds: [],
        paymentStatus,
        paidAt: paymentStatus === 'Paid' ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString()
      });
    }

    event.updatedAt = new Date().toISOString();
    this.persistEvents(events, event);
    return true;
  }

  // File Management
  static addEventFile(eventId: string, file: Omit<EventFile, 'id' | 'eventId' | 'uploadedAt'>): EventFile | null {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return null;

    const now = new Date().toISOString();
    const newFile: EventFile = {
      id: `f-${Date.now()}`,
      eventId,
      ...file,
      uploadedAt: now
    };

    if (!event.files) event.files = [];
    event.files.unshift(newFile);

    if (!event.activityLog) event.activityLog = [];
    event.activityLog.unshift({
      id: `act-${Date.now()}`,
      eventId,
      action: 'File Uploaded',
      details: `Uploaded ${file.category} asset "${file.name}".`,
      performedBy: file.uploadedBy || 'Admin',
      timestamp: now
    });

    event.updatedAt = now;
    this.persistEvents(events, event);
    return newFile;
  }

  static toggleDeliverable(eventId: string, deliverableId: string): void {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const del = event.deliverables.find(d => d.id === deliverableId);
    if (del) {
      del.completed = !del.completed;
      event.updatedAt = new Date().toISOString();
      this.persistEvents(events, event);
    }
  }

  static addDeliverable(eventId: string, deliverable: Omit<EventDeliverable, 'id'>): EventDeliverable | null {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return null;

    const newDel: EventDeliverable = {
      id: `del-${Date.now()}`,
      ...deliverable
    };

    if (!event.deliverables) event.deliverables = [];
    event.deliverables.push(newDel);
    event.updatedAt = new Date().toISOString();
    this.persistEvents(events, event);
    return newDel;
  }

  static deleteDeliverable(eventId: string, deliverableId: string): boolean {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event || !event.deliverables) return false;

    const len = event.deliverables.length;
    event.deliverables = event.deliverables.filter(d => d.id !== deliverableId);
    if (event.deliverables.length !== len) {
      event.updatedAt = new Date().toISOString();
      this.persistEvents(events, event);
      return true;
    }
    return false;
  }

  static addEventAddOn(eventId: string, addOn: { name: string; price: number }): void {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (!event.addOns) event.addOns = [];
    event.addOns.push(addOn);
    event.packageTotal += addOn.price;
    event.balanceDue = Math.max(0, event.packageTotal - event.advancePaid);
    event.updatedAt = new Date().toISOString();
    this.persistEvents(events, event);
  }

  static removeEventAddOn(eventId: string, index: number): void {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event || !event.addOns || !event.addOns[index]) return;

    const removed = event.addOns[index];
    event.addOns.splice(index, 1);
    event.packageTotal = Math.max(0, event.packageTotal - removed.price);
    event.balanceDue = Math.max(0, event.packageTotal - event.advancePaid);
    event.updatedAt = new Date().toISOString();
    this.persistEvents(events, event);
  }

  static getExpensesByEvent(eventId: string): Expense[] {
    return this.getExpenses().filter(e => e.eventId === eventId);
  }

  // --- EVENT CHARGES ---
  static getEventCharges(): EventCharge[] {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENT_CHARGES);
      return data ? JSON.parse(data) : DEFAULT_EVENT_CHARGES;
    } catch {
      return DEFAULT_EVENT_CHARGES;
    }
  }

  static getActiveEventCharges(): EventCharge[] {
    return this.getEventCharges().filter(c => c.status === 'Active');
  }

  static saveEventCharge(charge: Partial<EventCharge> & { name: string; price: number }): EventCharge {
    const charges = this.getEventCharges();
    const now = new Date().toISOString();

    if (charge.id) {
      const idx = charges.findIndex(c => c.id === charge.id);
      if (idx !== -1) {
        charges[idx] = {
          ...charges[idx],
          ...charge,
          updatedAt: now
        } as EventCharge;
        this.persistAndSync('eventCharges', STORAGE_KEYS.EVENT_CHARGES, charges, charges[idx]);
        return charges[idx];
      }
    }

    const newCharge: EventCharge = {
      id: `chg-${Date.now()}`,
      name: charge.name,
      category: charge.category || 'Wedding Day',
      description: charge.description || '',
      price: charge.price,
      duration: charge.duration || '8 Hours',
      crewRequirement: charge.crewRequirement || '2 Content Creators',
      includedServices: charge.includedServices || [],
      optionalAddOns: charge.optionalAddOns || [],
      notes: charge.notes || '',
      status: charge.status || 'Active',
      createdAt: now,
      updatedAt: now
    };

    charges.unshift(newCharge);
    this.persistAndSync('eventCharges', STORAGE_KEYS.EVENT_CHARGES, charges, newCharge);
    return newCharge;
  }

  static deleteOrArchiveEventCharge(chargeId: string): { success: boolean; action: 'deleted' | 'archived'; message: string } {
    const quotes = this.getQuotations();
    const isUsedInQuotes = quotes.some(q => 
      q.items && q.items.some(item => item.chargeId === chargeId || item.name.toLowerCase() === this.getEventCharges().find(c => c.id === chargeId)?.name.toLowerCase())
    );

    const charges = this.getEventCharges();
    const idx = charges.findIndex(c => c.id === chargeId);
    if (idx === -1) return { success: false, action: 'deleted', message: 'Charge not found' };

    if (isUsedInQuotes) {
      charges[idx].status = 'Archived';
      charges[idx].updatedAt = new Date().toISOString();
      this.persistAndSync('eventCharges', STORAGE_KEYS.EVENT_CHARGES, charges, charges[idx]);
      return { 
        success: true, 
        action: 'archived', 
        message: 'This event charge is referenced in existing quotations. Marked as Archived to preserve historical financial integrity.' 
      };
    } else {
      charges.splice(idx, 1);
      this.persistAndSync('eventCharges', STORAGE_KEYS.EVENT_CHARGES, charges, null, chargeId);
      return { success: true, action: 'deleted', message: 'Event charge removed from catalogue.' };
    }
  }

  // --- ENQUIRIES ---
  static getEnquiries(): Enquiry[] {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveEnquiry(enquiry: Partial<Enquiry> & { clientName: string; eventName: string }): Enquiry {
    const list = this.getEnquiries();
    const now = new Date().toISOString();

    if (enquiry.id) {
      const idx = list.findIndex(e => e.id === enquiry.id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          ...enquiry,
          updatedAt: now
        } as Enquiry;
        this.persistAndSync('enquiries', STORAGE_KEYS.ENQUIRIES, list, list[idx]);
        return list[idx];
      }
    }

    const newEnquiry: Enquiry = {
      id: `enq-${Date.now()}`,
      clientName: enquiry.clientName,
      phone: enquiry.phone ? normalizeIndianPhoneNumber(enquiry.phone) : '',
      whatsapp: enquiry.whatsapp ? normalizeIndianPhoneNumber(enquiry.whatsapp) : (enquiry.phone ? normalizeIndianPhoneNumber(enquiry.phone) : ''),
      email: enquiry.email || '',
      eventName: enquiry.eventName,
      eventType: enquiry.eventType || enquiry.shootType || 'Wedding',
      shootType: enquiry.shootType || enquiry.eventType || 'Wedding',
      date: enquiry.date || new Date().toISOString().split('T')[0],
      venue: enquiry.venue || '',
      budget: Number(enquiry.budget) || Number(enquiry.expectedBudget) || 0,
      expectedBudget: Number(enquiry.expectedBudget) || Number(enquiry.budget) || 0,
      requirements: enquiry.requirements || '',
      servicesRequired: enquiry.servicesRequired || [],
      leadSource: enquiry.leadSource || 'Instagram',
      notes: enquiry.notes || '',
      followUpDate: enquiry.followUpDate || '',
      salesperson: enquiry.salesperson || 'Admin',
      pipelineStage: enquiry.pipelineStage || 'New',
      followUps: enquiry.followUps || [],
      archived: enquiry.archived || false,
      createdAt: now,
      updatedAt: now
    };

    list.unshift(newEnquiry);
    this.persistAndSync('enquiries', STORAGE_KEYS.ENQUIRIES, list, newEnquiry);
    return newEnquiry;
  }

  static addFollowUp(enquiryId: string, notes: string, nextDate?: string, createdBy: string = 'Admin'): Enquiry | null {
    const list = this.getEnquiries();
    const idx = list.findIndex(e => e.id === enquiryId);
    if (idx === -1) return null;

    const followUp = {
      id: `fu-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      notes,
      createdBy,
      nextFollowUpDate: nextDate,
      createdAt: new Date().toISOString()
    };

    if (!list[idx].followUps) list[idx].followUps = [];
    list[idx].followUps.unshift(followUp);
    if (nextDate) list[idx].followUpDate = nextDate;
    list[idx].updatedAt = new Date().toISOString();

    this.persistAndSync('enquiries', STORAGE_KEYS.ENQUIRIES, list, list[idx]);
    return list[idx];
  }

  static convertEnquiryToClient(enquiryId: string, createEventAlso: boolean = true): { client: Client; event?: EventShoot } | null {
    const list = this.getEnquiries();
    const idx = list.findIndex(e => e.id === enquiryId);
    if (idx === -1) return null;

    const enquiry = list[idx];

    const newClient = this.saveClient({
      name: enquiry.clientName,
      phone: enquiry.phone,
      email: enquiry.email,
      notes: `Converted from Enquiry "${enquiry.eventName}". Lead Source: ${enquiry.leadSource}. Notes: ${enquiry.notes}`,
      fromEnquiryId: enquiry.id
    });

    list[idx].pipelineStage = 'Confirmed';
    list[idx].convertedToClientId = newClient.id;
    list[idx].updatedAt = new Date().toISOString();
    this.persistAndSync('enquiries', STORAGE_KEYS.ENQUIRIES, list, list[idx]);

    let createdEvent: EventShoot | undefined;
    if (createEventAlso) {
      createdEvent = this.saveEvent({
        clientId: newClient.id,
        clientName: newClient.name,
        clientContact: {
          phone: newClient.phone,
          email: newClient.email
        },
        enquiryId: enquiry.id,
        eventName: enquiry.eventName,
        eventType: enquiry.eventType,
        startDate: enquiry.date || new Date().toISOString().split('T')[0],
        endDate: enquiry.date || new Date().toISOString().split('T')[0],
        venue: enquiry.venue || 'TBD Venue',
        locationCity: 'Mumbai',
        status: 'Confirmed',
        leadCreator: enquiry.salesperson || 'Admin',
        crewMembers: [],
        crewPayout: 0,
        packageTotal: enquiry.budget || 0,
        advancePaid: 0,
        balanceDue: enquiry.budget || 0,
        notes: `Converted from lead CRM. Services required: ${enquiry.servicesRequired.join(', ')}`
      });
    }

    return { client: newClient, event: createdEvent };
  }

  static toggleArchiveEnquiry(enquiryId: string): boolean {
    const list = this.getEnquiries();
    const idx = list.findIndex(e => e.id === enquiryId);
    if (idx === -1) return false;
    list[idx].archived = !list[idx].archived;
    list[idx].updatedAt = new Date().toISOString();
    this.persistAndSync('enquiries', STORAGE_KEYS.ENQUIRIES, list, list[idx]);
    return true;
  }

  static deleteEnquiry(enquiryId: string): boolean {
    const list = this.getEnquiries();
    const filtered = list.filter(e => e.id !== enquiryId);
    if (filtered.length !== list.length) {
      this.persistAndSync('enquiries', STORAGE_KEYS.ENQUIRIES, filtered, null, enquiryId);
      return true;
    }
    return false;
  }

  // --- QUOTATIONS ---
  static getQuotations(): Quotation[] {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static getNextQuoteNumber(): string {
    const quotes = this.getQuotations();
    const currentYear = new Date().getFullYear();
    const prefix = `TMC-QTN-${currentYear}-`;
    const sequenceNumbers = quotes
      .filter(q => q.quoteNumber && q.quoteNumber.startsWith(prefix))
      .map(q => {
        const numPart = q.quoteNumber.replace(prefix, '');
        return parseInt(numPart, 10) || 0;
      });

    const maxSeq = sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) : 0;
    const nextSeq = maxSeq + 1;
    return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  }

  static saveQuotation(quoteData: Partial<Quotation>): Quotation {
    const quotes = this.getQuotations();
    const now = new Date().toISOString();

    if (quoteData.id) {
      const idx = quotes.findIndex(q => q.id === quoteData.id);
      if (idx !== -1) {
        quotes[idx] = {
          ...quotes[idx],
          ...quoteData,
        } as Quotation;
        localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotes));
        this.notifyListeners();
        return quotes[idx];
      }
    }

    const quoteNumber = quoteData.quoteNumber || this.getNextQuoteNumber();
    
    const snapshottedItems: QuoteItem[] = (quoteData.items || []).map(item => ({
      id: item.id || `qi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      chargeId: item.chargeId,
      name: item.name,
      description: item.description || '',
      rate: Number(item.rate) || 0,
      quantity: Number(item.quantity) || 1,
      crewRequirement: item.crewRequirement,
      duration: item.duration,
      includedServices: item.includedServices ? [...item.includedServices] : [],
      amount: (Number(item.rate) || 0) * (Number(item.quantity) || 1)
    }));

    const subtotal = snapshottedItems.reduce((acc, curr) => acc + curr.amount, 0);
    const discountType = quoteData.discountType || 'flat';
    const discountValue = Number(quoteData.discountValue) || 0;
    const discountAmount = discountType === 'percentage' 
      ? Math.round((subtotal * discountValue) / 100) 
      : discountValue;

    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const taxPercentage = quoteData.taxPercentage !== undefined ? quoteData.taxPercentage : 18;
    const taxAmount = Math.round((afterDiscount * taxPercentage) / 100);
    const grandTotal = afterDiscount + taxAmount;
    const advanceAmount = Number(quoteData.advanceAmount) || Math.round(grandTotal * 0.5);
    const balanceAmount = Math.max(0, grandTotal - advanceAmount);

    const defaultTerms = 
      '1. 50% advance booking deposit required to lock team & equipment on the roster.\n' +
      '2. Remaining 50% balance payable on or before event day.\n' +
      '3. Raw uncut footage transferred on-site via AirDrop / SSD at the end of each session.\n' +
      '4. Edited 9:16 high-definition reels delivered within 5-7 working days.';

    const newQuote: Quotation = {
      id: `qtn-${Date.now()}`,
      quoteNumber,
      clientId: quoteData.clientId,
      enquiryId: quoteData.enquiryId,
      clientName: quoteData.clientName || 'Valued Client',
      clientPhone: quoteData.clientPhone ? normalizeIndianPhoneNumber(quoteData.clientPhone) : '',
      clientEmail: quoteData.clientEmail || '',
      clientAddress: quoteData.clientAddress || '',
      clientInstagram: quoteData.clientInstagram || '',
      eventName: quoteData.eventName || 'Wedding Celebration',
      eventType: quoteData.eventType || 'Wedding',
      eventDate: quoteData.eventDate || new Date().toISOString().split('T')[0],
      venue: quoteData.venue || '',
      items: snapshottedItems,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxPercentage,
      taxAmount,
      grandTotal,
      advanceAmount,
      balanceAmount,
      notes: quoteData.notes || 'Capture formatted exclusively for 9:16 social storytelling with high-bitrate audio.',
      terms: quoteData.terms || defaultTerms,
      status: quoteData.status || 'Draft',
      createdAt: now,
      validUntil: quoteData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    quotes.unshift(newQuote);
    this.persistAndSync('quotations', STORAGE_KEYS.QUOTATIONS, quotes, newQuote);

    if (newQuote.enquiryId) {
      const enquiries = this.getEnquiries();
      const enq = enquiries.find(e => e.id === newQuote.enquiryId);
      if (enq && (enq.pipelineStage === 'New' || enq.pipelineStage === 'Contacted' || enq.pipelineStage === 'Requirement Collected')) {
        enq.pipelineStage = 'Quote Sent';
        enq.updatedAt = now;
        this.persistAndSync('enquiries', STORAGE_KEYS.ENQUIRIES, enquiries, enq);
      }
    }

    return newQuote;
  }

  static updateQuoteStatus(quoteId: string, status: Quotation['status']): Quotation | null {
    const quotes = this.getQuotations();
    const idx = quotes.findIndex(q => q.id === quoteId);
    if (idx === -1) return null;

    quotes[idx].status = status;
    if (status === 'Sent' && !quotes[idx].sentAt) {
      quotes[idx].sentAt = new Date().toISOString();
    }
    if (status === 'Accepted' && !quotes[idx].acceptedAt) {
      quotes[idx].acceptedAt = new Date().toISOString();
    }

    this.persistAndSync('quotations', STORAGE_KEYS.QUOTATIONS, quotes, quotes[idx]);
    return quotes[idx];
  }

  static deleteQuotation(quoteId: string): boolean {
    const quotes = this.getQuotations();
    const filtered = quotes.filter(q => q.id !== quoteId);
    if (filtered.length !== quotes.length) {
      this.persistAndSync('quotations', STORAGE_KEYS.QUOTATIONS, filtered, null, quoteId);
      return true;
    }
    return false;
  }

  // --- CLIENTS ---
  static getClients(): Client[] {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      return data ? JSON.parse(data) : DEFAULT_CLIENTS;
    } catch {
      return DEFAULT_CLIENTS;
    }
  }

  static saveClient(clientData: Partial<Client> & { name: string }): Client {
    const clients = this.getClients();
    const now = new Date().toISOString();

    if (clientData.id) {
      const idx = clients.findIndex(c => c.id === clientData.id);
      if (idx !== -1) {
        clients[idx] = {
          ...clients[idx],
          ...clientData,
          phone: clientData.phone ? normalizeIndianPhoneNumber(clientData.phone) : clients[idx].phone,
          updatedAt: now
        } as Client;
        this.persistAndSync('clients', STORAGE_KEYS.CLIENTS, clients, clients[idx]);
        return clients[idx];
      }
    }

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: clientData.name.trim(),
      phone: clientData.phone ? normalizeIndianPhoneNumber(clientData.phone) : '',
      email: clientData.email ? clientData.email.trim() : '',
      address: clientData.address || '',
      instagram: clientData.instagram || '',
      fromEnquiryId: clientData.fromEnquiryId,
      notes: clientData.notes || '',
      createdAt: now,
      updatedAt: now
    };

    clients.unshift(newClient);
    this.persistAndSync('clients', STORAGE_KEYS.CLIENTS, clients, newClient);
    return newClient;
  }

  static deleteClient(clientId: string): boolean {
    const clients = this.getClients();
    const filtered = clients.filter(c => c.id !== clientId);
    if (filtered.length !== clients.length) {
      this.persistAndSync('clients', STORAGE_KEYS.CLIENTS, filtered, null, clientId);
      return true;
    }
    return false;
  }

  // --- PAYMENTS ---
  static getPayments(): PaymentRecord[] {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      const list: PaymentRecord[] = data ? JSON.parse(data) : DEFAULT_PAYMENTS;
      return list.filter(p => 
        (p as any).clientName !== 'hello' && 
        (p as any).clientName !== 'Preeti & Karan' &&
        (p as any).clientName !== 'lakshya' &&
        p.id !== 'pay-1792229918201' &&
        p.id !== 'pay-1792229938880'
      );
    } catch {
      return DEFAULT_PAYMENTS;
    }
  }

  static recordPayment(payment: Omit<PaymentRecord, 'id' | 'createdAt'>): PaymentRecord {
    const payments = this.getPayments();
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      ...payment,
      createdAt: new Date().toISOString()
    };

    payments.unshift(newPayment);
    this.persistAndSync('payments', STORAGE_KEYS.PAYMENTS, payments, newPayment);

    if (payment.eventId) {
      const events = this.getEvents();
      const evt = events.find(e => e.id === payment.eventId);
      if (evt) {
        evt.advancePaid = (evt.advancePaid || 0) + payment.amount;
        evt.balanceDue = Math.max(0, evt.packageTotal - evt.advancePaid);
        
        if (!evt.activityLog) evt.activityLog = [];
        evt.activityLog.unshift({
          id: `act-${Date.now()}`,
          eventId: evt.id,
          action: 'Payment Received',
          details: `₹${payment.amount.toLocaleString('en-IN')} received via ${payment.paymentMode}.`,
          performedBy: 'Finance Admin',
          timestamp: new Date().toISOString()
        });

        evt.updatedAt = new Date().toISOString();
        this.persistEvents(events, evt);
      }
    }

    return newPayment;
  }

  // --- EXPENSES MANAGEMENT ---
  static getExpenses(): Expense[] {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : DEFAULT_EXPENSES;
    } catch {
      return DEFAULT_EXPENSES;
    }
  }

  static saveExpense(expenseData: Partial<Expense> & { title: string; amount: number; category: Expense['category'] }): Expense {
    const expenses = this.getExpenses();
    const now = new Date().toISOString();

    if (expenseData.id) {
      const idx = expenses.findIndex(e => e.id === expenseData.id);
      if (idx !== -1) {
        expenses[idx] = {
          ...expenses[idx],
          ...expenseData,
          amount: Number(expenseData.amount) || 0
        } as Expense;
        this.persistAndSync('expenses', STORAGE_KEYS.EXPENSES, expenses, expenses[idx]);
        return expenses[idx];
      }
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title: expenseData.title.trim(),
      category: expenseData.category,
      amount: Number(expenseData.amount) || 0,
      date: expenseData.date || now.split('T')[0],
      eventId: expenseData.eventId,
      eventName: expenseData.eventName,
      paidBy: expenseData.paidBy || 'Admin',
      paymentMode: expenseData.paymentMode || 'UPI',
      notes: expenseData.notes || '',
      createdAt: now
    };

    expenses.unshift(newExpense);
    this.persistAndSync('expenses', STORAGE_KEYS.EXPENSES, expenses, newExpense);
    return newExpense;
  }

  static deleteExpense(id: string): boolean {
    const expenses = this.getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    if (filtered.length !== expenses.length) {
      this.persistAndSync('expenses', STORAGE_KEYS.EXPENSES, filtered, null, id);
      return true;
    }
    return false;
  }

  // --- PLANNERS & VENDORS ---
  static getPlanners(): PlannerVendor[] {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLANNERS);
      return data ? JSON.parse(data) : DEFAULT_PLANNERS;
    } catch {
      return DEFAULT_PLANNERS;
    }
  }

  static savePlanner(plannerData: Partial<PlannerVendor> & { name: string; companyName: string; role: PlannerVendor['role']; phone: string }): PlannerVendor {
    const planners = this.getPlanners();

    if (plannerData.id) {
      const idx = planners.findIndex(p => p.id === plannerData.id);
      if (idx !== -1) {
        planners[idx] = {
          ...planners[idx],
          ...plannerData,
          phone: normalizeIndianPhoneNumber(plannerData.phone)
        } as PlannerVendor;
        this.persistAndSync('planners', STORAGE_KEYS.PLANNERS, planners, planners[idx]);
        return planners[idx];
      }
    }

    const newPlanner: PlannerVendor = {
      id: `pln-${Date.now()}`,
      name: plannerData.name.trim(),
      companyName: plannerData.companyName.trim(),
      role: plannerData.role,
      phone: normalizeIndianPhoneNumber(plannerData.phone),
      email: plannerData.email?.trim(),
      city: plannerData.city || 'Mumbai',
      instagram: plannerData.instagram,
      rating: plannerData.rating || 5,
      associatedEventIds: plannerData.associatedEventIds || [],
      notes: plannerData.notes || ''
    };

    planners.unshift(newPlanner);
    this.persistAndSync('planners', STORAGE_KEYS.PLANNERS, planners, newPlanner);
    return newPlanner;
  }

  static deletePlanner(id: string): boolean {
    const planners = this.getPlanners();
    const filtered = planners.filter(p => p.id !== id);
    if (filtered.length !== planners.length) {
      this.persistAndSync('planners', STORAGE_KEYS.PLANNERS, filtered, null, id);
      return true;
    }
    return false;
  }

  // --- PARTNERS & OUTSOURCED EVENT COMPANIES ---
  static getPartners(): Partner[] {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PARTNERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static savePartner(partnerData: Partial<Partner> & { companyName: string; phone: string }): Partner {
    const partners = this.getPartners();
    const now = new Date().toISOString();

    if (partnerData.id) {
      const idx = partners.findIndex(p => p.id === partnerData.id);
      if (idx !== -1) {
        partners[idx] = {
          ...partners[idx],
          ...partnerData,
          phone: normalizeIndianPhoneNumber(partnerData.phone),
          updatedAt: now
        } as Partner;
        this.persistAndSync('partners', STORAGE_KEYS.PARTNERS, partners, partners[idx]);
        savePartnerToFirestore(partners[idx]).catch(() => {});
        return partners[idx];
      }
    }

    const newPartner: Partner = {
      id: `ptn-${Date.now()}`,
      name: partnerData.name?.trim() || partnerData.contactPerson?.trim() || partnerData.companyName.trim(),
      companyName: partnerData.companyName.trim(),
      contactPerson: partnerData.contactPerson?.trim() || '',
      role: partnerData.role || 'Event Company',
      phone: normalizeIndianPhoneNumber(partnerData.phone),
      email: partnerData.email?.trim() || '',
      city: partnerData.city || 'Mumbai',
      commissionOrTerms: partnerData.commissionOrTerms || 'Standard Outsourced Vendor',
      instagram: partnerData.instagram || '',
      website: partnerData.website || '',
      rating: partnerData.rating || 5,
      notes: partnerData.notes || '',
      createdAt: now,
      updatedAt: now
    };

    partners.unshift(newPartner);
    this.persistAndSync('partners', STORAGE_KEYS.PARTNERS, partners, newPartner);
    savePartnerToFirestore(newPartner).catch(() => {});
    return newPartner;
  }

  static deletePartner(id: string): boolean {
    const partners = this.getPartners();
    const filtered = partners.filter(p => p.id !== id);
    if (filtered.length !== partners.length) {
      this.persistAndSync('partners', STORAGE_KEYS.PARTNERS, filtered, null, id);
      deletePartnerFromFirestore(id).catch(() => {});
      return true;
    }
    return false;
  }

  // Clear all mock/dummy records to start clean connected with Firebase
  static clearAllDummyData(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PLANNERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CREW_ROSTER, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    this.notifyListeners();
  }

  // --- INVOICE MANAGEMENT ---
  static getInvoices(): Invoice[] {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return data ? JSON.parse(data) : DEFAULT_INVOICES;
    } catch {
      return DEFAULT_INVOICES;
    }
  }

  static getNextInvoiceNumber(): string {
    const invoices = this.getInvoices();
    const currentYear = new Date().getFullYear();
    const prefix = `TMC-INV-${currentYear}-`;
    const sequenceNumbers = invoices
      .filter(i => i.invoiceNumber && i.invoiceNumber.startsWith(prefix))
      .map(i => {
        const numPart = i.invoiceNumber.replace(prefix, '');
        return parseInt(numPart, 10) || 0;
      });

    const maxSeq = sequenceNumbers.length > 0 ? Math.max(...sequenceNumbers) : 0;
    const nextSeq = maxSeq + 1;
    return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  }

  static saveInvoice(invoiceData: Partial<Invoice>): Invoice {
    const invoices = this.getInvoices();
    const now = new Date().toISOString();

    if (invoiceData.id) {
      const idx = invoices.findIndex(i => i.id === invoiceData.id);
      if (idx !== -1) {
        invoices[idx] = {
          ...invoices[idx],
          ...invoiceData,
          updatedAt: now
        } as Invoice;
        this.persistAndSync('invoices', STORAGE_KEYS.INVOICES, invoices, invoices[idx]);
        return invoices[idx];
      }
    }

    const invoiceNumber = invoiceData.invoiceNumber || this.getNextInvoiceNumber();
    const items: InvoiceItem[] = (invoiceData.items || []).map(item => ({
      id: item.id || `ii-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: item.name,
      description: item.description || '',
      quantity: Number(item.quantity) || 1,
      rate: Number(item.rate) || 0,
      amount: (Number(item.quantity) || 1) * (Number(item.rate) || 0)
    }));

    const subtotal = items.reduce((acc, curr) => acc + curr.amount, 0);
    const discountType = invoiceData.discountType || 'flat';
    const discountValue = Number(invoiceData.discountValue) || 0;
    const discountAmount = discountType === 'percentage'
      ? Math.round((subtotal * discountValue) / 100)
      : discountValue;

    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const taxPercentage = invoiceData.taxPercentage !== undefined ? invoiceData.taxPercentage : 18;
    const taxAmount = Math.round((afterDiscount * taxPercentage) / 100);
    const grandTotal = afterDiscount + taxAmount;
    const amountPaid = Number(invoiceData.amountPaid) || 0;
    const balanceDue = Math.max(0, grandTotal - amountPaid);

    let paymentStatus = invoiceData.paymentStatus || 'Sent';
    if (balanceDue === 0 && grandTotal > 0) {
      paymentStatus = 'Paid';
    } else if (amountPaid > 0 && balanceDue > 0) {
      paymentStatus = 'Partially Paid';
    }

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      eventId: invoiceData.eventId,
      quoteId: invoiceData.quoteId,
      clientId: invoiceData.clientId,
      clientName: invoiceData.clientName || 'Valued Client',
      clientPhone: invoiceData.clientPhone ? normalizeIndianPhoneNumber(invoiceData.clientPhone) : '',
      clientEmail: invoiceData.clientEmail || '',
      clientAddress: invoiceData.clientAddress || '',
      eventName: invoiceData.eventName || 'Production Shoot',
      eventType: invoiceData.eventType || 'Wedding',
      eventDate: invoiceData.eventDate || now.split('T')[0],
      issueDate: invoiceData.issueDate || now.split('T')[0],
      dueDate: invoiceData.dueDate || now.split('T')[0],
      items,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxPercentage,
      taxAmount,
      grandTotal,
      amountPaid,
      balanceDue,
      paymentStatus,
      notes: invoiceData.notes || 'Thank you for choosing The Main Character Media.',
      terms: invoiceData.terms || '1. Balance due upon delivery.\n2. Raw footage transfer completed via portable SSD.\n3. Bank details: HDFC Bank A/C 50200088912344, IFSC HDFC0000045.',
      createdAt: now,
      updatedAt: now
    };

    invoices.unshift(newInvoice);
    this.persistAndSync('invoices', STORAGE_KEYS.INVOICES, invoices, newInvoice);
    return newInvoice;
  }

  static createInvoiceFromEvent(eventId: string): Invoice | null {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return null;

    // Check if an invoice already exists for this event
    const existing = this.getInvoices().find(i => i.eventId === eventId);
    if (existing) return existing;

    const items: InvoiceItem[] = [];
    if (event.subEvents && event.subEvents.length > 0) {
      event.subEvents.forEach(sub => {
        items.push({
          id: `ii-${Date.now()}-${sub.id}`,
          name: `${sub.name} Coverage`,
          description: `${sub.date} · ${sub.startTime || 'Scheduled'} at ${sub.venue || event.venue}`,
          quantity: 1,
          rate: sub.eventCharge || Math.round(event.packageTotal / event.subEvents.length),
          amount: sub.eventCharge || Math.round(event.packageTotal / event.subEvents.length)
        });
      });
    }

    if (event.addOns && event.addOns.length > 0) {
      event.addOns.forEach((addon, idx) => {
        items.push({
          id: `ii-${Date.now()}-addon-${idx}`,
          name: addon.name,
          description: 'Production Add-on & Extra Equipment',
          quantity: 1,
          rate: addon.price,
          amount: addon.price
        });
      });
    }

    if (items.length === 0) {
      items.push({
        id: `ii-${Date.now()}-main`,
        name: `${event.eventName} (${event.eventType})`,
        description: `Full production coverage from ${event.startDate} to ${event.endDate || event.startDate}`,
        quantity: 1,
        rate: event.packageTotal,
        amount: event.packageTotal
      });
    }

    const subtotal = items.reduce((acc, curr) => acc + curr.amount, 0);
    const taxPercentage = 18;
    const taxAmount = Math.round((subtotal * taxPercentage) / 100);
    const grandTotal = subtotal + taxAmount;
    const amountPaid = event.advancePaid || 0;
    const balanceDue = Math.max(0, grandTotal - amountPaid);

    return this.saveInvoice({
      eventId: event.id,
      quoteId: event.quoteId,
      clientId: event.clientId,
      clientName: event.clientName,
      clientPhone: event.clientContact?.phone || '',
      clientEmail: event.clientContact?.email || '',
      eventName: event.eventName,
      eventType: event.eventType,
      eventDate: event.startDate,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: event.paymentDueDate || event.endDate || event.startDate,
      items,
      subtotal,
      discountType: 'flat',
      discountValue: 0,
      discountAmount: 0,
      taxPercentage,
      taxAmount,
      grandTotal,
      amountPaid,
      balanceDue,
      paymentStatus: balanceDue === 0 ? 'Paid' : amountPaid > 0 ? 'Partially Paid' : 'Sent',
      notes: event.clientRequirements ? `Client Brief: ${event.clientRequirements}` : 'Luxury Wedding Production Service',
      terms: '1. Final footage handover subject to full clearance.\n2. Bank Details: HDFC Current A/C #50200088912344, IFSC: HDFC0000045.'
    });
  }

  static createInvoiceFromQuote(quote: Quotation): Invoice {
    const invoices = this.getInvoices();
    const existing = invoices.find(i => i.quoteId === quote.id);
    if (existing) return existing;

    const items: InvoiceItem[] = (quote.items || []).map((it, idx) => ({
      id: `ii-${Date.now()}-${idx}`,
      name: it.name,
      description: it.description || '',
      quantity: it.quantity || 1,
      rate: it.rate,
      amount: it.amount
    }));

    if (items.length === 0) {
      items.push({
        id: `ii-${Date.now()}-main`,
        name: `${quote.eventName} (${quote.eventType})`,
        description: `Complete production coverage for ${quote.clientName}`,
        quantity: 1,
        rate: quote.grandTotal,
        amount: quote.grandTotal
      });
    }

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `TMC-INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`,
      quoteId: quote.id,
      clientId: quote.clientId,
      clientName: quote.clientName,
      clientPhone: quote.clientPhone || '',
      clientEmail: quote.clientEmail || '',
      clientAddress: quote.clientAddress || '',
      eventName: quote.eventName,
      eventType: quote.eventType,
      eventDate: quote.eventDate,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: quote.validUntil || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      items,
      subtotal: quote.subtotal,
      discountType: quote.discountType,
      discountValue: quote.discountValue,
      discountAmount: quote.discountAmount,
      taxPercentage: quote.taxPercentage,
      taxAmount: quote.taxAmount,
      grandTotal: quote.grandTotal,
      amountPaid: quote.advanceAmount || 0,
      balanceDue: quote.balanceAmount,
      paymentStatus: quote.balanceAmount === 0 ? 'Paid' : (quote.advanceAmount > 0 ? 'Partially Paid' : 'Sent'),
      notes: quote.notes || 'Luxury Wedding Production Service',
      terms: quote.terms || '1. Final footage handover subject to full clearance.\n2. Bank Details: HDFC Current A/C #50200088912344, IFSC: HDFC0000045.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.saveInvoice(newInvoice);
  }

  static deleteInvoice(invoiceId: string): boolean {
    const invoices = this.getInvoices();
    const filtered = invoices.filter(i => i.id !== invoiceId);
    if (filtered.length !== invoices.length) {
      this.persistAndSync('invoices', STORAGE_KEYS.INVOICES, filtered, null, invoiceId);
      return true;
    }
    return false;
  }

  static updateInvoiceStatus(invoiceId: string, status: InvoiceStatus): Invoice | null {
    const invoices = this.getInvoices();
    const idx = invoices.findIndex(i => i.id === invoiceId);
    if (idx !== -1) {
      invoices[idx].paymentStatus = status;
      invoices[idx].updatedAt = new Date().toISOString();
      this.persistAndSync('invoices', STORAGE_KEYS.INVOICES, invoices, invoices[idx]);
      return invoices[idx];
    }
    return null;
  }

  static recordPaymentForInvoice(invoiceId: string, amount: number): Invoice | null {
    const invoices = this.getInvoices();
    const idx = invoices.findIndex(i => i.id === invoiceId);
    if (idx !== -1) {
      const inv = invoices[idx];
      const newPaid = (inv.amountPaid || 0) + amount;
      const newBalance = Math.max(0, inv.grandTotal - newPaid);
      inv.amountPaid = newPaid;
      inv.balanceDue = newBalance;
      inv.paymentStatus = newBalance === 0 ? 'Paid' : 'Partially Paid';
      inv.updatedAt = new Date().toISOString();
      
      // Also register into payments ledger
      this.recordPayment({
        clientId: inv.clientId || 'cli-general',
        eventId: inv.eventId,
        amount,
        date: new Date().toISOString().split('T')[0],
        paymentMode: 'UPI',
        notes: `Settlement for Invoice ${inv.invoiceNumber}`
      });

      this.persistAndSync('invoices', STORAGE_KEYS.INVOICES, invoices, inv);
      return inv;
    }
    return null;
  }

  // --- DASHBOARD METRICS ---
  static getDashboardMetrics(): DashboardMetrics {
    const events = this.getEvents();
    const enquiries = this.getEnquiries();
    const payments = this.getPayments();
    const crew = this.getCrewRoster();
    const expenses = this.getExpenses();
    const invoices = this.getInvoices();

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const upcomingShoots = events.filter(e => 
      e.status === 'Confirmed' || e.status === 'Scheduled' || e.status === 'In Progress'
    );

    const todayShoots = events.filter(e => {
      const start = e.startDate || (e as any).shootDate || '';
      const end = e.endDate || start;
      return (todayStr >= start && todayStr <= end) && e.status !== 'Cancelled' && e.status !== 'Archived';
    });

    const activeJobs = events.filter(e =>
      e.status === 'In Progress' || e.status === 'Scheduled' || e.status === 'Confirmed'
    );
    
    const thisMonthEvents = events.filter(e => {
      const shootDate = new Date(e.startDate || (e as any).shootDate);
      return shootDate.getMonth() === currentMonth && shootDate.getFullYear() === currentYear;
    });

    const monthlyRevenue = thisMonthEvents.reduce((acc, curr) => acc + (curr.packageTotal || 0), 0);
    const monthlyCrewPayouts = thisMonthEvents.reduce((acc, curr) => acc + (curr.crewPayout || 0), 0);

    const thisMonthExpensesList = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
    const monthlyExpenses = thisMonthExpensesList.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const estimatedProfit = monthlyRevenue - monthlyCrewPayouts - monthlyExpenses;

    const pendingBalanceTotal = events.reduce((acc, curr) => acc + (curr.balanceDue || 0), 0);
    const totalRevenue = events.reduce((acc, curr) => acc + (curr.packageTotal || 0), 0);
    const collectedRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const crewPayoutTotal = events.reduce((acc, curr) => acc + (curr.crewPayout || 0), 0);
    const grossProfit = totalRevenue - crewPayoutTotal;

    const pendingEnquiries = enquiries.filter(
      e => !e.archived && e.pipelineStage !== 'Confirmed' && e.pipelineStage !== 'Lost'
    );

    const newEnquiries = enquiries.filter(e => !e.archived && e.pipelineStage === 'New');

    const outstandingInvoices = invoices.filter(i => i.paymentStatus !== 'Paid');
    const outstandingInvoicesAmount = outstandingInvoices.reduce((acc, curr) => acc + (curr.balanceDue || 0), 0);

    return {
      upcomingShootsCount: upcomingShoots.length,
      thisMonthShootsCount: thisMonthEvents.length,
      pendingBalanceTotal,
      crewOnRosterCount: crew.length,
      totalRevenue,
      collectedRevenue,
      crewPayoutTotal,
      grossProfit,
      pendingEnquiriesCount: pendingEnquiries.length,
      todayShootsCount: todayShoots.length,
      activeJobsCount: activeJobs.length,
      monthlyRevenue,
      monthlyExpenses,
      estimatedProfit,
      newEnquiriesCount: newEnquiries.length,
      outstandingInvoicesCount: outstandingInvoices.length,
      outstandingInvoicesAmount,
      crewCommissionsTotal: crewPayoutTotal,
      agencyCommissionTotal: grossProfit
    };
  }

  // --- CREW NOTIFICATIONS ---
  static getCrewNotifications(crewId?: string): CrewNotification[] {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const all: CrewNotification[] = data ? JSON.parse(data) : DEFAULT_NOTIFICATIONS;
      if (!crewId) return all;
      return all.filter(n => n.crewId === 'all' || n.crewId === crewId);
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  }

  static addCrewNotification(notifData: Omit<CrewNotification, 'id' | 'createdAt' | 'read'>): CrewNotification {
    const all = this.getCrewNotifications();
    const newNotif: CrewNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    all.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    this.notifyListeners();
    return newNotif;
  }

  static markNotificationAsRead(id: string): void {
    const all = this.getCrewNotifications();
    const updated = all.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    this.notifyListeners();
  }

  static markAllNotificationsAsRead(crewId?: string): void {
    const all = this.getCrewNotifications();
    const updated = all.map(n => {
      if (!crewId || n.crewId === 'all' || n.crewId === crewId) {
        return { ...n, read: true };
      }
      return n;
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    this.notifyListeners();
  }

  // --- CREW REMINDER SETTINGS ---
  static getReminderSettings(): ReminderSettings {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDER_SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_REMINDER_SETTINGS;
    } catch {
      return DEFAULT_REMINDER_SETTINGS;
    }
  }

  static saveReminderSettings(settings: ReminderSettings): void {
    localStorage.setItem(STORAGE_KEYS.REMINDER_SETTINGS, JSON.stringify(settings));
    this.notifyListeners();
  }

  // --- CREW REMINDERS TRACKING ---
  static saveCrewReminder(reminder: CrewReminderRecord): void {
    const events = this.getEvents();
    const evt = events.find(e => e.id === reminder.eventId);
    if (evt) {
      if (!evt.crewReminders) evt.crewReminders = [];
      const existingIdx = evt.crewReminders.findIndex(r => r.crewId === reminder.crewId);
      if (existingIdx >= 0) {
        evt.crewReminders[existingIdx] = reminder;
      } else {
        evt.crewReminders.push(reminder);
      }

      if (!evt.activityLog) evt.activityLog = [];
      evt.activityLog.unshift({
        id: `act-${Date.now()}`,
        eventId: evt.id,
        action: 'Crew Reminder Sent',
        details: `WhatsApp reminder dispatched to ${reminder.crewName} (${reminder.role}) by ${reminder.adminName}. Status: ${reminder.status}`,
        performedBy: reminder.adminName,
        timestamp: reminder.timestamp
      });

      evt.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      this.notifyListeners();
    }
  }

  // --- POV STATUS TRANSITION (CREW SPECIFIC) ---
  static updatePOVStatus(eventId: string, povId: string, status: POVStatus, crewId?: string): boolean {
    const events = this.getEvents();
    const evt = events.find(e => e.id === eventId);
    if (!evt) return false;

    if (!evt.povs) evt.povs = [];
    const pov = evt.povs.find(p => p.id === povId);
    if (!pov) return false;

    // Crew access restriction check: if crewId provided, verify crew assignment
    if (crewId && pov.assignedCrewId && pov.assignedCrewId !== crewId) {
      return false;
    }

    pov.status = status;
    if (status === 'Captured') {
      pov.capturedAt = new Date().toISOString();
    } else if (status === 'Delivered') {
      pov.deliveredAt = new Date().toISOString();
    }

    if (!evt.activityLog) evt.activityLog = [];
    const crewName = crewId ? (this.getCrewRoster().find(c => c.id === crewId)?.name || 'Crew Member') : 'Admin';
    evt.activityLog.unshift({
      id: `act-${Date.now()}`,
      eventId: evt.id,
      action: 'POV Status Updated',
      details: `${pov.type} (${pov.description.slice(0, 30)}...) marked as "${status}" by ${crewName}.`,
      performedBy: crewName,
      timestamp: new Date().toISOString()
    });

    evt.updatedAt = new Date().toISOString();
    this.persistEvents(events, evt);
    return true;
  }

  // --- ACTIVE CREW MEMBER & VIEW MODE ---
  static getActiveCrewMemberId(): string {
    this.initialize();
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CREW_ID) || '';
  }

  static setActiveCrewMemberId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CREW_ID, id);
    this.notifyListeners();
  }

  static getAppViewMode(): 'admin' | 'crew' {
    this.initialize();
    return (localStorage.getItem(STORAGE_KEYS.APP_VIEW_MODE) as 'admin' | 'crew') || 'admin';
  }

  static setAppViewMode(mode: 'admin' | 'crew'): void {
    localStorage.setItem(STORAGE_KEYS.APP_VIEW_MODE, mode);
    this.notifyListeners();
  }

  // --- COMPANY SETTINGS & MASTER BRANDING ---
  static getCompanySettings(): CompanySettings {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPANY_SETTINGS);
      if (!data) return DEFAULT_COMPANY_SETTINGS;
      const parsed = JSON.parse(data);
      return { ...DEFAULT_COMPANY_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_COMPANY_SETTINGS;
    }
  }

  static saveCompanySettings(settings: CompanySettings): void {
    localStorage.setItem(STORAGE_KEYS.COMPANY_SETTINGS, JSON.stringify(settings));
    RealtimeSyncService.saveSingleton('companySettings', settings);
    this.notifyListeners();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tmc_company_settings_updated', { detail: settings }));
    }
  }

  // --- USER AUTHENTICATION & ROLE SESSION ---
  static getUserSession(): UserSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static setUserSession(session: UserSession | null): void {
    if (typeof window === 'undefined') return;
    if (session) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER_SESSION, JSON.stringify(session));
      localStorage.setItem(STORAGE_KEYS.APP_VIEW_MODE, session.role);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER_SESSION);
    }
    this.notifyListeners();
  }
}
