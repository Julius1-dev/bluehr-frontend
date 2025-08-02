import { useState } from 'react';
import { Search, Filter, MoreHorizontal, Shield, UserPlus, Mail, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data - in a real app, this would come from an API
const initialSubAdmins = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    status: 'active',
    lastActive: '2023-06-10T14:30:00Z',
    permissions: {
      companies: { view: true, edit: true, delete: true },
      users: { view: true, edit: false, delete: false },
      settings: { view: true, edit: false }
    },
    createdAt: '2023-01-15'
  },
  {
    id: 2,
    name: 'Sarah Williams',
    email: 'sarah.w@example.com',
    status: 'suspended',
    lastActive: '2023-05-28T09:15:00Z',
    permissions: {
      companies: { view: true, edit: true, delete: false },
      users: { view: true, edit: true, delete: false },
      settings: { view: false, edit: false }
    },
    createdAt: '2023-03-22'
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    status: 'active',
    lastActive: '2023-06-05T10:30:00Z',
    permissions: {
      companies: { view: true, edit: true, delete: false },
      users: { view: true, edit: true, delete: false },
      settings: { view: true, edit: false }
    },
    createdAt: '2023-06-01'
  }
];

const permissionOptions = [
  { id: 'companies', label: 'Companies Management' },
  { id: 'users', label: 'Users Management' },
  { id: 'settings', label: 'System Settings' },
  { id: 'billing', label: 'Billing & Subscriptions' },
  { id: 'reports', label: 'Reports & Analytics' }
];

