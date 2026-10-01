import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  FileText, 
  Check, 
  Edit3, 
  Eye, 
  Archive, 
  Search,
  Clock,
  Users,
  AlertCircle
} from 'lucide-react';
import { EventCharge } from '../../types';
import { EventChargeModal } from './EventChargeModal';
import { RateCardPreviewModal } from './RateCardPreviewModal';

interface EventChargesViewProps {
  charges: EventCharge[];
  onSaveCharge: (charge: Partial<EventCharge> & { name: string; price: number }) => void;
  onDeleteCharge: (chargeId: string) => { success: boolean; action: 'deleted' | 'archived'; message: string };
  onAddChargeToQuote: (charge: EventCharge) => void;
  onCreateCustomQuote: () => void;
}

export const EventChargesView: React.FC<EventChargesViewProps> = ({
  charges,
  onSaveCharge,
  onDeleteCharge,
  onAddChargeToQuote,
  onCreateCustomQuote
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCharge, setEditingCharge] = useState<EventCharge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingCharge, setViewingCharge] = useState<EventCharge | null>(null);
  const [isRateCardPreviewOpen, setIsRateCardPreviewOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const categories = ['All', 'Wedding Day', 'Pre-Wedding Rituals', 'Add-ons & Gear', 'Crew & Hours', 'Archived'];

  const filteredCharges = charges.filter(charge => {
    const matchesCategory = selectedCategory === 'All' 
      ? charge.status === 'Active'
      : selectedCategory === 'Archived'
      ? charge.status === 'Archived'
      : charge.category === selectedCategory && charge.status === 'Active';

    const matchesSearch = 
      charge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      charge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (charge.includedServices && charge.includedServices.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesSearch;
  });

  const handleEdit = (charge: EventCharge) => {
    setEditingCharge(charge);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingCharge(null);
    setIsModalOpen(true);
  };

  const handleArchiveOrDelete = (charge: EventCharge) => {
    const res = onDeleteCharge(charge.id);
    setNotification(res.message);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Actions Bar */}
      <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#C58B39]">Master Catalogue</div>
          <h1 className="font-serif text-2xl font-bold text-[#181818] tracking-tight">
            Event Charges & Rate Card
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            The agency master pricing repository. Snapshotted across all client proposals.
          </p>
        </div>

        {/* Top Actions matching user brief */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#181818] hover:bg-[#282828] rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
            <span>+ Add Event Charge</span>
          </button>

          <button
            onClick={() => setIsRateCardPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#181818] bg-[#F4EFE6] hover:bg-[#EBE4D8] border border-[#DDD6C8] rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#C58B39]" />
            <span>Download Full Quotation</span>
          </button>

          <button
            onClick={onCreateCustomQuote}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#C58B39] hover:bg-[#B37B2E] rounded transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>+ Create Custom Quote</span>
          </button>
        </div>
      </div>

      {/* Notification Banner if charge was archived instead of permanently deleted */}
      {notification && (
        <div className="p-3.5 bg-[#FAF6EE] border border-[#E2D5BE] rounded text-xs text-[#8C6428] flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{notification}</div>
        </div>
      )}

      {/* Search & Category Filter Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#181818] text-white'
                  : 'bg-white text-neutral-600 hover:text-neutral-900 border border-[#E8E3D9]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search charges & services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E8E3D9] rounded text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#C58B39]"
          />
        </div>
      </div>

      {/* Charges Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCharges.map((charge) => (
          <div
            key={charge.id}
            className={`bg-white border ${charge.status === 'Archived' ? 'border-dashed border-neutral-300 opacity-75' : 'border-[#E8E3D9]'} rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-[#D5CEBF] transition-all`}
          >
            <div>
              {/* Header: Name and Price */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    {charge.category}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#181818] uppercase tracking-wide mt-0.5">
                    {charge.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xl font-bold text-[#C58B39] tabular-nums block">
                    ₹{charge.price.toLocaleString('en-IN')}
                  </span>
                  {charge.status === 'Archived' && (
                    <span className="text-[10px] uppercase font-bold text-neutral-400">
                      Archived
                    </span>
                  )}
                </div>
              </div>

              {/* Meta: Duration and Crew requirement */}
              <div className="flex items-center gap-3 text-xs text-neutral-600 mt-2.5 pb-3 border-b border-[#F0ECE1]">
                <div className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{charge.duration}</span>
                </div>
                <span className="text-neutral-300">·</span>
                <div className="flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{charge.crewRequirement}</span>
                </div>
              </div>

              {/* Description */}
              {charge.description && (
                <p className="text-xs text-neutral-600 mt-3 line-clamp-2">
                  {charge.description}
                </p>
              )}

              {/* Included Services Checklist */}
              {charge.includedServices && charge.includedServices.length > 0 && (
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#8C6428] mb-1.5">
                    Includes:
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-neutral-700">
                    {charge.includedServices.map((service, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 truncate">
                        <Check className="w-3 h-3 text-[#C58B39] shrink-0" />
                        <span className="truncate">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons snippet */}
              {charge.optionalAddOns && charge.optionalAddOns.length > 0 && (
                <div className="mt-3 text-[11px] text-neutral-500">
                  <span className="font-medium text-neutral-600">Add-ons:</span> {charge.optionalAddOns.join(', ')}
                </div>
              )}
            </div>

            {/* Actions: View, Edit, Add to Quote */}
            <div className="mt-5 pt-3.5 border-t border-[#F0ECE1] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewingCharge(charge)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100 text-xs flex items-center gap-1 transition-colors"
                  title="View Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>

                <button
                  onClick={() => handleEdit(charge)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100 text-xs flex items-center gap-1 transition-colors"
                  title="Edit Master Charge"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleArchiveOrDelete(charge)}
                  className="p-1.5 text-neutral-400 hover:text-red-700 rounded hover:bg-red-50 text-xs flex items-center gap-1 transition-colors"
                  title="Archive or Delete"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>

              {charge.status === 'Active' && (
                <button
                  onClick={() => onAddChargeToQuote(charge)}
                  className="px-3 py-1.5 bg-[#FAF6EE] text-[#8C6428] hover:bg-[#F2ECE1] border border-[#EADBBE] rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3 text-[#C58B39]" />
                  <span>Add to Quote</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCharges.length === 0 && (
        <div className="bg-white border border-[#E8E3D9] rounded-lg p-12 text-center text-neutral-500">
          <p className="text-sm">No charges found matching current filters.</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="mt-2 text-xs text-[#C58B39] font-medium hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      <EventChargeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveCharge}
        initialData={editingCharge}
      />

      {/* Single Charge Details View Modal */}
      {viewingCharge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">
                  {viewingCharge.category}
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#181818] uppercase">
                  {viewingCharge.name}
                </h2>
              </div>
              <div className="font-mono text-2xl font-bold text-[#C58B39] tabular-nums">
                ₹{viewingCharge.price.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-600 py-2 border-y border-[#F0ECE1]">
              <div><strong>Duration:</strong> {viewingCharge.duration}</div>
              <span>·</span>
              <div><strong>Crew:</strong> {viewingCharge.crewRequirement}</div>
            </div>

            {viewingCharge.description && (
              <p className="text-xs text-neutral-700">
                {viewingCharge.description}
              </p>
            )}

            {viewingCharge.includedServices && viewingCharge.includedServices.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold text-[#8C6428] uppercase tracking-wider mb-2">
                  Complete Deliverables Checklist:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-800">
                  {viewingCharge.includedServices.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#C58B39]" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewingCharge.notes && (
              <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded text-xs text-neutral-600">
                <span className="font-medium text-neutral-800">Production Specification:</span> {viewingCharge.notes}
              </div>
            )}

            <div className="pt-3 border-t border-[#E8E3D9] flex justify-end gap-2 text-xs">
              <button
                onClick={() => setViewingCharge(null)}
                className="px-4 py-2 border border-[#E8E3D9] rounded text-neutral-700 hover:bg-neutral-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const chg = viewingCharge;
                  setViewingCharge(null);
                  onAddChargeToQuote(chg);
                }}
                className="px-4 py-2 bg-[#C58B39] hover:bg-[#B37B2E] text-white font-medium rounded transition-colors"
              >
                Add to Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Rate Card Document Preview Modal */}
      <RateCardPreviewModal
        isOpen={isRateCardPreviewOpen}
        onClose={() => setIsRateCardPreviewOpen(false)}
        charges={charges}
      />
    </div>
  );
};
