import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  X,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Database,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  auth, 
  googleProvider, 
  getEffectiveFirebaseConfig, 
  saveCustomFirebaseCredentials, 
  clearCustomFirebaseCredentials 
} from '../../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Custom Credentials Drawer
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const currentConfig = getEffectiveFirebaseConfig();
  const [customApiKey, setCustomApiKey] = useState(currentConfig.apiKey || '');
  const [customDatabaseUrl, setCustomDatabaseUrl] = useState((currentConfig as any).databaseURL || '');
  const [customProjectId, setCustomProjectId] = useState(currentConfig.projectId || '');
  const [customAuthDomain, setCustomAuthDomain] = useState(currentConfig.authDomain || '');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName.trim()) {
          await updateProfile(cred.user, { displayName: displayName.trim() });
        }
        setSuccessMessage('Account registered and signed in successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccessMessage('Signed in successfully!');
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please verify your credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccessMessage('Signed in with Google successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customApiKey.trim() || !customProjectId.trim()) {
      setError('API Key and Project ID are required for custom credentials.');
      return;
    }
    saveCustomFirebaseCredentials({
      apiKey: customApiKey.trim(),
      projectId: customProjectId.trim(),
      authDomain: customAuthDomain.trim() || `${customProjectId.trim()}.firebaseapp.com`,
      databaseURL: customDatabaseUrl.trim()
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign out.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-[#E8E3D9] max-w-md w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-black p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          /* Profile & Sign Out View */
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E8E3D9]">
              <div className="w-12 h-12 rounded-full bg-[#1C1A18] border border-[#C58B39] text-[#C58B39] flex items-center justify-center font-bold text-lg">
                {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-neutral-900">
                  {currentUser.displayName || 'Authorized Admin'}
                </h3>
                <div className="text-xs text-neutral-500 font-mono">
                  {currentUser.email}
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Connected to Firebase Auth & Cloud Firestore Realtime Sync</span>
            </div>

            <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-xs space-y-1">
              <div className="font-semibold text-neutral-700">Active Firebase Project:</div>
              <div className="font-mono text-[11px] text-[#C58B39] truncate">{currentConfig.projectId}</div>
              {(currentConfig as any).databaseURL && (
                <div className="font-mono text-[10px] text-neutral-500 truncate">RTDB: {(currentConfig as any).databaseURL}</div>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#C58B39] font-bold">
                Firebase Authentication & Sync
              </div>
              <h3 className="font-serif text-2xl font-bold text-neutral-900 mt-0.5">
                {isSignUp ? 'Create Admin Account' : 'Sign In with Email'}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Authenticate with your email credentials to securely access The Main Character Media ERP and sync partners & shoots.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google Fast Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-3 bg-white border border-[#E8E3D9] hover:bg-[#FAF8F5] text-neutral-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#E8E3D9]" />
              <span className="flex-shrink mx-3 text-[10px] font-mono text-neutral-400 uppercase">Or with Email</span>
              <div className="flex-grow border-t border-[#E8E3D9]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {isSignUp && (
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Lakshay Pamnani"
                    className="w-full p-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@themaincharacter.media"
                    className="w-full pl-9 pr-3 py-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 border border-[#E8E3D9] rounded-lg bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#121212] hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-[#C58B39]" />
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-1 text-center text-xs text-neutral-500">
              {isSignUp ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError(null);
                    }}
                    className="font-semibold text-[#C58B39] hover:underline"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError(null);
                    }}
                    className="font-semibold text-[#C58B39] hover:underline"
                  >
                    Register Admin
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Custom Firebase Credentials Accordion */}
        <div className="pt-3 border-t border-[#E8E3D9]">
          <button
            type="button"
            onClick={() => setShowCredentialsForm(!showCredentialsForm)}
            className="w-full flex items-center justify-between text-xs text-neutral-600 hover:text-black font-semibold py-1"
          >
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#C58B39]" />
              <span>Custom Firebase / Realtime DB Credentials</span>
            </div>
            {showCredentialsForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showCredentialsForm && (
            <form onSubmit={handleSaveCredentials} className="mt-3 space-y-2.5 text-xs bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E3D9]">
              <p className="text-[11px] text-neutral-500">
                You can override the provisioned database with your own Firebase Realtime DB URL or Project API Key:
              </p>

              <div>
                <label className="block font-medium text-neutral-700 text-[11px] mb-0.5">Firebase Realtime DB URL (optional)</label>
                <input
                  type="text"
                  value={customDatabaseUrl}
                  onChange={(e) => setCustomDatabaseUrl(e.target.value)}
                  placeholder="https://your-database-name.firebaseio.com"
                  className="w-full p-2 border border-[#E8E3D9] rounded bg-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 text-[11px] mb-0.5">Firebase API Key</label>
                <input
                  type="text"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full p-2 border border-[#E8E3D9] rounded bg-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 text-[11px] mb-0.5">Project ID</label>
                <input
                  type="text"
                  value={customProjectId}
                  onChange={(e) => setCustomProjectId(e.target.value)}
                  placeholder="my-project-id"
                  className="w-full p-2 border border-[#E8E3D9] rounded bg-white font-mono text-[11px]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#C58B39] hover:bg-[#B37B2E] text-white rounded text-xs font-semibold shadow-2xs"
                >
                  Save & Connect Credentials
                </button>
                <button
                  type="button"
                  onClick={() => clearCustomFirebaseCredentials()}
                  className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded text-xs font-medium"
                >
                  Reset to Default
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
export default AuthModal;
