import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'primary' | 'outline' | 'compact' | 'crew-card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'primary'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Hide if already running in standalone PWA mode
  if (isInstalled) {
    if (variant === 'crew-card') {
      return (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>TMC Crew App is installed on this device home screen.</span>
        </div>
      );
    }
    return null;
  }

  // Chromium / Android / Desktop Flow
  if (isInstallable) {
    if (variant === 'crew-card') {
      return (
        <div className="bg-gradient-to-br from-[#1C1A18] to-[#121212] border border-[#C58B39]/40 rounded-xl p-4 text-white space-y-2.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C58B39]/20 border border-[#C58B39]/50 flex items-center justify-center text-[#C58B39]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-white">Install Crew App</div>
              <div className="text-[11px] text-neutral-400">Add to home screen for instant shoot access</div>
            </div>
          </div>
          <button
            onClick={install}
            className="w-full py-2.5 px-3 bg-[#C58B39] hover:bg-[#B37B2E] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Install on Home Screen</span>
          </button>
        </div>
      );
    }

    if (variant === 'compact') {
      return (
        <button
          onClick={install}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-[#C58B39]/20 hover:bg-[#C58B39]/30 text-[#C58B39] border border-[#C58B39]/40 rounded-lg text-xs font-medium transition-colors ${className}`}
          title="Install TMC PWA"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 px-3.5 py-2 bg-[#C58B39] hover:bg-[#B37B2E] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari Flow
  if (isIOS) {
    return (
      <>
        {variant === 'crew-card' ? (
          <div className="bg-gradient-to-br from-[#1C1A18] to-[#121212] border border-[#C58B39]/40 rounded-xl p-4 text-white space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C58B39]/20 border border-[#C58B39]/50 flex items-center justify-center text-[#C58B39]">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="font-serif font-bold text-sm text-white">Install on iPhone</div>
                <div className="text-[11px] text-neutral-400">Add to Safari home screen for full app mode</div>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(true)}
              className="w-full py-2.5 px-3 bg-[#C58B39] hover:bg-[#B37B2E] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>How to Install on iOS</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-medium border border-neutral-300 transition-colors ${className}`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#C58B39]" />
            <span>Install on iOS</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-[#E8E3D9] text-left space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="font-serif font-bold text-base text-neutral-900">Install on iPhone / iPad</div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-neutral-700">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#C58B39]/20 text-[#C58B39] font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span>Tap the <strong>Share</strong> icon in the Safari bottom bar.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#C58B39]/20 text-[#C58B39] font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#C58B39]/20 text-[#C58B39] font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <span>Tap <strong>Add</strong> in the top right corner.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback banner trigger
  if (variant === 'crew-card') {
    return (
      <div className="bg-gradient-to-br from-[#1C1A18] to-[#121212] border border-[#C58B39]/40 rounded-xl p-4 text-white space-y-2 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C58B39]/20 border border-[#C58B39]/50 flex items-center justify-center text-[#C58B39]">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="font-serif font-bold text-sm text-white">Mobile PWA Ready</div>
            <div className="text-[11px] text-neutral-400">Use browser menu to Add to Home Screen</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
