import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Mail, Lock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type UserRole = 'employee' | 'admin' | 'superadmin';

interface SignInProps {
  onLogin: (role: UserRole) => void;
}

export function SignIn({ onLogin }: SignInProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<UserRole>('admin'); // Default to company admin
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAUserId, setTwoFAUserId] = useState<string | null>(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAError, setTwoFAError] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Use correct endpoint based on role
      let endpoint = 'http://localhost:4000/company-admin/auth/login';
      let redirect = '/admin';
      if (role === 'superadmin') {
        endpoint = 'http://localhost:4000/super-admin/login';
        redirect = '/super-admin';
      } else if (role === 'employee') {
        endpoint = 'http://localhost:4000/employee/auth/login';
        redirect = '/';
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      const data = await response.json();
      
      // 2FA flow for company admin and employee
      if ((role === 'admin' || role === 'employee') && data.require2FA && data.userId) {
        setTwoFAUserId(data.userId);
        setShow2FAModal(true);
        setIsLoading(false);
        return;
      }
      
      localStorage.setItem('token', data.data?.token || data.token);
      if (onLogin) onLogin(role);
      navigate(redirect);
    } catch (err: any) {
      setError(err.message);
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2FA verify handler
  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFAError('');
    setTwoFALoading(true);
    try {
      // Use correct endpoint based on role
      let endpoint = 'http://localhost:4000/company-admin/auth/2fa/verify';
      let redirect = '/admin';
      if (role === 'employee') {
        endpoint = 'http://localhost:4000/employee/auth/2fa/verify';
        redirect = '/';
      }
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: twoFAUserId, code: twoFACode })
      });
      const data = await res.json();
      if (!data.success || !data.token) throw new Error(data.error || 'Invalid 2FA code');
      localStorage.setItem('token', data.token);
      setShow2FAModal(false);
      setTwoFACode('');
      setTwoFAUserId(null);
      if (onLogin) onLogin(role);
      navigate(redirect);
    } catch (err: any) {
      setTwoFAError(err.message || 'Invalid 2FA code');
    } finally {
      setTwoFALoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">B</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to BlueHR</CardTitle>
          <p className="text-gray-500">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}
          {/* 2FA Modal */}
          <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Two-Factor Authentication Required</DialogTitle>
              </DialogHeader>
              <form onSubmit={handle2FAVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">2FA Code</label>
                  <Input type="text" value={twoFACode} onChange={e => setTwoFACode(e.target.value)} required maxLength={6} />
                </div>
                {twoFAError && <div className="text-red-500 text-sm">{twoFAError}</div>}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShow2FAModal(false)} disabled={twoFALoading}>Cancel</Button>
                  <Button type="submit" disabled={twoFALoading}>{twoFALoading ? 'Verifying...' : 'Verify'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="role">
                Role
              </label>
              <Select value={role} onValueChange={v => setRole(v as UserRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Company Admin</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md"
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs text-blue-600"
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            type="button"
            onClick={() => {
              toast('Redirecting to Google... Please sign in with your Google account');
            }}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Button 
              variant="link" 
              className="h-auto p-0 text-blue-600"
              onClick={() => navigate('/signup')}
            >
              Sign up
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}