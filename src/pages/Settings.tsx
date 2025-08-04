import React, { useEffect, useState } from 'react';
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
  Palette
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface SettingsProps {
  onLogout: () => void;
}

const MAPBOX_TOKEN = 'sk.eyJ1IjoiYmx1ZWNvbGxhcjQ0MSIsImEiOiJjbWN6NTBkb3IwdHUyMnFzMzJvNHJ1a3NpIn0.IHM7SiNWAnFN_PkTln79xQ';

export function Settings({ onLogout }: SettingsProps) {
  // Ensure securitySettings is defined at the top
  const securitySettings = {
    lastPasswordChange: '2025-03-15',
    twoFactorEnabled: true,
    lastLogin: '2025-04-25 09:30 AM',
    loginDevices: [
      { device: 'MacBook Pro', location: 'Boston, MA', lastActive: '2025-04-25 09:30 AM' },
      { device: 'iPhone 15', location: 'Boston, MA', lastActive: '2025-04-25 08:45 AM' }
    ]
  };
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [otpSecret, setOtpSecret] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<'start' | 'show-qr' | 'verify' | 'disable'>('start');

  // Subscription state
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState('');
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const res = await fetch(`${BACKEND_URL}/company-admin/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch profile');
        setProfile(data.data);
        setLocation(data.data.location || '');
        setTwoFactorEnabled(!!data.data.two_factor_enabled);
      } catch (err: any) {
        setError(err.message || 'Error fetching profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    // Fetch company info (plan, price, etc)
    const fetchCompany = async () => {
      setSubscriptionLoading(true);
      setSubscriptionError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const res = await fetch(`${BACKEND_URL}/company-admin/company`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch company profile');
        const data = await res.json();
        setSubscription(data);
      } catch (err: any) {
        setSubscriptionError(err.message || 'Error fetching subscription');
      } finally {
        setSubscriptionLoading(false);
      }
    };
    fetchCompany();
  }, []);

  useEffect(() => {
    // Fetch user count
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const res = await fetch(`${BACKEND_URL}/company-admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUserCount(Array.isArray(data) ? data.length : 0);
      } catch {
        setUserCount(null);
      }
    };
    fetchUsers();
  }, []);

  // Fetch IP-based location automatically on mount
  useEffect(() => {
    const fetchIpLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data && data.city && data.region && data.country_name) {
          setLocation(`${data.city}, ${data.region}, ${data.country_name}`);
        } else if (data && data.country_name) {
          setLocation(data.country_name);
        }
      } catch (err) {
        // fallback: do not update location
      }
    };
    fetchIpLocation();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const res = await fetch(`${BACKEND_URL}/company-admin/users/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ location })
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setSaving(false);
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
      setSaving(false);
    }
  };

  // Restore mock notification preferences for the Notifications tab
  const notificationPreferences = [
    { type: 'Leave Requests', email: true, push: true },
    { type: 'Payroll Updates', email: true, push: false },
    { type: 'Team Announcements', email: true, push: true },
    { type: 'Performance Reviews', email: true, push: true },
    { type: 'Document Updates', email: false, push: true }
  ];

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [lastPasswordChange, setLastPasswordChange] = useState(securitySettings.lastPasswordChange);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordLoading(true);
    setChangePasswordError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/company-admin/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to change password');
      setLastPasswordChange(data.passwordChangedAt);
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setChangePasswordError(err.message || 'Failed to change password');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Helper to refetch profile
  const refetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const res = await fetch(`${BACKEND_URL}/company-admin/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch profile');
      setProfile(data.data);
      setLocation(data.data.location || '');
      setTwoFactorEnabled(!!data.data.two_factor_enabled);
    } catch (err: any) {
      setError(err.message || 'Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  // 2FA Setup
  const handle2FASetup = async () => {
    setOtpError('');
    setOtpLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/company-admin/auth/2fa/setup`, {
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
      const res = await fetch(`${BACKEND_URL}/company-admin/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: otpCode })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to enable 2FA');
      setShow2FAModal(false);
      setQrData(null);
      setOtpSecret(null);
      setOtpCode('');
      setSetupStep('start');
      await refetchProfile(); // Refetch profile to update 2FA state
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
      const res = await fetch(`${BACKEND_URL}/company-admin/auth/2fa/disable`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to disable 2FA');
      setShow2FAModal(false);
      setOtpCode('');
      setSetupStep('start');
      await refetchProfile(); // Refetch profile to update 2FA state
    } catch (err: any) {
      setOtpError(err.message || 'Failed to disable 2FA');
    } finally {
      setOtpLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!profile) return null;

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
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6">
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
                    <label className="text-sm font-medium text-gray-500">Role</label>
                    <div className="text-lg">{profile.role}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{profile.email}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{location || '-'}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Language</label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span>English</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationPreferences.map((pref, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{pref.type}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant={pref.email ? 'success' : 'secondary'}>
                          Email {pref.email ? 'On' : 'Off'}
                        </Badge>
                        <Badge variant={pref.push ? 'success' : 'secondary'}>
                          Push {pref.push ? 'On' : 'Off'}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                          Last changed: {lastPasswordChange ? new Date(lastPasswordChange).toLocaleDateString() : new Date(securitySettings.lastPasswordChange).toLocaleDateString()}
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
                          {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => { setShow2FAModal(true); setSetupStep('start'); }}>
                        <Shield className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                    </div>
                  </div>
                  {/* 2FA Modal */}
                  <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Two-Factor Authentication</DialogTitle>
                      </DialogHeader>
                      {!twoFactorEnabled ? (
                        <>
                          {setupStep === 'start' && (
                            <div className="space-y-4">
                              <p>Protect your account with an extra layer of security. Set up 2FA using an authenticator app.</p>
                              <Button onClick={handle2FASetup} disabled={otpLoading}>
                                {otpLoading ? 'Setting up...' : 'Set up 2FA'}
                              </Button>
                              {otpError && <div className="text-red-500 text-sm">{otpError}</div>}
                            </div>
                          )}
                          {setupStep === 'show-qr' && (
                            <div className="space-y-4">
                              <p>Scan this QR code with your authenticator app, then enter the 6-digit code below.</p>
                              {qrData && <img src={qrData} alt="2FA QR Code" className="mx-auto" style={{ width: 180, height: 180 }} />}
                              <form onSubmit={handle2FAEnable} className="space-y-2">
                                <label className="block text-sm font-medium mb-1">2FA Code</label>
                                <Input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} required maxLength={6} />
                                {otpError && <div className="text-red-500 text-sm">{otpError}</div>}
                                <DialogFooter>
                                  <Button type="button" variant="outline" onClick={() => setShow2FAModal(false)} disabled={otpLoading}>Cancel</Button>
                                  <Button type="submit" disabled={otpLoading}>{otpLoading ? 'Enabling...' : 'Enable 2FA'}</Button>
                                </DialogFooter>
                              </form>
                            </div>
                          )}
                        </>
                      ) : (
                        <form onSubmit={handle2FADisable} className="space-y-4">
                          <p>2FA is currently enabled. You can disable it below.</p>
                          {/* Optionally require code to disable: <Input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} required maxLength={6} /> */}
                          {otpError && <div className="text-red-500 text-sm">{otpError}</div>}
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShow2FAModal(false)} disabled={otpLoading}>Cancel</Button>
                            <Button type="submit" disabled={otpLoading}>{otpLoading ? 'Disabling...' : 'Disable 2FA'}</Button>
                          </DialogFooter>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>

                  <div className="space-y-2">
                    <h4 className="font-medium">Active Sessions</h4>
                    {securitySettings.loginDevices.map((device, index) => (
                      <div 
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Smartphone className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{device.device}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <MapPin className="h-4 w-4" />
                                <span>{device.location}</span>
                                <span>•</span>
                                <span>Last active: {device.lastActive}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                            Revoke
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Change Password Dialog */}
                <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Current Password</label>
                        <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                      </div>
                      {changePasswordError && <div className="text-red-500 text-sm">{changePasswordError}</div>}
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowChangePassword(false)} disabled={changePasswordLoading}>Cancel</Button>
                        <Button type="submit" disabled={changePasswordLoading}>{changePasswordLoading ? 'Saving...' : 'Save'}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="subscription">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Subscription</CardTitle>
                <p className="text-sm text-muted-foreground">Manage your subscription plan and billing information</p>
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading subscription...</div>
                ) : subscriptionError ? (
                  <div className="p-8 text-center text-red-500">{subscriptionError}</div>
                ) : subscription ? (
                <div className="space-y-6">
                  <div className="border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                          <h3 className="text-lg font-semibold">{subscription.plan || 'N/A'} Plan</h3>
                          <p className="text-muted-foreground">Active 2 Next billing date: {/* TODO: Add real billing date if available */}N/A</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Active
                      </Badge>
                    </div>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Price per user</p>
                          <p className="text-2xl font-semibold">
                            {subscription.price_per_user ? `$${subscription.price_per_user}` : '$30'}
                            <small className="text-sm font-normal text-muted-foreground">/user/month</small>
                          </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Users</p>
                          <p className="text-2xl font-semibold">{userCount !== null ? userCount : '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total per month</p>
                          <p className="text-2xl font-semibold">
                            {userCount !== null && (subscription.price_per_user || 30)
                              ? `$${userCount * (subscription.price_per_user || 30)}`
                              : '-'}
                            <small className="text-sm font-normal text-muted-foreground">/month</small>
                          </p>
                        </div>
                      </div>
                    </div>
                  <div className="border rounded-lg p-6">
                    <h4 className="font-medium mb-4">Plan Features</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>24/7 customer support</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Basic analytics and reporting</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Email support</span>
                      </li>
                    </ul>
                    <div className="mt-4 p-4 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> Charges are calculated based on your active employee count. If you add or remove employees, your total will be adjusted accordingly, and you'll receive an amended invoice reflecting these changes at your next billing cycle.
                      </p>
                    </div>
                      {/* Removed Change Plan and Update Payment Method buttons */}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}