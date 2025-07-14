import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

interface EmailSettingsProps {
  settings?: {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPass: string;
    fromEmail: string;
    fromName: string;
    enableTLS: boolean;
  };
  onSettingsChange?: (settings: any) => void;
}

export default function EmailSettings({ 
  settings: externalSettings, 
  onSettingsChange 
}: EmailSettingsProps) {
  const [settings, setSettings] = useState({
    smtpHost: externalSettings?.smtpHost || '',
    smtpPort: externalSettings?.smtpPort || '587',
    smtpUser: externalSettings?.smtpUser || '',
    smtpPass: externalSettings?.smtpPass || '',
    fromEmail: externalSettings?.fromEmail || '',
    fromName: externalSettings?.fromName || '',
    enableTLS: externalSettings?.enableTLS ?? true,
  });

  const handleChange = (field: string, value: any) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Settings</CardTitle>
        <CardDescription>
          Configure how your application sends emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtpHost">SMTP Host</Label>
            <Input
              id="smtpHost"
              value={settings.smtpHost}
              onChange={(e) => handleChange('smtpHost', e.target.value)}
              placeholder="smtp.example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpPort">SMTP Port</Label>
            <Input
              id="smtpPort"
              type="number"
              value={settings.smtpPort}
              onChange={(e) => handleChange('smtpPort', e.target.value)}
              placeholder="587"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtpUser">SMTP Username</Label>
            <Input
              id="smtpUser"
              value={settings.smtpUser}
              onChange={(e) => handleChange('smtpUser', e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpPass">SMTP Password</Label>
            <Input
              id="smtpPass"
              type="password"
              value={settings.smtpPass}
              onChange={(e) => handleChange('smtpPass', e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fromEmail">From Email</Label>
            <Input
              id="fromEmail"
              type="email"
              value={settings.fromEmail}
              onChange={(e) => handleChange('fromEmail', e.target.value)}
              placeholder="noreply@yourdomain.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromName">From Name</Label>
            <Input
              id="fromName"
              value={settings.fromName}
              onChange={(e) => handleChange('fromName', e.target.value)}
              placeholder="Your App Name"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id="enableTLS"
            checked={settings.enableTLS}
            onCheckedChange={(checked) => handleChange('enableTLS', checked)}
          />
          <Label htmlFor="enableTLS">Enable TLS</Label>
        </div>
        
        <div className="pt-4">
          <Button onClick={() => console.log('Test email settings')} variant="outline">
            Test Email Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
