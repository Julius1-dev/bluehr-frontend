import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BACKEND_URL } from '@/lib/config';
import { 
  LogOut,
  Mail,
  Phone,
  MapPin,
  Building2,
  Shield,
  Key,
  Smartphone,
  Clock,
  Languages,
  Calendar,
  Globe,
  Sun,
  Moon,
  Palette,
  User,
  Bell,
  Lock,
  CreditCard
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmployeeSettingsProps {
  onLogout: () => void;
}

export function EmployeeSettings({ onLogout }: EmployeeSettingsProps) {
  // Real profile data from backend
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState([
    { type: 'Leave Requests', email: true, push: true, sms: false },
    { type: 'Payroll Updates', email: true, push: false, sms: true },
    { type: 'Team Announcements', email: true, push: true, sms: false },
    { type: 'Performance Reviews', email: true, push: true, sms: false },
    { type: 'Document Updates', email: false, push: true, sms: false },
    { type: 'Attendance Reminders', email: false, push: true, sms: true },
    { type: 'Holiday Notifications', email: true, push: true, sms: false }
  ]);

  // Security settings - will be updated with real data from profile
  const [securitySettings, setSecuritySettings] = useState({
    lastPasswordChange: '2025-03-15',
    twoFactorEnabled: false,
    lastLogin: '2025-04-25 09:30 AM',
    loginDevices: [
      { device: 'MacBook Pro', location: 'Nairobi, Kenya', lastActive: '2025-04-25 09:30 AM' },
      { device: 'iPhone 15', location: 'Nairobi, Kenya', lastActive: '2025-04-25 08:45 AM' }
    ],
    sessionTimeout: 30,
    failedLoginAttempts: 0
  });

  // State for modals and forms
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');

  // Loading states
  const [saving, setSaving] = useState(false);

  // 2FA Setup
  const [qrData, setQrData] = useState<string | null>(null);
  const [otpSecret, setOtpSecret] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<'start' | 'show-qr' | 'verify-code'>('start');

  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        
        const res = await fetch(`${BACKEND_URL}/employee/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch profile');
        
        setProfile(data.data);
        
        // Update security settings with real data
        setSecuritySettings(prev => ({
          ...prev,
          lastPasswordChange: data.data.passwordChangedAt || '2025-03-15',
          twoFactorEnabled: data.data.twoFactorEnabled || false
        }));
      } catch (err: any) {
        setError(err.message || 'Error fetching profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setChangePasswordError('Passwords do not match');
      return;
    }
    
    setChangePasswordLoading(true);
    setChangePasswordError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/employee/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to change password');
      
      // Update the last password change date
      setSecuritySettings(prev => ({
        ...prev,
        lastPasswordChange: data.passwordChangedAt || new Date().toISOString().split('T')[0]
      }));
      
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setChangePasswordError(err.message || 'Failed to change password');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleNotificationToggle = (type: string, channel: 'email' | 'push' | 'sms') => {
    setNotificationPreferences(prev => 
      prev.map(pref => 
        pref.type === type 
          ? { ...pref, [channel]: !pref[channel as keyof typeof pref] }
          : pref
      )
    );
  };

  // 2FA Setup
  const handle2FASetup = async () => {
    setOtpError('');
    setOtpLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/employee/auth/2fa/setup`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to setup 2FA');
      setQrData(data.qr);
      setOtpSecret(data.otpauth_url);
      setSetupStep('show-qr');
    } catch (err: any) {
      setOtpError(err.message || 'Failed to setup 2FA');
    } finally {
      setOtpLoading(false);
    }
  };

  // 2FA Enable
  const handle2FAEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/employee/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: otpCode })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to enable 2FA');
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: true }));
      setShow2FAModal(false);
      setQrData(null);
      setOtpSecret(null);
      setOtpCode('');
      setSetupStep('start');
    } catch (err: any) {
      setOtpError(err.message || 'Failed to enable 2FA');
    } finally {
      setOtpLoading(false);
    }
  };

  // 2FA Disable
  const handle2FADisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/employee/auth/2fa/disable`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to disable 2FA');
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: false }));
      setShow2FAModal(false);
      setOtpCode('');
      setSetupStep('start');
    } catch (err: any) {
      setOtpError(err.message || 'Failed to disable 2FA');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button 
          variant="outline" 
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Payroll</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6">
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                  </div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <p className="text-red-600 mb-2">Error loading profile</p>
                    <p className="text-gray-600 text-sm">{error}</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : profile ? (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <div className="text-lg font-semibold">{profile.firstName} {profile.lastName}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Employee ID</label>
                      <div className="text-lg">{profile.employeeId}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{profile.email}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{profile.phone || 'Not Set'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Department</label>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>{profile.department}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Position</label>
                      <div className="text-lg">{profile.position}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{profile.location || 'Not Set'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Joining Date</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'Not Set'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Employment Type</label>
                      <div className="text-lg">{profile.employmentType}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <Badge variant={profile.status === 'Active' ? 'default' : 'secondary'}>
                        {profile.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">Company</label>
                      <div className="text-lg">{profile.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardContent className="text-sm text-gray-600">
                Choose how you want to receive notifications for different activities
              </CardContent>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {notificationPreferences.map((pref) => (
                  <div key={pref.type} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{pref.type}</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={pref.email}
                          onCheckedChange={() => handleNotificationToggle(pref.type, 'email')}
                        />
                        <Label>Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={pref.push}
                          onCheckedChange={() => handleNotificationToggle(pref.type, 'push')}
                        />
                        <Label>Push</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={pref.sms}
                          onCheckedChange={() => handleNotificationToggle(pref.type, 'sms')}
                        />
                        <Label>SMS</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Password</h4>
                        <p className="text-sm text-gray-500">
                          Last changed: {new Date(securitySettings.lastPasswordChange).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowChangePassword(true)}>
                        <Key className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">
                          {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShow2FAModal(true)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Active Sessions</h4>
                      <p className="text-sm text-gray-500 mb-3">
                        Last login: {securitySettings.lastLogin}
                      </p>
                      <div className="space-y-2">
                        {securitySettings.loginDevices.map((device, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div>
                              <span className="font-medium">{device.device}</span>
                              <span className="text-gray-500 ml-2">• {device.location}</span>
                            </div>
                            <span className="text-gray-500">{device.lastActive}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll">
          <div className="grid gap-6">
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading payroll information...</p>
                  </div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <p className="text-red-600 mb-2">Error loading payroll information</p>
                    <p className="text-gray-600 text-sm">{error}</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : profile ? (
              <>
                {/* Banking Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Banking Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Bank Name</label>
                        <div className="text-lg">{profile.bankName || 'Not Set'}</div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Account Number</label>
                        <div className="text-lg">
                          {profile.accountNumber ? `****${profile.accountNumber.slice(-4)}` : 'Not Set'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Account Name</label>
                        <div className="text-lg">{profile.accountName || 'Not Set'}</div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Payment Method</label>
                        <div className="text-lg capitalize">Bank Transfer</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Statutory Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Statutory Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">KRA PIN</label>
                        <div className="text-lg">
                          {profile.kraPin ? `****${profile.kraPin.slice(-4)}` : 'Not Set'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">NHIF Number</label>
                        <div className="text-lg">{profile.nhifNumber || 'Not Set'}</div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">NSSF Number</label>
                        <div className="text-lg">{profile.nssfNumber || 'Not Set'}</div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Tax Exemption</label>
                        <Badge variant="secondary">
                          No
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Salary Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Salary Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Basic Salary</label>
                        <div className="text-lg font-semibold">KES {profile.basicSalary ? parseFloat(profile.basicSalary).toLocaleString() : '0'}</div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Payment Frequency</label>
                        <div className="text-lg capitalize">{profile.paymentFrequency || 'Monthly'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>

      {/* Change Password Modal */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {changePasswordError && (
              <p className="text-sm text-red-600">{changePasswordError}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowChangePassword(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={changePasswordLoading}>
                {changePasswordLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2FA Modal */}
      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {setupStep === 'start' && (
              <>
                <p className="text-sm text-gray-600">
                  {securitySettings.twoFactorEnabled 
                    ? 'Two-factor authentication is currently enabled. You can disable it if needed.'
                    : 'Enable two-factor authentication to add an extra layer of security to your account.'
                  }
                </p>
                {otpError && (
                  <p className="text-sm text-red-600">{otpError}</p>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShow2FAModal(false)}>
                    Cancel
                  </Button>
                  {securitySettings.twoFactorEnabled ? (
                    <Button onClick={handle2FADisable} disabled={otpLoading}>
                      {otpLoading ? 'Disabling...' : 'Disable 2FA'}
                    </Button>
                  ) : (
                    <Button onClick={handle2FASetup} disabled={otpLoading}>
                      {otpLoading ? 'Setting up...' : 'Enable 2FA'}
                    </Button>
                  )}
                </div>
              </>
            )}

            {setupStep === 'show-qr' && (
              <>
                <p className="text-sm text-gray-600">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                {qrData && (
                  <div className="flex justify-center">
                    <img src={qrData} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                )}
                <p className="text-sm text-gray-600">
                  Or manually enter this code: <code className="bg-gray-100 px-2 py-1 rounded">{otpSecret}</code>
                </p>
                <div className="space-y-2">
                  <Label htmlFor="otpCode">Enter the 6-digit code from your app</Label>
                  <Input
                    id="otpCode"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
                {otpError && (
                  <p className="text-sm text-red-600">{otpError}</p>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setShow2FAModal(false);
                    setSetupStep('start');
                    setQrData(null);
                    setOtpSecret(null);
                    setOtpCode('');
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handle2FAEnable} disabled={otpLoading || otpCode.length !== 6}>
                    {otpLoading ? 'Verifying...' : 'Verify & Enable'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 