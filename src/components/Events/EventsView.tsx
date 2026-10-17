import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckSquare, 
  Square, 
  Edit3, 
  CreditCard,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Layers,
  ChevronRight,
  Sparkles,
  Camera
} from 'lucide-react';
import { EventShoot, EventStatus, Client, PaymentRecord, Quotation } from '../../types';
import { StorageService } from '../../services/storage';
import { EventModal } from './EventModal';
import { EventCommandCenter } from './EventCommandCenter';
import { AssignCrewModal } from './AssignCrewModal';
import { AddPaymentModal } from '../Clients/AddPaymentModal';

interface EventsViewProps {
  events: EventShoot[];
  clients: Client[];
  quotes?: Quotation[];
  payments?: PaymentRecord[];
  onSaveEvent: (eventData: Partial<EventShoot> & { eventName: string; clientName: string }) => void;
  onToggleDeliverable: (eventId: string, deliverableId: string) => void;
  onRecordPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
  onSelectQuoteForPreview?: (quote: Quotation) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  clients,
  quotes = [],
  payments = [],
  onSaveEvent,
  onToggleDeliverable,
  onRecordPayment,
  onSelectQuoteForPreview = () => {}
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventShoot | null>(null);
  const [activeCommandCenterEvent, setActiveCommandCenterEvent] = useState<EventShoot | null>(null);
  const [payingEvent, setPayingEvent] = useState<EventShoot | null>(null);
  const [crewAssignTargetEvent, setCrewAssignTargetEvent] = useState<EventShoot | null>(null);

  const statuses: ('All' | EventStatus)[] = [
    'All',
    'Confirmed',
    'Scheduled',
    'In Progress',
    'Completed',
    'Inquiry',
    'Quoted',
    'Negotiation',
    'Cancelled',
    'Archived'
  ];

