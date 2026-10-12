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
  InvoiceStatus
} from '../types';
import {
  savePartnerToFirestore,
  deletePartnerFromFirestore,
  saveEventToFirestore,
  deleteEventFromFirestore
} from './firebase';

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
};

const DEFAULT_EVENT_CHARGES: EventCharge[] = [
  {
    id: 'chg-wedding-day',
    name: 'Wedding Day',
    category: 'Wedding Day',
    description: 'Comprehensive wedding day storytelling capturing all sacred moments and unfiltered joy.',
    price: 25000,
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

const DEFAULT_CREW_ROSTER: CrewMember[] = [
  {
    id: 'cr-devansh',
    name: 'Devansh Saxena',
    phone: '+919820111223',
    email: 'devansh@themaincharactermedia.com',
    role: 'Cinematographer',
    specialization: 'Creative Direction, Couple POVs, 4K ProRes Grading',
    experience: '6 Years / 140+ Luxury Weddings',
    defaultPayout: 8000,
    availability: 'Available',
    status: 'Active',
    username: 'devansh',
    notes: 'Lead director for palace and destination weddings across Rajasthan & Goa.'
  },
  {
    id: 'cr-ishaan',
    name: 'Ishaan Verma',
    phone: '+919820222334',
    email: 'ishaan@themaincharactermedia.com',
    role: 'Content Creator',
    specialization: 'Groom POV, Baraat Energy, High-Beat Reels',
    experience: '4 Years / 90+ Weddings',
    defaultPayout: 6000,
    availability: 'Available',
    status: 'Active',
    username: 'ishaan',
    notes: 'Excellent crowd engagement during high energy Baraat and DJ afterparties.'
  },
  {
    id: 'cr-tara',
    name: 'Tara Sen',
    phone: '+919820333445',
    email: 'tara@themaincharactermedia.com',
    role: 'Content Creator',
    specialization: 'Bridal Prep POV, Aesthetic Details, Jewelry & Lehenga Micro-shots',
    experience: '4 Years / 110+ Weddings',
    defaultPayout: 6000,
    availability: 'Available',
    status: 'Active',
    username: 'tara',
    notes: 'Preferred creator for brides. Specializes in editorial slow-motion.'
  },
  {
    id: 'cr-rohit',
    name: 'Rohit Bansal',
    phone: '+919820555667',
    email: 'rohit@themaincharactermedia.com',
    role: 'Drone Operator',
    specialization: 'DGCA Certified, 4K FPV Fly-through, Twilight Orbits',
    experience: '5 Years / 200+ Flights',
    defaultPayout: 5000,
    availability: 'Available',
    status: 'Active',
    username: 'rohit_pilot',
    notes: 'Operates DJI Mavic 3 Pro Cine and Avata 2 indoor rigs.'
  },
  {
    id: 'cr-aman',
    name: 'Aman Joshi',
    phone: '+919820666778',
    email: 'aman@themaincharactermedia.com',
    role: 'Editor',
    specialization: 'Rapid Same-Day Editing, Sound Design, Trending Audio Curation',
    experience: '3 Years / On-site Specialist',
    defaultPayout: 4500,
    availability: 'Available',
    status: 'Active',
    username: 'aman_edit',
    notes: 'Mobile editing setup with M3 Max MacBook Pro for lightning fast 4K renders.'
  },
  {
    id: 'cr-kavya',
    name: 'Kavya Nair',
    phone: '+919820444556',
    email: 'kavya@themaincharactermedia.com',
    role: 'Photographer',
    specialization: 'Candid Portraits, Decor & Floral Architecture, Editorial Frames',
    experience: '5 Years / 95+ Weddings',
    defaultPayout: 6500,
    availability: 'Available',
    status: 'Active',
    username: 'kavya_nair',
    notes: 'Leica SL2 & Sony A7R V shooter for ultra-high-resolution candid stills.'
  }
];

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

const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    name: 'Ananya Singhania & Kabir Mehra',
    phone: '+919820144552',
    email: 'ananya.singhania@gmail.com',
    address: 'Bandra West, Mumbai, MH',
    instagram: '@ananyasinghania',
    notes: 'Destination 3-day royal wedding at Taj Lake Palace, Udaipur. Bride wants aesthetic slow-mo & warm vintage tones.',
    createdAt: '2026-01-05T09:00:00.000Z',
    updatedAt: '2026-01-05T09:00:00.000Z'
  },
  {
    id: 'cli-002',
    name: 'Rahul Mehta & Priya Saxena',
    phone: '+919811033910',
    email: 'rahul.priya.wedding@gmail.com',
    address: 'Worli Sea Face, Mumbai, MH',
    instagram: '@priyasaxena_official',
    notes: 'Multi-day grand wedding celebration in Mumbai. Focus on high energy Sangeet and cinematic bride entry.',
    createdAt: '2026-01-12T14:30:00.000Z',
    updatedAt: '2026-01-12T14:30:00.000Z'
  },
  {
    id: 'cli-003',
    name: 'Dr. Tanya Sharma & Neil Verma',
    phone: '+919742288190',
    email: 'tanya.sharma.md@gmail.com',
    address: 'Indiranagar, Bengaluru, KA',
    instagram: '@drtanyasharma',
    notes: 'Eco-chic intimate wedding at Tamara Resort, Coorg. Wants 100% natural candids and drone canopy shots.',
    createdAt: '2026-02-01T11:15:00.000Z',
    updatedAt: '2026-02-01T11:15:00.000Z'
  }
];

