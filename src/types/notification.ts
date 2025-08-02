export type NotificationType = 'leave_request' | 'holiday' | 'announcement' | 'reminder';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}
