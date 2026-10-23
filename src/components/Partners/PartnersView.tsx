import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Calendar, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Sparkles, 
  CalendarDays, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Edit3, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Partner, EventShoot } from '../../types';
import { StorageService } from '../../services/storage';

interface PartnersViewProps {
  partners: Partner[];
  events: EventShoot[];
  onOpenPartnerCalendar: (partner: Partner) => void;
  onRefreshData: () => void;
  onOpenNewEventForPartner: (partner: Partner) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  partners,
  events,
  onOpenPartnerCalendar,
  onRefreshData,
  onOpenNewEventForPartner
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [role, setRole] = useState('Event Company');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [commissionOrTerms, setCommissionOrTerms] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingPartner(null);
    setCompanyName('');
    setContactPerson('');
    setRole('Event Company');
    setPhone('');
    setEmail('');
    setCity('Mumbai');
    setCommissionOrTerms('Standard Outsourced Vendor');
    setInstagram('');
    setWebsite('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (partner: Partner, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPartner(partner);
    setCompanyName(partner.companyName);
    setContactPerson(partner.contactPerson || partner.name || '');
    setRole(partner.role || 'Event Company');
    setPhone(partner.phone);
    setEmail(partner.email || '');
    setCity(partner.city || 'Mumbai');
    setCommissionOrTerms(partner.commissionOrTerms || '');
    setInstagram(partner.instagram || '');
    setWebsite(partner.website || '');
    setNotes(partner.notes || '');
    setIsModalOpen(true);
  };

