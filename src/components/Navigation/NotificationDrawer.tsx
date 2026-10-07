import React from 'react';
import { 
  X, 
  Bell, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  AlertCircle, 
  MessageCircle, 
  Check, 
  ChevronRight 
} from 'lucide-react';
import { CrewNotification, EventShoot } from '../../types';
import { StorageService } from '../../services/storage';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: CrewNotification[];
  upcomingEvents: EventShoot[];
  onSelectEvent?: (event: EventShoot) => void;
  onRefreshData: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  upcomingEvents,
  onSelectEvent,
  onRefreshData
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsAsRead();
    onRefreshData();
  };

  const handleNotificationClick = (notif: CrewNotification) => {
    StorageService.markNotificationAsRead(notif.id);
    onRefreshData();
    if (notif.eventId && onSelectEvent) {
      const found = upcomingEvents.find(e => e.id === notif.eventId);
      if (found) {
        onSelectEvent(found);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#E8E3D9] animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#121212] text-white flex items-center justify-between border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1C1A18] border border-[#C58B39]/50 flex items-center justify-center text-[#C58B39]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-white">Notifications & Alerts</h2>
              <div className="text-[10px] font-mono text-[#C58B39]">
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-mono text-neutral-300 hover:text-white underline"
              >
                Mark all read
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10"
              aria-label="Close notification panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 bg-white rounded-xl border border-[#E8E3D9]">
              No system notifications yet.
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                  notif.read 
                    ? 'bg-white border-[#E8E3D9] text-neutral-700' 
                    : 'bg-amber-50/70 border-amber-300 text-amber-950 ring-1 ring-amber-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-neutral-900">{notif.title}</span>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-[#C58B39] shrink-0 mt-1" />
                  )}
                </div>

                <p className="text-neutral-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                <div className="mt-2 pt-2 border-t border-[#E8E3D9]/60 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {notif.eventId && (
                    <span className="text-[#C58B39] font-semibold flex items-center gap-0.5">
                      <span>View Event</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-white border-t border-[#E8E3D9] text-center text-xs text-neutral-500">
          Semi-automated shoot notifications sync in real-time.
        </div>
      </div>
    </div>
  );
};
