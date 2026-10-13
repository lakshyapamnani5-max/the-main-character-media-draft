import React, { useState } from 'react';
import { 
  X, 
  Key, 
  ShieldCheck, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  RotateCcw,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { 
  getEffectiveFirebaseConfig, 
  saveCustomFirebaseCredentials, 
  clearCustomFirebaseCredentials,
  testFirebaseConnection 
} from '../../services/firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose
}) => {
  const currentConfig = getEffectiveFirebaseConfig();
  
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || '');
  const [projectId, setProjectId] = useState(currentConfig.projectId || '');
  const [appId, setAppId] = useState(currentConfig.appId || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId || '');
  const [jsonInput, setJsonInput] = useState('');
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handlePasteJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.appId) setAppId(parsed.appId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      setTestResult({ success: true, message: 'JSON parsed and fields populated successfully!' });
      setJsonInput('');
    } catch {
      setTestResult({ success: false, message: 'Invalid JSON format. Please verify the copied snippet.' });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setTestResult({ success: false, message: 'API Key and Project ID are required.' });
      return;
    }

    const customConfig: Record<string, string> = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      appId: appId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim()
    };

    saveCustomFirebaseCredentials(customConfig);
  };

  const handleReset = () => {
    if (confirm('Reset to default pre-configured Firebase project credentials?')) {
      clearCustomFirebaseCredentials();
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      await testFirebaseConnection();
      setTestResult({
        success: true,
        message: 'Successfully connected to Firebase services! Auth and Firestore are operational.'
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection test response: ${err.message || 'Offline or invalid credentials'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(currentConfig, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E3D9] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#181818] border border-[#C58B39] flex items-center justify-center text-[#C58B39]">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">
                Firebase Auth & Cloud Infrastructure
              </div>
              <h2 className="font-serif text-lg font-bold text-[#181818]">
                Firebase Project Credentials
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* Active Status Badge */}
          <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">Current Active Project</span>
              <span className="font-mono font-bold text-neutral-900 text-sm">
                {currentConfig.projectId || 'subtle-raceway-k7854'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyConfig}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono border border-[#DCD6C8] bg-white rounded hover:bg-neutral-50 text-neutral-700"
                title="Copy active config JSON"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy JSON'}</span>
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-[#181818] text-white rounded hover:bg-[#282828] disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test Link</span>
              </button>
            </div>
          </div>

          {/* Test Feedback Notice */}
          {testResult && (
            <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
              testResult.success 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">{testResult.message}</div>
            </div>
          )}

          {/* Quick Paste JSON */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
            <label className="block text-[11px] font-semibold text-neutral-700">
              Quick Paste firebaseConfig JSON Snippet:
            </label>
            <textarea
              rows={2}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='Paste { "apiKey": "...", "authDomain": "...", "projectId": "..." }'
              className="w-full px-2.5 py-1.5 border border-[#DCD6C8] rounded font-mono text-[11px] bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#C58B39]"
            />
            {jsonInput.trim() && (
              <button
                type="button"
                onClick={handlePasteJson}
                className="px-3 py-1 bg-[#C58B39] text-white rounded font-medium hover:bg-[#A9752B]"
              >
                Parse & Populate Fields
              </button>
            )}
          </div>

          {/* Manual Credentials Form */}
          <form onSubmit={handleSave} className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  API Key (apiKey) *
                </label>
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded font-mono text-neutral-900 focus:border-[#C58B39]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Project ID (projectId) *
                </label>
                <input
                  type="text"
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="your-project-id"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded font-mono text-neutral-900 focus:border-[#C58B39]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Auth Domain (authDomain)
                </label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="your-project.firebaseapp.com"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded font-mono text-neutral-900 focus:border-[#C58B39]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  App ID (appId)
                </label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:123456789:web:abcdef"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded font-mono text-neutral-900 focus:border-[#C58B39]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Storage Bucket
                </label>
                <input
                  type="text"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  placeholder="your-project.firebasestorage.app"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded font-mono text-neutral-900 focus:border-[#C58B39]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Messaging Sender ID
                </label>
                <input
                  type="text"
                  value={messagingSenderId}
                  onChange={(e) => setMessagingSenderId(e.target.value)}
                  placeholder="123456789"
                  className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded font-mono text-neutral-900 focus:border-[#C58B39]"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded text-[11px] text-amber-900 space-y-1">
              <span className="font-semibold block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C58B39]" />
                Firebase Auth Setup Tip:
              </span>
              <p>
                Ensure <strong>Email/Password Sign-In Provider</strong> is enabled in your Firebase Console under{' '}
                <span className="font-mono font-bold">Authentication &gt; Sign-in method &gt; Email/Password</span>.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#E8E3D9] flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 text-neutral-500 hover:text-red-700 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#181818] hover:bg-[#282828] text-white font-medium rounded transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5 text-[#C58B39]" />
                  <span>Save & Reload</span>
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
