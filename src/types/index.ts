export type PipelineStage = 
  | 'New'
  | 'Contacted'
  | 'Discussion'
  | 'Requirement Collected'
  | 'Quote Sent'
  | 'Negotiation'
  | 'Confirmed'
  | 'Lost';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue';

export type QuoteStatus = 
  | 'Draft'
  | 'Sent'
  | 'Viewed'
  | 'Accepted'
  | 'Rejected'
  | 'Expired'
  | 'Converted';

export type EventStatus = 
  | 'Inquiry'
  | 'Quoted'
  | 'Negotiation'
  | 'Confirmed'
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'Archived';

export type ChargeStatus = 'Active' | 'Archived';

export type CrewRole = 
  | 'Photographer'
  | 'Videographer'
  | 'Content Creator'
  | 'Cinematographer'
  | 'Drone Operator'
  | 'Editor'
  | 'Assistant'
  | 'Social Media Manager';

export type POVType = 
  | 'Bride POV'
  | 'Groom POV'
  | 'Couple POV'
  | 'Family POV'
  | 'Family'
  | 'Rituals'
  | 'Catering'
  | 'Decor'
  | 'Venue'
  | 'Guest reactions'
  | 'Guests'
  | 'Entry'
  | 'Dance'
  | 'Behind the scenes'
  | 'BTS'
  | 'Interviews'
  | 'Drone'
  | 'Cinematic shots'
  | 'Cinematic'
  | 'Photographer coverage'
  | 'Photography'
  | 'Videography'
  | 'Reels'
  | 'Custom POV'
  | 'Custom';

export type POVStatus = 
  | 'Pending'
  | 'In Progress'
  | 'Captured'
  | 'Reviewed'
  | 'Delivered';

export type EventFileCategory = 
  | 'Contract'
  | 'Moodboard'
  | 'Shot List'
  | 'Venue Map'
  | 'Reference Media'
  | 'PDF'
  | 'Image'
  | 'Other';

export interface FollowUp {
  id: string;
  date: string;
  notes: string;
  createdBy: string;
  nextFollowUpDate?: string;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  clientName: string;
  phone: string;
  whatsapp?: string;
  email: string;
  eventName: string;
  eventType: string; // Shoot type (Wedding, Haldi, etc.)
  shootType?: string;
  date: string; // Event date
  venue: string;
  budget: number;
  expectedBudget?: number;
  requirements?: string;
  servicesRequired: string[];
  leadSource: string;
  notes: string;
  followUpDate: string;
  salesperson: string;
  pipelineStage: PipelineStage;
  createdAt: string;
  updatedAt: string;
  followUps: FollowUp[];
  convertedToClientId?: string;
  archived?: boolean;
}

