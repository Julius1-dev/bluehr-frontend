import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, ArrowUpDown, Mail, Eye, Edit, Lock, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BACKEND_URL } from '@/lib/config';

const API_URL = `${BACKEND_URL}/super-admin/users`;

export function UsersManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});
  const [usersData, setUsersData] = useState<any[]>([]); // State to hold the users data
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch users');
        }
        const data = await response.json();
        setUsersData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleViewProfile = (userId: number) => {
    navigate(`/super-admin/users/${userId}`);
  };

  const handleEditUser = (userId: number) => {
    navigate(`/super-admin/users/edit/${userId}`);
  };

  const handleResetPassword = async (userId: number) => {
    setIsLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset link');
      }
      toast.success('Password reset link sent to user\'s email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setIsLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const toggleUserStatus = async (user: any) => {
    const userId = user.id;
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    const action = newStatus === 'suspended' ? 'suspend' : 'activate';
    setIsLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} user`);
      }
      setUsersData(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      toast.success(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} user`);
    } finally {
      setIsLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const filteredUsers = usersData
    .filter(user => {
      const fullName = ((user.first_name || '') + ' ' + (user.last_name || '')).trim();
      const matchesSearch = 
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.company_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || user.status === statusFilter;
      const matchesRole = !roleFilter || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
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

  const getInitials = (name: string | undefined) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage all users across all organizations
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0"
          onClick={() => navigate('/super-admin/users/add')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    {roleFilter ? 
                      `Role: ${roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}` : 
                      'All Roles'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setRoleFilter(null)}>
                    All Roles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter('admin')}>
                    Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter('manager')}>
                    Manager
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter('user')}>
                    User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    {statusFilter ? 
                      `Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}` : 
                      'All Statuses'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                    Inactive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('suspended')}>
                    Suspended
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">
                    <button
                      type="button"
                      className="flex items-center font-medium"
                      onClick={() => handleSort('name')}
                    >
                      User
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Mail className="mr-1 h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.company_name || '-'}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {user.last_active && !isNaN(Date.parse(user.last_active))
                          ? new Date(user.last_active).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleViewProfile(user.id)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEditUser(user.id)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleResetPassword(user.id)}
                              className="cursor-pointer"
                              disabled={isLoading[user.id]}
                            >
                              <Lock className="mr-2 h-4 w-4" />
                              {isLoading[user.id] ? 'Sending...' : 'Reset Password'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => toggleUserStatus(user)}
                              className="cursor-pointer text-destructive"
                              disabled={isLoading[user.id]}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              {user.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>Showing {filteredUsers.length} of {usersData.length} users</div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
