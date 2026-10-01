import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Bell, Clock, Check, Sparkles } from 'lucide-react';
import { ReminderSettings } from '../../types';
import { StorageService } from '../../services/storage';

interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings?: () => void;
}

export const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveSettings
}) => {
  const [settings, setSettings] = useState<ReminderSettings>(() => StorageService.getReminderSettings());
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(StorageService.getReminderSettings());
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    StorageService.saveReminderSettings(settings);
    setIsSaved(true);
    if (onSaveSettings) onSaveSettings();
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleResetTemplate = () => {
    setSettings(prev => ({
      ...prev,
      defaultTemplate: `Hi {CREW_NAME},

Reminder for your upcoming shoot:

{EVENT_NAME} {EVENT_TYPE}

Date:
{EVENT_DATE}

Call Time:
{CALL_TIME}

Venue:
{VENUE}

Role:
{ROLE}

Map & Directions:
{MAP_LINK}

Please reach 15 minutes before call time with full battery packs & formatted SD cards.

— The Main Character Media`
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-[#E8E3D9] max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E8E3D9] bg-[#121212] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C58B39]/20 border border-[#C58B39]/40 flex items-center justify-center text-[#C58B39]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#C58B39] uppercase font-semibold">Configuration</div>
              <h2 className="font-serif text-lg font-bold text-white">Crew Reminder Rules & WhatsApp Settings</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto bg-[#FAF8F5] text-xs">
          
          {/* Automatic Internal Alert Rules */}
          <div className="space-y-3">
            <div className="font-semibold text-neutral-800 uppercase tracking-wider text-[11px]">
              Internal Reminder Thresholds
            </div>

            <div className="bg-white border border-[#E8E3D9] rounded-lg p-4 space-y-3">
              {/* Reminder 1: 24 hours */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900 text-xs">Crew Reminder 1: 24 Hours Before Shoot</div>
                    <div className="text-neutral-500 text-[11px] mt-0.5">
                      Highlights unreminded upcoming shoots on the Admin Dashboard 24h prior to call time.
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.reminder24hEnabled}
                    onChange={(e) => setSettings({ ...settings, reminder24hEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="border-t border-neutral-100 pt-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900 text-xs">Crew Reminder 2: 2 Hours Before Call Time</div>
                    <div className="text-neutral-500 text-[11px] mt-0.5">
                      Urgent morning of shoot alert prompt for final battery and transit check.
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.reminder2hEnabled}
                    onChange={(e) => setSettings({ ...settings, reminder2hEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Master WhatsApp Message Template */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-800 uppercase tracking-wider text-[11px]">
                Default WhatsApp Message Template
              </span>
              <button
                type="button"
                onClick={handleResetTemplate}
                className="text-[11px] text-[#C58B39] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            </div>

            <textarea
              value={settings.defaultTemplate}
              onChange={(e) => setSettings({ ...settings, defaultTemplate: e.target.value })}
              rows={9}
              className="w-full text-xs font-mono bg-white border border-[#E8E3D9] rounded-lg p-3 text-neutral-800 leading-relaxed focus:border-[#C58B39] focus:outline-none focus:ring-1 focus:ring-[#C58B39]"
            />

            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C58B39]" />
              <span>Use placeholders: &#123;CREW_NAME&#125;, &#123;EVENT_NAME&#125;, &#123;EVENT_TYPE&#125;, &#123;EVENT_DATE&#125;, &#123;CALL_TIME&#125;, &#123;VENUE&#125;, &#123;ROLE&#125;, &#123;MAP_LINK&#125;</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E3D9] bg-white flex items-center justify-between">
          <div className="text-[11px] text-neutral-500">
            {isSaved && <span className="text-emerald-600 font-medium flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Settings saved!</span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#C58B39] hover:bg-[#B37B2E] rounded-lg transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Reminder Rules</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
