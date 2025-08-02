import type { Notification } from '@/types/notification';

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private subscribers: ((notifications: Notification[]) => void)[] = [];

  private constructor() {
    console.log('Initializing NotificationService...');
    this.initialize();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initialize() {
    // Initial fetch of notifications
    await this.fetchNotifications();
    
    // Set up polling (every 5 minutes)
    setInterval(() => this.fetchNotifications(), 5 * 60 * 1000);
  }

  public subscribe(callback: (notifications: Notification[]) => void) {
    this.subscribers.push(callback);
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public getNotifications(limit?: number): Notification[] {
    return limit ? this.notifications.slice(0, limit) : this.notifications;
  }

  public async markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifySubscribers();
    }
  }

  public async markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notifySubscribers();
  }

  public async addNotification(notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };
    
    this.notifications.unshift(newNotification);
    this.notifySubscribers();
  }

  private async fetchNotifications() {
    try {
      // fetch data from notifications API endpoint
     //      
      // Mock notifications data
      const mockData: Notification[] = [
        {
          id: '1',
          type: 'holiday',
          title: 'Upcoming Public Holiday',
          message: 'Mashujaa Day is coming up on October 20th',
          timestamp: new Date('2025-10-20T00:00:00'),
          read: false,
          priority: 'high',
          metadata: { holidayId: '123' }
        },
        {
          id: '2',
          type: 'leave_request',
          title: 'New Leave Request',
          message: 'John Doe has requested leave from August 10-15',
          timestamp: new Date('2025-07-30T14:30:00'),
          read: false,
          priority: 'medium',
          metadata: { employeeId: 'emp123', requestId: 'req456' }
        },
        {
          id: '3',
          type: 'announcement',
          title: 'Team Meeting',
          message: 'Monthly team meeting scheduled for August 5th at 10:00 AM',
          timestamp: new Date('2025-07-29T09:15:00'),
          read: true,
          priority: 'medium',
          metadata: { meetingId: 'm789' }
        },
        {
          id: '4',
          type: 'reminder',
          title: 'Performance Reviews Due',
          message: 'Complete performance reviews for your team by August 15th',
          timestamp: new Date('2025-08-01T16:45:00'),
          read: false,
          priority: 'high',
          metadata: { dueDate: '2025-08-15' }
        },
        {
          id: '5',
          type: 'announcement',
          title: 'New HR Policy',
          message: 'Updated remote work policy has been published',
          timestamp: new Date('2025-07-25T11:20:00'),
          read: true,
          priority: 'low',
          metadata: { documentId: 'doc123' }
        }
      ];
      
      this.notifications = mockData;
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback([...this.notifications]));
  }
}

export const notificationService = NotificationService.getInstance();
