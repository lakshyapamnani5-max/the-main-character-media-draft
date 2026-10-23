import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  Lock, 
  LogIn, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Database,
  ChevronDown,
  ChevronUp,
  Phone,
  Instagram
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { 
  auth, 
  getEffectiveFirebaseConfig, 
  saveCustomFirebaseCredentials 
} from '../../services/firebase';
import { UserSession } from '../../services/storage';
import { CrewMember } from '../../types';

interface AuthPageProps {
  onLoginSuccess: (session: UserSession) => void;
  crewRoster: CrewMember[];
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, crewRoster }) => {
  const [roleMode, setRoleMode] = useState<'admin' | 'crew'>('admin');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Official Admin Credentials pre-filled by default
  const [email, setEmail] = useState('admin@tmcm.com');
  const [password, setPassword] = useState('admin123');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Crew Login State
  const [selectedCrewId, setSelectedCrewId] = useState(crewRoster[0]?.id || '');
  const [crewNameInput, setCrewNameInput] = useState('');
  const [crewPhoneInput, setCrewPhoneInput] = useState('');

  // Custom Firebase Credentials Drawer
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const currentConfig = getEffectiveFirebaseConfig();
  const [customApiKey, setCustomApiKey] = useState(currentConfig.apiKey || '');
  const [customDatabaseUrl, setCustomDatabaseUrl] = useState((currentConfig as any).databaseURL || '');
  const [customProjectId, setCustomProjectId] = useState(currentConfig.projectId || '');

  // Admin Email/Password Sign-in
  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Direct official credentials match
    if (cleanEmail === 'admin@tmcm.com' && password === 'admin123') {
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

    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const name = displayName.trim() || cleanEmail.split('@')[0];
        if (displayName.trim()) {
          await updateProfile(cred.user, { displayName: name });
        }
        setSuccessMessage('Account registered and verified successfully.');
        setTimeout(() => {
          onLoginSuccess({
            role: 'admin',
            name,
            email: cred.user.email || cleanEmail,
            authenticatedAt: new Date().toISOString()
          });
        }, 500);
      } else {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const name = cred.user.displayName || cleanEmail.split('@')[0] || 'Admin';
        setSuccessMessage('Welcome back! Loading Production Workspace...');
        setTimeout(() => {
          onLoginSuccess({
            role: 'admin',
            name,
            email: cred.user.email || cleanEmail,
            authenticatedAt: new Date().toISOString()
          });
        }, 500);
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid credentials. Official Admin access is admin@tmcm.com with password admin123.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else {
        setError(err.message || 'Authentication error. Use official credentials admin@tmcm.com / admin123.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Crew Login Handler
  const handleCrewLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let member = crewRoster.find(c => c.id === selectedCrewId);
    let memberName = member?.name;
    let memberId = member?.id;

    if (!member && crewNameInput.trim()) {
      memberName = crewNameInput.trim();
      memberId = `crew-${Date.now()}`;
    }

    if (!memberName) {
      setError('Please select or enter your name to proceed.');
      return;
    }

    setSuccessMessage(`Welcome, ${memberName}! Loading your shoot schedule...`);
    setTimeout(() => {
      onLoginSuccess({
        role: 'crew',
        name: memberName!,
        crewId: memberId,
        phone: member?.phone || crewPhoneInput.trim() || undefined,
        authenticatedAt: new Date().toISOString()
      });
    }, 400);
  };

  // Custom Firebase credentials save
  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomFirebaseCredentials({
      apiKey: customApiKey.trim(),
      projectId: customProjectId.trim(),
      databaseURL: customDatabaseUrl.trim(),
    });
    setSuccessMessage('Firebase configuration updated and saved.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#FAF8F5] flex flex-col justify-between selection:bg-[#C58B39]/30 relative overflow-hidden font-sans">
      
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#C58B39]/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-amber-600/10 via-[#C58B39]/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Brand Banner */}
      <header className="relative z-10 px-6 py-5 max-w-6xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-[#C58B39]/60 bg-[#161513] flex items-center justify-center shadow-lg">
            <span className="font-serif text-[#C58B39] font-bold text-xl tracking-wider">M</span>
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
              Sign in to manage wedding productions, financials, or crew calls.
            </p>
          </div>

          {/* Role Mode Tabs: Admin vs Crew */}
          <div className="grid grid-cols-2 p-1 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setRoleMode('admin');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                roleMode === 'admin'
                  ? 'bg-[#C58B39] text-[#121212] shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin / Producer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRoleMode('crew');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                roleMode === 'crew'
                  ? 'bg-[#C58B39] text-[#121212] shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Crew Portal</span>
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
              
              {/* Official Credential Notice Banner */}
              <div className="p-3 bg-[#1B1916] border border-[#C58B39]/40 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[#D89B48] uppercase tracking-wider font-semibold">
                    Executive Admin Credentials
                  </div>
                  <div className="text-xs text-neutral-300 font-mono mt-0.5">
                    <span className="text-white font-semibold">admin@tmcm.com</span> · <span className="text-neutral-400">admin123</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@tmcm.com');
                    setPassword('admin123');
                    setError(null);
                  }}
                  className="px-2 py-1 bg-[#C58B39]/20 hover:bg-[#C58B39]/30 border border-[#C58B39]/40 text-[#D89B48] rounded text-[10px] font-mono font-medium transition-colors"
                >
                  Apply
                </button>
              </div>

              <form onSubmit={handleAdminAuth} className="space-y-3.5">
                {isSignUp && (
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Creative Producer"
                        className="w-full pl-9 pr-3 py-2 bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl text-xs text-white focus:outline-none focus:border-[#C58B39] transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    Admin Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@tmcm.com"
                      className="w-full pl-9 pr-3 py-2 bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl text-xs text-white focus:outline-none focus:border-[#C58B39] transition-colors"
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
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl text-xs text-white focus:outline-none focus:border-[#C58B39] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#C58B39] hover:bg-[#B37B2E] active:scale-[0.99] disabled:opacity-50 text-[#121212] rounded-xl text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 mt-3 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Admin Account' : 'Sign In as Admin'}</span>
                </button>
              </form>

              {/* Toggle Sign Up / Sign In */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-neutral-400 hover:text-[#C58B39] underline transition-colors"
                >
                  {isSignUp ? 'Already have an admin account? Sign In' : 'Register New Administrator Account'}
                </button>
              </div>
            </div>
          )}

          {/* CREW AUTH FORM */}
          {roleMode === 'crew' && (
            <form onSubmit={handleCrewLogin} className="space-y-4">
              <div className="p-3 bg-[#1C1A18] border border-[#C58B39]/30 rounded-xl text-xs text-neutral-300 space-y-1">
                <div className="font-semibold text-[#C58B39] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile-First Crew Terminal</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Access your upcoming wedding shoots, call times, location GPS, and payout records.
                </p>
              </div>

              {crewRoster.length > 0 ? (
                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    Select Your Profile
                  </label>
                  <select
                    value={selectedCrewId}
                    onChange={(e) => setSelectedCrewId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl text-xs text-white focus:outline-none focus:border-[#C58B39]"
                  >
                    {crewRoster.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.role})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      Your Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={crewNameInput}
                        onChange={(e) => setCrewNameInput(e.target.value)}
                        placeholder="e.g. Sahil Patel"
                        className="w-full pl-9 pr-3 py-2 bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl text-xs text-white focus:outline-none focus:border-[#C58B39]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      Mobile Number (WhatsApp)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={crewPhoneInput}
                        onChange={(e) => setCrewPhoneInput(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl text-xs text-white focus:outline-none focus:border-[#C58B39]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#C58B39] hover:bg-[#B37B2E] text-[#121212] rounded-xl text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Enter Crew Portal</span>
              </button>
            </form>
          )}

          {/* Expandable Firebase Sync Config */}
          <div className="mt-6 pt-4 border-t border-[#262626]">
            <button
              type="button"
              onClick={() => setShowCredentialsForm(!showCredentialsForm)}
              className="w-full flex items-center justify-between text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#C58B39]" />
                <span>Firebase Realtime Database Settings</span>
              </div>
              {showCredentialsForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showCredentialsForm && (
              <form onSubmit={handleSaveCredentials} className="mt-3 space-y-2.5 text-xs text-neutral-300">
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400">Firebase API Key</label>
                  <input
                    type="text"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-2.5 py-1.5 bg-[#181818] border border-[#282828] rounded text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400">Project ID</label>
                  <input
                    type="text"
                    value={customProjectId}
                    onChange={(e) => setCustomProjectId(e.target.value)}
                    placeholder="tmcm-336db"
                    className="w-full px-2.5 py-1.5 bg-[#181818] border border-[#282828] rounded text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400">Realtime Database URL</label>
                  <input
                    type="text"
                    value={customDatabaseUrl}
                    onChange={(e) => setCustomDatabaseUrl(e.target.value)}
                    placeholder="https://tmcm-336db-default-rtdb.firebaseio.com"
                    className="w-full px-2.5 py-1.5 bg-[#181818] border border-[#282828] rounded text-white font-mono text-[11px]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[11px] font-medium transition-colors"
                >
                  Save & Reconnect
                </button>
              </form>
            )}
          </div>

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
