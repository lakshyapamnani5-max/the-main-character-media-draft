import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone } from 'lucide-react';
import { LocationVenue } from '../../types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (locData: Partial<LocationVenue> & { venue: string; city: string }) => void;
  initialData?: LocationVenue | null;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [parking, setParking] = useState('');
  const [accessInstructions, setAccessInstructions] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setVenue(initialData.venue);
      setAddress(initialData.address);
      setCity(initialData.city);
      setGoogleMapsLink(initialData.googleMapsLink || '');
      setContactPerson(initialData.contactPerson || '');
      setPhone(initialData.phone || '');
      setParking(initialData.parking || '');
      setAccessInstructions(initialData.accessInstructions || '');
      setNotes(initialData.notes || '');
    } else {
      setVenue('');
      setAddress('');
      setCity('Mumbai');
      setGoogleMapsLink('');
      setContactPerson('');
      setPhone('');
      setParking('Vendor loading dock & banquet parking available');
      setAccessInstructions('Service elevators via Basement 1');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue.trim() || !city.trim()) return;

    onSave({
      id: initialData?.id,
      venue: venue.trim(),
      address: address.trim(),
      city: city.trim(),
      googleMapsLink: googleMapsLink.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      parking: parking.trim(),
      accessInstructions: accessInstructions.trim(),
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E3D9] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">
              Venue Coordinates
            </div>
            <h2 className="font-serif text-lg font-bold text-[#181818]">
              {initialData ? 'Edit Location' : '+ Add Saved Venue & Location'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Venue Name *</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. The St. Regis Mumbai"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 focus:border-[#C58B39]"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">City / Region *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, MH"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 focus:border-[#C58B39]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Full Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 462, Senapati Bapat Marg, Lower Parel"
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Google Maps Link</label>
            <input
              type="url"
              value={googleMapsLink}
              onChange={(e) => setGoogleMapsLink(e.target.value)}
              placeholder="https://maps.google.com/?q=..."
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Contact Person (Banquet / Ops)</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Mr. Vikram Rathore"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 00000"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Parking & Valet</label>
              <input
                type="text"
                value={parking}
                onChange={(e) => setParking(e.target.value)}
                placeholder="Vendor parking at Gate 3"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Access Instructions</label>
              <input
                type="text"
                value={accessInstructions}
                onChange={(e) => setAccessInstructions(e.target.value)}
                placeholder="Service lift Basement 1 to Ballroom"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Production Notes & Drone Clearance</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Drone flight permitted before sunset only; sound restriction after 10 PM."
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#E8E3D9] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-neutral-600 hover:text-neutral-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#181818] hover:bg-[#282828] text-white font-medium rounded transition-colors"
            >
              {initialData ? 'Update Location' : 'Save Location'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