export interface EventCharge {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  crewRequirement: string;
  includedServices: string[];
  optionalAddOns: string[];
  notes?: string;
  status: ChargeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  chargeId?: string;
  name: string;
  description: string;
  rate: number;
  quantity: number;
  discount?: number; // per item discount amount or percentage
  tax?: number; // per item tax percentage if applicable
  crewRequirement?: string;
  duration?: string;
  includedServices?: string[];
  amount: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  clientId?: string;
  enquiryId?: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress?: string;
  clientInstagram?: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  venue: string;
  items: QuoteItem[];
  subtotal: number;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  grandTotal: number;
  advanceAmount: number;
  balanceAmount: number;
  notes: string;
  terms: string;
  status: QuoteStatus;
  createdAt: string;
  validUntil: string;
  sentAt?: string;
  acceptedAt?: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  eventId?: string;
  quoteId?: string;
  clientId?: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress?: string;
  eventName: string;
  eventType: string;
  eventDate?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: InvoiceStatus;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  clientId: string;
  eventId?: string;
  quoteId?: string;
  amount: number;
  date: string;
  paymentMode: 'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Credit Card';
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  instagram?: string;
  fromEnquiryId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrewMember {
  id: string;
  name: string;
  photo?: string;
  phone: string; // Normalized: +919876543210
  email: string;
  role: CrewRole;
  specialization: string;
  experience: string;
  defaultPayout: number;
  availability: 'Available' | 'Booked' | 'Unavailable';
  status: 'Active' | 'Inactive';
  username?: string;
  password?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationVenue {
  id: string;
  venue: string;
  address: string;
  city: string;
  googleMapsLink?: string;
  contactPerson?: string;
  phone?: string;
  parking?: string;
  accessInstructions?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubEvent {
  id: string;
  eventId: string;
  name: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "10:30 AM"
  endTime: string; // "02:00 PM"
  venue: string;
  description?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  assignedCrewIds: string[];
  notes?: string;
  eventCharge?: number; // Allocated function fee
  contentRequirements?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TimelineItem {
  id: string;
  eventId: string;
  subEventId?: string;
  time: string; // e.g. "08:00 AM"
  title: string;
  description?: string;
  venue?: string;
  assignedCrewIds: string[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  notes?: string;
  completed?: boolean;
}

export interface POVItem {
  id: string;
  eventId: string;
  subEventId?: string;
  subEventName?: string;
  type: POVType;
  customTypeName?: string;
  description: string;
  assignedCrewId?: string;
  assignedCrewName?: string;
  priority: 'Normal' | 'High' | 'Urgent';
  shotNotes?: string;
  notes?: string;
  status: POVStatus;
  plannedTime?: string;
  platform?: 'Instagram Reels' | 'TikTok' | 'YouTube Shorts' | 'Client Drive' | 'Raw Delivery' | 'Cinematic 4K';
  plannedPostDate?: string;
  completed?: boolean;
  capturedAt?: string;
  deliveredAt?: string;
  previewUrl?: string;
}

export interface EventCrewAssignment {
  id: string;
  eventId: string;
  crewId: string;
  crewName: string;
  role: CrewRole | string;
  phone?: string;
  callTime: string;
  wrapTime: string;
  reportingLocation?: string;
  payout: number;
  assignedSubEventIds: string[];
  assignedPOVIds: string[];
  notes?: string;
  overrideConflictConfirmed?: boolean;
  createdAt: string;
}

export interface EventFile {
  id: string;
  eventId: string;
  name: string;
  category: EventFileCategory;
  fileType: string;
  fileSize: string;
  url?: string;
  dataUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  notes?: string;
}

export interface EventActivityLog {
  id: string;
  eventId: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
}

export interface EventDeliverable {
  id: string;
  title: string;
  type?: 'Highlight Reel' | 'Full Ceremony Video' | 'Teaser' | 'Raw AirDrop' | 'Social Reel' | 'Drone Cut' | 'Photos Album';
  completed: boolean;
  dueDate?: string;
  assignedEditorId?: string;
  notes?: string;
  fileUrl?: string;
}

export interface CrewNotification {
  id: string;
  crewId: string; // 'all' or crewId
  title: string;
  message: string;
  type: 
    | 'shoot_assigned' 
    | 'call_time_changed' 
    | 'venue_changed' 
    | 'pov_assigned' 
    | 'timeline_changed' 
    | 'shoot_cancelled' 
    | 'general';
  eventId?: string;
  read: boolean;
  createdAt: string;
}

export interface CrewReminderRecord {
  id: string;
  eventId: string;
  crewId: string;
  crewName: string;
  phone: string;
  role: string;
  message: string;
  timestamp: string;
  adminName: string;
  status: 'Prepared' | 'WhatsApp Opened' | 'Cancelled';
}

export interface ReminderSettings {
  reminder24hEnabled: boolean;
  reminder2hEnabled: boolean;
  defaultTemplate: string;
}

export interface EventShoot {
  id: string;
  category?: 'Wedding' | 'Event Planner' | 'Other Shoot';
  clientId: string;
  clientName: string;
  clientContact?: {
    phone: string;
    email: string;
  };
  enquiryId?: string;
  quoteId?: string;
  eventName: string;
  eventType: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  shootDate?: string;
  shootTime?: string;
  venue: string;
  locationId?: string;
  locationCity: string;
  city?: string;
  status: EventStatus;
  notes: string;
  clientRequirements?: string;
  consentUsageNotes?: string;
  leadCreator: string;
  crewMembers: string[];
  crewAssignments: EventCrewAssignment[];
  subEvents: SubEvent[];
  timeline: TimelineItem[];
  povs: POVItem[];
  files: EventFile[];
  activityLog: EventActivityLog[];
  crewReminders?: CrewReminderRecord[];
  crewPayout: number;
  packageTotal: number;
  advancePaid: number;
  balanceDue: number;
  paymentDueDate?: string;
  addOns?: { name: string; price: number }[];
  deliverables: EventDeliverable[];
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 
    | 'Equipment Rental' 
    | 'Travel & Cab' 
    | 'Food & Catering' 
    | 'Hard Drives & Storage' 
    | 'Studio & Office' 
    | 'Costumes & Props' 
    | 'Miscellaneous';
  amount: number;
  date: string; // YYYY-MM-DD
  eventId?: string;
  eventName?: string;
  paidBy?: string;
  paymentMode: 'UPI' | 'Bank Transfer' | 'Cash' | 'Credit Card';
  notes?: string;
  createdAt: string;
}

export interface PlannerVendor {
  id: string;
  name: string;
  companyName: string;
  role: 'Wedding Planner' | 'Decor Designer' | 'DJ / Sound' | 'MUA' | 'Choreographer' | 'Caterer' | 'Venue Manager';
  phone: string;
  email?: string;
  city: string;
  instagram?: string;
  rating?: number;
  associatedEventIds?: string[];
  notes?: string;
}

export interface DashboardMetrics {
  upcomingShootsCount: number;
  thisMonthShootsCount: number;
  pendingBalanceTotal: number;
  crewOnRosterCount: number;
  totalRevenue: number;
  collectedRevenue: number;
  crewPayoutTotal: number;
  grossProfit: number;
  pendingEnquiriesCount: number;
  // Extended ERP metrics:
  todayShootsCount: number;
  activeJobsCount: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  estimatedProfit: number;
  newEnquiriesCount: number;
  outstandingInvoicesCount?: number;
  outstandingInvoicesAmount?: number;
}
