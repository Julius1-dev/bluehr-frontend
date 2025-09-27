import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, Building, User, Shield, Calendar, MapPin, Hash } from 'lucide-react';
import { BACKEND_URL } from '@/lib/config';

const API_URL = `${BACKEND_URL}/super-admin/users`;

export function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user');
        }
        const data = await response.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default">Admin</Badge>;
      case 'manager':
        return <Badge variant="secondary">Manager</Badge>;
      case 'user':
        return <Badge variant="outline">User</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getInitials = (first: string, last: string) => {
    return ((first || '') + ' ' + (last || ''))
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading user...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!user) return <div className="text-center py-8 text-gray-500">User not found</div>;

  const fullName = ((user.first_name || '') + ' ' + (user.last_name || '')).trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Profile Card */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" alt={fullName} />
                  <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{fullName}</h2>
                  <p className="text-muted-foreground">{user.position || '-'}</p>
                  <div className="mt-2 flex justify-center space-x-2">
                    {getStatusBadge(user.status)}
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{user.email || '-'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{user.phone || '-'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{user.company_name || '-'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{user.address || '-'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Joined on {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>ID: {user.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Additional Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {user.about || '-'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium">Profile Updated</p>
                    <p className="text-sm text-muted-foreground">
                      Last updated on {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium">Last Active</p>
                    <p className="text-sm text-muted-foreground">
                      {user.last_active ? new Date(user.last_active).toLocaleString() : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/super-admin/users/edit/${user.id}`)}
        >
          Edit Profile
        </Button>
        <Button>Reset Password</Button>
        <Button variant="destructive">Suspend User</Button>
      </div>
    </div>
  );
}
