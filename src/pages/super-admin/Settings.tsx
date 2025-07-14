import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Mail, Shield, CreditCard, Bell, Server } from 'lucide-react';
import { useState } from 'react';

// Import settings components
import EmailSettings from './settings/EmailSettings';
import SecuritySettings from './settings/SecuritySettings';
import BillingSettings from './settings/BillingSettings';
import NotificationSettings from './settings/NotificationSettings';
import SystemSettings from './settings/SystemSettings';

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    email: {
      smtpHost: 'smtp.example.com',
      smtpPort: '587',
      smtpUser: 'user@example.com',
      smtpPass: '********',
      fromEmail: 'noreply@bluehr.com',
      fromName: 'BlueHR',
      enableTLS: true,
    },
    security: {
      enable2FA: true,
      passwordMinLength: 8,
      passwordRequireSpecial: true,
      passwordRequireNumber: true,
      passwordRequireUppercase: true,
      failedLoginAttempts: 5,
      sessionTimeout: 30,
    },
    billing: {
      currency: 'USD',
      taxRate: 0,
      invoicePrefix: 'INV-',
      paymentTerms: 'Net 30',
      lateFee: 0,
      enableAutoInvoicing: true,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      newUserSignup: true,
      paymentReceived: true,
      invoiceOverdue: true,
      systemAlerts: true,
      marketingEmails: false,
    },
    system: {
      appName: 'BlueHR',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12',
      maintenanceMode: false,
      cacheEnabled: true,
      cacheTtl: 60,
    },
  });

  const handleSettingsChange = (section: string, newSettings: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: newSettings
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="email" className="space-y-4">
        <TabsList>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Billing</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <EmailSettings 
            settings={settings.email} 
            onSettingsChange={(newSettings) => handleSettingsChange('email', newSettings)} 
          />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings 
            settings={settings.security} 
            onSettingsChange={(newSettings) => handleSettingsChange('security', newSettings)} 
          />
        </TabsContent>
        <TabsContent value="billing">
          <BillingSettings 
            settings={settings.billing} 
            onSettingsChange={(newSettings) => handleSettingsChange('billing', newSettings)} 
          />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationSettings 
            settings={settings.notifications} 
            onSettingsChange={(newSettings) => handleSettingsChange('notifications', newSettings)} 
          />
        </TabsContent>
        <TabsContent value="system">
          <SystemSettings 
            settings={settings.system} 
            onSettingsChange={(newSettings) => handleSettingsChange('system', newSettings)} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}


