import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  ArrowUpDown,
  Building2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const API_URL = 'http://localhost:4000/super-admin/admins';

type Admin = {
  id: number;
  name: string;
  email: string;
  company?: string;
  role: string;
  status: string;
  last_login?: string | null;
  join_date?: string | null;
  permissions: string[];
};

export default function Admins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Admin; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    permissions: [] as string[],
  });
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch admins');
        }
        const data = await response.json();
        // Map backend fields to Admin type
        setAdmins(
          data.map((admin: any) => ({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            company: admin.company || '-',
            role: admin.role,
            status: admin.status || 'active',
            last_login: admin.last_login || null,
            join_date: admin.created_at || null,
            permissions: admin.permissions || [],
          }))
        );
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  // Filter and sort admins
  const filteredAdmins = admins.filter(admin => {
    const name = admin.name || '';
    const email = admin.email || '';
    const company = admin.company || '';

    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
    const matchesRole = roleFilter === 'all' || (admin.role || '').toLowerCase().includes(roleFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesRole;
  });


  // Sort admins
  const sortedAdmins = [...filteredAdmins].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = (a[sortConfig.key] ?? '') as string | number;
    const bValue = (b[sortConfig.key] ?? '') as string | number;
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedAdmins.length / itemsPerPage);
  const paginatedAdmins = sortedAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = (key: keyof Admin) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; icon: React.ReactNode; variant: string }> = {
      active: { 
        text: 'Active', 
        icon: <ShieldCheck className="h-3 w-3" />, 
        variant: 'bg-green-100 text-green-800' 
      },
      pending: { 
        text: 'Pending', 
        icon: <ShieldAlert className="h-3 w-3" />, 
        variant: 'bg-yellow-100 text-yellow-800' 
      },
      suspended: { 
        text: 'Suspended', 
        icon: <ShieldOff className="h-3 w-3" />, 
        variant: 'bg-red-100 text-red-800' 
      },
    };
    const { text, icon, variant } = statusMap[status] || { 
      text: status, 
      icon: <Shield className="h-3 w-3" />, 
      variant: 'bg-gray-100 text-gray-800' 
    };
    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant}`}>
        {icon}
        <span className="ml-1">{text}</span>
      </div>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, string> = {
      'super-admin': 'bg-purple-100 text-purple-800',
      'sub-superadmin': 'bg-blue-100 text-blue-800',
    };
    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleMap[role] || 'bg-gray-100 text-gray-800'}`}>
        <Shield className="h-3 w-3 mr-1" />
        <span>{role === 'super-admin' ? 'Super Admin' : 'Sub-Superadmin'}</span>
      </div>
    );
  };

  const getLastLoginText = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never logged in';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return format(date, 'MMM d, yyyy');
  };

  const getPermissionCount = (permissions: string[]) => {
    if (permissions.includes('all')) return 'All Permissions';
    return `${permissions.length} Permission${permissions.length !== 1 ? 's' : ''}`;
  };

  // Add Admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          permissions: formData.permissions,
          role: 'sub-superadmin',
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add admin');
      }
      toast.success('Admin added successfully');
      setIsAddDialogOpen(false);
      setFormData({ name: '', email: '', password: '', permissions: [] });
      // Refresh list
      const adminsRes = await fetch(API_URL, { headers: { 'Authorization': `Bearer ${token}` } });
      const adminsData = await adminsRes.json();
      setAdmins(adminsData.map((admin: any) => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        company: admin.company || '-',
        role: admin.role,
        status: admin.status || 'active',
        last_login: admin.last_login || null,
        join_date: admin.created_at || null,
        permissions: admin.permissions || [],
      })));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Edit Permissions
  const openEditDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditPermissions(admin.permissions || []);
    setIsEditDialogOpen(true);
  };
  const handleEditPermissions = async () => {
    if (!selectedAdmin) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${selectedAdmin.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions: editPermissions }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update permissions');
      }
      toast.success('Permissions updated');
      setIsEditDialogOpen(false);
      // Update in list
      setAdmins(prev => prev.map(a => a.id === selectedAdmin.id ? { ...a, permissions: editPermissions } : a));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Permission options (example)
  const allPermissions = [
    'companies:view', 'companies:edit', 'companies:delete',
    'users:view', 'users:edit', 'users:delete',
    'settings:view', 'settings:edit',
    'billing:view', 'billing:edit',
    'reports:view', 'reports:edit',
  ];

  const handleSuspend = async (admin: Admin) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = admin.status === 'suspended' ? 'active' : 'suspended';
      const res = await fetch(`${API_URL}/${admin.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      toast.success(`Admin ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`);
      setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, status: newStatus } : a));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openResetDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setResetEmail(admin.email);
    setIsResetDialogOpen(true);
  };

  const handleResetPassword = async () => {
    if (!selectedAdmin) return;
    setResetLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${selectedAdmin.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: resetEmail }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }
      toast.success('Password reset link sent');
      setIsResetDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading administrators...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Administrators</h1>
          <p className="text-muted-foreground">
            Manage administrator accounts and permissions across all companies
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search administrators..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-2">
                <div className="relative">
                  <select
                    className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="super admin">Super Admin</option>
                    <option value="company admin">Company Admin</option>
                    <option value="hr admin">HR Admin</option>
                    <option value="finance admin">Finance Admin</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center">
                      Administrator
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('last_login')}
                  >
                    <div className="flex items-center">
                      Last Login
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAdmins.length > 0 ? (
                  paginatedAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium">{admin.name}</div>
                            <div className="text-sm text-gray-500">{admin.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">{admin.company}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(admin.role)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {getPermissionCount(admin.permissions)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(admin.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {getLastLoginText(admin.last_login)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(admin)}>
                              Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSuspend(admin)}>
                              {admin.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openResetDialog(admin)}>
                              Reset Password
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No administrators found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredAdmins.length)}
                </span>{' '}
                of <span className="font-medium">{filteredAdmins.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="px-2 text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sub-Superadmin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <Input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <Input type="password" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Permissions</label>
              <div className="flex flex-wrap gap-2">
                {allPermissions.map(perm => (
                  <label key={perm} className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm)}
                      onChange={e => setFormData(f => ({
                        ...f,
                        permissions: e.target.checked
                          ? [...f.permissions, perm]
                          : f.permissions.filter(p => p !== perm)
                      }))}
                    />
                    {perm}
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="font-medium">{selectedAdmin?.name} ({selectedAdmin?.email})</div>
            <div className="flex flex-wrap gap-2">
              {allPermissions.map(perm => (
                <label key={perm} className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={editPermissions.includes(perm)}
                    onChange={e => setEditPermissions(perms =>
                      e.target.checked
                        ? [...perms, perm]
                        : perms.filter(p => p !== perm)
                    )}
                  />
                  {perm}
                </label>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button type="button" onClick={handleEditPermissions}>Save</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>Send a password reset link to <span className="font-medium">{resetEmail}</span>?</div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
              <Button type="button" onClick={handleResetPassword} disabled={resetLoading}>
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
