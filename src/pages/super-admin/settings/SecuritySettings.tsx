import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SecuritySettingsProps {
  settings?: {
    enable2FA: boolean;
    passwordMinLength: number;
    passwordRequireSpecial: boolean;
    passwordRequireNumber: boolean;
    passwordRequireUppercase: boolean;
    failedLoginAttempts: number;
    sessionTimeout: number;
  };
  onSettingsChange?: (settings: any) => void;
}

export default function SecuritySettings({ 
  settings: externalSettings, 
  onSettingsChange 
}: SecuritySettingsProps) {
  const [settings, setSettings] = useState({
    enable2FA: externalSettings?.enable2FA ?? true,
    passwordMinLength: externalSettings?.passwordMinLength ?? 8,
    passwordRequireSpecial: externalSettings?.passwordRequireSpecial ?? true,
    passwordRequireNumber: externalSettings?.passwordRequireNumber ?? true,
    passwordRequireUppercase: externalSettings?.passwordRequireUppercase ?? true,
    failedLoginAttempts: externalSettings?.failedLoginAttempts ?? 5,
    sessionTimeout: externalSettings?.sessionTimeout ?? 30,
  });

  const handleChange = (field: string, value: any) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Configure security preferences and authentication settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Authentication</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable2FA">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require users to use 2FA for additional security
                </p>
              </div>
              <Switch
                id="enable2FA"
                checked={settings.enable2FA}
                onCheckedChange={(checked) => handleChange('enable2FA', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <Label>Password Requirements</Label>
                <p className="text-sm text-muted-foreground">
                  Set rules for strong passwords
                </p>
              </div>
            </div>
            
            <div className="space-y-4 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="passwordMinLength" className="font-normal">
                  Minimum Length: {settings.passwordMinLength} characters
                </Label>
                <Input
                  id="passwordMinLength"
                  type="range"
                  min="6"
                  max="32"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleChange('passwordMinLength', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="passwordRequireSpecial" className="font-normal">
                  Require special character (!@#$%^&*)
                </Label>
                <Switch
                  id="passwordRequireSpecial"
                  checked={settings.passwordRequireSpecial}
                  onCheckedChange={(checked) => handleChange('passwordRequireSpecial', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="passwordRequireNumber" className="font-normal">
                  Require number
                </Label>
                <Switch
                  id="passwordRequireNumber"
                  checked={settings.passwordRequireNumber}
                  onCheckedChange={(checked) => handleChange('passwordRequireNumber', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="passwordRequireUppercase" className="font-normal">
                  Require uppercase letter
                </Label>
                <Switch
                  id="passwordRequireUppercase"
                  checked={settings.passwordRequireUppercase}
                  onCheckedChange={(checked) => handleChange('passwordRequireUppercase', checked)}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-medium">Session</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="failedLoginAttempts">Failed Login Attempts</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="failedLoginAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.failedLoginAttempts}
                  onChange={(e) => handleChange('failedLoginAttempts', parseInt(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">attempts before lockout</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  max="1440"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">minutes of inactivity</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-medium">Security Headers</h3>
          <div className="bg-muted/50 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">
              Configure security headers in your web server configuration for:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Content Security Policy (CSP)</li>
              <li>HTTP Strict Transport Security (HSTS)</li>
              <li>X-Content-Type-Options</li>
              <li>X-Frame-Options</li>
              <li>X-XSS-Protection</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
