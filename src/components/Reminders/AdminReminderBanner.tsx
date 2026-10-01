import React from 'react';
import { BellRing, AlertCircle, MessageCircle, ArrowRight, Clock } from 'lucide-react';
import { EventShoot } from '../../types';
import { StorageService } from '../../services/storage';

interface AdminReminderBannerProps {
  upcomingEvents: EventShoot[];
  onOpenSendReminder: (event: EventShoot) => void;
  onOpenReminderSettings: () => void;
}

export const AdminReminderBanner: React.FC<AdminReminderBannerProps> = ({
  upcomingEvents,
  onOpenSendReminder,
  onOpenReminderSettings
}) => {
  const settings = StorageService.getReminderSettings();
  if (!settings.reminder24hEnabled && !settings.reminder2hEnabled) return null;

  const now = new Date();
  const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Find events occurring soon with unreminded crew
  const urgentEventsNeedingReminders = upcomingEvents.filter(event => {
    if (event.status === 'Cancelled' || event.status === 'Archived' || event.status === 'Completed') {
      return false;
    }
    const shootDate = new Date(event.startDate || event.shootDate || '');
    const isSoon = shootDate >= now && shootDate <= next48Hours;
    if (!isSoon) return false;

    // Check if reminders were opened
    const totalCrewCount = (event.crewAssignments && event.crewAssignments.length > 0)
      ? event.crewAssignments.length
      : (event.crewMembers || []).length;

    const remindedCount = (event.crewReminders || []).filter(r => r.status === 'WhatsApp Opened').length;
    return remindedCount < totalCrewCount && totalCrewCount > 0;
  });

  if (urgentEventsNeedingReminders.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {urgentEventsNeedingReminders.map(event => {
        const totalCrewCount = (event.crewAssignments && event.crewAssignments.length > 0)
          ? event.crewAssignments.length
          : (event.crewMembers || []).length;
        
        const remindedCount = (event.crewReminders || []).filter(r => r.status === 'WhatsApp Opened').length;
        const pendingCount = totalCrewCount - remindedCount;

        const isTomorrow = new Date(event.startDate || event.shootDate || '').toDateString() === 
          new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

        return (
          <div
            key={event.id}
            className="bg-amber-500/10 border-2 border-[#C58B39] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#C58B39] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                <BellRing className="w-4 h-4" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#91621E] bg-[#C58B39]/20 px-2 py-0.5 rounded border border-[#C58B39]/40">
                    REMINDER PENDING
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {isTomorrow ? 'Shoot Tomorrow' : 'Upcoming Shoot (Next 48h)'}
                  </span>
                </div>

                <div className="font-serif font-bold text-sm text-neutral-900 mt-1">
                  {event.eventName} {event.eventType}
                </div>

                <div className="text-xs text-neutral-600 mt-0.5">
                  <strong className="text-neutral-900">{pendingCount} crew member{pendingCount > 1 ? 's have' : ' has'} not been reminded</strong> for call time ({event.shootTime?.split('-')[0]?.trim() || '08:00 AM'} at {event.venue}).
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={onOpenReminderSettings}
                className="px-3 py-2 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors font-medium"
              >
                Settings
              </button>

              <button
                onClick={() => onOpenSendReminder(event)}
                className="flex items-center gap-2 px-4 py-2 bg-[#C58B39] hover:bg-[#B37B2E] active:scale-95 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>Send Crew Reminder</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
