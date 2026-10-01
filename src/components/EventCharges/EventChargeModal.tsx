import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { EventCharge, ChargeStatus } from '../../types';

interface EventChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (charge: Partial<EventCharge> & { name: string; price: number }) => void;
  initialData?: EventCharge | null;
}

export const EventChargeModal: React.FC<EventChargeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Wedding Day');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>(25000);
  const [duration, setDuration] = useState('8 Hours');
  const [crewRequirement, setCrewRequirement] = useState('2 Content Creators');
  const [includedServiceInput, setIncludedServiceInput] = useState('');
  const [includedServices, setIncludedServices] = useState<string[]>([]);
  const [addOnInput, setAddOnInput] = useState('');
  const [optionalAddOns, setOptionalAddOns] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ChargeStatus>('Active');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setDescription(initialData.description);
      setPrice(initialData.price);
      setDuration(initialData.duration);
      setCrewRequirement(initialData.crewRequirement);
      setIncludedServices(initialData.includedServices || []);
      setOptionalAddOns(initialData.optionalAddOns || []);
      setNotes(initialData.notes || '');
      setStatus(initialData.status);
    } else {
      setName('');
      setCategory('Wedding Day');
      setDescription('');
      setPrice(25000);
      setDuration('8 Hours');
      setCrewRequirement('2 Content Creators');
      setIncludedServices([
        'Bride POV',
        'Groom POV',
        'Couple POV',
        'Rituals',
        'Family',
        'Guests',
        'Decor',
        'Reels'
      ]);
      setOptionalAddOns(['Drone Coverage', 'Same Day Edit']);
      setNotes('');
      setStatus('Active');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddIncludedService = () => {
    if (includedServiceInput.trim() && !includedServices.includes(includedServiceInput.trim())) {
      setIncludedServices([...includedServices, includedServiceInput.trim()]);
      setIncludedServiceInput('');
    }
  };

  const handleRemoveIncludedService = (index: number) => {
    setIncludedServices(includedServices.filter((_, i) => i !== index));
  };

  const handleAddOptionalAddOn = () => {
    if (addOnInput.trim() && !optionalAddOns.includes(addOnInput.trim())) {
      setOptionalAddOns([...optionalAddOns, addOnInput.trim()]);
      setAddOnInput('');
    }
  };

  const handleRemoveOptionalAddOn = (index: number) => {
    setOptionalAddOns(optionalAddOns.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === '') return;

    onSave({
      id: initialData?.id,
      name: name.trim(),
      category,
      description,
      price: Number(price),
      duration,
      crewRequirement,
      includedServices,
      optionalAddOns,
      notes,
      status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E8E3D9] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#C58B39]">Master Catalogue</div>
            <h2 className="font-serif text-xl font-semibold text-[#181818]">
              {initialData ? 'Edit Event Charge' : 'Add New Event Charge'}
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
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Charge / Package Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wedding Day or Haldi Ceremony"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39] bg-white"
              >
                <option value="Wedding Day">Wedding Day</option>
                <option value="Pre-Wedding Rituals">Pre-Wedding Rituals</option>
                <option value="Add-ons & Gear">Add-ons & Gear</option>
                <option value="Crew & Hours">Crew & Hours</option>
                <option value="Custom Packages">Custom Packages</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="500"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="25000"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 font-mono tabular-nums focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Duration / Time *
              </label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 8 Hours, 4 Hours, Full Day"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Crew Requirement *
              </label>
              <input
                type="text"
                required
                value={crewRequirement}
                onChange={(e) => setCrewRequirement(e.target.value)}
                placeholder="e.g. 2 Content Creators"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of what this service delivers for the couple..."
              className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
            />
          </div>

          {/* Included Services List */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Included Services (e.g. Bride POV, Groom POV, Rituals, Reels)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={includedServiceInput}
                onChange={(e) => setIncludedServiceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddIncludedService();
                  }
                }}
                placeholder="Type service and click Add (e.g. Bride POV)"
                className="flex-1 px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
              <button
                type="button"
                onClick={handleAddIncludedService}
                className="px-3 py-1.5 bg-[#FAF8F5] border border-[#DCD6C8] hover:bg-[#F2ECE1] rounded text-neutral-800 font-medium"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded min-h-[44px]">
              {includedServices.length === 0 ? (
                <span className="text-neutral-400 italic">No included deliverables added yet.</span>
              ) : (
                includedServices.map((srv, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DCD6C8] rounded text-[11px] text-neutral-800"
                  >
                    <span>{srv}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIncludedService(idx)}
                      className="text-neutral-400 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Optional Add-ons List */}
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Optional Add-ons
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={addOnInput}
                onChange={(e) => setAddOnInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddOptionalAddOn();
                  }
                }}
                placeholder="e.g. Drone coverage, Same Day Edit"
                className="flex-1 px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
              <button
                type="button"
                onClick={handleAddOptionalAddOn}
                className="px-3 py-1.5 bg-[#FAF8F5] border border-[#DCD6C8] hover:bg-[#F2ECE1] rounded text-neutral-800 font-medium"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAF8F5] border border-[#E8E3D9] rounded min-h-[38px]">
              {optionalAddOns.length === 0 ? (
                <span className="text-neutral-400 italic">No add-ons listed.</span>
              ) : (
                optionalAddOns.map((ao, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DCD6C8] rounded text-[11px] text-neutral-800"
                  >
                    <span>{ao}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionalAddOn(idx)}
                      className="text-neutral-400 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Technical Notes / Equipment Specification
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Shot on iPhone 16 Pro Max ProRes with wireless audio"
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ChargeStatus)}
                className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39] bg-white"
              >
                <option value="Active">Active (Available for new quotes)</option>
                <option value="Archived">Archived (Preserved for historical integrity)</option>
              </select>
            </div>
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
              className="px-5 py-2 bg-[#181818] hover:bg-[#282828] text-white font-medium rounded transition-colors shadow-xs"
            >
              {initialData ? 'Update Event Charge' : 'Save Event Charge'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