  const filteredEvents = events.filter(e => {
    const matchesStatus = selectedStatus === 'All' || e.status === selectedStatus;
    const startDate = e.startDate || (e as any).shootDate || '';
    const locationCity = e.locationCity || (e as any).city || '';
    
    const matchesSearch = 
      e.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.leadCreator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      locationCity.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleAddNew = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEdit = (event: EventShoot) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleStatusChange = (event: EventShoot, newStatus: EventStatus) => {
    onSaveEvent({
      id: event.id,
      eventName: event.eventName,
      clientName: event.clientName,
      status: newStatus
    });
  };

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'Confirmed':
      case 'Scheduled':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'In Progress':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'Completed':
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
      case 'Cancelled':
      case 'Archived':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Inquiry':
      case 'Quoted':
      case 'Negotiation':
      default:
        return 'bg-[#FAF6EE] text-[#8C6428] border-[#EADBBE]';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">Production Operations & Shoots</div>
          <h1 className="font-serif text-2xl font-bold text-[#181818] tracking-tight">
            Event Productions & Command Workspace
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Confirmed productions with sub-events, call sheet timelines, POVs, crew assignments, and deliverables.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#181818] hover:bg-[#282828] rounded transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
          <span>+ New Event Shoot</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? 'bg-[#181818] text-white'
                  : 'bg-white text-neutral-600 hover:text-neutral-900 border border-[#E8E3D9]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search events, clients, venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E8E3D9] rounded text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#C58B39]"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredEvents.map((event) => {
          const startDate = event.startDate || (event as any).shootDate || '';
          const endDate = event.endDate || startDate;
          const locationCity = event.locationCity || (event as any).city || '';
          const subEventsCount = (event.subEvents || []).length;
          const povsCount = (event.povs || []).length;
          const crewCount = (event.crewAssignments || []).length || (event.crewMembers || []).length;

          return (
            <div
              key={event.id}
              className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-[#C58B39] transition-all space-y-4 group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#F0ECE1]">
                  <div>
                    <span className="text-[10px] font-mono text-[#C58B39] font-bold uppercase tracking-wider">
                      {event.eventType}
                    </span>
                    <h3 
                      onClick={() => setActiveCommandCenterEvent(event)}
                      className="font-serif font-bold text-lg text-[#181818] mt-0.5 cursor-pointer hover:text-[#C58B39] transition-colors"
                    >
                      {event.eventName}
                    </h3>
                    <div className="text-xs text-neutral-600 mt-0.5 font-medium">
                      Client: {event.clientName}
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={event.status}
                    onChange={(e) => handleStatusChange(event, e.target.value as EventStatus)}
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded cursor-pointer ${getStatusBadge(event.status)}`}
                  >
                    <option value="Inquiry">Inquiry</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                {/* Logistics */}
                <div className="py-2.5 space-y-1.5 text-xs text-neutral-600 border-b border-[#F0ECE1]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-mono text-neutral-900 font-medium">
                      {startDate} {endDate && endDate !== startDate ? `to ${endDate}` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{event.venue}, {locationCity}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>Lead: <strong>{event.leadCreator}</strong> · {crewCount} Crew Members</span>
                  </div>
                </div>

                {/* Sub-events & POVs Quick Tags */}
                <div className="pt-2.5 flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded font-medium text-neutral-700">
                    {subEventsCount} Sub-Events
                  </span>
                  <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded font-medium text-neutral-700">
                    {povsCount} Content POVs
                  </span>
                  <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded font-medium text-neutral-700">
                    {(event.files || []).length} Files Attached
                  </span>
                </div>

                {/* Financial Strip */}
                <div className="mt-3 p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">Package</span>
                    <span className="font-mono font-bold text-neutral-900 tabular-nums">
                      ₹{event.packageTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">Advance Paid</span>
                    <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                      ₹{event.advancePaid.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-neutral-500 uppercase block">Balance Due</span>
                    <span className={`font-mono font-bold tabular-nums ${event.balanceDue > 0 ? 'text-[#D97706]' : 'text-neutral-500'}`}>
                      ₹{event.balanceDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveCommandCenterEvent(event)}
                    className="px-3 py-1.5 bg-[#181818] hover:bg-[#282828] text-white text-xs font-semibold rounded flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C58B39]" />
                    <span>Open Command Center</span>
                  </button>

                  <button
                    onClick={() => setCrewAssignTargetEvent(event)}
                    className="px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-[#F2EDE4] border border-[#DCD6C8] text-neutral-800 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors shadow-2xs"
                    title="Quick Crew Deployment"
                  >
                    <Users className="w-3.5 h-3.5 text-[#C58B39]" />
                    <span>{crewCount > 0 ? `${crewCount} Crew` : '+ Assign Crew'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100 text-xs"
                    title="Edit Basic Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {event.balanceDue > 0 && (
                    <button
                      onClick={() => setPayingEvent(event)}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-50 border border-[#DCD6C8] text-neutral-800 text-[11px] font-medium rounded flex items-center gap-1"
                    >
                      <CreditCard className="w-3 h-3 text-[#C58B39]" />
                      <span>Payment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="bg-white border border-[#E8E3D9] rounded-lg p-12 text-center text-neutral-400">
          No event shoots found. Click "+ New Event Shoot" to schedule.
        </div>
      )}

      {/* Add / Edit Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={onSaveEvent}
        initialData={editingEvent}
      />

      {/* Quick Assign Crew Modal */}
      {crewAssignTargetEvent && (
        <AssignCrewModal
          isOpen={true}
          onClose={() => setCrewAssignTargetEvent(null)}
          event={events.find(e => e.id === crewAssignTargetEvent.id) || crewAssignTargetEvent}
          onAssignCrew={(asg) => {
            StorageService.assignCrewToEvent(crewAssignTargetEvent.id, asg);
            const fresh = StorageService.getEventById(crewAssignTargetEvent.id);
            if (fresh) onSaveEvent(fresh);
          }}
          onAssignMultipleCrew={(assignments) => {
            StorageService.assignMultipleCrewToEvent(crewAssignTargetEvent.id, assignments);
            const fresh = StorageService.getEventById(crewAssignTargetEvent.id);
            if (fresh) onSaveEvent(fresh);
          }}
        />
      )}

      {/* Complete Event Command Center Workspace Modal */}
      {activeCommandCenterEvent && (
        <EventCommandCenter
          isOpen={true}
          onClose={() => setActiveCommandCenterEvent(null)}
          event={events.find(e => e.id === activeCommandCenterEvent.id) || activeCommandCenterEvent}
          onSaveEvent={(data) => {
            onSaveEvent(data);
            const updated = events.find(e => e.id === activeCommandCenterEvent.id);
            if (updated) setActiveCommandCenterEvent(updated);
          }}
          onToggleDeliverable={onToggleDeliverable}
          onRecordPayment={onRecordPayment}
          onSelectQuoteForPreview={onSelectQuoteForPreview}
          quotes={quotes}
          payments={payments}
        />
      )}

      {/* Embedded Payment Modal */}
      {payingEvent && (
        <AddPaymentModal
          isOpen={true}
          onClose={() => setPayingEvent(null)}
          client={clients.find(c => c.id === payingEvent.clientId) || {
            id: payingEvent.clientId,
            name: payingEvent.clientName,
            phone: '',
            email: '',
            notes: '',
            createdAt: '',
            updatedAt: ''
          }}
          events={[payingEvent]}
          onRecordPayment={onRecordPayment}
        />
      )}
    </div>
  );
};
