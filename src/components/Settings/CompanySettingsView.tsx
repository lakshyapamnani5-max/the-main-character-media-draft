import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Upload, 
  Trash2, 
  Check, 
  CreditCard, 
  FileText, 
  ShieldCheck, 
  QrCode, 
  Smartphone, 
  Mail, 
  MapPin, 
  Globe, 
  Sparkles, 
  PenTool, 
  RefreshCw,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { CompanySettings } from '../../types';
import { StorageService } from '../../services/storage';

interface CompanySettingsViewProps {
  onSettingsSaved?: (settings: CompanySettings) => void;
}

export const CompanySettingsView: React.FC<CompanySettingsViewProps> = ({ onSettingsSaved }) => {
  const [settings, setSettings] = useState<CompanySettings>(() => StorageService.getCompanySettings());
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'banking' | 'signature' | 'defaults'>('profile');
  const [previewMode, setPreviewMode] = useState<'header' | 'banking' | 'signature'>('header');

  useEffect(() => {
    const handleSettingsUpdated = (e: any) => {
      if (e.detail) {
        setSettings(e.detail);
      }
    };
    window.addEventListener('tmc_company_settings_updated', handleSettingsUpdated);
    return () => window.removeEventListener('tmc_company_settings_updated', handleSettingsUpdated);
  }, []);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    field: 'logoUrl' | 'signatureUrl' | 'upiQrUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit. Please choose a compressed PNG, JPG or SVG.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSettings(prev => ({ ...prev, [field]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveCompanySettings(settings);
    setIsSaved(true);
    if (onSettingsSaved) onSettingsSaved(settings);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all company details, bank info, and signature to initial defaults?')) {
      localStorage.removeItem('tmc_company_settings_v1');
      const fresh = StorageService.getCompanySettings();
      setSettings(fresh);
      StorageService.saveCompanySettings(fresh);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C58B39] to-[#8C6428] flex items-center justify-center text-white shadow-md shrink-0">
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt="Company Logo" 
                className="w-10 h-10 object-contain rounded-lg"
              />
            ) : (
              <Building2 className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#C58B39]">Master Organization Setup</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40">Active Across App</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-white tracking-tight mt-0.5">
              {settings.companyName || 'Company Settings & Master Branding'}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Configure logo, phone, address, banking, UPI, and authorized signature. Applied automatically to quotes, invoices, and PDFs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 text-xs font-medium text-neutral-400 hover:text-white bg-[#222] hover:bg-[#2A2A2A] border border-[#333] rounded-lg transition-colors flex items-center gap-1.5"
            title="Reset to initial placeholder values"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#C58B39] hover:bg-[#B37B2E] rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            {isSaved ? <Check className="w-4 h-4 text-white" /> : <ShieldCheck className="w-4 h-4 text-white" />}
            <span>{isSaved ? 'Settings Synced!' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">Company details saved successfully! All quotations, invoices, sidebars, and PDFs have been updated.</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">Live in Storage</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#E8E3D9] gap-2 overflow-x-auto text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3.5 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-[#C58B39] text-[#181818] font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#C58B39]" />
          <span>1. Company Profile & Logo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('banking')}
          className={`pb-3 px-3.5 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'banking'
              ? 'border-[#C58B39] text-[#181818] font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-[#C58B39]" />
          <span>2. Banking & UPI Settlement</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('signature')}
          className={`pb-3 px-3.5 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'signature'
              ? 'border-[#C58B39] text-[#181818] font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <PenTool className="w-4 h-4 text-[#C58B39]" />
          <span>3. Signature & Signatory</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('defaults')}
          className={`pb-3 px-3.5 transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'defaults'
              ? 'border-[#C58B39] text-[#181818] font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <FileText className="w-4 h-4 text-[#C58B39]" />
          <span>4. Quotes & Invoice Defaults</span>
        </button>
      </div>

      {/* Main Content Grid: Form (2 cols) + Live Preview Card (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* TAB 1: Profile & Logo */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-[#E8E3D9] rounded-xl p-6 space-y-5 shadow-xs">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#181818] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#C58B39]" />
                    Company Identity & Master Logo
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Your brand logo appears in the top navigation, sidebar, quotations, and generated PDF proposals.
                  </p>
                </div>

                {/* Logo Uploader */}
                <div className="p-4 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-24 h-24 rounded-xl border border-[#DCD6C8] bg-white flex items-center justify-center p-2 relative overflow-hidden shadow-xs shrink-0">
                    {settings.logoUrl ? (
                      <img 
                        src={settings.logoUrl} 
                        alt="Brand Logo" 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-neutral-400">
                        <Building2 className="w-8 h-8 mx-auto text-neutral-300 mb-1" />
                        <span className="text-[10px] font-mono">No Logo</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <label className="cursor-pointer px-3.5 py-1.5 bg-[#181818] hover:bg-[#282828] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo File</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'logoUrl')}
                        />
                      </label>

                      {settings.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, logoUrl: '' }))}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Recommended: High-resolution PNG or SVG with transparent background (Max 2MB).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Company / Brand Name *</label>
                    <input
                      type="text"
                      required
                      value={settings.companyName}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                      placeholder="e.g. The Main Character Media"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Brand Tagline / Subtitle</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                      placeholder="e.g. Luxury Wedding & Event Content Creation"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-[#C58B39]" />
                      Official Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                      placeholder="+91 98200 12345"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      WhatsApp Business Number
                    </label>
                    <input
                      type="text"
                      value={settings.whatsapp}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                      placeholder="+91 98200 12345"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#C58B39]" />
                      Official Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                      placeholder="hello@themaincharactermedia.com"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-[#C58B39]" />
                      Website
                    </label>
                    <input
                      type="text"
                      value={settings.website}
                      onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                      placeholder="www.themaincharactermedia.com"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F0ECE1] space-y-4 text-xs">
                  <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C58B39]" />
                    Studio & Registered Office Address
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Street Address / Studio Details</label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                      placeholder="Studio 402, Pali Hill, Bandra West"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">City</label>
                      <input
                        type="text"
                        value={settings.city}
                        onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                        className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">State</label>
                      <input
                        type="text"
                        value={settings.state}
                        onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                        className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">PIN Code</label>
                      <input
                        type="text"
                        value={settings.pincode}
                        onChange={(e) => setSettings({ ...settings, pincode: e.target.value })}
                        className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                        placeholder="400050"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">GSTIN / Tax Identification (Optional)</label>
                    <input
                      type="text"
                      value={settings.gstin || ''}
                      onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 font-mono focus:outline-none focus:border-[#C58B39]"
                      placeholder="27AABCT1234F1Z5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Banking & UPI */}
            {activeTab === 'banking' && (
              <div className="bg-white border border-[#E8E3D9] rounded-xl p-6 space-y-5 shadow-xs">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#181818] flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#C58B39]" />
                    Banking & Direct UPI Transfer Details
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Printed cleanly at the bottom of client quotation sheets and tax invoices for direct deposit and advance payments.
                  </p>
                </div>

                <div className="p-4 bg-[#FAF6EE] border border-[#E2D5BE] rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-[#8C6428] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Direct Client Settlement Account
                  </div>
                  <p className="text-[11px] text-neutral-700">
                    Ensure the Account Number and IFSC Code match your verified current bank account to avoid client transfer delays.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Bank Name *</label>
                    <input
                      type="text"
                      required
                      value={settings.bankName}
                      onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                      placeholder="e.g. HDFC Bank"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Beneficiary / Account Name *</label>
                    <input
                      type="text"
                      required
                      value={settings.accountName}
                      onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                      placeholder="e.g. The Main Character Media"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Account Number *</label>
                    <input
                      type="text"
                      required
                      value={settings.accountNumber}
                      onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 font-mono focus:outline-none focus:border-[#C58B39]"
                      placeholder="50200088912344"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">IFSC Code *</label>
                    <input
                      type="text"
                      required
                      value={settings.ifscCode}
                      onChange={(e) => setSettings({ ...settings, ifscCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 font-mono uppercase focus:outline-none focus:border-[#C58B39]"
                      placeholder="HDFC0000045"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-neutral-700 mb-1">Bank Branch Location</label>
                    <input
                      type="text"
                      value={settings.branch}
                      onChange={(e) => setSettings({ ...settings, branch: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                      placeholder="Bandra West, Mumbai"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F0ECE1] space-y-4 text-xs">
                  <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-[#C58B39]" />
                    UPI ID & Instant Payment Handle
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">Primary UPI ID / VPA *</label>
                      <input
                        type="text"
                        required
                        value={settings.upiId}
                        onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                        className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 font-mono focus:outline-none focus:border-[#C58B39]"
                        placeholder="tmcmedia@hdfcbank"
                      />
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Clients can scan or transfer directly to this handle via Google Pay, PhonePe, Paytm, and BHIM.
                      </p>
                    </div>

                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">UPI QR Code Image (Optional)</label>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer px-3 py-2 bg-[#FAF8F5] hover:bg-white border border-[#DCD6C8] rounded text-neutral-800 text-xs font-medium transition-colors flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-[#C58B39]" />
                          <span>Upload QR Image</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, 'upiQrUrl')}
                          />
                        </label>
                        {settings.upiQrUrl && (
                          <button
                            type="button"
                            onClick={() => setSettings(prev => ({ ...prev, upiQrUrl: '' }))}
                            className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                          >
                            Remove QR
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Signature & Signatory */}
            {activeTab === 'signature' && (
              <div className="bg-white border border-[#E8E3D9] rounded-xl p-6 space-y-5 shadow-xs">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#181818] flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-[#C58B39]" />
                    Authorized Signature & Signatory
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Rendered in the quotation and invoice sign-off block to certify legal production proposals and invoices.
                  </p>
                </div>

                {/* Signature Image Uploader */}
                <div className="p-4 bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-48 h-24 rounded-xl border border-[#DCD6C8] bg-white flex items-center justify-center p-2 relative overflow-hidden shadow-xs shrink-0">
                    {settings.signatureUrl ? (
                      <img 
                        src={settings.signatureUrl} 
                        alt="Authorized Signature" 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-neutral-400">
                        <PenTool className="w-6 h-6 mx-auto text-neutral-300 mb-1" />
                        <span className="text-[10px] font-mono">No Signature Uploaded</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <label className="cursor-pointer px-3.5 py-1.5 bg-[#181818] hover:bg-[#282828] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Signature Photo / Scan</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'signatureUrl')}
                        />
                      </label>

                      {settings.signatureUrl && (
                        <button
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, signatureUrl: '' }))}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Upload a PNG or JPG scan of the founder or authorized signatory signature (transparent PNG recommended).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Signatory Full Name *</label>
                    <input
                      type="text"
                      required
                      value={settings.signatoryName}
                      onChange={(e) => setSettings({ ...settings, signatoryName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                      placeholder="e.g. Devansh Saxena"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Signatory Designation / Title *</label>
                    <input
                      type="text"
                      required
                      value={settings.signatoryTitle}
                      onChange={(e) => setSettings({ ...settings, signatoryTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                      placeholder="e.g. Creative Producer & Founder"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Quotes & Invoices Defaults */}
            {activeTab === 'defaults' && (
              <div className="bg-white border border-[#E8E3D9] rounded-xl p-6 space-y-5 shadow-xs">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#181818] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C58B39]" />
                    Quotation & Invoice Defaults
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Default commercial percentages, validity dates, terms & conditions populated when generating a quote or invoice.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Default Advance Booking %</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={settings.defaultAdvancePercentage}
                        onChange={(e) => setSettings({ ...settings, defaultAdvancePercentage: Number(e.target.value) || 50 })}
                        className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                      />
                      <span className="absolute right-3 top-2.5 font-bold text-neutral-500">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Quotation Validity Period (Days)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={settings.defaultValidityDays}
                        onChange={(e) => setSettings({ ...settings, defaultValidityDays: Number(e.target.value) || 15 })}
                        className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                      />
                      <span className="absolute right-3 top-2.5 text-neutral-500">days</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Standard Terms & Booking Policy (Formatted on Proposals & Invoices)
                    </label>
                    <textarea
                      rows={6}
                      value={settings.defaultTerms}
                      onChange={(e) => setSettings({ ...settings, defaultTerms: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39] font-sans leading-relaxed"
                      placeholder="1. 50% non-refundable advance required..."
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Default Commercial Notes
                    </label>
                    <textarea
                      rows={3}
                      value={settings.defaultCommercialNotes}
                      onChange={(e) => setSettings({ ...settings, defaultCommercialNotes: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD6C8] rounded text-neutral-900 focus:outline-none focus:border-[#C58B39]"
                      placeholder="Capture formatted exclusively for 9:16 social storytelling..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Bar */}
            <div className="p-4 bg-white border border-[#E8E3D9] rounded-xl flex items-center justify-between shadow-xs">
              <span className="text-xs text-neutral-500">
                Any changes saved here immediately update the Sidebar, Quotation sheets, Invoices, and PDF exports.
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#181818] hover:bg-[#282828] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
              >
                <Check className="w-4 h-4 text-[#C58B39]" />
                <span>Save All Settings</span>
              </button>
            </div>

          </form>
        </div>

        {/* Live Preview Column: Exactly shows how proposals & invoices look */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E8E3D9] rounded-xl p-5 shadow-xs space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C58B39]" />
                <h3 className="font-serif text-sm font-bold text-[#181818]">Live Document Preview</h3>
              </div>
              <div className="flex gap-1">
                {(['header', 'banking', 'signature'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPreviewMode(mode)}
                    className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded transition-colors ${
                      previewMode === mode 
                        ? 'bg-[#181818] text-white' 
                        : 'bg-[#F2EFE9] text-neutral-600 hover:bg-[#E8E3D9]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Header Preview */}
            {previewMode === 'header' && (
              <div className="p-4 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  {settings.logoUrl ? (
                    <img 
                      src={settings.logoUrl} 
                      alt="Preview Logo" 
                      className="w-10 h-10 object-contain rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded border border-[#C58B39] bg-[#181818] text-[#C58B39] font-serif font-bold flex items-center justify-center text-lg">
                      {settings.companyName.charAt(0) || 'M'}
                    </div>
                  )}
                  <div>
                    <div className="font-serif font-bold text-sm text-[#181818] leading-tight">
                      {settings.companyName}
                    </div>
                    <div className="text-[10px] text-[#8C6428] font-medium">
                      {settings.tagline}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-600 border-t border-[#E8E3D9] pt-2 space-y-0.5">
                  <div>📞 {settings.phone}</div>
                  <div>✉️ {settings.email}</div>
                  <div>📍 {settings.address}, {settings.city} - {settings.pincode}</div>
                  {settings.gstin && (
                    <div className="font-mono text-[10px] text-neutral-500 mt-1">GSTIN: {settings.gstin}</div>
                  )}
                </div>
              </div>
            )}

            {/* Banking Preview */}
            {previewMode === 'banking' && (
              <div className="p-4 bg-[#FAF6EE] border border-[#E2D5BE] rounded-lg space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C6428]">
                  BANKING & UPI SETTLEMENT
                </div>
                <div className="text-xs space-y-1 font-mono text-neutral-800">
                  <div><span className="text-neutral-500">Bank:</span> {settings.bankName}</div>
                  <div><span className="text-neutral-500">A/C:</span> {settings.accountName}</div>
                  <div><span className="text-neutral-500">No:</span> {settings.accountNumber}</div>
                  <div><span className="text-neutral-500">IFSC:</span> {settings.ifscCode}</div>
                  {settings.branch && <div><span className="text-neutral-500">Branch:</span> {settings.branch}</div>}
                  <div className="pt-1 border-t border-[#E2D5BE]">
                    <span className="text-neutral-500">UPI ID:</span> <span className="text-[#8C6428] font-bold">{settings.upiId}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Signature Preview */}
            {previewMode === 'signature' && (
              <div className="p-4 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C6428]">
                  AUTHORIZED ISSUANCE & SIGN-OFF
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-serif font-bold text-[#181818]">
                    For {settings.companyName}
                  </div>
                  
                  <div className="h-16 flex items-center">
                    {settings.signatureUrl ? (
                      <img 
                        src={settings.signatureUrl} 
                        alt="Signature Preview" 
                        className="max-h-14 max-w-full object-contain"
                      />
                    ) : (
                      <div className="w-full border-b border-dashed border-neutral-400 h-8 flex items-end pb-1 text-[10px] text-neutral-400 italic">
                        [Authorized Digital Signature]
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#DCD6C8] pt-1">
                    <div className="text-xs font-semibold text-neutral-900">{settings.signatoryName}</div>
                    <div className="text-[10px] text-neutral-500">{settings.signatoryTitle}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-[11px] text-neutral-500 leading-normal">
              💡 <strong>Pro Tip:</strong> Uploading your company logo and digital signature replaces generic placeholders on all generated PDF proposals and WhatsApp share templates.
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