const DEFAULT_EVENTS: EventShoot[] = [
  {
    id: 'evt-rahul-priya',
    clientId: 'cli-002',
    clientName: 'Rahul Mehta & Priya Saxena',
    clientContact: {
      phone: '+919811033910',
      email: 'rahul.priya.wedding@gmail.com'
    },
    quoteId: 'qtn-002',
    category: 'Wedding',
    eventName: 'Rahul & Priya Royal Wedding',
    eventType: 'Wedding',
    startDate: '2026-10-12',
    endDate: '2026-10-14',
    venue: 'The St. Regis & Turf Club',
    locationCity: 'Mumbai',
    status: 'Confirmed',
    notes: 'Bride requested specific emphasis on custom Sabyasachi bridal veil detailing and Groom entry on vintage convertible.',
    clientRequirements: '1. Ultra-fast turnaround reels (within 12h for Sangeet & Wedding).\n2. Cinematic Sabyasachi lehenga macro jewelry shots.\n3. Complete 4K raw footage handover on Samsung T7 Shield SSD.\n4. Discrete audio lapels for vows during Phere.\n5. Drone coverage for open-air baraat & mandap.',
    consentUsageNotes: 'Full social media broadcast permissions granted for Instagram Reels & YouTube Shorts with client tag.',
    leadCreator: 'Devansh Saxena',
    crewMembers: ['Devansh Saxena', 'Tara Sen', 'Ishaan Verma', 'Rohit Bansal', 'Aman Joshi'],
    crewPayout: 28000,
    packageTotal: 95000,
    advancePaid: 50000,
    balanceDue: 45000,
    paymentDueDate: '2026-10-14',
    addOns: [
      { name: 'Same-Day Edit (SDE) Fast Track', price: 12000 },
      { name: 'Drone 4K Pilot Extended Pass', price: 8000 }
    ],
    deliverables: [
      { id: 'del-1', title: 'Full 4K Uncompressed ProRes Raw SSD Drive', completed: false, dueDate: '2026-10-14', notes: 'Master backup on dual 2TB Samsung T7 SSDs.' },
      { id: 'del-2', title: 'Bride Prep POV & Jewelry Reel', completed: false, dueDate: '2026-10-15', notes: '9:16 vertical 4K with color grade.' },
      { id: 'del-3', title: 'Same Day Sangeet Viral Drop (Midnight Cut)', completed: false, dueDate: '2026-10-13', notes: 'Delivered before midnight for Instagram.' },
      { id: 'del-4', title: 'Grand Varmala & Sacred Phere 9:16 Master Film', completed: false, dueDate: '2026-10-18', notes: 'Cinematic audio mixed with vows.' }
    ],
    subEvents: [
      {
        id: 'sub-mehendi',
        eventId: 'evt-rahul-priya',
        name: 'Mehendi Soirée',
        date: '2026-10-12',
        startTime: '04:00 PM',
        endTime: '08:30 PM',
        venue: 'The St. Regis Terrace Lawn',
        description: 'Intimate bridal mehendi application, live Rajasthani folk musicians, close-up henna macro detailing, and bridesmaid candid moments.',
        status: 'Scheduled',
        assignedCrewIds: ['cr-tara'],
        eventCharge: 15000,
        contentRequirements: ['Bride Mehendi Macro POV', 'Henna Detailing', 'Bridesmaid Candids'],
        notes: 'Bride lehenga by Anita Dongre. Warm sunset natural light.'
      },
      {
        id: 'sub-haldi',
        eventId: 'evt-rahul-priya',
        name: 'Haldi Ceremony',
        date: '2026-10-13',
        startTime: '10:00 AM',
        endTime: '02:00 PM',
        venue: 'Turf Club Lawn 1',
        description: 'Vibrant marigold petal shower, dhol beats, splash moments, and candid family laughter.',
        status: 'Scheduled',
        assignedCrewIds: ['cr-tara', 'cr-ishaan'],
        eventCharge: 15000,
        contentRequirements: ['Haldi Phoolon Ki Holi', 'Yellow Vespa Entry', 'Water Splash Candids'],
        notes: 'Waterproof protective pouches on iPhone rigs; high shutter speed for petal drops.'
      },
      {
        id: 'sub-sangeet',
        eventId: 'evt-rahul-priya',
        name: 'Sangeet Gala',
        date: '2026-10-13',
        startTime: '06:00 PM',
        endTime: '11:45 PM',
        venue: 'The St. Regis Grand Ballroom',
        description: '12 choreographed stage dance performances, groom family flash mob, and high-energy DJ floor party.',
        status: 'Scheduled',
        assignedCrewIds: ['cr-devansh', 'cr-tara', 'cr-ishaan', 'cr-aman'],
        eventCharge: 25000,
        contentRequirements: ['Stage Choreography Dance POV', 'Guest Reactions & Cheers', 'DJ Floor Party BTS'],
        notes: 'Aman on-site for same-night edit delivery before 12 AM.'
      },
      {
        id: 'sub-wedding',
        eventId: 'evt-rahul-priya',
        name: 'Royal Wedding & Phere',
        date: '2026-10-14',
        startTime: '04:30 PM',
        endTime: '09:30 PM',
        venue: 'Turf Club Mandap Stage',
        description: 'Vintage open convertible Baraat, grand floral mandap ceremony, sacred vows, and pheras.',
        status: 'Scheduled',
        assignedCrewIds: ['cr-devansh', 'cr-tara', 'cr-ishaan', 'cr-rohit'],
        eventCharge: 30000,
        contentRequirements: ['Bride POV Walk Down Aisle', 'Groom Baraat Vintage Car Entry', 'Sacred Vows & Phere Rituals', 'Drone Mandap Establishing'],
        notes: 'Drone clearance approved for Turf Club open skies until 08:30 PM.'
      },
      {
        id: 'sub-reception',
        eventId: 'evt-rahul-priya',
        name: 'Reception & Dinner Gala',
        date: '2026-10-14',
        startTime: '08:30 PM',
        endTime: '01:00 AM',
        venue: 'Turf Club Royal Arena',
        description: 'Black-tie dinner, 4-tier cake cutting, champagne toast, couple formal portraits, and live band.',
        status: 'Scheduled',
        assignedCrewIds: ['cr-devansh', 'cr-rohit'],
        eventCharge: 15000,
        contentRequirements: ['Cake Cutting & Toast POV', 'Couple Formal Portraits', 'Catering & Ambience Showcase'],
        notes: 'Stage backdrop lighting sync with production team.'
      }
    ],
    timeline: [
      {
        id: 'tl-1',
        eventId: 'evt-rahul-priya',
        time: '08:30 AM',
        title: 'Crew Call & Gear Calibration',
        description: 'Team briefing, wireless audio mic sync, camera gimbal balancing.',
        venue: 'Turf Club Lawn 1',
        assignedCrewIds: ['cr-tara', 'cr-ishaan'],
        priority: 'High',
        completed: false
      },
      {
        id: 'tl-2',
        eventId: 'evt-rahul-priya',
        time: '10:00 AM',
        title: 'Haldi Ceremony & Floral Shower',
        description: 'Candid coverage of marigold splash and couple entry on yellow vespa.',
        venue: 'Turf Club Lawn 1',
        assignedCrewIds: ['cr-tara', 'cr-ishaan'],
        priority: 'Critical',
        completed: false
      },
      {
        id: 'tl-3',
        eventId: 'evt-rahul-priya',
        time: '02:30 PM',
        title: 'Bride Preparation & First Look',
        description: 'Macro bridal jewelry, lehenga reveal, emotional mother-daughter hug, first look with father.',
        venue: 'St. Regis Suite 2201',
        assignedCrewIds: ['cr-tara'],
        priority: 'Critical',
        completed: false
      },
      {
        id: 'tl-4',
        eventId: 'evt-rahul-priya',
        time: '05:00 PM',
        title: 'Baraat Procession from Above & Ground',
        description: 'Groom on vintage convertible with 80+ dancing guests; drone tracking along turf path.',
        venue: 'Turf Club Main Gate',
        assignedCrewIds: ['cr-ishaan', 'cr-rohit', 'cr-devansh'],
        priority: 'High',
        completed: false
      },
      {
        id: 'tl-5',
        eventId: 'evt-rahul-priya',
        time: '07:30 PM',
        title: 'Varmala & Sacred Mandap Phere',
        description: 'Cold pyros sparkler entrance, sacred vows, ring exchange, blessings.',
        venue: 'Turf Club Mandap Stage',
        assignedCrewIds: ['cr-devansh', 'cr-tara', 'cr-ishaan'],
        priority: 'Critical',
        completed: false
      },
      {
        id: 'tl-6',
        eventId: 'evt-rahul-priya',
        time: '11:00 PM',
        title: 'Shoot Wrap & Instant AirDrop Handover',
        description: 'All 4K raw footage transferred to client SSD drive on site.',
        venue: 'Production Desk',
        assignedCrewIds: ['cr-devansh'],
        priority: 'High',
        completed: false
      }
    ],
    povs: [
      {
        id: 'pov-1',
        eventId: 'evt-rahul-priya',
        subEventId: 'sub-wedding',
        subEventName: 'Royal Wedding & Phere',
        type: 'Bride POV',
        description: 'First mirror reveal in bridal lehenga, delicate ear jewel fastening, eye contact with camera.',
        assignedCrewId: 'cr-tara',
        priority: 'Urgent',
        plannedTime: '03:45 PM',
        platform: 'Instagram Reels',
        plannedPostDate: '2026-10-15',
        shotNotes: '4K 60fps ProRes. Natural diffused window light. Soft focus roll.',
        status: 'Pending',
        completed: false
      },
      {
        id: 'pov-2',
        eventId: 'evt-rahul-priya',
        subEventId: 'sub-wedding',
        subEventName: 'Royal Wedding & Phere',
        type: 'Groom POV',
        description: 'Tying the safa turban with father, cufflink adjustments, laughing with groomsmen.',
        assignedCrewId: 'cr-ishaan',
        priority: 'High',
        plannedTime: '04:00 PM',
        platform: 'Instagram Reels',
        plannedPostDate: '2026-10-15',
        shotNotes: 'Wide angle crisp candid.',
        status: 'Pending',
        completed: false
      },
      {
        id: 'pov-3',
        eventId: 'evt-rahul-priya',
        subEventId: 'sub-wedding',
        subEventName: 'Royal Wedding & Phere',
        type: 'Couple POV',
        description: 'Sunset portrait editorial by Turf Club fountain garden, holding hands, whispered giggles.',
        assignedCrewId: 'cr-devansh',
        priority: 'Urgent',
        plannedTime: '05:45 PM',
        platform: 'Instagram Reels',
        plannedPostDate: '2026-10-16',
        shotNotes: 'Slow orbital pan at golden hour (05:45 PM).',
        status: 'Pending',
        completed: false
      },
      {
        id: 'pov-4',
        eventId: 'evt-rahul-priya',
        subEventId: 'sub-wedding',
        subEventName: 'Royal Wedding & Phere',
        type: 'Drone',
        description: 'Grand bird’s eye establishing shots of the entire Turf Club illuminated at twilight.',
        assignedCrewId: 'cr-rohit',
        priority: 'High',
        plannedTime: '06:15 PM',
        platform: 'Cinematic 4K',
        plannedPostDate: '2026-10-18',
        shotNotes: 'Ascend to 60m altitude; smooth push forward across mandap canopy.',
        status: 'Pending',
        completed: false
      },
      {
        id: 'pov-5',
        eventId: 'evt-rahul-priya',
        subEventId: 'sub-sangeet',
        subEventName: 'Sangeet Gala',
        type: 'Dance',
        description: 'Couple duet stage dance and fast-paced bridal squad choreographed sequence.',
        assignedCrewId: 'cr-aman',
        priority: 'High',
        plannedTime: '08:30 PM',
        platform: 'Instagram Reels',
        plannedPostDate: '2026-10-14',
        shotNotes: 'Gimbal tracking on stage rim. Audio synced directly from DJ mixer.',
        status: 'Pending',
        completed: false
      },
      {
        id: 'pov-6',
        eventId: 'evt-rahul-priya',
        subEventId: 'sub-mehendi',
        subEventName: 'Mehendi Soirée',
        type: 'Behind the scenes',
        description: 'Bridesmaids running in heels, emergency safety pin fixes, fun candid backstage banter.',
        assignedCrewId: 'cr-tara',
        priority: 'Normal',
        plannedTime: '05:00 PM',
        platform: 'TikTok',
        plannedPostDate: '2026-10-13',
        shotNotes: 'Unscripted, handheld, candid audio snippets.',
        status: 'Pending',
        completed: false
      },
      {
        id: 'pov-7',
        eventId: 'evt-rahul-priya',
        subEventId: 'sub-wedding',
        subEventName: 'Royal Wedding & Phere',
        type: 'Entry',
        description: 'Groom Baraat on open vintage convertible and Bride walking under phoolon ki chaadar.',
        assignedCrewId: 'cr-devansh',
        priority: 'Urgent',
        plannedTime: '06:00 PM',
        platform: 'Instagram Reels',
        plannedPostDate: '2026-10-16',
        shotNotes: 'Dual angle: Devansh on ground gimbal, Tara on Bride entry telephoto.',
        status: 'Pending',
        completed: false
      },
      {
        id: 'pov-8',
        eventId: 'evt-rahul-priya',
        subEventId: 'sub-wedding',
        subEventName: 'Royal Wedding & Phere',
        type: 'Rituals',
        description: 'Sacred agni phere, sindoor daan, mangalsutra ceremony, and flower petals shower.',
        assignedCrewId: 'cr-tara',
        priority: 'Urgent',
        plannedTime: '07:30 PM',
        platform: 'YouTube Shorts',
        plannedPostDate: '2026-10-17',
        shotNotes: 'Close-up emotional mother tears and smiling couple exchange.',
        status: 'Pending',
        completed: false
      },
      {
        id: 'pov-9',
        eventId: 'evt-rahul-priya',
        subEventId: 'sub-reception',
        subEventName: 'Reception & Dinner Gala',
        type: 'Decor',
        description: 'Crystal chandeliers, floral mandap arches, customized illuminated neon signs.',
        assignedCrewId: 'cr-ishaan',
        priority: 'Normal',
        plannedTime: '07:00 PM',
        platform: 'Client Drive',
        plannedPostDate: '2026-10-15',
        shotNotes: 'Smooth slider passes before guests arrive.',
        status: 'Pending',
        completed: false
      }
    ],
    crewAssignments: [
      {
        id: 'asg-1',
        eventId: 'evt-rahul-priya',
        crewId: 'cr-devansh',
        crewName: 'Devansh Saxena',
        role: 'Cinematographer',
        callTime: '09:00 AM',
        wrapTime: '11:30 PM',
        payout: 8000,
        assignedSubEventIds: ['sub-2', 'sub-4'],
        assignedPOVIds: ['pov-3'],
        notes: 'Lead director and master camera rig.',
        createdAt: '2026-01-24T10:00:00.000Z'
      },
      {
        id: 'asg-2',
        eventId: 'evt-rahul-priya',
        crewId: 'cr-tara',
        crewName: 'Tara Sen',
        role: 'Content Creator',
        callTime: '08:30 AM',
        wrapTime: '11:00 PM',
        payout: 6000,
        assignedSubEventIds: ['sub-1', 'sub-2', 'sub-3', 'sub-4'],
        assignedPOVIds: ['pov-1', 'pov-6'],
        notes: 'Dedicated Bride POV & macro jewelry detailer.',
        createdAt: '2026-01-24T10:00:00.000Z'
      },
      {
        id: 'asg-3',
        eventId: 'evt-rahul-priya',
        crewId: 'cr-ishaan',
        crewName: 'Ishaan Verma',
        role: 'Content Creator',
        callTime: '09:30 AM',
        wrapTime: '11:30 PM',
        payout: 6000,
        assignedSubEventIds: ['sub-1', 'sub-2', 'sub-3', 'sub-4'],
        assignedPOVIds: ['pov-2'],
        notes: 'Dedicated Groom POV & Baraat energy camera.',
        createdAt: '2026-01-24T10:00:00.000Z'
      },
      {
        id: 'asg-4',
        eventId: 'evt-rahul-priya',
        crewId: 'cr-rohit',
        crewName: 'Rohit Bansal',
        role: 'Drone Operator',
        callTime: '04:00 PM',
        wrapTime: '09:00 PM',
        payout: 5000,
        assignedSubEventIds: ['sub-4'],
        assignedPOVIds: ['pov-4'],
        notes: '4K aerial flights over Turf Club lawns.',
        createdAt: '2026-01-24T10:00:00.000Z'
      },
      {
        id: 'asg-5',
        eventId: 'evt-rahul-priya',
        crewId: 'cr-aman',
        crewName: 'Aman Joshi',
        role: 'Editor',
        callTime: '05:00 PM',
        wrapTime: '12:00 AM',
        payout: 4500,
        assignedSubEventIds: ['sub-2'],
        assignedPOVIds: ['pov-5'],
        notes: 'On-site mobile edit rig for midnight Instagram broadcast.',
        createdAt: '2026-01-24T10:00:00.000Z'
      }
    ],
    files: [
      {
        id: 'f-1',
        eventId: 'evt-rahul-priya',
        name: 'Official_Production_Contract_TMC_Rahul_Priya.pdf',
        category: 'Contract',
        fileType: 'PDF Document',
        fileSize: '1.4 MB',
        uploadedBy: 'Devansh Saxena',
        uploadedAt: '2026-01-24T10:30:00.000Z',
        notes: 'Digitally signed 50% advance agreement.'
      },
      {
        id: 'f-2',
        eventId: 'evt-rahul-priya',
        name: 'Bridal_Aesthetic_Moodboard_WarmVintage.pdf',
        category: 'Moodboard',
        fileType: 'PDF Document',
        fileSize: '4.8 MB',
        uploadedBy: 'Tara Sen',
        uploadedAt: '2026-01-25T14:00:00.000Z',
        notes: 'Color palettes: Marigold Yellow, Emerald Green, and Raw Ivory.'
      },
      {
        id: 'f-3',
        eventId: 'evt-rahul-priya',
        name: 'Turf_Club_Entry_Map_Vendor_Access.pdf',
        category: 'Venue Map',
        fileType: 'PDF Document',
        fileSize: '820 KB',
        uploadedBy: 'Devansh Saxena',
        uploadedAt: '2026-01-25T16:00:00.000Z',
        notes: 'Shows Gate 3 vendor entry and drone takeoff zone.'
      }
    ],
    activityLog: [
      {
        id: 'act-1',
        eventId: 'evt-rahul-priya',
        action: 'Event Created',
        details: 'Confirmed from Proposal TMC-QTN-2026-0002 with 4 Sub-events.',
        performedBy: 'Aarav Malhotra',
        timestamp: '2026-01-24T10:00:00.000Z'
      },
      {
        id: 'act-2',
        eventId: 'evt-rahul-priya',
        action: 'Crew Assigned',
        details: '5 crew members (Devansh, Tara, Ishaan, Rohit, Aman) locked on calendar.',
        performedBy: 'Devansh Saxena',
        timestamp: '2026-01-24T10:15:00.000Z'
      },
      {
        id: 'act-3',
        eventId: 'evt-rahul-priya',
        action: 'Advance Payment Logged',
        details: '₹40,000 received via UPI ICICI-491028472.',
        performedBy: 'Admin',
        timestamp: '2026-01-24T18:15:00.000Z'
      }
    ],
    createdAt: '2026-01-24T10:00:00.000Z',
    updatedAt: '2026-01-24T10:00:00.000Z'
  },
  {
    id: 'evt-ananya-kabir',
    clientId: 'cli-001',
    clientName: 'Ananya Singhania & Kabir Mehra',
    clientContact: {
      phone: '+919820144552',
      email: 'ananya.singhania@gmail.com'
    },
    quoteId: 'qtn-001',
    eventName: 'Ananya & Kabir Royal Udaipur Wedding',
    eventType: 'Wedding',
    startDate: '2026-11-20',
    endDate: '2026-11-22',
    venue: 'Taj Lake Palace & Jagmandir Island',
    locationCity: 'Udaipur, Rajasthan',
    status: 'Scheduled',
    notes: 'Destination wedding in Lake Pichola. Boat transfer logistics to be adhered to strictly.',
    consentUsageNotes: 'Signed global usage rights for agency portfolio & brand showcase.',
    leadCreator: 'Devansh Saxena',
    crewMembers: ['Devansh Saxena', 'Kavya Nair', 'Rohit Bansal'],
    crewPayout: 22000,
    packageTotal: 61360,
    advancePaid: 30000,
    balanceDue: 31360,
    deliverables: [
      { id: 'del-5', title: 'Sangeet Stage Performance Highlight', completed: false, dueDate: '2026-11-21' },
      { id: 'del-6', title: 'Boat Arrival & Baraat Cinematic Reel', completed: false, dueDate: '2026-11-21' },
      { id: 'del-7', title: 'Phere & Mandap Sacred Moments', completed: false, dueDate: '2026-11-22' }
    ],
    subEvents: [
      {
        id: 'sub-5',
        eventId: 'evt-ananya-kabir',
        name: 'Welcome Dinner & Sangeet',
        date: '2026-11-20',
        startTime: '06:00 PM',
        endTime: '11:00 PM',
        venue: 'Jagmandir Island Palace',
        description: 'Lakeside welcome cocktail and royal acoustic performance.',
        status: 'Scheduled',
        assignedCrewIds: ['cr-devansh', 'cr-kavya'],
        notes: 'Boat transfer from jetty at 05:00 PM.'
      },
      {
        id: 'sub-6',
        eventId: 'evt-ananya-kabir',
        name: 'Sacred Phere & Lake Reception',
        date: '2026-11-21',
        startTime: '04:00 PM',
        endTime: '11:00 PM',
        venue: 'Taj Lake Palace Courtyard',
        description: 'Sunset mandap overlooking Lake Pichola with royal fireworks.',
        status: 'Scheduled',
        assignedCrewIds: ['cr-devansh', 'cr-kavya', 'cr-rohit'],
        notes: 'Aerial drone capture of floating palace illuminated.'
      }
    ],
    timeline: [
      {
        id: 'tl-7',
        eventId: 'evt-ananya-kabir',
        time: '04:00 PM',
        title: 'Royal Boat Baraat Arrival',
        description: 'Groom arrives via decorated royal barge with folk musicians.',
        venue: 'Lake Pichola / Taj Jetty',
        assignedCrewIds: ['cr-devansh', 'cr-rohit'],
        priority: 'Critical',
        completed: false
      }
    ],
    povs: [
      {
        id: 'pov-7',
        eventId: 'evt-ananya-kabir',
        type: 'Bride POV',
        description: 'Jharokha window candid overlooking the lake with reflection of sunset.',
        assignedCrewId: 'cr-kavya',
        priority: 'Urgent',
        shotNotes: '4K ProRes with silhouette backlight.',
        status: 'Pending'
      }
    ],
    crewAssignments: [
      {
        id: 'asg-6',
        eventId: 'evt-ananya-kabir',
        crewId: 'cr-devansh',
        crewName: 'Devansh Saxena',
        role: 'Cinematographer',
        callTime: '03:00 PM',
        wrapTime: '11:30 PM',
        payout: 8000,
        assignedSubEventIds: ['sub-5', 'sub-6'],
        assignedPOVIds: [],
        notes: 'Lead producer on location.',
        createdAt: '2026-01-18T10:00:00.000Z'
      }
    ],
    files: [],
    activityLog: [],
    createdAt: '2026-01-18T17:00:00.000Z',
    updatedAt: '2026-01-18T17:00:00.000Z'
  }
];

