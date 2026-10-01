import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Edit3, 
  Building2, 
  Car, 
  Navigation
} from 'lucide-react';
import { LocationVenue } from '../../types';
import { LocationModal } from './LocationModal';

interface LocationsViewProps {
  locations: LocationVenue[];
  onSaveLocation: (locData: Partial<LocationVenue> & { venue: string; city: string }) => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  locations,
  onSaveLocation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationVenue | null>(null);

  const filteredLocations = locations.filter(l => 
    l.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.contactPerson && l.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (l.address && l.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddNew = () => {
    setEditingLocation(null);
    setIsLocationModalOpen(true);
  };

  const handleEdit = (loc: LocationVenue) => {
    setEditingLocation(loc);
    setIsLocationModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#E8E3D9] rounded-lg p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">Venue Intelligence & Access</div>
          <h1 className="font-serif text-2xl font-bold text-[#181818] tracking-tight">
            Production Locations & Venues
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Coordinates, banquet contacts, gate access instructions, parking logistics, and drone flight rules.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#181818] hover:bg-[#282828] rounded transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#C58B39]" />
          <span>+ Add Location</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search venues, city, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E8E3D9] rounded text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#C58B39]"
          />
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredLocations.map((loc) => (
          <div
            key={loc.id}
            className="bg-white border border-[#E8E3D9] rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-[#D5CEBF] transition-all space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#F0ECE1]">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#181818]">{loc.venue}</h3>
                  <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C58B39]" />
                    <span>{loc.city}</span>
                  </div>
                </div>

                {loc.googleMapsLink && (
                  <a
                    href={loc.googleMapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-[#FAF8F5] border border-[#E8E3D9] hover:border-[#C58B39] text-neutral-700 hover:text-[#C58B39] rounded text-xs flex items-center gap-1 transition-colors"
                    title="Open in Google Maps"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Map</span>
                  </a>
                )}
              </div>

              {/* Address */}
              {loc.address && (
                <div className="text-xs text-neutral-600 mt-2">
                  <strong>Address:</strong> {loc.address}
                </div>
              )}

              {/* Contact */}
              {(loc.contactPerson || loc.phone) && (
                <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded space-y-1 text-xs text-neutral-700">
                  {loc.contactPerson && (
                    <div><strong>Banquet / Event Lead:</strong> {loc.contactPerson}</div>
                  )}
                  {loc.phone && (
                    <div className="flex items-center gap-1.5 font-mono text-neutral-900 font-semibold">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      <span>{loc.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Logistics */}
              <div className="space-y-1 text-[11px] text-neutral-600 pt-1">
                {loc.parking && (
                  <div><strong>Parking & Valet:</strong> {loc.parking}</div>
                )}
                {loc.accessInstructions && (
                  <div><strong>Crew Access / Loading:</strong> {loc.accessInstructions}</div>
                )}
                {loc.notes && (
                  <div className="italic text-neutral-500 mt-1">"{loc.notes}"</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-between">
              <button
                onClick={() => handleEdit(loc)}
                className="p-1.5 text-neutral-600 hover:text-neutral-900 text-xs flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Location</span>
              </button>

              <span className="text-[10px] font-mono text-neutral-400">
                ID: {loc.id}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSave={onSaveLocation}
        initialData={editingLocation}
      />
    </div>
  );
};
