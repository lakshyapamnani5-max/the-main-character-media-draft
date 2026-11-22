import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  Lock, 
  LogIn, 
  AlertCircle,
  Phone,
  CheckCircle2,
  Instagram
} from 'lucide-react';
import { UserSession } from '../../services/storage';
import { CrewMember, Partner } from '../../types';
import { Building2 } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (session: UserSession) => void;
  crewRoster: CrewMember[];
  partners: Partner[];
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, crewRoster, partners }) => {
  const [roleMode, setRoleMode] = useState<'admin' | 'crew' | 'partner'>('admin');
  
  // Admin login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Crew Login State - Phone based
  const [crewPhoneInput, setCrewPhoneInput] = useState('');

  // Partner Login State - Phone or Email based
  const [partnerIdentifier, setPartnerIdentifier] = useState('');

  // Admin Sign-in (hardcoded single admin: admin@tmcm / admin123)
  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === 'admin@tmcm' || cleanEmail === 'admin@tmcm.com') {
      if (password === 'admin123') {
        setSuccessMessage('Credentials verified. Entering Production ERP...');
        setTimeout(() => {
          onLoginSuccess({
            role: 'admin',
            name: 'Executive Producer',
            email: 'admin@tmcm.com',
            authenticatedAt: new Date().toISOString()
          });
        }, 400);
        setLoading(false);
        return;
      }
    }

    setError('Invalid credentials. Use admin@tmcm with password admin123.');
    setLoading(false);
  };

  // Crew Login Handler - Phone number matching
  const handleCrewLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const inputDigits = crewPhoneInput.replace(/\D/g, '');
    if (!inputDigits || inputDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Normalize to last 10 digits for matching
    const last10 = inputDigits.slice(-10);

    // Find crew member by phone number
    const member = crewRoster.find(c => {
      if (!c.phone) return false;
      const crewDigits = c.phone.replace(/\D/g, '');
      const crewLast10 = crewDigits.slice(-10);
      return crewLast10 === last10;
    });

    if (!member) {
      setError('No crew member found with this phone number. Please contact your admin.');
      return;
    }

    if (member.status === 'Inactive') {
      setError('Your account is currently inactive. Please contact your admin.');
      return;
    }

    setSuccessMessage(`Welcome, ${member.name}! Loading your shoot schedule...`);
    setTimeout(() => {
      onLoginSuccess({
        role: 'crew',
        name: member.name,
        crewId: member.id,
        phone: member.phone,
        authenticatedAt: new Date().toISOString()
      });
    }, 400);
  };

  // Partner Login Handler - Phone number or Email matching
  const handlePartnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const rawInput = partnerIdentifier.trim();
    if (!rawInput) {
      setError('Please enter your registered phone number or email address.');
      return;
    }

    const isEmailInput = rawInput.includes('@');
    let matchedPartner: Partner | undefined;

    if (isEmailInput) {
      const targetEmail = rawInput.toLowerCase();
      matchedPartner = partners.find(p => (p.email || '').trim().toLowerCase() === targetEmail);
    } else {
      const inputDigits = rawInput.replace(/\D/g, '');
      if (inputDigits.length >= 10) {
        const last10 = inputDigits.slice(-10);
        matchedPartner = partners.find(p => {
          if (!p.phone) return false;
          const partnerDigits = p.phone.replace(/\D/g, '');
          return partnerDigits.length >= 10 && partnerDigits.slice(-10) === last10;
        });
      } else {
        setError('Please enter a valid 10-digit mobile number or full email address.');
        return;
      }
    }

    if (!matchedPartner) {
      setError('No event partner found with this phone number or email. Ask the admin to add or update your company details.');
      return;
    }

    if (matchedPartner.portalAccessEnabled === false) {
      setError('Portal access is currently paused for your company. Please contact the admin.');
      return;
    }

    setSuccessMessage(`Welcome, ${matchedPartner.companyName}! Loading your calendar & events...`);
    setTimeout(() => {
      onLoginSuccess({
        role: 'partner',
        name: matchedPartner.contactPerson || matchedPartner.name || matchedPartner.companyName,
        companyName: matchedPartner.companyName,
        partnerId: matchedPartner.id,
        phone: matchedPartner.phone,
        email: matchedPartner.email,
        authenticatedAt: new Date().toISOString()
      });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#FAF8F5] flex flex-col justify-between selection:bg-[#C58B39]/30 relative overflow-hidden font-sans">
      
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#C58B39]/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-amber-600/10 via-[#C58B39]/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Brand Banner */}
      <header className="relative z-10 px-6 py-5 max-w-6xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-[#C58B39]/60 bg-white p-1 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
            <img src="/logo.png" alt="TMCM" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="font-serif tracking-[0.2em] text-sm font-bold text-white uppercase">
              The Main Character Media
            </div>
            <div className="text-[10px] font-mono tracking-widest text-[#C58B39] uppercase">
              Luxury Wedding Content ERP & Crew Terminal
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] font-mono text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Production Ready v2.6</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          
          {/* Header Title */}
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5">
              Secure Terminal Access
            </h1>
            <p className="text-xs text-neutral-400">
              Sign in as Admin, Crew Member, or Event Partner.
            </p>
          </div>

          {/* Role Mode Tabs: Admin vs Crew vs Partner */}
          <div className="grid grid-cols-3 p-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl mb-6 gap-1">
            <button
              type="button"
              onClick={() => {
                setRoleMode('admin');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                roleMode === 'admin'
                  ? 'bg-[#C58B39] text-[#121212] shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRoleMode('crew');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                roleMode === 'crew'
                  ? 'bg-[#C58B39] text-[#121212] shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span>Crew</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRoleMode('partner');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                roleMode === 'partner'
                  ? 'bg-[#C58B39] text-[#121212] shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>Partners</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* ADMIN AUTH FORM */}
          {roleMode === 'admin' && (
            <div className="space-y-4">
              <form onSubmit={handleAdminAuth} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    Admin Username *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@tmcm"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl text-sm text-white focus:outline-none focus:border-[#C58B39] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl text-sm text-white focus:outline-none focus:border-[#C58B39] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#C58B39] hover:bg-[#B37B2E] active:scale-[0.99] disabled:opacity-50 text-[#121212] rounded-xl text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 mt-3 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Authenticating...' : 'Sign In as Admin'}</span>
                </button>
              </form>
            </div>
          )}

          {/* CREW AUTH FORM - Phone Number Login */}
          {roleMode === 'crew' && (
            <form onSubmit={handleCrewLogin} className="space-y-4">
              <div className="p-3 bg-[#1C1A18] border border-[#C58B39]/30 rounded-xl text-xs text-neutral-300 space-y-1">
                <div className="font-semibold text-[#C58B39] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile-First Crew Terminal</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Enter the mobile number registered by your admin to access your shoot schedule, call times, and payout records.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                  Registered Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={crewPhoneInput}
                    onChange={(e) => setCrewPhoneInput(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl text-sm text-white focus:outline-none focus:border-[#C58B39] transition-colors"
                  />
                </div>
                <p className="text-[10px] text-neutral-500 mt-1.5 ml-1">
                  Use the same number your admin registered while adding you to the crew roster.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#C58B39] hover:bg-[#B37B2E] text-[#121212] rounded-xl text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Enter Crew Portal</span>
              </button>
            </form>
          )}

          {/* PARTNER AUTH FORM - Phone or Email Login */}
          {roleMode === 'partner' && (
            <form onSubmit={handlePartnerLogin} className="space-y-4">
              <div className="p-3 bg-[#1C1A18] border border-[#C58B39]/30 rounded-xl text-xs text-neutral-300 space-y-1">
                <div className="font-semibold text-[#C58B39] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Event Partner Company Portal</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Sign in with your company’s registered mobile number or email address to view your scheduled events and calendar.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                  Registered Phone Number or Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={partnerIdentifier}
                    onChange={(e) => setPartnerIdentifier(e.target.value)}
                    placeholder="+91 98200 11223 or partner@company.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl text-sm text-white focus:outline-none focus:border-[#C58B39] transition-colors"
                  />
                </div>
                <p className="text-[10px] text-neutral-500 mt-1.5 ml-1">
                  Uses the phone number or email saved by admin in your Partner profile.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#C58B39] hover:bg-[#B37B2E] text-[#121212] rounded-xl text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>Enter Partner Portal</span>
              </button>
            </form>
          )}

        </div>
      </main>

      {/* Footer with DRONA Tech Solutions Attribution */}
      <footer className="relative z-10 px-6 py-4 max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 font-mono gap-3 border-t border-white/5">
        <div>© {new Date().getFullYear()} The Main Character Media. All rights reserved.</div>
        <div className="flex flex-wrap items-center gap-3 text-neutral-400">
          <span>Made by <strong className="text-white font-semibold">DRONA Tech Solutions</strong></span>
          <span className="text-neutral-600">·</span>
          <a
            href="https://instagram.com/_.drona._"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#C58B39] hover:text-[#D89B48] transition-colors"
            title="Follow on Instagram"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>_.drona._</span>
          </a>
          <span className="text-neutral-600">·</span>
          <a
            href="tel:7620366390"
            className="inline-flex items-center gap-1 text-neutral-300 hover:text-white transition-colors"
            title="Call DRONA Tech Solutions"
          >
            <Phone className="w-3.5 h-3.5 text-[#C58B39]" />
            <span>7620366390</span>
          </a>
        </div>
      </footer>

    </div>
  );
};
export default AuthPage;