const DEFAULT_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-001',
    clientId: 'cli-001',
    quoteId: 'qtn-001',
    amount: 30000,
    date: '2026-01-18',
    paymentMode: 'Bank Transfer',
    referenceNumber: 'HDFC-NEFT-928172901',
    notes: '50% advance booking deposit for Taj Lake Palace wedding.',
    createdAt: '2026-01-18T16:30:00.000Z'
  },
  {
    id: 'pay-002',
    clientId: 'cli-002',
    eventId: 'evt-rahul-priya',
    quoteId: 'qtn-002',
    amount: 40000,
    date: '2026-01-24',
    paymentMode: 'UPI',
    referenceNumber: 'UPI-ICICI-491028472',
    notes: 'Advance booking deposit for Turf Club wedding shoot.',
    createdAt: '2026-01-24T18:15:00.000Z'
  }
];

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

const DEFAULT_NOTIFICATIONS: CrewNotification[] = [
  {
    id: 'notif-1',
    crewId: 'cr-aman',
    title: 'New Shoot Assignment',
    message: 'You have been assigned to Rahul & Priya Wedding on 12 Oct 2026 as Content Creator.',
    type: 'shoot_assigned',
    eventId: 'evt-rahul-priya',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'notif-2',
    crewId: 'cr-aman',
    title: 'Call Time Confirmed',
    message: 'Call time for Taj Lands End Baraat & Wedding is set to 08:00 AM sharp.',
    type: 'call_time_changed',
    eventId: 'evt-rahul-priya',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'notif-3',
    crewId: 'cr-aman',
    title: 'Special POV Assigned',
    message: 'Bride POV (High Priority) and Transition Reel assigned to your queue.',
    type: 'pov_assigned',
    eventId: 'evt-rahul-priya',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'notif-4',
    crewId: 'cr-tara',
    title: 'New Shoot Assignment',
    message: 'Assigned as Dedicated Bride POV creator for Rahul & Priya Wedding.',
    type: 'shoot_assigned',
    eventId: 'evt-rahul-priya',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'notif-5',
    crewId: 'all',
    title: 'Production Guidelines Update',
    message: 'ProRes 4K 60fps setting mandatory for all slow-motion ceremonial captures.',
    type: 'general',
    read: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Sony FX3 + 24-70mm GM II Rig Rental',
    category: 'Equipment Rental',
    amount: 6500,
    date: '2026-02-10',
    eventId: 'evt-rahul-priya',
    eventName: 'Rahul & Priya Wedding',
    paidBy: 'Devansh Saxena',
    paymentMode: 'UPI',
    notes: '2-day rental from RentACam Mumbai with spare V-mounts.',
    createdAt: '2026-02-10T11:00:00.000Z'
  },
  {
    id: 'exp-2',
    title: '2TB SanDisk Extreme Pro SSD (x2)',
    category: 'Hard Drives & Storage',
    amount: 14200,
    date: '2026-02-11',
    eventId: 'evt-rahul-priya',
    eventName: 'Rahul & Priya Wedding',
    paidBy: 'Devansh Saxena',
    paymentMode: 'Bank Transfer',
    notes: 'Dedicated high-speed backup drive for raw footage archival.',
    createdAt: '2026-02-11T14:30:00.000Z'
  },
  {
    id: 'exp-3',
    title: 'Crew Cabs & Transport (Taj Lands End)',
    category: 'Travel & Cab',
    amount: 3200,
    date: '2026-02-12',
    eventId: 'evt-rahul-priya',
    eventName: 'Rahul & Priya Wedding',
    paidBy: 'Tara Sen',
    paymentMode: 'UPI',
    notes: 'Airport pickup & late-night gear transport back to studio.',
    createdAt: '2026-02-12T23:45:00.000Z'
  },
  {
    id: 'exp-4',
    title: 'On-set Crew Meals & Refreshments',
    category: 'Food & Catering',
    amount: 3800,
    date: '2026-02-13',
    eventId: 'evt-karan-ananya',
    eventName: 'Karan & Ananya Pre-Wedding',
    paidBy: 'Ishaan Verma',
    paymentMode: 'UPI',
    notes: 'Lunch & hydration for 4-member production team.',
    createdAt: '2026-02-13T16:00:00.000Z'
  },
  {
    id: 'exp-5',
    title: 'Godox Wireless Lav Mic Spares & Wind Muffs',
    category: 'Equipment Rental',
    amount: 2400,
    date: '2026-02-14',
    paidBy: 'Rohit Bansal',
    paymentMode: 'UPI',
    notes: 'Audio spares for outdoor seaside wind conditions.',
    createdAt: '2026-02-14T10:15:00.000Z'
  }
];

