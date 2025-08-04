import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, User, Mail, Phone, Building2, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BACKEND_URL } from '@/lib/config';

const API_URL = `${BACKEND_URL}/super-admin`;

export function AddUserPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyId: '',
    role: 'admin', // Only admin role is selectable
    status: 'active',
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/companies`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch companies');
        }
        const data = await response.json();
        setCompanies(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchCompanies();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingInvite(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add user');
      }
      setInviteSent(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyId: '',
        role: 'admin',
        status: 'active',
      });
      setTimeout(() => {
        navigate('/super-admin/users');
      }, 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSendingInvite(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New User</h1>
          <p className="text-muted-foreground">
            Register a new user to the platform
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Basic details about the user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyId">Company *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={formData.companyId}
                    onValueChange={(value) => handleSelectChange('companyId', value)}
                  >
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="relative">
                  <UserCog className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value="Admin"
                    disabled
                    className="pl-9 bg-muted/50"
                  />
                  <input type="hidden" name="role" value="admin" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Admin role will be granted to this user
                </p>
              </div>
            </div>

            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Email Invitation</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      An invitation email with setup instructions will be sent to the user's email address.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/super-admin/users')}
            disabled={isSendingInvite}
          >
            <X className="mr-2 h-4 w-4" />
            {inviteSent ? 'Back to Users' : 'Cancel'}
          </Button>
          <Button 
            type="submit" 
            disabled={isSendingInvite || inviteSent}
          >
            {isSendingInvite ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Invite...
              </>
            ) : inviteSent ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Invite Sent!
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </div>
        {inviteSent && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  Invitation sent successfully! The user will receive an email to complete their registration.
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