export function SubAdminManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [subAdmins, setSubAdmins] = useState(initialSubAdmins);
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    permissions: {
      companies: { view: false, edit: false, delete: false },
      users: { view: false, edit: false, delete: false },
      settings: { view: false, edit: false },
      billing: { view: false, edit: false },
      reports: { view: false, edit: false }
    }
  });

  const filteredAdmins = subAdmins.filter(admin => {
    const matchesSearch = 
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || admin.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle permission change in the form
  const handlePermissionChange = (section: string, permission: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: {
          ...prev.permissions[section as keyof typeof prev.permissions],
          [permission]: value
        }
      }
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would make an API call here
    console.log('Form submitted:', formData);
    setIsAddDialogOpen(false);
    // Reset form
    setFormData({
      name: '',
      email: '',
      permissions: {
        companies: { view: false, edit: false, delete: false },
        users: { view: false, edit: false, delete: false },
        settings: { view: false, edit: false },
        billing: { view: false, edit: false },
        reports: { view: false, edit: false }
      }
    });
  };

  const handleToggleStatus = async (admin: any) => {
    const newStatus = admin.status === 'suspended' ? 'active' : 'suspended';
    const action = newStatus === 'suspended' ? 'suspend' : 'activate';
    
    try {
      setIsLoading(prev => ({ ...prev, [admin.id]: true }));
      // In a real app, you would make an API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the local state
      setSubAdmins(prevAdmins => 
        prevAdmins.map(a => 
          a.id === admin.id ? { ...a, status: newStatus } : a
        )
      );
      
      toast.success(`Sub-admin ${action}ed successfully`);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(`Failed to ${action} sub-admin`);
    } finally {
      setIsLoading(prev => ({ ...prev, [admin.id]: false }));
    }
  };
  
  const handleUpdatePermissions = async () => {
    if (!selectedAdmin) return;
    
    try {
      setIsLoading(prev => ({ ...prev, [selectedAdmin.id]: true }));
      // In a real app, you would make an API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the local state
      setSubAdmins(prevAdmins => 
        prevAdmins.map(a => 
          a.id === selectedAdmin.id 
            ? { ...a, permissions: formData.permissions }
            : a
        )
      );
      
      setIsEditDialogOpen(false);
      toast.success('Permissions updated successfully');
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setIsLoading(prev => ({ ...prev, [selectedAdmin.id]: false }));
    }
  };

  const openEditDialog = (admin: any) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      permissions: { ...admin.permissions }
    });
    setIsEditDialogOpen(true);
  };

  const renderPermissionSwitches = () => {
    return (
      <div className="space-y-6">
        {permissionOptions.map(option => (
          <div key={option.id} className="space-y-2">
            <h4 className="text-sm font-medium">{option.label}</h4>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id={`${option.id}-view`} 
                  checked={formData.permissions[option.id as keyof typeof formData.permissions]?.view || false}
                  onCheckedChange={(checked) => handlePermissionChange(option.id, 'view', checked)}
                />
                <Label htmlFor={`${option.id}-view`}>View</Label>
              </div>
              
              {!['settings', 'billing', 'reports'].includes(option.id) && (
                <div className="flex items-center space-x-2">
                  <Switch 
                    id={`${option.id}-edit`}
                    checked={formData.permissions[option.id as keyof typeof formData.permissions]?.edit || false}
                    onCheckedChange={(checked) => handlePermissionChange(option.id, 'edit', checked)}
                    disabled={!formData.permissions[option.id as keyof typeof formData.permissions]?.view}
                  />
                  <Label htmlFor={`${option.id}-edit`}>Edit</Label>
                </div>
              )}
              
              {(option.id === 'companies' || option.id === 'users') && (
                <div className="flex items-center space-x-2">
                  <Switch 
                    id={`${option.id}-delete`}
                    checked={formData.permissions[option.id as keyof typeof formData.permissions]?.delete || false}
                    onCheckedChange={(checked) => handlePermissionChange(option.id, 'delete', checked)}
                    disabled={!formData.permissions[option.id as keyof typeof formData.permissions]?.edit}
                  />
                  <Label htmlFor={`${option.id}-delete`}>Delete</Label>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sub-Admins</h1>
          <p className="text-muted-foreground">
            Manage sub-admins and their permissions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Sub-Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="px-1">
              <DialogTitle className="text-xl">Add New Sub-Admin</DialogTitle>
              <DialogDescription className="text-sm">
                Invite a new sub-admin to the platform. They will receive an email with setup instructions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 px-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-4">Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderPermissionSwitches()}
                </div>
              </div>
            </div>
            <DialogFooter className="px-1 py-4 border-t">
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 w-full">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="w-full sm:w-auto"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search sub-admins..."
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
                  <DropdownMenuItem onClick={() => setStatusFilter('suspended')}>
                    Suspended
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <span>{admin.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{getStatusBadge(admin.status)}</TableCell>
                  <TableCell>
                    {admin.lastActive 
                      ? new Date(admin.lastActive).toLocaleDateString() 
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {Object.entries(admin.permissions)
                        .filter(([_, perms]) => Object.values(perms).some(Boolean))
                        .map(([key]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </Badge>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(admin)}>
                          Edit Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(admin)}
                          className={admin.status === 'suspended' ? 'text-green-600' : 'text-amber-600'}
                        >
                          {isLoading[admin.id] ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {admin.status === 'suspended' ? 'Activating...' : 'Suspending...'}
                            </>
                          ) : (
                            <>
                              {admin.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Permission Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-1">
            <DialogTitle className="text-xl">Edit Sub-Admin Permissions</DialogTitle>
            <DialogDescription className="text-sm">
              Update permissions for {selectedAdmin?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4 px-1">
            <div className="space-y-2 p-4 bg-muted/30 rounded-md">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">{selectedAdmin?.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedAdmin?.email}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Last active: {selectedAdmin?.lastActive 
                  ? new Date(selectedAdmin.lastActive).toLocaleString() 
                  : 'Never'}
              </p>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-4">Permissions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderPermissionSwitches()}
              </div>
            </div>
          </div>
          <DialogFooter className="px-1 py-4 border-t">
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isLoading[selectedAdmin?.id]}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleUpdatePermissions}
                disabled={isLoading[selectedAdmin?.id]}
              >
                {isLoading[selectedAdmin?.id] ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
