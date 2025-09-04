import { useEffect, useState } from 'react';
import { 
  Bell, 
  Clock, 
  Calendar, 
  Users, 
  Building2, 
  UserX, 
  CreditCard, 
  BarChart2, 
  FileText, 
  Megaphone 
} from 'lucide-react';

import type { Notification } from '@/types/notification';
import { BACKEND_URL } from '@/lib/config';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const getNotificationIcon = (type: string) => {
  const iconClass = "w-full h-full text-black";

  switch (type) {
    case 'holiday':
      return <Calendar className={iconClass} />;
    case 'leave_request':
      return <Calendar className={iconClass} />;
    case 'announcement':
      return <Megaphone className={iconClass} />;
    case 'TEAM_MEMBER_ADDED':
      return <Users className={iconClass} />;
    case 'workshift':
      return <Clock className={iconClass} />;
    case 'office_location':
      return <Building2 className={iconClass} />;
    case 'offboarding':
      return <UserX className={iconClass} />;
    case 'payroll':
      return <CreditCard className={iconClass} />;
    case 'performance':
      return <BarChart2 className={iconClass} />;
    case 'document':
      return <FileText className={iconClass} />;
    default:
      return <Bell className={iconClass} />;
  }
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const navigate = useNavigate();

  useEffect(() => {
    refreshNotifications();
  }, []);

  const refreshNotifications = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BACKEND_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setNotifications(res.ok ? await res.json() : []);
  };

  const handleMarkAsRead = async (id: string | number) => {
    const token = localStorage.getItem('token');
    await fetch(`${BACKEND_URL}/api/notifications/${id}/read`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    refreshNotifications();
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem('token');
    await fetch(`${BACKEND_URL}/api/notifications/read-all`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    refreshNotifications();
  };

  // 🚀 Clear all
  const handleClearAll = async () => {
    const token = localStorage.getItem('token');
    await fetch(`${BACKEND_URL}/api/notifications/clear-all`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setNotifications([]); // Clear UI instantly
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) handleMarkAsRead(notification.id);
    if (notification.link?.startsWith('/')) navigate(notification.link);
    else if (notification.link) window.location.href = notification.link;
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-6 w-6 text-gray-600" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center rounded-full"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-96 p-0 bg-white shadow-2xl rounded-xl overflow-hidden animate-in slide-in-from-top-2"
          align="end"
          forceMount
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 bg-gray-50">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-blue-600 hover:bg-blue-50"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>

          {/* Notifications */}
          <div className="max-h-96 overflow-y-auto divide-y">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                🎉 You're all caught up!
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition ${
                    notification.read
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium text-gray-900 line-clamp-2 cursor-pointer"
                      title={notification.message}
                    >
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-500">
                      {notification.createdAt && !isNaN(new Date(notification.createdAt).getTime())
                        ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                        : 'Unknown'}
                    </span>
                  </div>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              ))
            )}
          </div>

          {/* Footer with Clear all */}
          {notifications.length > 0 && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-red-600 hover:bg-red-50"
                onClick={handleClearAll}
              >
                Clear all notifications
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Blur overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
