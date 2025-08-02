import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, Globe, Users, User, Shield, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function CompanyDetails() {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();
  const [activeTab, setActiveTab] = useState<'details' | 'users'>('details');
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [suspendLoading, setSuspendLoading] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:4000/super-admin/companies/${companyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch company');
        }
        const data = await response.json();
        setCompany(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (companyId) fetchCompany();
  }, [companyId]);

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
      case 'user':
        return <Badge variant="outline">User</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const handleEdit = () => {
    setEditData({ ...company });
    setIsEditing(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/super-admin/companies/${companyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update company');
      }
      const updated = await response.json();
      setCompany(updated);
      setIsEditing(false);
      toast.success('Company updated successfully');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleSuspendToggle = async () => {
    if (!company) return;
    setSuspendLoading(true);
    try {
      const token = localStorage.getItem('token');
      const newStatus = company.status === 'suspended' ? 'active' : 'suspended';
      const response = await fetch(`http://localhost:4000/super-admin/companies/${companyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      setCompany({ ...company, status: newStatus });
      toast.success(`Company ${newStatus === 'suspended' ? 'suspended' : 'unsuspended'} successfully`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSuspendLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading company details...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!company) return <div className="text-center py-8 text-gray-500">Company not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{company.company_name || company.name}</h1>
          <p className="text-muted-foreground">
            Company ID: {companyId}
          </p>
        </div>
      </div>

      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
            }`}
          >
            Company Details
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
            }`}
          >
            Users ({company.users ? company.users.length : 0})
          </button>
        </nav>
      </div>

      {activeTab === 'details' ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic details about {company.company_name || company.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Company Name:</span>
                    <span className="ml-2">{company.company_name || company.name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Domain:</span>
                    <span className="ml-2">{company.domain}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Plan:</span>
                    <span className="ml-2">{company.plan}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-6"></span>
                    <span className="font-medium">Status:</span>
                    <span className="ml-2">
                      {getStatusBadge(company.status)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Contact:</span>
                    <span className="ml-2">{company.contact_name || company.contactName}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <a href={`mailto:${company.contact_email || company.contactEmail}`} className="ml-2 text-primary hover:underline">
                      {company.contact_email || company.contactEmail}
                    </a>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Phone:</span>
                    <a href={`tel:${company.contact_phone || company.contactPhone}`} className="ml-2 text-primary hover:underline">
                      {company.contact_phone || company.contactPhone}
                    </a>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Address</h4>
                <p className="text-sm">{company.address}</p>
                <p className="text-sm">{company.city}, {company.country}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={handleEdit} disabled={editLoading || suspendLoading}>
              Edit Company
            </Button>
            <Button variant="outline" onClick={handleSuspendToggle} disabled={suspendLoading}>
              {company.status === 'suspended' ? 'Unsuspend Company' : 'Suspend Company'}
            </Button>
          </div>

          {/* Edit Dialog (simple inline, no UI change) */}
          {isEditing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">Edit Company</h2>
                <div className="space-y-2">
                  <input className="w-full border p-2 rounded" name="company_name" value={editData.company_name || ''} onChange={handleEditChange} placeholder="Company Name" />
                  <input className="w-full border p-2 rounded" name="domain" value={editData.domain || ''} onChange={handleEditChange} placeholder="Domain" />
                  <input className="w-full border p-2 rounded" name="plan" value={editData.plan || ''} onChange={handleEditChange} placeholder="Plan" />
                  <input className="w-full border p-2 rounded" name="contact_name" value={editData.contact_name || ''} onChange={handleEditChange} placeholder="Contact Name" />
                  <input className="w-full border p-2 rounded" name="contact_email" value={editData.contact_email || ''} onChange={handleEditChange} placeholder="Contact Email" />
                  <input className="w-full border p-2 rounded" name="contact_phone" value={editData.contact_phone || ''} onChange={handleEditChange} placeholder="Contact Phone" />
                  <input className="w-full border p-2 rounded" name="address" value={editData.address || ''} onChange={handleEditChange} placeholder="Address" />
                  <input className="w-full border p-2 rounded" name="city" value={editData.city || ''} onChange={handleEditChange} placeholder="City" />
                  <input className="w-full border p-2 rounded" name="country" value={editData.country || ''} onChange={handleEditChange} placeholder="Country" />
                  <input className="w-full border p-2 rounded" name="postal_code" value={editData.postal_code || ''} onChange={handleEditChange} placeholder="Postal Code" />
                  <input className="w-full border p-2 rounded" name="tax_id" value={editData.tax_id || ''} onChange={handleEditChange} placeholder="Tax ID" />
                  <textarea className="w-full border p-2 rounded" name="notes" value={editData.notes || ''} onChange={handleEditChange} placeholder="Notes" />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={editLoading}>Cancel</Button>
                  <Button onClick={handleEditSave} disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  Manage users for {company.company_name || company.name}
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => {}}>
                <User className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {company.users && company.users.length > 0 ? company.users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : ''}
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
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit User</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Remove User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No users found for this company
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