const DEFAULT_PLANNERS: PlannerVendor[] = [
  {
    id: 'pln-1',
    name: 'Rhea Singhania',
    companyName: 'The Regal Affair Luxury Weddings',
    role: 'Wedding Planner',
    phone: '+919820011223',
    email: 'rhea@theregalaffair.com',
    city: 'Mumbai',
    instagram: '@theregalaffair',
    rating: 5,
    associatedEventIds: ['evt-rahul-priya'],
    notes: 'Premier luxury wedding designer for South Mumbai & Goa destination weddings.'
  },
  {
    id: 'pln-2',
    name: 'Kabir Oberoi',
    companyName: 'Aura Event Architecture',
    role: 'Decor Designer',
    phone: '+919811445566',
    email: 'kabir@auraevents.in',
    city: 'Mumbai',
    instagram: '@aura.weddings',
    rating: 5,
    associatedEventIds: ['evt-rahul-priya'],
    notes: 'Specializes in grand floral mandaps and cinematic ambient lighting.'
  },
  {
    id: 'pln-3',
    name: 'DJ Shadow & Sound Works',
    companyName: 'SoundWave Productions',
    role: 'DJ / Sound',
    phone: '+919833778899',
    city: 'Mumbai',
    instagram: '@djshadowmumbai',
    rating: 4.8,
    notes: 'High-energy Sangeet and after-party specialist.'
  }
];

