import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  ShieldCheck, 
  DollarSign, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Key
} from 'lucide-react';
import { CrewMember, CrewRole } from '../../types';
import { normalizeIndianPhoneNumber } from '../../services/storage';
import { createCrewFirebaseAuthUser } from '../../services/firebase';

interface CrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (crewData: Partial<CrewMember> & { name: string; phone: string; role: CrewRole; email?: string; password?: string; firebaseUid?: string }) => void;
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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [connectFirebaseAuth, setConnectFirebaseAuth] = useState(true);
  const [firebaseUid, setFirebaseUid] = useState<string | undefined>(undefined);

  const [role, setRole] = useState<CrewRole>('Content Creator');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('3 Years / 50+ Weddings');
  const [defaultPayout, setDefaultPayout] = useState<number | ''>(6000);
  const [username, setUsername] = useState('');
  const [availability, setAvailability] = useState<CrewMember['availability']>('Available');
  const [status, setStatus] = useState<CrewMember['status']>('Active');
  const [notes, setNotes] = useState('');

  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authNotice, setAuthNotice] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

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
      setPassword(initialData.password || '');
      setRole(initialData.role);
      setSpecialization(initialData.specialization);
      setExperience(initialData.experience);
      setDefaultPayout(initialData.defaultPayout);
      setUsername(initialData.username || '');
      setAvailability(initialData.availability);
      setStatus(initialData.status);
      setNotes(initialData.notes || '');
      setFirebaseUid(initialData.firebaseUid);
      setConnectFirebaseAuth(Boolean(initialData.firebaseUid || initialData.email));
      setAuthNotice(null);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setRole('Content Creator');
      setSpecialization('Mobile Stabilization & Rapid Reel Turnaround');
      setExperience('3 Years / 60+ Weddings');
      setDefaultPayout(6000);
      setUsername('');
      setAvailability('Available');
      setStatus('Active');
      setNotes('');
      setFirebaseUid(undefined);
      setConnectFirebaseAuth(true);
      setAuthNotice(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const normalizedPreview = normalizeIndianPhoneNumber(phone);

  const handleGeneratePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
    let generated = 'TMC@';
    for (let i = 0; i < 6; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthNotice(null);

    if (!name.trim() || !phone.trim() || defaultPayout === '') {
      return;
    }

    let resolvedUid = firebaseUid;

    // Handle Firebase Auth provisioning
    if (connectFirebaseAuth && email.trim() && password.trim()) {
      if (password.trim().length < 6) {
        setAuthNotice({
          type: 'error',
          message: 'Firebase Auth requires password to be at least 6 characters.'
        });
        return;
      }

      // If user doesn't already have a confirmed UID or email changed
      if (!resolvedUid || initialData?.email !== email.trim()) {
        setIsSubmittingAuth(true);
        try {
          const authRes = await createCrewFirebaseAuthUser(email.trim(), password.trim(), name.trim());
          if (authRes.success && authRes.uid) {
            resolvedUid = authRes.uid;
            setFirebaseUid(authRes.uid);
          } else if (authRes.error) {
            // If already registered, still allow associating
            if (authRes.error.includes('already registered')) {
              setAuthNotice({
                type: 'success',
                message: 'Account already exists in Firebase Auth. Linking to this crew member profile.'
              });
            } else {
              setAuthNotice({
                type: 'error',
                message: `Firebase Auth Note: ${authRes.error}`
              });
              setIsSubmittingAuth(false);
              return;
            }
          }
        } catch (err: any) {
          console.warn('Firebase Auth creation non-fatal error:', err);
        } finally {
          setIsSubmittingAuth(false);
        }
      }
    }

    onSave({
      id: initialData?.id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      role,
      specialization: specialization.trim(),
      experience: experience.trim(),
      defaultPayout: Number(defaultPayout),
      username: username.trim() || email.split('@')[0] || name.toLowerCase().replace(/\s+/g, '_'),
      password: password.trim(),
      firebaseUid: resolvedUid,
      availability,
      status,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E3D9] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">
              Crew Roster & Firebase Provisioning
            </div>
            <h2 className="font-serif text-lg font-bold text-[#181818]">
              {initialData ? 'Edit Crew Profile' : '+ Add New Crew Member'}
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-3.5 text-xs">
          
          {/* Notification / Feedback Banner */}
          {authNotice && (
            <div className={`p-3 rounded border flex items-start gap-2 ${
              authNotice.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              {authNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span className="text-xs">{authNotice.message}</span>
            </div>
          )}

          {/* Full Name */}
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

          {/* ⚡ FIREBASE AUTH & CREDENTIALS SECTION */}
          <div className="p-3.5 bg-[#FAF8F5] border border-[#E2DBD0] rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C58B39]" />
                <span className="text-[11px] uppercase font-bold text-neutral-800 tracking-wide">
                  Firebase Auth & Portal Login Credentials
                </span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-[#8C6428]">
                <input
                  type="checkbox"
                  checked={connectFirebaseAuth}
                  onChange={(e) => setConnectFirebaseAuth(e.target.checked)}
                  className="rounded text-[#C58B39] focus:ring-[#C58B39]"
                />
                <span>Sync to Firebase Auth</span>
              </label>
            </div>

            <p className="text-[11px] text-neutral-500">
              Enter the crew member's email & password. They will use these credentials to authenticate into the Crew Portal via Firebase Auth.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Email Address {connectFirebaseAuth ? '*' : ''}</span>
                </label>
                <input
                  type="email"
                  required={connectFirebaseAuth}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aman@themaincharactermedia.com"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900 bg-white focus:border-[#C58B39]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-neutral-700 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Password {connectFirebaseAuth ? '*' : ''}</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[10px] font-semibold text-[#C58B39] hover:underline flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={connectFirebaseAuth && !initialData}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-3 pr-8 py-1.5 border border-[#DCD6C8] rounded font-mono text-neutral-900 bg-white focus:border-[#C58B39]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-700"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {firebaseUid && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Firebase Auth UID: <strong>{firebaseUid}</strong></span>
              </div>
            )}
          </div>

          {/* Phone & Primary Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Phone Number (WhatsApp) *
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
                <div className="text-[10px] font-mono text-[#8C6428] mt-0.5 truncate">
                  Normalized: <strong className="text-neutral-900">{normalizedPreview}</strong>
                </div>
              )}
            </div>

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
          </div>

          {/* Daily Payout & Availability */}
          <div className="grid grid-cols-2 gap-3">
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
          </div>

          {/* Specialization & Experience */}
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

          {/* Status & Username */}
          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Portal Handle / Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="aman_joshi"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded font-mono text-neutral-900"
              />
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
          <div className="pt-3 border-t border-[#E8E3D9] flex items-center justify-between">
            <span className="text-[10px] text-neutral-400">
              {connectFirebaseAuth ? '⚡ Will provision on Firebase Auth' : 'Local storage only'}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-neutral-600 hover:text-neutral-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#181818] hover:bg-[#282828] text-white font-medium rounded transition-colors disabled:opacity-50"
              >
                {isSubmittingAuth && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C58B39]" />}
                <span>{initialData ? 'Update Crew' : 'Onboard & Provision Crew'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
