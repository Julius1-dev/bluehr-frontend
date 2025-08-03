import { useEffect, useState } from 'react';
import { Bell, Clock, AlertCircle, Calendar } from 'lucide-react';
import type { Notification } from '@/types/notification';
import { notificationService } from '@/services/notificationService';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'holiday':
      return <Calendar className="h-4 w-4 text-blue-500" />;
    case 'leave_request':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'announcement':
      return <AlertCircle className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    console.log('NotificationDropdown: Subscribing to notifications');
    
    // Initial fetch
    const initialNotifications = notificationService.getNotifications();
    console.log('Initial notifications:', initialNotifications);
    setNotifications(initialNotifications);
    
    // Subscribe to updates
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      console.log('Received updated notifications:', updatedNotifications);
      setNotifications(updatedNotifications);
    });

    return () => {
      console.log('NotificationDropdown: Unsubscribing from notifications');
      unsubscribe();
    };
  }, []);

  const handleMarkAsRead = (id: string) => {
    console.log('Marking notification as read:', id);
    try {
      notificationService.markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = () => {
    console.log('Marking all notifications as read');
    try {
      notificationService.markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification.id);
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  console.log('Rendering NotificationDropdown with notifications:', notifications);

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-500" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-80 p-0 bg-white text-black border-0 shadow-xl" 
          align="end" 
          forceMount
          onInteractOutside={(e) => {
            // Prevent closing when clicking on the blur overlay
            if ((e.target as HTMLElement).classList.contains('blur-overlay')) {
              e.preventDefault();
            }
          }}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs text-white bg-blue-600 hover:bg-blue-700"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id} 
                  className={`flex items-start gap-3 p-3 cursor-pointer ${!notification.read ? 'bg-white' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  )}
                </DropdownMenuItem>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="border-t p-2 text-center">
              <Button variant="ghost" size="sm" className="text-white bg-blue-600 hover:bg-blue-700 w-full">
                View all notifications
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
          style={{ pointerEvents: 'auto' }}
        />
      )}
    </>
  );
}