  const handleDeletePartner = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this partner agency?')) {
      StorageService.deletePartner(id);
      if (selectedPartnerId === id) setSelectedPartnerId(null);
      onRefreshData();
    }
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !phone.trim()) return;

    StorageService.savePartner({
      id: editingPartner?.id,
      companyName: companyName.trim(),
      name: contactPerson.trim() || companyName.trim(),
      contactPerson: contactPerson.trim(),
      role,
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      commissionOrTerms: commissionOrTerms.trim(),
      instagram: instagram.trim(),
      website: website.trim(),
      notes: notes.trim()
    });

    setIsModalOpen(false);
    onRefreshData();
  };

  const filteredPartners = (partners || []).filter(p => {
    if (!p) return false;
    const compName = (p.companyName || p.name || '').toLowerCase();
    const contact = (p.contactPerson || '').toLowerCase();
    const city = (p.city || '').toLowerCase();
    const role = (p.role || '').toLowerCase();
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return true;
    return compName.includes(q) || contact.includes(q) || city.includes(q) || role.includes(q);
  });

  // Helper to get partner events
  const getPartnerEvents = (partnerId: string) => {
    if (!partnerId) return [];
    return (events || []).filter(e => 
      e.partnerId === partnerId || 
      (e.notes && e.notes.toLowerCase().includes(partnerId.toLowerCase()))
    );
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#C58B39] font-semibold">
            B2B Agencies & Outsourced Event Companies
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-0.5 tracking-tight">
            Partners & Event Planners
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5 max-w-2xl">
            Partner agencies and event companies that outsource shoots to The Main Character Media. Click any partner card to view their dedicated calendar, schedule new outsourced shoots, and sync automatically with the Weddings & Jobs section.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors shadow-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-[#C58B39]" />
          <span>+ Add Partner Company</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 font-medium">Active Partner Agencies</span>
          <div className="font-serif text-2xl font-bold text-neutral-900 font-mono mt-1">
            {(partners || []).length} Companies
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Outsourcing production & video shoots</div>
        </div>

        <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 font-medium">Outsourced Shoots Booked</span>
          <div className="font-serif text-2xl font-bold text-[#C58B39] font-mono mt-1">
            {(events || []).filter(e => e.partnerId).length} Shoots
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Synced with Weddings/Jobs schedule</div>
        </div>

        <div className="bg-white border border-[#E8E3D9] p-4 rounded-xl shadow-xs">
          <span className="text-xs text-neutral-500 font-medium">Outsourced Production Value</span>
          <div className="font-serif text-2xl font-bold text-emerald-700 font-mono mt-1">
            ₹{(events || []).filter(e => e.partnerId).reduce((sum, e) => sum + (e.packageTotal || 0), 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Gross outsourced contract volume</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search partners by company name, contact, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E3D9] rounded-lg text-xs text-neutral-900 focus:outline-none focus:border-[#C58B39]"
          />
        </div>
        <div className="text-xs text-neutral-500 font-mono">
          Showing {filteredPartners.length} of {(partners || []).length}
        </div>
      </div>

      {/* PARTNERS LIST & BELOW CARD INTEGRATED SECTIONS */}
      <div className="space-y-6">
        {filteredPartners.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-[#E8E3D9] text-xs text-neutral-500 space-y-3">
            <Building2 className="w-8 h-8 text-neutral-300 mx-auto" />
            <div className="font-medium text-neutral-800">No partner companies added yet.</div>
            <p className="max-w-md mx-auto text-neutral-500">
              Add your first partner event company or agency. Once added, click the card to open their calendar and add synced outsourced shoots.
            </p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-[#121212] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              + Add Partner Now
            </button>
          </div>
        ) : (
          filteredPartners.map((partner) => {
            const partnerEvents = getPartnerEvents(partner.id);
            const isSelected = selectedPartnerId === partner.id;
            const displayName = partner.companyName || partner.name || 'Partner Company';
            const initialLetter = displayName.charAt(0).toUpperCase() || 'P';

            return (
              <div 
                key={partner.id}
                className="bg-white border border-[#E8E3D9] rounded-xl overflow-hidden shadow-xs transition-all hover:border-[#C58B39]"
              >
                {/* Main Partner Card Clickable Header */}
                <div 
                  onClick={() => {
                    setSelectedPartnerId(isSelected ? null : partner.id);
                  }}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none hover:bg-[#FAF8F5]/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1F1E1C] border border-[#C58B39] text-[#C58B39] flex items-center justify-center font-serif text-xl font-bold shrink-0 shadow-2xs">
                      {initialLetter}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                          {displayName}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] text-neutral-700 border border-[#E8E3D9] font-semibold uppercase">
                          {partner.role || 'Event Company'}
                        </span>
                        {partner.city && (
                          <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#C58B39]" />
                            {partner.city}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-neutral-600 flex-wrap">
                        {partner.contactPerson && (
                          <span>Contact: <strong className="text-neutral-800">{partner.contactPerson}</strong></span>
                        )}
                        {partner.phone && (
                          <span className="font-mono text-neutral-700">📞 {partner.phone}</span>
                        )}
                        {partner.email && (
                          <span className="text-neutral-600">✉️ {partner.email}</span>
                        )}
                        {partner.commissionOrTerms && (
                          <span className="text-[#C58B39] font-medium">📋 {partner.commissionOrTerms}</span>
                        )}
                      </div>

                      {partner.notes && (
                        <p className="text-xs text-neutral-500 italic pt-0.5 line-clamp-1">
                          "{partner.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side CTA actions */}
                  <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPartnerCalendar(partner);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#C58B39] hover:bg-[#B37B2E] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                      title="Open full interactive schedule calendar for this partner"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Open Calendar</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNewEventForPartner(partner);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                      title="Add outsourced shoot for this partner that syncs to weddings/jobs"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
                      <span>+ Add Event</span>
                    </button>

                    <button
                      onClick={(e) => openEditModal(partner, e)}
                      className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Edit partner details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDeletePartner(partner.id, e)}
                      className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete partner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* BELOW THE CARD SECTION:
                    Shows the partner's booked events synced with weddings/jobs, dates, call times & quick actions */}
                <div className="p-4 sm:p-5 bg-[#FAF8F5] border-t border-[#E8E3D9] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase font-bold text-neutral-700 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-[#C58B39]" />
                        <span>Outsourced Shoots & Calendar Schedule</span>
                      </span>
                      <span className="font-mono text-[10px] bg-white border border-[#E8E3D9] px-2 py-0.2 rounded-full font-bold text-neutral-700">
                        {partnerEvents.length} Synced
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenPartnerCalendar(partner)}
                      className="text-xs font-semibold text-[#C58B39] hover:underline flex items-center gap-1"
                    >
                      <span>View on Calendar View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {partnerEvents.length === 0 ? (
                    <div className="p-4 bg-white rounded-lg border border-[#E8E3D9] text-center text-xs text-neutral-500 flex items-center justify-between">
                      <span>No shoots assigned to this partner yet. Click "+ Add Event" to schedule an outsourced shoot.</span>
                      <button
                        onClick={() => onOpenNewEventForPartner(partner)}
                        className="px-3 py-1 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-black"
                      >
                        + Schedule Shoot
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {partnerEvents.map((ev) => (
                        <div 
                          key={ev.id}
                          className="p-3.5 bg-white border border-[#E8E3D9] rounded-lg shadow-2xs space-y-2 hover:border-[#C58B39] transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-[10px] font-mono text-[#C58B39] font-bold">
                                📅 {ev.startDate} {ev.endDate && ev.endDate !== ev.startDate ? `to ${ev.endDate}` : ''}
                              </div>
                              <h4 className="font-serif font-bold text-sm text-neutral-900 mt-0.5">
                                {ev.eventName}
                              </h4>
                              <div className="text-[11px] text-neutral-600">Client: {ev.clientName}</div>
                            </div>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3D9] font-bold text-neutral-800">
                              {ev.status}
                            </span>
                          </div>

                          <div className="text-xs text-neutral-600 flex items-center gap-1 truncate">
                            <span>📍</span>
                            <span>{ev.venue}</span>
                          </div>

                          <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-neutral-900">
                              ₹{ev.packageTotal.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                              Synced with Jobs ✓
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Partner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E8E3D9] max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-neutral-900">
              {editingPartner ? 'Edit Partner Company' : 'Add Partner Event Company'}
            </h3>
            <p className="text-xs text-neutral-500">
              Add event management firms, wedding planning houses, or agencies that outsource video and photography coverage to us.
            </p>

            <form onSubmit={handleSavePartner} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Company / Agency Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. WedMeGood Experiences / Signature Weddings"
                  className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Karan Singhania"
                    className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Role / Category</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] text-xs font-medium"
                  >
                    <option value="Event Company">Event Company</option>
                    <option value="Wedding Planner">Wedding Planner</option>
                    <option value="Production House">Production House</option>
                    <option value="Creative Agency">Creative Agency</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919820011223"
                    className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@events.com"
                    className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Operating City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai / Goa / Delhi"
                    className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Commission / Terms</label>
                  <input
                    type="text"
                    value={commissionOrTerms}
                    onChange={(e) => setCommissionOrTerms(e.target.value)}
                    placeholder="e.g. 15% agency cut or Fixed Rate"
                    className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Instagram Handle / Website</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@signatureweddings.in"
                  className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Internal Notes & Preferences</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special client styles, delivery requirements, preferred creator roster..."
                  className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5] text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E3D9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#121212] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
