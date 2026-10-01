import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  Calendar, 
  DollarSign, 
  Phone, 
  Mail, 
  FileText, 
  UserCheck, 
  MessageSquarePlus, 
  Edit3,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Enquiry, PipelineStage } from '../../types';
import { EnquiryModal } from './EnquiryModal';
import { FollowUpModal } from './FollowUpModal';
import { ConvertToClientModal } from './ConvertToClientModal';

interface EnquiriesViewProps {
  enquiries: Enquiry[];
  onSaveEnquiry: (enquiry: Partial<Enquiry> & { clientName: string; eventName: string }) => void;
  onAddFollowUp: (enquiryId: string, notes: string, nextDate?: string, createdBy?: string) => void;
  onConvertEnquiry: (enquiryId: string, createEventAlso: boolean) => void;
  onCreateQuoteFromEnquiry: (enquiry: Enquiry) => void;
}

export const EnquiriesView: React.FC<EnquiriesViewProps> = ({
  enquiries,
  onSaveEnquiry,
  onAddFollowUp,
  onConvertEnquiry,
  onCreateQuoteFromEnquiry
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('All');

  // Modals state
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);
  
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedEnquiryForFollowUp, setSelectedEnquiryForFollowUp] = useState<Enquiry | null>(null);

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedEnquiryForConvert, setSelectedEnquiryForConvert] = useState<Enquiry | null>(null);

  const pipelineStages: PipelineStage[] = [
    'New',
    'Contacted',
    'Requirement Collected',
    'Quote Sent',
    'Negotiation',
    'Confirmed',
    'Lost'
  ];

  const filteredEnquiries = enquiries.filter(e => {
    const matchesStage = selectedStageFilter === 'All' || e.pipelineStage === selectedStageFilter;
    const matchesSearch = 
      e.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.salesperson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.venue && e.venue.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStage && matchesSearch;
  });

  const handleAddNew = () => {
    setEditingEnquiry(null);
    setIsEnquiryModalOpen(true);
  };

  const handleEdit = (enquiry: Enquiry) => {
    setEditingEnquiry(enquiry);
    setIsEnquiryModalOpen(true);
  };

  const handleOpenFollowUp = (enquiry: Enquiry) => {
    setSelectedEnquiryForFollowUp(enquiry);
    setIsFollowUpModalOpen(true);
  };

  const handleOpenConvert = (enquiry: Enquiry) => {
    setSelectedEnquiryForConvert(enquiry);
    setIsConvertModalOpen(true);
  };

  const handleStageChange = (enquiry: Enquiry, newStage: PipelineStage) => {
    onSaveEnquiry({
      id: enquiry.id,
      clientName: enquiry.clientName,
      eventName: enquiry.eventName,
      pipelineStage: newStage
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#C58B39]">Lead Management & CRM</div>
          <h1 className="font-serif text-2xl font-bold text-[#181818] tracking-tight">
            Enquiries & Sales Pipeline
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Track inquiries from initial DM to confirmed production bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="bg-[#FAF8F5] p-1 border border-[#E8E3D9] rounded flex items-center gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'kanban' ? 'bg-[#181818] text-white' : 'text-neutral-500 hover:text-neutral-900'}`}
              title="Pipeline Board"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-[#181818] text-white' : 'text-neutral-500 hover:text-neutral-900'}`}
              title="Table List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#181818] hover:bg-[#282828] rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
            <span>+ New Enquiry</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedStageFilter('All')}
            className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors ${
              selectedStageFilter === 'All'
                ? 'bg-[#181818] text-white'
                : 'bg-white text-neutral-600 hover:text-neutral-900 border border-[#E8E3D9]'
            }`}
          >
            All Leads ({enquiries.length})
          </button>
          {pipelineStages.map((stage) => {
            const count = enquiries.filter(e => e.pipelineStage === stage).length;
            return (
              <button
                key={stage}
                onClick={() => setSelectedStageFilter(stage)}
                className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                  selectedStageFilter === stage
                    ? 'bg-[#181818] text-white'
                    : 'bg-white text-neutral-600 hover:text-neutral-900 border border-[#E8E3D9]'
                }`}
              >
                {stage} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leads, events, venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E8E3D9] rounded text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#C58B39]"
          />
        </div>
      </div>

      {/* KANBAN PIPELINE VIEW */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
          {pipelineStages
            .filter(stage => selectedStageFilter === 'All' || selectedStageFilter === stage)
            .map((stage) => {
              const stageEnquiries = filteredEnquiries.filter(e => e.pipelineStage === stage);
              return (
                <div 
                  key={stage} 
                  className="w-80 shrink-0 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg p-3 flex flex-col max-h-[75vh]"
                >
                  {/* Stage Header */}
                  <div className="pb-3 border-b border-[#E8E3D9] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#181818]">
                        {stage}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-[#E8E3D9] rounded-full text-neutral-600 font-bold">
                        {stageEnquiries.length}
                      </span>
                    </div>

                    <span className="text-[10px] text-neutral-400">
                      ₹{stageEnquiries.reduce((acc, curr) => acc + curr.budget, 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Stage Cards Container */}
                  <div className="overflow-y-auto space-y-3 mt-3 flex-1 pr-1">
                    {stageEnquiries.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-neutral-400 italic">
                        No leads in {stage}
                      </div>
                    ) : (
                      stageEnquiries.map((enquiry) => (
                        <div
                          key={enquiry.id}
                          className="bg-white border border-[#E8E3D9] rounded p-3.5 shadow-2xs hover:border-[#C58B39] transition-all flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h3 className="font-serif font-bold text-sm text-[#181818]">
                                {enquiry.clientName}
                              </h3>
                              <span className="text-[10px] text-[#C58B39] font-medium bg-[#FAF6EE] px-1.5 py-0.5 rounded border border-[#EADBBE]">
                                {enquiry.leadSource}
                              </span>
                            </div>

                            <div className="text-xs text-neutral-700 mt-1 font-medium">
                              {enquiry.eventName}
                            </div>

                            <div className="text-[11px] text-neutral-500 mt-1 space-y-0.5">
                              {enquiry.date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-neutral-400" />
                                  <span>{enquiry.date}</span>
                                </div>
                              )}
                              {enquiry.venue && (
                                <div className="truncate text-neutral-600">
                                  📍 {enquiry.venue}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs font-mono mt-2 pt-2 border-t border-[#F0ECE1]">
                              <span className="text-neutral-500">Budget:</span>
                              <span className="font-bold text-[#181818] tabular-nums">
                                ₹{enquiry.budget.toLocaleString('en-IN')}
                              </span>
                            </div>

                            {/* Rep & Follow-up */}
                            <div className="text-[10px] text-neutral-500 mt-1 flex justify-between">
                              <span>Rep: {enquiry.salesperson}</span>
                              {enquiry.followUpDate && (
                                <span className="text-[#C58B39]">Follow: {enquiry.followUpDate}</span>
                              )}
                            </div>
                          </div>

                          {/* Quick Stage Move Dropdown */}
                          <div className="pt-2 border-t border-[#F0ECE1]">
                            <select
                              value={enquiry.pipelineStage}
                              onChange={(e) => handleStageChange(enquiry, e.target.value as PipelineStage)}
                              className="w-full text-[10px] font-medium px-2 py-1 border border-[#DCD6C8] rounded bg-white text-neutral-800"
                            >
                              {pipelineStages.map(s => (
                                <option key={s} value={s}>Move to: {s}</option>
                              ))}
                            </select>
                          </div>

                          {/* Action Buttons as requested: [ Create Quote ] [ Add Follow-up ] [ Convert to Client ] */}
                          <div className="grid grid-cols-3 gap-1 pt-1">
                            <button
                              onClick={() => onCreateQuoteFromEnquiry(enquiry)}
                              className="px-1.5 py-1 text-[10px] font-medium bg-[#181818] text-white hover:bg-[#282828] rounded text-center truncate transition-colors"
                              title="Create Quote"
                            >
                              Quote
                            </button>
                            <button
                              onClick={() => handleOpenFollowUp(enquiry)}
                              className="px-1.5 py-1 text-[10px] font-medium bg-[#FAF8F5] text-neutral-800 border border-[#DCD6C8] hover:bg-[#F2ECE1] rounded text-center truncate transition-colors"
                              title="Add Follow-up"
                            >
                              Follow-up
                            </button>
                            <button
                              onClick={() => handleOpenConvert(enquiry)}
                              className="px-1.5 py-1 text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded text-center truncate transition-colors"
                              title="Convert to Client"
                            >
                              Convert
                            </button>
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white border border-[#E8E3D9] rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-neutral-600 border-b border-[#E8E3D9] uppercase tracking-wider text-[11px] font-medium">
                <tr>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Event & Venue</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Budget (₹)</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3">Next Action</th>
                  <th className="py-3 px-4 text-right">CRM Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1]">
                {filteredEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-400 italic">
                      No enquiries found.
                    </td>
                  </tr>
                ) : (
                  filteredEnquiries.map((enquiry) => (
                    <tr key={enquiry.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-serif font-bold text-sm text-[#181818]">{enquiry.clientName}</div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                          {enquiry.phone && <span>{enquiry.phone}</span>}
                          {enquiry.email && <span>· {enquiry.email}</span>}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-900">{enquiry.eventName}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">{enquiry.venue || 'Venue TBD'}</div>
                      </td>

                      <td className="py-3 px-3 text-neutral-600 font-mono text-[11px] whitespace-nowrap">
                        {enquiry.date || 'TBD'}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900 tabular-nums whitespace-nowrap">
                        ₹{enquiry.budget.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <select
                          value={enquiry.pipelineStage}
                          onChange={(e) => handleStageChange(enquiry, e.target.value as PipelineStage)}
                          className="text-[11px] font-medium px-2 py-0.5 border border-[#DCD6C8] rounded bg-white"
                        >
                          {pipelineStages.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-3 text-neutral-500 text-[11px]">
                        <div>Rep: {enquiry.salesperson}</div>
                        {enquiry.followUpDate && (
                          <div className="text-[#C58B39]">Due: {enquiry.followUpDate}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onCreateQuoteFromEnquiry(enquiry)}
                            className="px-2 py-1 bg-[#181818] text-white hover:bg-[#282828] rounded text-[11px] font-medium"
                          >
                            Create Quote
                          </button>
                          <button
                            onClick={() => handleOpenFollowUp(enquiry)}
                            className="px-2 py-1 bg-[#FAF8F5] border border-[#DCD6C8] hover:bg-[#F2ECE1] rounded text-[11px] font-medium text-neutral-800"
                          >
                            Add Follow-up
                          </button>
                          <button
                            onClick={() => handleOpenConvert(enquiry)}
                            className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded text-[11px] font-medium"
                          >
                            Convert to Client
                          </button>
                          <button
                            onClick={() => handleEdit(enquiry)}
                            className="p-1 text-neutral-400 hover:text-neutral-800"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        onSave={onSaveEnquiry}
        initialData={editingEnquiry}
      />

      {/* Follow-up Activity Modal */}
      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        enquiry={selectedEnquiryForFollowUp}
        onAddFollowUp={onAddFollowUp}
      />

      {/* Convert to Client Modal */}
      <ConvertToClientModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        enquiry={selectedEnquiryForConvert}
        onConfirmConvert={onConvertEnquiry}
      />
    </div>
  );
};
