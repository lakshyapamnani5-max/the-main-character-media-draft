import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Users, AlertTriangle, Check, UserCheck, Clock, IndianRupee, Wallet, CheckCircle2 } from 'lucide-react';
import { EventShoot, EventStatus, EventDeliverable, Client, CrewMember, CrewRole, EventCrewAssignment, Partner, SubEvent } from '../../types';
import { StorageService } from '../../services/storage';
import { getTodayDateString } from '../../utils/dateUtils';

interface EventCrewSelection {
  crewId: string;
  crewName: string;
  role: CrewRole | string;
  callTime: string;
  wrapTime: string;
  payout: number | '';
  advancePaid?: number | '';
  showPayoutConfig?: boolean;
  isPaidFull?: boolean;
  paymentMode?: string;
  phone?: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<EventShoot> & { eventName: string; clientName: string }) => void;
  initialData?: EventShoot | null;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [category, setCategory] = useState<'Wedding' | 'Event Planner' | 'Other Shoot'>('Wedding');
  const [partnerId, setPartnerId] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shootTime, setShootTime] = useState('14:00 - 22:00');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [leadCreator, setLeadCreator] = useState('');
  const [selectedCrew, setSelectedCrew] = useState<EventCrewSelection[]>([]);
  const [crewPayout, setCrewPayout] = useState<number | ''>('');
  const [packageTotal, setPackageTotal] = useState<number | ''>('');
  const [advancePaid, setAdvancePaid] = useState<number | ''>('');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [status, setStatus] = useState<EventStatus>('Confirmed');
  const [clientRequirements, setClientRequirements] = useState('');
  const [deliverables, setDeliverables] = useState<EventDeliverable[]>([]);
  const [newDeliverableTitle, setNewDeliverableTitle] = useState('');
  const [notes, setNotes] = useState('');
  // Track whether the user has manually diverged Event Name or End Date
  const [isEventNameCustomized, setIsEventNameCustomized] = useState(false);
  const [isEndDateCustomized, setIsEndDateCustomized] = useState(false);
  const [subEvents, setSubEvents] = useState<SubEvent[]>([]);
  const [customFunctionName, setCustomFunctionName] = useState('');
  const [customFunctionCharge, setCustomFunctionCharge] = useState<number | ''>('');
  const [eventCategories, setEventCategories] = useState<string[]>(() => StorageService.getEventCategories());
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setIsAddingCategory(false);
      return;
    }
    const updated = StorageService.addEventCategory(trimmed);
    setEventCategories(updated);
    setEventType(trimmed);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const clients = StorageService.getClients();
  const partners = StorageService.getPartners();
  const crewRoster = StorageService.getCrewRoster().filter(c => c.status === 'Active');

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || 'Wedding');
      setPartnerId(initialData.partnerId || '');
      setPartnerName(initialData.partnerName || '');
      setClientId(initialData.clientId);
      setClientName(initialData.clientName);
      setClientPhone(initialData.clientContact?.phone || '');
      setClientEmail(initialData.clientContact?.email || '');
      setEventName(initialData.eventName);
      setEventType(initialData.eventType);
      const start = initialData.startDate || initialData.shootDate || '';
      const end = initialData.endDate || start;
      setStartDate(start);
      setEndDate(end);
      setIsEventNameCustomized(Boolean(initialData.eventName && initialData.eventName !== initialData.clientName));
      setIsEndDateCustomized(Boolean(end && start && end !== start));
      setShootTime(initialData.shootTime || '14:00 - 22:00');
      setVenue(initialData.venue);
      setCity(initialData.locationCity || initialData.city || 'Mumbai');
      setLeadCreator(initialData.leadCreator || '');

      // Populate selected crew from existing assignments or crew members
      if (initialData.crewAssignments && initialData.crewAssignments.length > 0) {
        setSelectedCrew(initialData.crewAssignments.map(a => {
          const payoutVal = a.payout !== undefined ? a.payout : 6000;
          const advanceVal = a.paidAmount !== undefined ? a.paidAmount : (a.paymentStatus === 'Paid' ? payoutVal : 0);
          const isFull = a.paymentStatus === 'Paid' || (payoutVal > 0 && advanceVal >= payoutVal);
          return {
            crewId: a.crewId,
            crewName: a.crewName,
            role: a.role,
            callTime: a.callTime || '08:00 AM',
            wrapTime: a.wrapTime || '11:00 PM',
            payout: payoutVal,
            advancePaid: advanceVal,
            showPayoutConfig: Boolean((a.payout && a.payout > 0) || advanceVal > 0 || a.paymentStatus === 'Paid'),
            isPaidFull: isFull,
            paymentMode: a.paymentMode || 'UPI',
            phone: a.phone
          };
        }));
      } else if (initialData.crewMembers && initialData.crewMembers.length > 0) {
        setSelectedCrew(initialData.crewMembers.map(name => {
          const member = crewRoster.find(c => c.name.toLowerCase() === name.toLowerCase());
          const payoutVal = member?.defaultPayout || 6000;
          return {
            crewId: member?.id || `crew-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            crewName: member?.name || name,
            role: member?.role || 'Content Creator',
            callTime: '08:00 AM',
            wrapTime: '11:00 PM',
            payout: payoutVal,
            advancePaid: 0,
            showPayoutConfig: false,
            isPaidFull: false,
            paymentMode: 'UPI',
            phone: member?.phone
          };
        }));
      } else {
        setSelectedCrew([]);
      }

      setCrewPayout(initialData.crewPayout);
      setPackageTotal(initialData.packageTotal);
      setAdvancePaid(initialData.advancePaid);
      setPaymentDueDate(initialData.paymentDueDate || end || start);
      setStatus(initialData.status || 'Confirmed');
      setClientRequirements(initialData.clientRequirements || '');
      setDeliverables(initialData.deliverables || []);
      setNotes(initialData.notes || '');
      setSubEvents(initialData.subEvents ? [...initialData.subEvents] : []);
    } else {
      const defaultStart = getTodayDateString();
      const defaultEnd = defaultStart;
      setCategory('Wedding');
      setPartnerId('');
      setPartnerName('');
      setClientId('');
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setEventName('');
      setEventType('Wedding');
      setStartDate(defaultStart);
      setEndDate(defaultEnd);
      setIsEventNameCustomized(false);
      setIsEndDateCustomized(false);
      setShootTime('14:00 - 22:00');
      setVenue('');
      setCity('Mumbai');
      setLeadCreator('');
      setSelectedCrew([]);
      setCrewPayout('');
      setPackageTotal('');
      setAdvancePaid('');
      setPaymentDueDate(defaultEnd);
      setStatus('Confirmed');
      setClientRequirements('');
      setDeliverables([
        { id: `del-1`, title: 'Full 4K ProRes Raw Footage Transfer on SSD', completed: false },
        { id: `del-2`, title: 'Bride & Groom POV Highlights (x3 Reels)', completed: false },
        { id: `del-3`, title: 'Ceremonial Master Cut Reel (9:16)', completed: false }
      ]);
      setNotes('');
      setSubEvents([]);
    }
  }, [initialData, isOpen]);

  const toggleCrewMember = (member: CrewMember) => {
    const exists = selectedCrew.some(c => c.crewId === member.id);
    if (exists) {
      setSelectedCrew(selectedCrew.filter(c => c.crewId !== member.id));
    } else {
      const startTime = shootTime?.split('-')[0]?.trim() || '08:00 AM';
      const endTime = shootTime?.split('-')[1]?.trim() || '11:00 PM';
      const defaultPayout = member.defaultPayout || 6000;
      setSelectedCrew([
        ...selectedCrew,
        {
          crewId: member.id,
          crewName: member.name,
          role: member.role || 'Content Creator',
          callTime: startTime,
          wrapTime: endTime,
          payout: defaultPayout,
          advancePaid: 0,
          showPayoutConfig: false,
          isPaidFull: false,
          paymentMode: 'UPI',
          phone: member.phone
        }
      ]);
    }
  };

  const updateCrewField = (crewId: string, field: keyof EventCrewSelection, value: any) => {
    setSelectedCrew(selectedCrew.map(c => c.crewId === crewId ? { ...c, [field]: value } : c));
  };

  const handleTogglePayoutConfig = (crewId: string, checked: boolean) => {
    setSelectedCrew(prev => prev.map(c => {
      if (c.crewId !== crewId) return c;
      return {
        ...c,
        showPayoutConfig: checked,
        payout: c.payout !== '' && c.payout !== undefined ? c.payout : 6000
      };
    }));
  };

  const handleCrewPayoutChange = (crewId: string, value: number | '') => {
    setSelectedCrew(prev => prev.map(c => {
      if (c.crewId !== crewId) return c;
      const newPayout = value;
      const newAdvance = c.isPaidFull ? newPayout : c.advancePaid;
      return {
        ...c,
        payout: newPayout,
        advancePaid: newAdvance
      };
    }));
  };

  const handleCrewAdvanceChange = (crewId: string, value: number | '') => {
    setSelectedCrew(prev => prev.map(c => {
      if (c.crewId !== crewId) return c;
      const advNum = Number(value) || 0;
      const payNum = Number(c.payout) || 0;
      const isFull = payNum > 0 && advNum >= payNum;
      return {
        ...c,
        advancePaid: value,
        isPaidFull: isFull
      };
    }));
  };

  const handleTogglePaidFull = (crewId: string, checked: boolean) => {
    setSelectedCrew(prev => prev.map(c => {
      if (c.crewId !== crewId) return c;
      return {
        ...c,
        isPaidFull: checked,
        advancePaid: checked ? (c.payout !== '' ? c.payout : 6000) : 0
      };
    }));
  };

  const removeCrew = (crewId: string) => {
    setSelectedCrew(selectedCrew.filter(c => c.crewId !== crewId));
  };

  if (!isOpen) return null;

  const handleClientNameChange = (val: string) => {
    setClientName(val);
    if (!isEventNameCustomized) {
      setEventName(val);
    }
  };

  const handleEventNameChange = (val: string) => {
    setEventName(val);
    if (val.trim() && val.trim() !== clientName.trim()) {
      setIsEventNameCustomized(true);
    } else if (!val.trim()) {
      setIsEventNameCustomized(false);
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (!isEndDateCustomized || !endDate || endDate === startDate || endDate < val) {
      setEndDate(val);
      setPaymentDueDate(val);
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    if (val && val !== startDate) {
      setIsEndDateCustomized(true);
    } else {
      setIsEndDateCustomized(false);
    }
  };

  const handleSelectClient = (id: string) => {
    setClientId(id);
    const cli = clients.find(c => c.id === id);
    if (cli) {
      setClientName(cli.name);
      setClientPhone(cli.phone || '');
      setClientEmail(cli.email || '');
      if (!isEventNameCustomized) {
        setEventName(cli.name);
      }
    }
  };

  const handleAddDeliverable = () => {
    if (newDeliverableTitle.trim()) {
      setDeliverables([
        ...deliverables,
        { id: `del-${Date.now()}`, title: newDeliverableTitle.trim(), completed: false }
      ]);
      setNewDeliverableTitle('');
    }
  };

  const handleRemoveDeliverable = (id: string) => {
    setDeliverables(deliverables.filter(d => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !clientName.trim()) return;

    const total = Number(packageTotal) || 0;
    const adv = Number(advancePaid) || 0;
    const balanceDue = Math.max(0, total - adv);

    const finalCrewAssignments: EventCrewAssignment[] = selectedCrew.map((c, idx) => {
      const payoutNum = Number(c.payout) || 0;
      const advanceNum = Number(c.advancePaid) || 0;
      const isFull = Boolean(c.isPaidFull || (advanceNum >= payoutNum && payoutNum > 0));
      const isPartial = Boolean(!isFull && advanceNum > 0);

      return {
        id: `asg-${Date.now()}-${idx}-${c.crewId}`,
        eventId: initialData?.id || '',
        crewId: c.crewId,
        crewName: c.crewName,
        role: c.role,
        callTime: c.callTime,
        wrapTime: c.wrapTime,
        payout: payoutNum,
        paidAmount: isFull ? payoutNum : advanceNum,
        paymentStatus: isFull ? 'Paid' : isPartial ? 'Partially Paid' : 'Unpaid',
        paymentMode: c.paymentMode || (advanceNum > 0 ? 'UPI' : undefined),
        paidAt: (isFull || isPartial) ? new Date().toISOString() : undefined,
        phone: c.phone || '',
        assignedSubEventIds: [],
        assignedPOVIds: [],
        createdAt: new Date().toISOString()
      };
    });

    const finalCrewMembers = selectedCrew.map(c => c.crewName);
    const totalCrewPayoutCalc = selectedCrew.reduce((sum, c) => sum + (Number(c.payout) || 0), 0);

    onSave({
      id: initialData?.id,
      category,
      partnerId: partnerId || undefined,
      partnerName: partnerName || undefined,
      clientId: clientId || `cli-${Date.now()}`,
      clientName: clientName.trim(),
      clientContact: {
        phone: clientPhone.trim(),
        email: clientEmail.trim()
      },
      eventName: eventName.trim(),
      eventType,
      startDate: startDate,
      endDate: endDate || startDate,
      shootDate: startDate,
      shootTime,
      venue: venue.trim() || 'TBD Venue',
      locationCity: city.trim(),
      city: city.trim(),
      leadCreator: selectedCrew[0]?.crewName || leadCreator || 'Admin',
      crewMembers: finalCrewMembers,
      crewAssignments: finalCrewAssignments,
      crewPayout: totalCrewPayoutCalc > 0 ? totalCrewPayoutCalc : (Number(crewPayout) || 0),
      packageTotal: total,
      advancePaid: adv,
      balanceDue,
      paymentDueDate: paymentDueDate || undefined,
      clientRequirements: clientRequirements.trim(),
      status,
      deliverables,
      subEvents: subEvents,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl border border-[#E8E3D9] max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E3D9] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">
              Hierarchical Production Setup · Job & Ceremonies
            </div>
            <h2 className="font-serif text-xl font-bold text-[#181818]">
              {initialData ? 'Edit Production Job' : 'Create New Job / Wedding'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          
          {/* Level 1: Job Category */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1.5">
              Job Category Hierarchy *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Wedding', 'Event Planner', 'Other Shoot'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    category === cat
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                      : 'bg-[#FAF8F5] text-neutral-700 border-[#E8E3D9] hover:border-neutral-400'
                  }`}
                >
                  {cat === 'Wedding' ? '💍 Wedding' : cat === 'Event Planner' ? '✨ Event Planner' : '🎬 Other Shoot'}
                </button>
              ))}
            </div>
          </div>

          {/* Event Partner / Outsourced Agency Dropdown */}
          <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-neutral-800 text-[11px] uppercase tracking-wider font-mono">
                Event Partner (If Outsourced by Agency / Planner)
              </label>
              {partnerId && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#C58B39] text-white">
                  Partner Linked
                </span>
              )}
            </div>
            <select
              value={partnerId}
              onChange={(e) => {
                const pid = e.target.value;
                setPartnerId(pid);
                const p = partners.find(item => item.id === pid);
                setPartnerName(p ? p.companyName : '');
                if (p && category !== 'Event Planner') {
                  setCategory('Event Planner');
                }
              }}
              className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 bg-white font-medium text-xs focus:outline-none focus:border-[#C58B39]"
            >
              <option value="">-- Direct Client / No Event Partner --</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>
                  🏢 {p.companyName} {p.name && p.name !== p.companyName ? `(${p.name})` : ''} · {p.city}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-neutral-500">
              Shoots linked to a partner appear automatically in the Event Partners workspace, Calendar, and assigned crew phone terminals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Link to Existing Client (Optional)
              </label>
              <select
                value={clientId}
                onChange={(e) => handleSelectClient(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 bg-white"
              >
                <option value="">-- Choose Client or Type Below --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Client / Couple Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => handleClientNameChange(e.target.value)}
                placeholder="e.g. Rahul Mehta & Priya Saxena"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Client Contact Phone</label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+919811033910"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Client Contact Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-neutral-700">Main Event / Job Title *</label>
                {!isEventNameCustomized && clientName && (
                  <span className="text-[10px] text-[#C58B39] font-mono font-medium">Auto-synced</span>
                )}
              </div>
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => handleEventNameChange(e.target.value)}
                placeholder="e.g. Rahul & Priya Royal Wedding"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-neutral-700">Event Type</label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C58B39] hover:text-[#9e6d27] bg-[#FAF8F5] border border-[#E8E3D9] hover:border-[#C58B39] px-2 py-0.5 rounded transition-colors shadow-2xs cursor-pointer"
                  title="Add custom event category / type"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Category</span>
                </button>
              </div>

              {isAddingCategory ? (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                  <input
                    type="text"
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewCategory();
                      } else if (e.key === 'Escape') {
                        setIsAddingCategory(false);
                        setNewCategoryName('');
                      }
                    }}
                    placeholder="e.g. Maternity Shoot"
                    className="flex-1 min-w-0 px-2.5 py-2 text-xs border border-[#C58B39] rounded-lg bg-white text-neutral-900 focus:outline-none ring-1 ring-[#C58B39]"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="px-3 py-2 bg-[#C58B39] hover:bg-[#B37B2E] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName('');
                    }}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg cursor-pointer shrink-0"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 bg-white focus:outline-none focus:border-[#C58B39]"
                  >
                    {eventCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    className="p-2 border border-[#DCD6C8] hover:border-[#C58B39] bg-[#FAF8F5] hover:bg-[#F2ECE1] rounded-lg text-[#C58B39] transition-colors cursor-pointer shrink-0"
                    title="Add custom event category"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-neutral-700">End Date</label>
                {!isEndDateCustomized && startDate && (
                  <span className="text-[10px] text-[#C58B39] font-mono font-medium">Synced with Start Date</span>
                )}
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900 bg-white font-medium"
              >
                <option value="Inquiry">Inquiry</option>
                <option value="Quoted">Quoted</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Main Venue / Property</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. The St. Regis & Turf Club"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">City / Base</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai / Udaipur"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900"
              />
            </div>
          </div>

          {/* Commercials: Package Total, Advance, Due Date */}
          <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C58B39]">
                Commercials & Billing
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[10px] text-neutral-500 font-medium">Auto-fill Rate:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const chg = StorageService.getActiveEventCharges().find(c => c.id === e.target.value);
                      if (chg) {
                        setPackageTotal(chg.price);
                        setEventType(chg.name);
                      }
                    }
                  }}
                  className="px-2 py-1 text-[11px] border border-[#DCD6C8] rounded bg-white text-neutral-800"
                >
                  <option value="">-- Select from Event Rates --</option>
                  {StorageService.getActiveEventCharges().map(chg => (
                    <option key={chg.id} value={chg.id}>{chg.name} — ₹{chg.price.toLocaleString('en-IN')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Package Total (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={packageTotal}
                  onChange={(e) => setPackageTotal(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="75000"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded-lg text-neutral-900 font-mono font-bold bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Advance Received (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="35000"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded-lg text-emerald-800 font-mono font-bold bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded-lg font-mono bg-white"
                />
              </div>
            </div>
          </div>

          {/* Ceremonies / Sub-Events / Event Charges Selection */}
          <div className="p-4 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C58B39]">
                    Ceremonies & Functions ({subEvents.length})
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Tap to add or remove wedding ceremonies. Leave empty if this is a single-event shoot.
                </p>
              </div>
              {subEvents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSubEvents([])}
                  className="text-[11px] font-mono text-rose-600 hover:underline"
                >
                  Clear all functions
                </button>
              )}
            </div>

            {/* Quick Toggle Ceremony Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { name: 'Mehendi', defaultCharge: 15000 },
                { name: 'Haldi', defaultCharge: 15000 },
                { name: 'Sangeet', defaultCharge: 25000 },
                { name: 'Wedding Ceremony', defaultCharge: 30000 },
                { name: 'Reception', defaultCharge: 20000 },
                { name: 'Cocktail', defaultCharge: 20000 },
                { name: 'Pre-Wedding Shoot', defaultCharge: 25000 }
              ].map(preset => {
                const isSelected = subEvents.some(s => s.name.toLowerCase() === preset.name.toLowerCase());
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSubEvents(subEvents.filter(s => s.name.toLowerCase() !== preset.name.toLowerCase()));
                      } else {
                        setSubEvents([
                          ...subEvents,
                          {
                            id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                            eventId: initialData?.id || '',
                            name: preset.name,
                            date: startDate || new Date().toISOString().split('T')[0],
                            startTime: '04:00 PM',
                            endTime: '11:00 PM',
                            venue: venue || 'Main Venue',
                            status: 'Scheduled',
                            assignedCrewIds: [],
                            eventCharge: preset.defaultCharge,
                            contentRequirements: [],
                            notes: ''
                          }
                        ]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-[#181818] text-white border-neutral-900 shadow-2xs'
                        : 'bg-white text-neutral-700 border-[#DCD6C8] hover:border-[#C58B39]'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5 text-neutral-400" />}
                    <span>{preset.name}</span>
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-amber-300' : 'text-neutral-500'}`}>
                      ₹{preset.defaultCharge.toLocaleString('en-IN')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Function Form */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={customFunctionName}
                onChange={e => setCustomFunctionName(e.target.value)}
                placeholder="Or type custom ceremony (e.g. Ring Ceremony, Pool Party)"
                className="flex-1 px-3 py-1.5 bg-white border border-[#DCD6C8] rounded-lg text-xs"
              />
              <input
                type="number"
                value={customFunctionCharge}
                onChange={e => setCustomFunctionCharge(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Fee ₹"
                className="w-24 px-2 py-1.5 bg-white border border-[#DCD6C8] rounded-lg text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (!customFunctionName.trim()) return;
                  setSubEvents([
                    ...subEvents,
                    {
                      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                      eventId: initialData?.id || '',
                      name: customFunctionName.trim(),
                      date: startDate || new Date().toISOString().split('T')[0],
                      startTime: '04:00 PM',
                      endTime: '11:00 PM',
                      venue: venue || 'Main Venue',
                      status: 'Scheduled',
                      assignedCrewIds: [],
                      eventCharge: Number(customFunctionCharge) || 15000,
                      contentRequirements: [],
                      notes: ''
                    }
                  ]);
                  setCustomFunctionName('');
                  setCustomFunctionCharge('');
                }}
                className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
              >
                + Add
              </button>
            </div>

            {/* Active Functions List */}
            {subEvents.length > 0 ? (
              <div className="space-y-1.5 pt-2 border-t border-[#E8E3D9]">
                <div className="text-[10px] uppercase font-mono text-neutral-500 font-semibold">
                  Selected Ceremonies ({subEvents.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {subEvents.map((s) => (
                    <div
                      key={s.id}
                      className="px-2.5 py-1.5 bg-white border border-[#DCD6C8] rounded-lg text-xs flex items-center gap-2 shadow-2xs"
                    >
                      <span className="font-semibold text-neutral-900">{s.name}</span>
                      <span className="text-neutral-300">·</span>
                      <span className="font-mono text-[#C58B39] font-bold">
                        ₹{(s.eventCharge || 15000).toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSubEvents(subEvents.filter(sub => sub.id !== s.id))}
                        className="text-neutral-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                        title="Remove this ceremony"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-neutral-500 italic p-2 bg-white/70 rounded border border-dashed border-[#E8E3D9]">
                No separate sub-events added. This shoot is booked as a single standalone event.
              </div>
            )}
          </div>

          {/* Crew Deployment Section (Multiple Crew) */}
          <div className="p-4 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C58B39]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C58B39]">
                  Deploy Crew (Multiple Creators)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#181818] text-white">
                  {selectedCrew.length} Assigned
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-neutral-800">
                Total Crew Payout: <span className="text-[#C58B39]">₹{selectedCrew.reduce((s, c) => s + (Number(c.payout) || 0), 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Quick 1-Tap Crew Roster Chips */}
            <div>
              <div className="text-[10px] text-neutral-500 font-medium mb-1.5 uppercase tracking-wider">
                Tap crew to deploy or remove:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {crewRoster.map(member => {
                  const isSelected = selectedCrew.some(c => c.crewId === member.id);
                  const conflict = StorageService.checkCrewConflict(
                    member.id,
                    startDate,
                    initialData?.id
                  );

                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleCrewMember(member)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#181818] text-white border-neutral-900 shadow-2xs'
                          : 'bg-white text-neutral-700 border-[#DCD6C8] hover:border-[#C58B39]'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      )}
                      <span>{member.name}</span>
                      <span className={`text-[10px] px-1 py-0.2 rounded ${isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-500'}`}>
                        {member.role}
                      </span>
                      {conflict.hasConflict && (
                        <span className="text-amber-500 text-[10px]" title="Busy on another shoot on this date">⚠️</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Crew Details List */}
            {selectedCrew.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-[#E8E3D9]">
                <div className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
                  Assigned Roles, Call Times & Agreed Payouts:
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedCrew.map((c) => (
                    <div
                      key={c.crewId}
                      className="bg-white border border-[#E8E3D9] rounded-xl p-3 space-y-2.5 text-xs shadow-2xs"
                    >
                      {/* Top Row: Identity, Role, Call Time, Remove */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <div className="w-7 h-7 rounded-full bg-[#181818] text-[#C58B39] font-bold flex items-center justify-center text-[10px]">
                            {c.crewName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900 leading-tight">{c.crewName}</div>
                            {c.phone && <div className="text-[10px] text-neutral-400 font-mono">{c.phone}</div>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Role */}
                          <div>
                            <span className="text-[9px] text-neutral-400 block font-medium">Role</span>
                            <select
                              value={c.role}
                              onChange={(e) => updateCrewField(c.crewId, 'role', e.target.value)}
                              className="px-2 py-1 border border-[#DCD6C8] rounded bg-white text-xs text-neutral-800"
                            >
                              <option value="Content Creator">Content Creator</option>
                              <option value="Cinematographer">Cinematographer</option>
                              <option value="Photographer">Photographer</option>
                              <option value="Videographer">Videographer</option>
                              <option value="Drone Operator">Drone Operator</option>
                              <option value="Editor">Editor</option>
                              <option value="Assistant">Assistant</option>
                              <option value="Social Media Manager">Social Media Manager</option>
                            </select>
                          </div>

                          {/* Call Time */}
                          <div className="w-24">
                            <span className="text-[9px] text-neutral-400 block font-medium">Call Time</span>
                            <input
                              type="text"
                              value={c.callTime}
                              onChange={(e) => updateCrewField(c.crewId, 'callTime', e.target.value)}
                              placeholder="08:00 AM"
                              className="w-full px-2 py-1 border border-[#DCD6C8] rounded text-xs font-mono text-neutral-900"
                            />
                          </div>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => removeCrew(c.crewId)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-neutral-100 transition-colors mt-3"
                            title="Remove crew"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Checkbox Strip to configure Payout & Advance */}
                      <div className="pt-2 border-t border-[#F0EBE1] flex items-center justify-between">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!c.showPayoutConfig}
                            onChange={(e) => handleTogglePayoutConfig(c.crewId, e.target.checked)}
                            className="w-4 h-4 rounded text-[#C58B39] focus:ring-[#C58B39] accent-[#C58B39] cursor-pointer"
                          />
                          <span className="font-semibold text-neutral-800 flex items-center gap-1.5 text-xs">
                            <Wallet className="w-3.5 h-3.5 text-[#C58B39]" />
                            <span>Set Payout & Advance Payment</span>
                          </span>
                        </label>

                        {!c.showPayoutConfig && (
                          <div className="text-[11px] font-mono text-neutral-500">
                            Agreed: <strong className="text-neutral-800">₹{Number(c.payout) || 0}</strong>
                            {c.isPaidFull && <span className="text-emerald-700 font-bold ml-1.5">✓ Paid Full</span>}
                          </div>
                        )}
                      </div>

                      {/* Expanded Payout & Advance Configuration */}
                      {c.showPayoutConfig && (
                        <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg space-y-2.5 mt-1.5">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                            {/* Payout Input (Editable textfield) */}
                            <div>
                              <label className="block text-[10px] font-semibold text-neutral-600 uppercase tracking-wider mb-1">
                                Total Payout (₹) *
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={c.payout}
                                onChange={(e) => handleCrewPayoutChange(c.crewId, e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="6000"
                                className="w-full px-2.5 py-1.5 border border-[#DCD6C8] rounded text-xs font-mono font-bold text-neutral-900 bg-white focus:outline-none focus:border-[#C58B39]"
                              />
                            </div>

                            {/* Advance Paid Input (Editable textfield) */}
                            <div>
                              <label className="block text-[10px] font-semibold text-neutral-600 uppercase tracking-wider mb-1">
                                Add Advance Paid (₹)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={c.advancePaid}
                                onChange={(e) => handleCrewAdvanceChange(c.crewId, e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="0"
                                className="w-full px-2.5 py-1.5 border border-[#DCD6C8] rounded text-xs font-mono font-bold text-neutral-900 bg-white focus:outline-none focus:border-[#C58B39]"
                              />
                            </div>

                            {/* Paid In Full Checkbox */}
                            <div>
                              <label className={`w-full h-[34px] px-3 rounded border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all select-none ${
                                c.isPaidFull || (Number(c.payout) > 0 && Number(c.advancePaid) >= Number(c.payout))
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                  : 'bg-white border-[#DCD6C8] text-neutral-700 hover:border-[#C58B39]'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={Boolean(c.isPaidFull || (Number(c.payout) > 0 && Number(c.advancePaid) >= Number(c.payout)))}
                                  onChange={(e) => handleTogglePaidFull(c.crewId, e.target.checked)}
                                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                                />
                                <span className="truncate">
                                  Paid in Full {c.isPaidFull ? '✓' : ''}
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Real-time Status Badge Banner */}
                          <div className="flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-[#E8E3D9]">
                            {c.isPaidFull || (Number(c.payout) > 0 && Number(c.advancePaid) >= Number(c.payout)) ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Paid in Full · Appears as Settled in Crew App (₹{(Number(c.payout) || 0).toLocaleString('en-IN')})</span>
                              </span>
                            ) : Number(c.advancePaid) > 0 ? (
                              <span className="text-amber-800 font-semibold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Advance: ₹{(Number(c.advancePaid) || 0).toLocaleString('en-IN')} · Due: ₹{Math.max(0, (Number(c.payout) || 0) - (Number(c.advancePaid) || 0)).toLocaleString('en-IN')}</span>
                              </span>
                            ) : (
                              <span className="text-neutral-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                <span>Unpaid · ₹{(Number(c.payout) || 0).toLocaleString('en-IN')} pending post-shoot settlement</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white border border-dashed border-[#DCD6C8] rounded-lg text-center text-xs text-neutral-400">
                Click any crew members above to deploy them to this shoot. They will automatically see this shoot in their Crew App.
              </div>
            )}
          </div>

          {/* Client Requirements */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">Client Requirements & Deliverables Brief</label>
            <textarea
              rows={2}
              value={clientRequirements}
              onChange={(e) => setClientRequirements(e.target.value)}
              placeholder="e.g. Fast turnaround reels (within 12h), 4K ProRes SSD handover, vertical orientation."
              className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900"
            />
          </div>

          {/* Production Notes */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">Internal Production Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal coordination notes, crew instructions..."
              className="w-full px-3 py-2 border border-[#DCD6C8] rounded-lg text-neutral-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E8E3D9] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 hover:text-neutral-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#181818] hover:bg-black text-white font-semibold rounded-lg transition-colors shadow-xs"
            >
              {initialData ? 'Update Job' : 'Create Confirmed Job'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