const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'TMC-INV-2026-0001',
    eventId: 'evt-rahul-priya',
    quoteId: 'qtn-002',
    clientId: 'cli-002',
    clientName: 'Rahul Mehta & Priya Saxena',
    clientPhone: '+919811033910',
    clientEmail: 'rahul.mehta@gmail.com',
    clientAddress: 'Worli Sea Face, Mumbai',
    eventName: 'Rahul & Priya Royal Wedding',
    eventType: 'Wedding',
    eventDate: '2026-10-12',
    issueDate: '2026-01-24',
    dueDate: '2026-10-12',
    items: [
      { id: 'ii-1', name: 'Wedding Day & Phere Ceremony', description: 'Complete 8h coverage, 2 creators', quantity: 1, rate: 25000, amount: 25000 },
      { id: 'ii-2', name: 'Haldi & Phoolon Ki Holi', description: 'Floral slow-motion video coverage', quantity: 1, rate: 8000, amount: 8000 },
      { id: 'ii-3', name: 'Mehendi Ceremony', description: 'Intimate Henna storytelling', quantity: 1, rate: 8000, amount: 8000 },
      { id: 'ii-4', name: 'Sangeet Gala & Performances', description: 'Stage dance choreography POV', quantity: 1, rate: 12000, amount: 12000 },
      { id: 'ii-5', name: 'Reception Evening & Dinner', description: 'Grand evening entrance & speeches', quantity: 1, rate: 10000, amount: 10000 },
      { id: 'ii-6', name: 'Aerial Drone 4K Coverage', description: 'DGCA certified aerial coverage', quantity: 1, rate: 5000, amount: 5000 },
      { id: 'ii-7', name: 'Social Reels Package (5 edits)', description: 'Color graded vertical reels', quantity: 1, rate: 3000, amount: 3000 },
      { id: 'ii-8', name: 'Extra Photographer (Candid)', description: 'Dedicated candid specialist', quantity: 1, rate: 4000, amount: 4000 }
    ],
    subtotal: 75000,
    discountType: 'flat',
    discountValue: 0,
    discountAmount: 0,
    taxPercentage: 18,
    taxAmount: 13500,
    grandTotal: 88500,
    amountPaid: 40000,
    balanceDue: 48500,
    paymentStatus: 'Partially Paid',
    notes: 'Thank you for choosing The Main Character Media for your wedding coverage.',
    terms: '1. Payment due prior to final edited reels delivery.\n2. Raw footage transfer completed via portable SSD.\n3. Bank details: HDFC Bank A/C 50200088912344, IFSC HDFC0000045.',
    createdAt: '2026-01-24T18:00:00.000Z',
    updatedAt: '2026-01-24T18:00:00.000Z'
  }
];

