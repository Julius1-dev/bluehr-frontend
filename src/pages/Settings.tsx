import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BACKEND_URL } from "@/lib/config";
import {
  LogOut,
  Mail,
  MapPin,
  Shield,
  Key,
  Smartphone,
  Globe,
  CreditCard,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AdvanceSettings as AdvanceSettingsComponent } from "@/components/settings/AdvanceSettings";

interface SettingsProps {
  onLogout: () => void;
}

// NOTE: removed unused MAPBOX_TOKEN constant

export function Settings({ onLogout }: SettingsProps) {
  // Ensure securitySettings is defined at the top
  const securitySettings = {
    lastPasswordChange: "2025-03-15",
    twoFactorEnabled: true,
    lastLogin: "2025-04-25 09:30 AM",
    loginDevices: [
      {
        device: "MacBook Pro",
        location: "Boston, MA",
        lastActive: "2025-04-25 09:30 AM",
      },
      {
        device: "iPhone 15",
        location: "Boston, MA",
        lastActive: "2025-04-25 08:45 AM",
      },
    ],
  };
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // removed unused 'saving' state
  const [location, setLocation] = useState("");
  // removed unused 'locationLoading' state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  // removed unused 'otpSecret' state
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<
    "start" | "show-qr" | "verify" | "disable"
  >("start");

  // Subscription state (removed unused detailed subscription tracking)
  const [userCount, setUserCount] = useState<number | null>(null);

  // Active sessions state
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        const res = await fetch(`${BACKEND_URL}/company-admin/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success)
          throw new Error(data.error || "Failed to fetch profile");
        setProfile(data.data);
        setLocation(data.data.location || "");
        setTwoFactorEnabled(!!data.data.two_factor_enabled);
      } catch (err: any) {
        setError(err.message || "Error fetching profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Note: subscription details are static in UI; skipping fetch of company profile

  useEffect(() => {
    // Fetch user count
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        const res = await fetch(`${BACKEND_URL}/company-admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch users");
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
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data && data.city && data.region && data.country_name) {
          setLocation(`${data.city}, ${data.region}, ${data.country_name}`);
        } else if (data && data.country_name) {
          setLocation(data.country_name);
        }
      } catch {
        // fallback: do not update location
      }
    };
    fetchIpLocation();
  }, []);

  // Fetch active sessions
  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        setSessionsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const res = await fetch(
          `${BACKEND_URL}/company-admin/auth/login-logs`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch active sessions");

        const data = await res.json();

        if (data.success) {
          setActiveSessions(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch active sessions");
        }
      } catch {
        // Fallback to empty array if API fails
        setActiveSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchActiveSessions();
  }, []);

  // Removed unused handleSave (location is not editable in UI)

  // Restore mock notification preferences for the Notifications tab
  const notificationPreferences = [
    { type: "Leave Requests", email: true, push: true },
    { type: "Payroll Updates", email: true, push: false },
    { type: "Team Announcements", email: true, push: true },
    { type: "Performance Reviews", email: true, push: true },
    { type: "Document Updates", email: false, push: true },
  ];

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [lastPasswordChange, setLastPasswordChange] = useState(
    securitySettings.lastPasswordChange
  );

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordLoading(true);
    setChangePasswordError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BACKEND_URL}/company-admin/auth/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );
      const data = await res.json();
      if (!data.success)
        throw new Error(data.error || "Failed to change password");
      setLastPasswordChange(data.passwordChangedAt);
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setChangePasswordError(err.message || "Failed to change password");
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Helper to refetch profile
  const refetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const res = await fetch(`${BACKEND_URL}/company-admin/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success)
        throw new Error(data.error || "Failed to fetch profile");
      setProfile(data.data);
      setLocation(data.data.location || "");
      setTwoFactorEnabled(!!data.data.two_factor_enabled);
    } catch (err: any) {
      setError(err.message || "Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  // 2FA Setup
  const handle2FASetup = async () => {
    setOtpError("");
    setOtpLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/company-admin/auth/2fa/setup`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to setup 2FA");
      setQrData(data.qr);
      setSetupStep("show-qr");
    } catch (err: any) {
      setOtpError(err.message || "Failed to setup 2FA");
    } finally {
      setOtpLoading(false);
    }
  };

  // 2FA Enable
  const handle2FAEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setOtpLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/company-admin/auth/2fa/enable`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: otpCode }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to enable 2FA");
      setShow2FAModal(false);
      setQrData(null);
      setOtpSecret(null);
      setOtpCode("");
      setSetupStep("start");
      await refetchProfile(); // Refetch profile to update 2FA state
    } catch (err: any) {
      setOtpError(err.message || "Failed to enable 2FA");
    } finally {
      setOtpLoading(false);
    }
  };

  // 2FA Disable
  const handle2FADisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setOtpLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/company-admin/auth/2fa/disable`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to disable 2FA");
      setShow2FAModal(false);
      setOtpCode("");
      setSetupStep("start");
      await refetchProfile(); // Refetch profile to update 2FA state
    } catch (err: any) {
      setOtpError(err.message || "Failed to disable 2FA");
    } finally {
      setOtpLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading profile...</div>
    );
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
          <TabsTrigger value="subscription">Subscription & Payroll</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
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
                    <label className="text-sm font-medium text-gray-500">
                      Full Name
                    </label>
                    <div className="text-lg font-semibold">
                      {profile.firstName} {profile.lastName}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Role
                    </label>
                    <div className="text-lg">{profile.role}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{profile.email}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Location
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{location || "-"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Language
                    </label>
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
                        <Badge variant={pref.email ? "success" : "secondary"}>
                          Email {pref.email ? "On" : "Off"}
                        </Badge>
                        <Badge variant={pref.push ? "success" : "secondary"}>
                          Push {pref.push ? "On" : "Off"}
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
                          Last changed:{" "}
                          {lastPasswordChange
                            ? new Date(lastPasswordChange).toLocaleDateString()
                            : new Date(
                                securitySettings.lastPasswordChange
                              ).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowChangePassword(true)}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-gray-500">
                          {twoFactorEnabled ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShow2FAModal(true);
                          setSetupStep("start");
                        }}
                      >
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
                          {setupStep === "start" && (
                            <div className="space-y-4">
                              <p>
                                Protect your account with an extra layer of
                                security. Set up 2FA using an authenticator app.
                              </p>
                              <Button
                                onClick={handle2FASetup}
                                disabled={otpLoading}
                              >
                                {otpLoading ? "Setting up..." : "Set up 2FA"}
                              </Button>
                              {otpError && (
                                <div className="text-red-500 text-sm">
                                  {otpError}
                                </div>
                              )}
                            </div>
                          )}
                          {setupStep === "show-qr" && (
                            <div className="space-y-4">
                              <p>
                                Scan this QR code with your authenticator app,
                                then enter the 6-digit code below.
                              </p>
                              {qrData && (
                                <img
                                  src={qrData}
                                  alt="2FA QR Code"
                                  className="mx-auto"
                                  style={{ width: 180, height: 180 }}
                                />
                              )}
                              <form
                                onSubmit={handle2FAEnable}
                                className="space-y-2"
                              >
                                <label className="block text-sm font-medium mb-1">
                                  2FA Code
                                </label>
                                <Input
                                  type="text"
                                  value={otpCode}
                                  onChange={(e) => setOtpCode(e.target.value)}
                                  required
                                  maxLength={6}
                                />
                                {otpError && (
                                  <div className="text-red-500 text-sm">
                                    {otpError}
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShow2FAModal(false)}
                                    disabled={otpLoading}
                                  >
                                    Cancel
                                  </Button>
                                  <Button type="submit" disabled={otpLoading}>
                                    {otpLoading ? "Enabling..." : "Enable 2FA"}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </div>
                          )}
                        </>
                      ) : (
                        <form onSubmit={handle2FADisable} className="space-y-4">
                          <p>
                            2FA is currently enabled. You can disable it below.
                          </p>
                          {/* Optionally require code to disable: <Input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} required maxLength={6} /> */}
                          {otpError && (
                            <div className="text-red-500 text-sm">
                              {otpError}
                            </div>
                          )}
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShow2FAModal(false)}
                              disabled={otpLoading}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={otpLoading}>
                              {otpLoading ? "Disabling..." : "Disable 2FA"}
                            </Button>
                          </DialogFooter>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>

                  <div className="space-y-2">
                    <h4 className="font-medium">Active Sessions</h4>
                    {sessionsLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        Loading sessions...
                      </div>
                    ) : activeSessions.length === 0 ? (
                      <p>No active sessions found.</p>
                    ) : (
                      <div className="space-y-4">
                        {activeSessions.map((session) => (
                          <div
                            key={session.id}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Smartphone className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{session.device}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <MapPin className="h-4 w-4" />
                                  <span>{session.location}</span>
                                  <span>•</span>
                                  <span>Last active: {session.lastActive}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Change Password Dialog */}
                <Dialog
                  open={showChangePassword}
                  onOpenChange={setShowChangePassword}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Current Password
                        </label>
                        <Input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          New Password
                        </label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                      </div>
                      {changePasswordError && (
                        <div className="text-red-500 text-sm">
                          {changePasswordError}
                        </div>
                      )}
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowChangePassword(false)}
                          disabled={changePasswordLoading}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={changePasswordLoading}>
                          {changePasswordLoading ? "Saving..." : "Save"}
                        </Button>
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
            {/* Subscription Plan Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Free Forever Plan</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Active
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your BlueHR subscription is completely free with no hidden
                  costs
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-lg">
                            $0
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-800">
                            Monthly Cost
                          </h4>
                          <p className="text-sm text-green-600">Free forever</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800">
                            Active Users
                          </h4>
                          <p className="text-2xl font-bold text-blue-600">
                            {userCount !== null ? userCount : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-amber-600 text-sm font-bold">
                          !
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-800 mb-1">
                          Payroll Processing Fees
                        </h4>
                        <p className="text-sm text-amber-700">
                          While your subscription is free, payroll processing
                          fees are deducted from your employees' salaries when
                          payments are processed. These fees are transparent and
                          based on salary ranges.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Plan Features</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Unlimited employee management</span>
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Complete HR management suite</span>
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>24/7 customer support</span>
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Advanced analytics and reporting</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payroll Charges Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payroll Processing Charges
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Transparent fees deducted from employee salaries during
                  payroll processing
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-4">
                      These charges are automatically deducted from your
                      employees' salaries when payroll transactions are
                      processed. The fees are based on salary ranges and are
                      charged per transaction.
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-lg border">
                    <div className="bg-gray-50 px-6 py-3 border-b">
                      <h4 className="font-medium text-gray-900">
                        Payroll Fee Structure
                      </h4>
                    </div>
                    <div className="divide-y">
                      <div className="flex justify-between items-center px-6 py-4 hover:bg-gray-50">
                        <div>
                          <span className="font-medium text-gray-900">
                            KSh 101 - 3,000
                          </span>
                          <p className="text-sm text-gray-500">
                            Basic salary range
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">
                            KSh 30
                          </span>
                          <p className="text-sm text-gray-500">
                            per transaction
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center px-6 py-4 hover:bg-gray-50">
                        <div>
                          <span className="font-medium text-gray-900">
                            KSh 3,001 - 10,000
                          </span>
                          <p className="text-sm text-gray-500">
                            Lower middle range
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">
                            KSh 50
                          </span>
                          <p className="text-sm text-gray-500">
                            per transaction
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center px-6 py-4 hover:bg-gray-50">
                        <div>
                          <span className="font-medium text-gray-900">
                            KSh 10,001 - 20,000
                          </span>
                          <p className="text-sm text-gray-500">Middle range</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">
                            KSh 70
                          </span>
                          <p className="text-sm text-gray-500">
                            per transaction
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center px-6 py-4 hover:bg-gray-50">
                        <div>
                          <span className="font-medium text-gray-900">
                            KSh 20,001 - 40,000
                          </span>
                          <p className="text-sm text-gray-500">
                            Upper middle range
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">
                            KSh 100
                          </span>
                          <p className="text-sm text-gray-500">
                            per transaction
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center px-6 py-4 hover:bg-gray-50">
                        <div>
                          <span className="font-medium text-gray-900">
                            KSh 40,001 - 50,000
                          </span>
                          <p className="text-sm text-gray-500">High range</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">
                            KSh 150
                          </span>
                          <p className="text-sm text-gray-500">
                            per transaction
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 bg-blue-50">
                        <div>
                          <span className="font-medium text-gray-900">
                            KSh 50,001 - Above
                          </span>
                          <p className="text-sm text-gray-500">Premium range</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-blue-600">
                            KSh 200
                          </span>
                          <p className="text-sm text-gray-500">
                            per transaction
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">
                          i
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800 mb-1">
                          Important Information
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>
                            • Fees are automatically deducted during payroll
                            processing
                          </li>
                          <li>
                            • Charges are based on individual employee salary
                            ranges
                          </li>
                          <li>• No additional subscription or hidden costs</li>
                          <li>• Transparent fee structure with no surprises</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <AdvanceSettingsComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
