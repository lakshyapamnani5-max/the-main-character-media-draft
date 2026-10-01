import React from 'react';
import { 
  Bell, 
  Calendar, 
  Clock, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  CheckCheck, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { CrewNotification, EventShoot } from '../../types';
import { StorageService } from '../../services/storage';

interface CrewNotificationsTabProps {
  notifications: CrewNotification[];
  allShoots: EventShoot[];
  onSelectShootById?: (eventId: string) => void;
  onRefreshData: () => void;
}

export const CrewNotificationsTab: React.FC<CrewNotificationsTabProps> = ({
  notifications,
  allShoots,
  onSelectShootById,
  onRefreshData
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    StorageService.markNotificationAsRead(id);
    onRefreshData();
  };

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsAsRead();
    onRefreshData();
  };

  const getNotificationIcon = (type: CrewNotification['type']) => {
    switch (type) {
      case 'shoot_assigned':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'call_time_changed':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'venue_changed':
        return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'pov_assigned':
        return <Camera className="w-4 h-4 text-[#C58B39]" />;
      case 'shoot_cancelled':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-600" />;
    }
  };

  return (
    <div className="space-y-4 pb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="font-serif text-xl font-bold text-neutral-900 tracking-tight">
            Production Alerts & Notices
          </h1>
          <div className="text-xs text-neutral-500">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All alerts caught up'}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-[#C58B39] font-medium hover:underline"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white border border-[#E8E3D9] rounded-2xl p-8 text-center text-xs text-neutral-500 space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E8E3D9] flex items-center justify-center text-neutral-400 mx-auto">
            <Bell className="w-5 h-5" />
          </div>
          <div className="font-serif font-bold text-sm text-neutral-800">
            No Notifications
          </div>
          <p className="text-[11px] text-neutral-400">
            You will receive instant alerts here when new shoots or call times are modified.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif) => {
            const hasEventLink = !!notif.eventId && onSelectShootById;

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) handleMarkAsRead(notif.id);
                  if (hasEventLink && notif.eventId) {
                    onSelectShootById(notif.eventId);
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  notif.read 
                    ? 'bg-white border-[#E8E3D9] opacity-80' 
                    : 'bg-white border-[#C58B39] ring-2 ring-[#C58B39]/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E8E3D9] flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif font-bold text-sm text-neutral-900 truncate">
                        {notif.title}
                      </h3>
                      <span className="text-[10px] font-mono text-neutral-400 whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-neutral-400 font-mono">
                        {new Date(notif.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>

                      {hasEventLink && (
                        <span className="text-[#C58B39] font-medium flex items-center gap-0.5 hover:underline">
                          <span>View Shoot</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