export class StorageService {
  private static notifyListeners() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tmc_storage_updated'));
    }
  }

  static initialize(): void {
    if (typeof window === 'undefined') return;

    // Remove all dummy data on initial load to connect with clean Firebase storage as requested
    const dummyCleared = localStorage.getItem('tmc_dummy_data_cleared_v3');
    if (!dummyCleared) {
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
      localStorage.setItem('tmc_dummy_data_cleared_v3', 'true');
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
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CREW_ID, 'cr-aman');
    }
    if (!localStorage.getItem(STORAGE_KEYS.APP_VIEW_MODE)) {
      localStorage.setItem(STORAGE_KEYS.APP_VIEW_MODE, 'admin');
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
      id: `cr-${Date.now()}`,
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
      notes: crewData.notes || '',
      createdAt: now,
      updatedAt: now
    };

    roster.unshift(newCrew);
    localStorage.setItem(STORAGE_KEYS.CREW_ROSTER, JSON.stringify(roster));
    this.notifyListeners();
    return newCrew;
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
      return data ? JSON.parse(data) : DEFAULT_EVENTS;
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
        const updated: EventShoot = {
          ...existing,
          ...eventData,
          updatedAt: now
        };
        events[idx] = updated;
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
        saveEventToFirestore(updated).catch(() => {});
        this.notifyListeners();
        return updated;
      }
    }

    const startDate = eventData.startDate || (eventData as any).shootDate || new Date().toISOString().split('T')[0];
    const endDate = eventData.endDate || startDate;
    const packageTotal = Number(eventData.packageTotal) || 35000;
    const advancePaid = Number(eventData.advancePaid) || 0;
    const balanceDue = Math.max(0, packageTotal - advancePaid);

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
      leadCreator: eventData.leadCreator || 'Devansh Saxena',
      crewMembers: eventData.crewMembers || ['Devansh Saxena'],
      crewAssignments: eventData.crewAssignments || [],
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
          assignedCrewIds: [],
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
          assignedCrewIds: [],
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
          details: `Event created for ${eventData.clientName}.`,
          performedBy: 'Admin',
          timestamp: now
        }
      ],
      crewPayout: Number(eventData.crewPayout) || 12000,
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
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    saveEventToFirestore(newEvent).catch(() => {});
    this.notifyListeners();
    return newEvent;
  }

  static deleteEvent(eventId: string): boolean {
    const events = this.getEvents();
    const filtered = events.filter(e => e.id !== eventId);
    if (filtered.length !== events.length) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(filtered));
      deleteEventFromFirestore(eventId).catch(() => {});
      this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notifyListeners();
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
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notifyListeners();
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
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notifyListeners();
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
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notifyListeners();
    return newAssignment;
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
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notifyListeners();
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
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notifyListeners();
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
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notifyListeners();
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
        localStorage.setItem(STORAGE_KEYS.EVENT_CHARGES, JSON.stringify(charges));
        this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.EVENT_CHARGES, JSON.stringify(charges));
    this.notifyListeners();
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
      localStorage.setItem(STORAGE_KEYS.EVENT_CHARGES, JSON.stringify(charges));
      this.notifyListeners();
      return { 
        success: true, 
        action: 'archived', 
        message: 'This event charge is referenced in existing quotations. Marked as Archived to preserve historical financial integrity.' 
      };
    } else {
      charges.splice(idx, 1);
      localStorage.setItem(STORAGE_KEYS.EVENT_CHARGES, JSON.stringify(charges));
      this.notifyListeners();
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
        localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(list));
        this.notifyListeners();
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
      salesperson: enquiry.salesperson || 'Aarav Malhotra',
      pipelineStage: enquiry.pipelineStage || 'New',
      followUps: enquiry.followUps || [],
      archived: enquiry.archived || false,
      createdAt: now,
      updatedAt: now
    };

    list.unshift(newEnquiry);
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(list));
    this.notifyListeners();
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

    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(list));
    this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(list));

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
        leadCreator: enquiry.salesperson || 'Devansh Saxena',
        crewMembers: ['Devansh Saxena', 'Tara Sen'],
        crewPayout: Math.round((enquiry.budget || 35000) * 0.35),
        packageTotal: enquiry.budget || 35000,
        advancePaid: 0,
        balanceDue: enquiry.budget || 35000,
        notes: `Converted from lead CRM. Services required: ${enquiry.servicesRequired.join(', ')}`
      });
    }

    this.notifyListeners();
    return { client: newClient, event: createdEvent };
  }

  static toggleArchiveEnquiry(enquiryId: string): boolean {
    const list = this.getEnquiries();
    const idx = list.findIndex(e => e.id === enquiryId);
    if (idx === -1) return false;
    list[idx].archived = !list[idx].archived;
    list[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(list));
    this.notifyListeners();
    return true;
  }

  static deleteEnquiry(enquiryId: string): boolean {
    const list = this.getEnquiries();
    const filtered = list.filter(e => e.id !== enquiryId);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(filtered));
      this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotes));

    if (newQuote.enquiryId) {
      const enquiries = this.getEnquiries();
      const enq = enquiries.find(e => e.id === newQuote.enquiryId);
      if (enq && (enq.pipelineStage === 'New' || enq.pipelineStage === 'Contacted' || enq.pipelineStage === 'Requirement Collected')) {
        enq.pipelineStage = 'Quote Sent';
        enq.updatedAt = now;
        localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(enquiries));
      }
    }

    this.notifyListeners();
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

    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotes));
    this.notifyListeners();
    return quotes[idx];
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
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
        this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    this.notifyListeners();
    return newClient;
  }

  // --- PAYMENTS ---
  static getPayments(): PaymentRecord[] {
    this.initialize();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return data ? JSON.parse(data) : DEFAULT_PAYMENTS;
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
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

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
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      }
    }

    this.notifyListeners();
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
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
        this.notifyListeners();
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
      paidBy: expenseData.paidBy || 'Devansh Saxena',
      paymentMode: expenseData.paymentMode || 'UPI',
      notes: expenseData.notes || '',
      createdAt: now
    };

    expenses.unshift(newExpense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    this.notifyListeners();
    return newExpense;
  }

  static deleteExpense(id: string): boolean {
    const expenses = this.getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    if (filtered.length !== expenses.length) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
      this.notifyListeners();
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
        localStorage.setItem(STORAGE_KEYS.PLANNERS, JSON.stringify(planners));
        this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.PLANNERS, JSON.stringify(planners));
    this.notifyListeners();
    return newPlanner;
  }

  static deletePlanner(id: string): boolean {
    const planners = this.getPlanners();
    const filtered = planners.filter(p => p.id !== id);
    if (filtered.length !== planners.length) {
      localStorage.setItem(STORAGE_KEYS.PLANNERS, JSON.stringify(filtered));
      this.notifyListeners();
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
        localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
        savePartnerToFirestore(partners[idx]).catch(() => {});
        this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
    savePartnerToFirestore(newPartner).catch(() => {});
    this.notifyListeners();
    return newPartner;
  }

  static deletePartner(id: string): boolean {
    const partners = this.getPartners();
    const filtered = partners.filter(p => p.id !== id);
    if (filtered.length !== partners.length) {
      localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(filtered));
      deletePartnerFromFirestore(id).catch(() => {});
      this.notifyListeners();
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
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
        this.notifyListeners();
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
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    this.notifyListeners();
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

  static deleteInvoice(invoiceId: string): boolean {
    const invoices = this.getInvoices();
    const filtered = invoices.filter(i => i.id !== invoiceId);
    if (filtered.length !== invoices.length) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(filtered));
      this.notifyListeners();
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
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
      this.notifyListeners();
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

      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
      this.notifyListeners();
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
      outstandingInvoicesAmount
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
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.notifyListeners();
    return true;
  }

  // --- ACTIVE CREW MEMBER & VIEW MODE ---
  static getActiveCrewMemberId(): string {
    this.initialize();
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CREW_ID) || 'cr-aman';
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
}
