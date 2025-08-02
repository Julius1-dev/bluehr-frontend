import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Mail, BellRing, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface NotificationSettingsProps {
  settings?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newUserSignup: boolean;
    paymentReceived: boolean;
    invoiceOverdue: boolean;
    systemAlerts: boolean;
    marketingEmails: boolean;
  };
  onSettingsChange?: (settings: any) => void;
}

export default function NotificationSettings({ 
  settings: externalSettings, 
  onSettingsChange 
}: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    emailNotifications: externalSettings?.emailNotifications ?? true,
    pushNotifications: externalSettings?.pushNotifications ?? true,
    newUserSignup: externalSettings?.newUserSignup ?? true,
    paymentReceived: externalSettings?.paymentReceived ?? true,
    invoiceOverdue: externalSettings?.invoiceOverdue ?? true,
    systemAlerts: externalSettings?.systemAlerts ?? true,
    marketingEmails: externalSettings?.marketingEmails ?? false,
  });

  const handleChange = (field: string, value: boolean) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const notificationTypes = [
    {
      id: 'emailNotifications',
      label: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail,
    },
    {
      id: 'pushNotifications',
      label: 'Push Notifications',
      description: 'Receive push notifications in your browser',
      icon: Bell,
    },
    {
      id: 'newUserSignup',
      label: 'New User Signup',
      description: 'Get notified when a new user signs up',
      icon: BellRing,
    },
    {
      id: 'paymentReceived',
      label: 'Payment Received',
      description: 'Get notified when a payment is received',
      icon: CheckCircle,
    },
    {
      id: 'invoiceOverdue',
      label: 'Invoice Overdue',
      description: 'Get notified when an invoice is overdue',
      icon: AlertCircle,
    },
    {
      id: 'systemAlerts',
      label: 'System Alerts',
      description: 'Important system alerts and updates',
      icon: AlertCircle,
    },
    {
      id: 'marketingEmails',
      label: 'Marketing Emails',
      description: 'Receive our newsletter and marketing emails',
      icon: Mail,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {notificationTypes.map((notification) => {
            const Icon = notification.icon;
            return (
              <div key={notification.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <Label htmlFor={notification.id} className="font-medium">
                      {notification.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={notification.id}
                  checked={settings[notification.id as keyof typeof settings] as boolean}
                  onCheckedChange={(checked) => handleChange(notification.id, checked)}
                />
              </div>
            );
          })}
        </div>
        
        <div className="pt-4">
          <h3 className="text-sm font-medium mb-3">Email Preferences</h3>
          <div className="space-y-4 bg-muted/50 p-4 rounded-md">
            <div className="space-y-2">
              <Label>Notification Frequency</Label>
              <div className="flex flex-wrap gap-2">
                {['Immediate', 'Daily Digest', 'Weekly Digest'].map((freq) => (
                  <Button 
                    key={freq} 
                    variant="outline"
                    className={freq === 'Immediate' ? 'bg-primary/10 border-primary' : ''}
                  >
                    {freq}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Choose how often you want to receive non-urgent notifications
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Quiet Hours</Label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="quietStart" className="text-sm font-normal">From</Label>
                  <Input 
                    id="quietStart" 
                    type="time" 
                    className="mt-1" 
                    defaultValue="22:00"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="quietEnd" className="text-sm font-normal">To</Label>
                  <Input 
                    id="quietEnd" 
                    type="time" 
                    className="mt-1" 
                    defaultValue="07:00"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                During these hours, only critical notifications will be sent
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
