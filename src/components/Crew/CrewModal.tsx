import React, { useState, useEffect } from 'react';
import { X, Phone, ShieldCheck, DollarSign } from 'lucide-react';
import { CrewMember, CrewRole } from '../../types';
import { normalizeIndianPhoneNumber } from '../../services/storage';

interface CrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (crewData: Partial<CrewMember> & { name: string; phone: string; role: CrewRole }) => void;
  initialData?: CrewMember | null;
}

export const CrewModal: React.FC<CrewModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CrewRole>('Content Creator');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('3 Years / 50+ Weddings');
  const [defaultPayout, setDefaultPayout] = useState<number | ''>(6000);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [availability, setAvailability] = useState<CrewMember['availability']>('Available');
  const [status, setStatus] = useState<CrewMember['status']>('Active');
  const [notes, setNotes] = useState('');

  const roles: CrewRole[] = [
    'Photographer',
    'Videographer',
    'Content Creator',
    'Cinematographer',
    'Drone Operator',
    'Editor',
    'Assistant',
    'Social Media Manager'
  ];

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setEmail(initialData.email || '');
      setRole(initialData.role);
      setSpecialization(initialData.specialization);
      setExperience(initialData.experience);
      setDefaultPayout(initialData.defaultPayout);
      setUsername(initialData.username || '');
      setPassword(initialData.password || '');
      setAvailability(initialData.availability);
      setStatus(initialData.status);
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setRole('Content Creator');
      setSpecialization('Mobile Stabilization & Rapid Reel Turnaround');
      setExperience('3 Years / 60+ Weddings');
      setDefaultPayout(6000);
      setUsername('');
      setPassword('');
      setAvailability('Available');
      setStatus('Active');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const normalizedPreview = normalizeIndianPhoneNumber(phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || defaultPayout === '') return;

    onSave({
      id: initialData?.id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      role,
      specialization: specialization.trim(),
      experience: experience.trim(),
      defaultPayout: Number(defaultPayout),
      username: username.trim() || name.toLowerCase().replace(/\s+/g, '_'),
      password: password.trim(),
      availability,
      status,
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
              Crew Roster Onboarding
            </div>
            <h2 className="font-serif text-lg font-bold text-[#181818]">
              {initialData ? 'Edit Crew Profile' : '+ Add New Crew Member'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-3.5 text-xs">
          
          <div>
            <label className="block font-medium text-neutral-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aman Joshi"
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 focus:border-[#C58B39]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Phone Number (REQUIRED) *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded font-mono text-neutral-900 focus:border-[#C58B39]"
              />
              {phone && (
                <div className="text-[10px] font-mono text-[#8C6428] mt-0.5">
                  Normalized: <strong className="text-neutral-900">{normalizedPreview}</strong>
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@themaincharactermedia.com"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Primary Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as CrewRole)}
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white text-neutral-900 font-medium"
              >
                {roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Default Daily Payout (₹) *</label>
              <input
                type="number"
                required
                min="0"
                step="500"
                value={defaultPayout}
                onChange={(e) => setDefaultPayout(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="6000"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded font-mono tabular-nums font-bold text-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Specialization & Gear</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. 4K Drone Pilot, Bridal Closeups"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Experience</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="4 Years / 80+ Weddings"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
              />
            </div>
          </div>

          {/* Credentials */}
          <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded space-y-2">
            <span className="text-[10px] uppercase font-bold text-neutral-600 block">
              Portal Access Credentials (Optional)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-600 mb-0.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="aman_joshi"
                  className="w-full px-2.5 py-1 border border-[#DCD6C8] rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-600 mb-0.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-2.5 py-1 border border-[#DCD6C8] rounded bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Roster Availability</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as CrewMember['availability'])}
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white text-neutral-900"
              >
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
                <option value="Unavailable">Unavailable / Leave</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CrewMember['status'])}
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white text-neutral-900"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Excellent with groom party & Baraat energy."
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
              {initialData ? 'Update Crew' : 'Onboard Crew Member'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
